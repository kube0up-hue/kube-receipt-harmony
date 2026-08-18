// All business days in this system are Riyadh days (UTC+3).
// Never use `new Date().toISOString().slice(0,10)` for "today": that is a UTC day
// and shifts receipts made between 00:00 and 03:00 Riyadh to the previous day.

export const RIYADH_TZ = "Asia/Riyadh";

const DAY_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: RIYADH_TZ,
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** yyyy-MM-dd for the given instant, in Riyadh time. */
export function riyadhDate(input: Date | string | number = new Date()): string {
  const d = input instanceof Date ? input : new Date(input);
  return DAY_FMT.format(d);
}

/** Today in Riyadh time as yyyy-MM-dd. */
export function riyadhToday(): string {
  return riyadhDate();
}

/** Riyadh day, `days` before/after today (negative = past). */
export function riyadhDayOffset(days: number): string {
  return riyadhDate(new Date(Date.now() + days * 86_400_000));
}

/** Timestamp string for 00:00 Riyadh of a Riyadh day — safe for `gte` filters. */
export function riyadhDayStart(day: string = riyadhToday()): string {
  return `${day}T00:00:00+03:00`;
}

/** Timestamp string for the instant just after 23:59:59.999 Riyadh — safe for `lt`. */
export function riyadhDayEndExclusive(day: string = riyadhToday()): string {
  const next = riyadhDate(new Date(`${day}T12:00:00+03:00`).getTime() + 86_400_000);
  return `${next}T00:00:00+03:00`;
}
