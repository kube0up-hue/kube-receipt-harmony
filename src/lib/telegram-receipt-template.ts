// Template for the Telegram receipt-approved notification.
// Edit this file to change the message layout — no other file needs to change.

export interface TelegramReceiptItem {
  product_name: string;
  ordered: number;
  received: number;
  damaged: number;
  accepted: number;
  diff: number; // accepted - ordered
}

export interface TelegramReceiptPayload {
  supplier_name: string;
  receipt_number: string;
  received_at: Date; // when the receipt was approved
  employee_name: string;
  items: TelegramReceiptItem[];
  note?: string | null;
}

const DIVIDER = "━━━━━━━━━━━━━━━━━━";

function esc(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmtNum(n: number): string {
  const rounded = Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  return rounded.toLocaleString("en-US");
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

// Riyadh time (UTC+3) — matches app timezone convention
function formatRiyadh(date: Date): { date: string; time: string; full: string } {
  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = pad2(shifted.getUTCMonth() + 1);
  const d = pad2(shifted.getUTCDate());
  const hh = pad2(shifted.getUTCHours());
  const mm = pad2(shifted.getUTCMinutes());
  return { date: `${y}-${m}-${d}`, time: `${hh}:${mm}`, full: `${y}-${m}-${d} ${hh}:${mm}` };
}

export function buildReceiptTelegramMessage(payload: TelegramReceiptPayload): string {
  const { date, time, full } = formatRiyadh(payload.received_at);
  const sentAt = formatRiyadh(new Date()).full;

  const totalOrdered = payload.items.reduce((s, i) => s + Number(i.ordered || 0), 0);
  const totalReceived = payload.items.reduce((s, i) => s + Number(i.received || 0), 0);
  const totalShort = payload.items.reduce((s, i) => s + (i.diff < 0 ? -i.diff : 0), 0);
  const totalDamaged = payload.items.reduce((s, i) => s + Number(i.damaged || 0), 0);

  const shortItems = payload.items.filter((i) => i.diff < 0);
  const damagedItems = payload.items.filter((i) => Number(i.damaged || 0) > 0);
  const note = (payload.note ?? "").trim();

  const statusLine =
    totalShort > 0 && totalDamaged > 0
      ? "⚠️ يوجد نقص وتالف"
      : totalShort > 0
      ? "⚠️ يوجد نقص"
      : totalDamaged > 0
      ? "❌ يوجد تالف"
      : "✅ مكتمل";

  const lines: string[] = [];
  lines.push("📦 <b>تم تسجيل استلام جديد</b>");
  lines.push(DIVIDER);
  lines.push(`🏭 <b>المورد:</b>\n${esc(payload.supplier_name)}`);
  lines.push("");
  lines.push(`🆔 <b>رقم الاستلام:</b>\n${esc(payload.receipt_number)}`);
  lines.push("");
  lines.push(`📅 <b>التاريخ:</b>\n${esc(date)}`);
  lines.push("");
  lines.push(`🕒 <b>الوقت:</b>\n${esc(time)}`);
  lines.push("");
  lines.push(`👤 <b>المستلم:</b>\n${esc(payload.employee_name)}`);
  lines.push(DIVIDER);

  lines.push("📋 <b>الأصناف المستلمة</b>");
  lines.push("");
  for (const it of payload.items) {
    lines.push(`• <b>${esc(it.product_name)}</b>`);
    lines.push(`   المطلوب: <code>${fmtNum(it.ordered)}</code>`);
    lines.push(`   المستلم: <code>${fmtNum(it.received)}</code>`);
    lines.push(`   الفرق: <code>${fmtNum(it.diff)}</code>`);
    lines.push("");
  }
  lines.push(DIVIDER);

  lines.push("⚠️ <b>النواقص</b>");
  if (shortItems.length === 0) {
    lines.push("✅ لا يوجد نقص.");
  } else {
    for (const it of shortItems) {
      lines.push(`• <b>${esc(it.product_name)}</b>`);
      lines.push(`   النقص: <code>${fmtNum(-it.diff)}</code>`);
    }
  }
  lines.push(DIVIDER);

  lines.push("❌ <b>التالف</b>");
  if (damagedItems.length === 0) {
    lines.push("✅ لا يوجد تالف.");
  } else {
    for (const it of damagedItems) {
      lines.push(`• <b>${esc(it.product_name)}</b>`);
      lines.push(`   التالف: <code>${fmtNum(it.damaged)}</code>`);
    }
  }
  lines.push(DIVIDER);

  if (note) {
    lines.push("📝 <b>ملاحظات</b>");
    lines.push(esc(note));
    lines.push(DIVIDER);
  }

  lines.push("📊 <b>ملخص العملية</b>");
  lines.push(`عدد الأصناف: <code>${fmtNum(payload.items.length)}</code>`);
  lines.push(`إجمالي المطلوب: <code>${fmtNum(totalOrdered)}</code>`);
  lines.push(`إجمالي المستلم: <code>${fmtNum(totalReceived)}</code>`);
  lines.push(`إجمالي النقص: <code>${fmtNum(totalShort)}</code>`);
  lines.push(`إجمالي التالف: <code>${fmtNum(totalDamaged)}</code>`);
  lines.push("");
  lines.push(`حالة الاستلام:\n${statusLine}`);
  lines.push(DIVIDER);

  lines.push(`⏰ <b>وقت إرسال الإشعار:</b>\n${esc(sentAt)}`);

  return lines.join("\n");
}
