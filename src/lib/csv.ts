/** مُولّد ملفات CSV احترافي متوافق مع Excel العربي (UTF-8 + BOM + CRLF) */

export type CsvCell = string | number | null | undefined;

export interface CsvReport {
  /** عنوان التقرير */
  title: string;
  /** أسطر معلومات الترويسة: [التسمية، القيمة] */
  meta?: Array<[string, CsvCell]>;
  /** رؤوس الأعمدة */
  columns: string[];
  /** صفوف البيانات */
  rows: CsvCell[][];
  /** صفوف المجاميع (تُعرض أسفل الجدول) */
  totals?: CsvCell[][];
  /** أسطر ملاحظات في الأسفل */
  notes?: string[];
}

function esc(v: CsvCell): string {
  if (v === null || v === undefined) return '""';
  const s = String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** تاريخ ووقت ميلادي للترويسة وأسماء الملفات */
export function nowStamp(): { human: string; file: string } {
  const d = new Date();
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { human: `${date} ${time}`, file: `${date}_${pad(d.getHours())}${pad(d.getMinutes())}` };
}

export function buildCsv(report: CsvReport): string {
  const lines: string[][] = [];
  lines.push(["KUBE Supplier Receiving"]);
  lines.push([report.title]);
  for (const [k, v] of report.meta ?? []) lines.push([k, v as string]);
  lines.push(["تاريخ التصدير", nowStamp().human]);
  lines.push([]);
  lines.push(report.columns);
  for (const r of report.rows) lines.push(r as string[]);
  if (report.totals?.length) {
    lines.push([]);
    for (const t of report.totals) lines.push(t as string[]);
  }
  if (report.notes?.length) {
    lines.push([]);
    for (const n of report.notes) lines.push([n]);
  }
  return "\uFEFF" + lines.map((r) => r.map(esc).join(",")).join("\r\n");
}

/** تنزيل التقرير كملف CSV */
export function downloadCsv(fileName: string, report: CsvReport) {
  const safe = fileName.replace(/[\\/:*?"<>|]/g, "-");
  const blob = new Blob([buildCsv(report)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safe.endsWith(".csv") ? safe : `${safe}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
