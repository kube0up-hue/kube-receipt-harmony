import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildReceiptTelegramMessage, type TelegramReceiptItem } from "./telegram-receipt-template";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

type SendOutcome =
  | { ok: true; messageId: number | null; skipped?: false }
  | { ok: true; skipped: true; reason: "already_sent" }
  | { ok: false; reason: string; status?: number };

async function markTelegramStatus(
  receiptId: string,
  status: "pending" | "sent" | "failed",
  messageId: number | null,
  error: string | null,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error: rpcErr } = await supabaseAdmin.rpc("mark_receipt_telegram", {
    p_receipt_id: receiptId,
    p_status: status,
    p_message_id: messageId,
    p_error: error,
  });
  if (rpcErr) console.error("[telegram] mark_receipt_telegram failed", rpcErr);
}

async function performSend(
  supabase: any,
  receiptId: string,
  opts: { force?: boolean } = {},
): Promise<SendOutcome> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const telegramKey = process.env.TELEGRAM_API_KEY;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!lovableKey || !telegramKey || !chatId) {
    const msg = "missing_env: LOVABLE_API_KEY/TELEGRAM_API_KEY/TELEGRAM_CHAT_ID";
    console.error("[telegram]", msg);
    await markTelegramStatus(receiptId, "failed", null, msg);
    return { ok: false, reason: "missing_env" };
  }

  const { data: receipt, error: rErr } = await supabase
    .from("receipts")
    .select(
      "id, status, note, received_at, telegram_notification_status, supplier:suppliers(name), employee:employees(full_name), order:orders(order_number)"
    )
    .eq("id", receiptId)
    .single();
  if (rErr || !receipt) {
    console.error("[telegram] receipt fetch failed", rErr);
    return { ok: false, reason: "receipt_not_found" };
  }

  // Only send for approved/submitted receipts (never drafts).
  if (receipt.status !== "submitted" && receipt.status !== "approved") {
    return { ok: false, reason: "not_approved" };
  }

  // Idempotency: skip if already sent unless caller explicitly forces (admin-only path).
  if (receipt.telegram_notification_status === "sent" && !opts.force) {
    return { ok: true, skipped: true, reason: "already_sent" };
  }

  const { data: rows, error: iErr } = await supabase
    .from("receipt_items")
    .select("ordered_qty, received_qty, damaged_qty, accepted_qty, diff, product:products(name)")
    .eq("receipt_id", receiptId);
  if (iErr) {
    console.error("[telegram] items fetch failed", iErr);
    await markTelegramStatus(receiptId, "failed", null, "items_fetch_failed");
    return { ok: false, reason: "items_fetch_failed" };
  }

  const items: TelegramReceiptItem[] = (rows ?? []).map((r: any) => {
    const ordered = Number(r.ordered_qty ?? 0);
    const received = Number(r.received_qty ?? 0);
    const damaged = Number(r.damaged_qty ?? 0);
    const accepted = Number(r.accepted_qty ?? Math.max(received - damaged, 0));
    const diff = Number(r.diff ?? accepted - ordered);
    return { product_name: r.product?.name ?? "—", ordered, received, damaged, accepted, diff };
  });

  const text = buildReceiptTelegramMessage({
    supplier_name: (receipt as any).supplier?.name ?? "—",
    receipt_number: (receipt as any).order?.order_number ?? receipt.id.slice(0, 8),
    received_at: new Date(receipt.received_at as string),
    employee_name: (receipt as any).employee?.full_name ?? "—",
    items,
    note: receipt.note,
  });

  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": telegramKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[telegram] fetch threw", msg);
    await markTelegramStatus(receiptId, "failed", null, `network: ${msg}`);
    return { ok: false, reason: "network_error" };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const errMsg = `HTTP ${res.status}: ${body.slice(0, 500)}`;
    console.error(`[telegram] sendMessage failed`, errMsg);
    await markTelegramStatus(receiptId, "failed", null, errMsg);
    return { ok: false, reason: "send_failed", status: res.status };
  }

  const payload = await res.json().catch(() => null as any);
  // Provider-in-body error (Telegram returns { ok: false, description } on some 2xx)
  if (payload && payload.ok === false) {
    const errMsg = `telegram: ${payload.description ?? "unknown"}`;
    console.error("[telegram] provider error", errMsg);
    await markTelegramStatus(receiptId, "failed", null, errMsg);
    return { ok: false, reason: "provider_error" };
  }

  const messageId: number | null = payload?.result?.message_id ?? null;
  await markTelegramStatus(receiptId, "sent", messageId, null);
  return { ok: true, messageId };
}

// Called automatically once after a receipt is submitted (fire-and-forget from client).
// Idempotent — safe to call multiple times; skips when status is already 'sent'.
export const notifyReceiptApproved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { receiptId: string }) => {
    if (!input?.receiptId || typeof input.receiptId !== "string") throw new Error("receiptId مطلوب");
    return input;
  })
  .handler(async ({ data, context }) => {
    try {
      return await performSend(context.supabase, data.receiptId);
    } catch (err) {
      console.error("[telegram] notifyReceiptApproved threw", err);
      return { ok: false as const, reason: "exception" };
    }
  });

// Admin resend — allowed always (retries failed) and can force when already sent.
export const resendReceiptTelegram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { receiptId: string; force?: boolean }) => {
    if (!input?.receiptId) throw new Error("receiptId مطلوب");
    return { receiptId: input.receiptId, force: !!input.force };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: roleRow, error: roleErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) throw new Error("صلاحية المدير مطلوبة");
    try {
      return await performSend(supabase, data.receiptId, { force: data.force });
    } catch (err) {
      console.error("[telegram] resendReceiptTelegram threw", err);
      return { ok: false as const, reason: "exception" };
    }
  });
