import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { buildReceiptTelegramMessage, type TelegramReceiptItem } from "./telegram-receipt-template";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

export const notifyReceiptApproved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { receiptId: string }) => {
    if (!input?.receiptId || typeof input.receiptId !== "string") {
      throw new Error("receiptId مطلوب");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    try {
      const lovableKey = process.env.LOVABLE_API_KEY;
      const telegramKey = process.env.TELEGRAM_API_KEY;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (!lovableKey || !telegramKey || !chatId) {
        console.error("[telegram] Missing env: LOVABLE_API_KEY/TELEGRAM_API_KEY/TELEGRAM_CHAT_ID");
        return { ok: false, reason: "missing_env" as const };
      }

      const { supabase } = context;

      const { data: receipt, error: rErr } = await supabase
        .from("receipts")
        .select(
          "id, status, note, received_at, supplier:suppliers(name), employee:employees(name), order:orders(order_number)"
        )
        .eq("id", data.receiptId)
        .single();
      if (rErr || !receipt) {
        console.error("[telegram] receipt fetch failed", rErr);
        return { ok: false, reason: "receipt_not_found" as const };
      }

      // Only send when the receipt is approved/submitted (not draft)
      if (receipt.status !== "submitted" && receipt.status !== "approved") {
        return { ok: false, reason: "not_approved" as const };
      }

      const { data: rows, error: iErr } = await supabase
        .from("receipt_items")
        .select("ordered_qty, received_qty, damaged_qty, accepted_qty, diff, product:products(name)")
        .eq("receipt_id", data.receiptId);
      if (iErr) {
        console.error("[telegram] items fetch failed", iErr);
        return { ok: false, reason: "items_fetch_failed" as const };
      }

      const items: TelegramReceiptItem[] = (rows ?? []).map((r: any) => {
        const ordered = Number(r.ordered_qty ?? 0);
        const received = Number(r.received_qty ?? 0);
        const damaged = Number(r.damaged_qty ?? 0);
        const accepted = Number(r.accepted_qty ?? Math.max(received - damaged, 0));
        const diff = Number(r.diff ?? accepted - ordered);
        return {
          product_name: r.product?.name ?? "—",
          ordered,
          received,
          damaged,
          accepted,
          diff,
        };
      });

      const text = buildReceiptTelegramMessage({
        supplier_name: (receipt as any).supplier?.name ?? "—",
        receipt_number: (receipt as any).order?.order_number ?? receipt.id.slice(0, 8),
        received_at: new Date(receipt.received_at as string),
        employee_name: (receipt as any).employee?.name ?? "—",
        items,
        note: receipt.note,
      });

      const res = await fetch(`${GATEWAY_URL}/sendMessage`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": telegramKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[telegram] sendMessage failed [${res.status}] ${body}`);
        return { ok: false, reason: "send_failed" as const, status: res.status };
      }

      return { ok: true as const };
    } catch (err) {
      // Never let a Telegram failure bubble up — receipt must not fail.
      console.error("[telegram] notifyReceiptApproved threw", err);
      return { ok: false, reason: "exception" as const };
    }
  });
