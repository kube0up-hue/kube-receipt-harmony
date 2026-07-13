// Unified date/time formatting for the app — Gregorian calendar only.
// Never use "ar-SA" directly because Chrome resolves it to the Islamic (umalqura)
// calendar. Use these helpers everywhere Arabic dates are displayed.

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  calendar: "gregory",
  numberingSystem: "latn",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

const DATETIME_OPTS: Intl.DateTimeFormatOptions = {
  ...DATE_OPTS,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export function formatDateAr(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("ar", DATE_OPTS).format(d);
}

export function formatDateTimeAr(input: Date | string | number): string {
  const d = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("ar", DATETIME_OPTS).format(d);
}
