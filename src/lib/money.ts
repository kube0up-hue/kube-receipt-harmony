/** أدوات موحّدة للأرقام والمبالغ — تمنع ظهور كسور عشرية طويلة (مثل 37.049999999999997) */

/** تقريب دقيق إلى عدد خانات محدد */
export function roundTo(n: number, digits = 2): number {
  if (!Number.isFinite(n)) return 0;
  const f = Math.pow(10, digits);
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** تقريب مبلغ مالي إلى خانتين */
export const round2 = (n: number) => roundTo(n, 2);

/** تقريب كمية إلى ٣ خانات */
export const round3 = (n: number) => roundTo(n, 3);

/** جمع مبالغ مع تقريب كل قيمة قبل الجمع */
export function sumMoney(values: number[]): number {
  return round2(values.reduce((a, v) => a + round2(v), 0));
}

/** سعر × كمية بمبلغ مقرَّب */
export function lineAmount(qty: number, price: number): number {
  return round2(round3(qty) * round2(price));
}

/** تنسيق مبلغ: فاصل آلاف + خانتين */
export function formatMoney(n: number): string {
  return round2(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** تنسيق مبلغ مع العملة */
export function formatMoneySar(n: number): string {
  return `${formatMoney(n)} ر.س`;
}

/** تنسيق كمية بدون أصفار زائدة */
export function formatQty(n: number): string {
  const v = round3(n);
  return v.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

/** تحويل نص إدخال إلى رقم آمن */
export function num(v: string | number | null | undefined): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

/** تنسيق فرق (مع إشارة) */
export function formatSigned(n: number, kind: "money" | "qty" = "money"): string {
  const v = kind === "money" ? round2(n) : round3(n);
  const s = kind === "money" ? formatMoney(Math.abs(v)) : formatQty(Math.abs(v));
  if (v > 0) return `+${s}`;
  if (v < 0) return `-${s}`;
  return s;
}
