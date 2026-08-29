import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { riyadhDayOffset, riyadhToday } from "@/lib/riyadh-time";
import { Download } from "lucide-react";
import { formatMoney, num, round2, sumMoney } from "@/lib/money";
import { downloadCsv } from "@/lib/csv";

type Row = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  periodStart: string | null;
  periodEnd: string | null;
  supplierId: string;
  supplierName: string;
  total: number;
  paid: number;
  remaining: number;
  status: string;
};

const statusLabel: Record<string, string> = {
  pending_match: "بانتظار المطابقة",
  unmatched: "غير مطابقة",
  matched_ready: "جاهزة للتحويل",
  approved_for_payment: "معتمدة للسداد",
  paid: "مسددة",
};

const money = formatMoney;

function payLabel(r: Row) {
  if (r.paid <= 0) return { label: "غير مسددة", cls: "bg-destructive/10 text-destructive" };
  if (r.remaining > 0.009) return { label: "مسددة جزئياً", cls: "bg-amber-500/15 text-amber-700" };
  return { label: "مسددة بالكامل", cls: "bg-emerald-500/15 text-emerald-700" };
}


export function DuesReport() {
  const [from, setFrom] = useState(() => riyadhDayOffset(-30));
  const [to, setTo] = useState(() => riyadhToday());
  const [supplierId, setSupplierId] = useState("");

  const suppliers = useQuery({
    queryKey: ["dues-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const report = useQuery({
    queryKey: ["dues-report", from, to, supplierId],
    queryFn: async (): Promise<Row[]> => {
      let q = supabase
        .from("invoices")
        .select("id,invoice_number,invoice_date,period_start,period_end,total_amount,status,supplier_id,suppliers(name)")
        .gte("invoice_date", from)
        .lte("invoice_date", to)
        .order("invoice_date", { ascending: false });
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      const invoices = (data ?? []) as unknown as Array<{
        id: string; invoice_number: string; invoice_date: string;
        period_start: string | null; period_end: string | null;
        total_amount: number | null; status: string; supplier_id: string;
        suppliers: { name: string } | null;
      }>;
      if (invoices.length === 0) return [];

      const { data: pays, error: pErr } = await supabase
        .from("payments")
        .select("invoice_id,amount")
        .in("invoice_id", invoices.map((i) => i.id));
      if (pErr) throw pErr;
      const paidMap = new Map<string, number>();
      for (const p of pays ?? []) {
        paidMap.set(p.invoice_id, round2((paidMap.get(p.invoice_id) ?? 0) + round2(num(p.amount))));
      }

      return invoices.map((i) => {
        const total = round2(num(i.total_amount));
        const paid = round2(paidMap.get(i.id) ?? 0);
        return {
          invoiceId: i.id,
          invoiceNumber: i.invoice_number,
          invoiceDate: i.invoice_date,
          periodStart: i.period_start,
          periodEnd: i.period_end,
          supplierId: i.supplier_id,
          supplierName: i.suppliers?.name ?? "—",
          total,
          paid,
          remaining: Math.max(round2(total - paid), 0),
          status: i.status,
        };
      });
    },
  });

  const rows = report.data ?? [];

  const groups = useMemo(() => {
    const map = new Map<string, { name: string; rows: Row[] }>();
    for (const r of rows) {
      const g = map.get(r.supplierId) ?? { name: r.supplierName, rows: [] };
      g.rows.push(r);
      map.set(r.supplierId, g);
    }
    return [...map.entries()].map(([id, g]) => ({
      id,
      name: g.name,
      rows: g.rows,
      total: sumMoney(g.rows.map((r) => r.total)),
      paid: sumMoney(g.rows.map((r) => r.paid)),
      remaining: sumMoney(g.rows.map((r) => r.remaining)),
    }));
  }, [rows]);

  const grand = {
    total: sumMoney(groups.map((g) => g.total)),
    paid: sumMoney(groups.map((g) => g.paid)),
    remaining: sumMoney(groups.map((g) => g.remaining)),
  };

  function exportCSV() {
    const supplierName = supplierId
      ? (suppliers.data ?? []).find((s) => s.id === supplierId)?.name ?? "—"
      : "كل الموردين";
    const body: (string | number)[][] = [];
    for (const g of groups) {
      for (const r of g.rows) {
        body.push([
          g.name, r.invoiceNumber, r.invoiceDate,
          r.periodStart ?? "", r.periodEnd ?? "",
          formatMoney(r.total), formatMoney(r.paid), formatMoney(r.remaining),
          statusLabel[r.status] ?? r.status, payLabel(r).label,
        ]);
      }
      body.push([
        `إجمالي ${g.name}`, "", "", "", "",
        formatMoney(g.total), formatMoney(g.paid), formatMoney(g.remaining), "", "",
      ]);
    }
    downloadCsv(`المبالغ-المستحقة-${from}_${to}`, {
      title: "تقرير المبالغ المستحقة للسداد",
      meta: [
        ["المورد", supplierName],
        ["الفترة", `${from} → ${to}`],
        ["عدد الفواتير", rows.length],
      ],
      columns: [
        "المورد", "رقم الفاتورة", "تاريخ الفاتورة", "بداية فترة المطابقة", "نهاية فترة المطابقة",
        "إجمالي الفاتورة (ر.س)", "المسدَّد (ر.س)", "المتبقي المستحق (ر.س)", "حالة الفاتورة", "حالة السداد",
      ],
      rows: body,
      totals: [
        ["الإجمالي العام", "", "", "", "", formatMoney(grand.total), formatMoney(grand.paid), formatMoney(grand.remaining), "", ""],
      ],
      notes: ["المتبقي المستحق = إجمالي الفاتورة − المسدَّد", "جميع المبالغ بالريال السعودي ومقرَّبة إلى خانتين"],
    });
  }


  return (
    <div className="space-y-4">
      <div className="kube-card grid sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">من تاريخ</span>
          <input type="date" className="kube-input w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">إلى تاريخ</span>
          <input type="date" className="kube-input w-full" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">المورد</span>
          <select className="kube-input w-full" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="">كل الموردين</option>
            {(suppliers.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="kube-card">
          <div className="text-xs text-muted-foreground">إجمالي الفواتير</div>
          <div className="text-xl font-extrabold">{money(grand.total)}</div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground">المسدَّد</div>
          <div className="text-xl font-extrabold">{money(grand.paid)}</div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground">المستحق للسداد</div>
          <div className="text-xl font-extrabold text-primary">{money(grand.remaining)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="kube-btn-outline flex items-center gap-2" onClick={exportCSV} disabled={rows.length === 0}>
          <Download className="w-4 h-4" /> تصدير Excel/CSV
        </button>
      </div>

      {report.isLoading && <div className="kube-card text-center text-sm text-muted-foreground">جارِ التحميل…</div>}
      {report.isError && <div className="kube-card text-center text-sm text-destructive">تعذر تحميل التقرير</div>}
      {!report.isLoading && groups.length === 0 && (
        <div className="kube-card text-center text-sm text-muted-foreground">لا توجد فواتير في هذه الفترة</div>
      )}

      {groups.map((g) => (
        <div key={g.id} className="kube-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-extrabold">{g.name}</h3>
            <div className="text-xs text-muted-foreground">
              إجمالي: <b className="text-foreground">{money(g.total)}</b> · مسدَّد: <b className="text-foreground">{money(g.paid)}</b> · مستحق:{" "}
              <b className="text-primary">{money(g.remaining)}</b>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="py-2 text-right">الفاتورة</th>
                  <th className="py-2 text-right">فترة المطابقة</th>
                  <th className="py-2 text-right">الإجمالي</th>
                  <th className="py-2 text-right">المسدَّد</th>
                  <th className="py-2 text-right">المستحق</th>
                  <th className="py-2 text-right">حالة الدفع</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => {
                  const p = payLabel(r);
                  return (
                    <tr key={r.invoiceId} className="border-b last:border-0">
                      <td className="py-2 font-bold">
                        {r.invoiceNumber}
                        <div className="text-[11px] font-normal text-muted-foreground">{r.invoiceDate}</div>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {r.periodStart && r.periodEnd ? `${r.periodStart} ← ${r.periodEnd}` : "—"}
                      </td>
                      <td className="py-2">{money(r.total)}</td>
                      <td className="py-2">{money(r.paid)}</td>
                      <td className="py-2 font-bold">{money(r.remaining)}</td>
                      <td className="py-2">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${p.cls}`}>{p.label}</span>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{statusLabel[r.status] ?? r.status}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
