import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { riyadhDayEndExclusive, riyadhDayOffset, riyadhDayStart, riyadhToday } from "@/lib/riyadh-time";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { formatDateTimeAr } from "@/lib/format-date";
import { formatMoneySar } from "@/lib/money";
import { Download, Printer, Building2, Truck, Calendar, Layers, AlertTriangle, CheckCircle2, FileText, Package } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: () => (
    <PermissionGuard anyOf={["reports_export", "reports_dues"]}>
      <ReportsPage />
    </PermissionGuard>
  ),
});

type ReportTab = "summary" | "receipts" | "discrepancies" | "invoices";

function ReportsPage() {
  const { branchId, label: branchLabel } = useBranchFilter();
  const [from, setFrom] = useState(() => riyadhDayOffset(-30));
  const [to, setTo] = useState(() => riyadhToday());
  const [supplierId, setSupplierId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ReportTab>("summary");

  const suppliers = useQuery({
    queryKey: ["suppliers-report-filter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const reportData = useQuery({
    queryKey: ["admin-comprehensive-report", from, to, supplierId, branchId],
    queryFn: async () => {
      // 1. Receipts
      let rQuery = supabase
        .from("receipts")
        .select(`
          id, received_at, status, total_ordered, total_received, total_accepted, total_damaged, total_short, total_over,
          supplier:suppliers(id, name),
          employee:employees(full_name),
          order:orders(order_number),
          branch:branches(name),
          items:receipt_items(
            ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note,
            product:products(name, unit)
          )
        `)
        .gte("received_at", riyadhDayStart(from))
        .lt("received_at", riyadhDayEndExclusive(to))
        .order("received_at", { ascending: false });

      if (supplierId) rQuery = rQuery.eq("supplier_id", supplierId);
      if (branchId) rQuery = rQuery.eq("branch_id", branchId);

      // 2. Invoices
      let iQuery = supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, period_start, period_end, total_amount, status, supplier:suppliers(name)")
        .gte("invoice_date", from)
        .lte("invoice_date", to)
        .order("invoice_date", { ascending: false });

      if (supplierId) iQuery = iQuery.eq("supplier_id", supplierId);

      // 3. Payments
      let pQuery = supabase
        .from("payments")
        .select("id, amount, payment_date, reference_number, invoice:invoices(invoice_number, supplier_id)")
        .gte("payment_date", from)
        .lte("payment_date", to);

      const [recsRes, invsRes, paysRes] = await Promise.all([rQuery, iQuery, pQuery]);
      if (recsRes.error) throw recsRes.error;
      if (invsRes.error) throw invsRes.error;
      if (paysRes.error) throw paysRes.error;

      const receipts = recsRes.data ?? [];
      const invoices = invsRes.data ?? [];
      const payments = paysRes.data ?? [];

      return {
        receipts,
        invoices,
        payments,
      };
    },
  });

  const d = reportData.data;

  const totals = useMemo(() => {
    const list = d?.receipts ?? [];
    const invs = d?.invoices ?? [];
    const pays = d?.payments ?? [];

    return {
      receiptCount: list.length,
      ordered: list.reduce((a, r) => a + Number(r.total_ordered ?? 0), 0),
      accepted: list.reduce((a, r) => a + Number(r.total_accepted ?? 0), 0),
      damaged: list.reduce((a, r) => a + Number(r.total_damaged ?? 0), 0),
      short: list.reduce((a, r) => a + Number(r.total_short ?? 0), 0),
      over: list.reduce((a, r) => a + Number(r.total_over ?? 0), 0),
      invoiceCount: invs.length,
      invoiceTotal: invs.reduce((a, i) => a + Number(i.total_amount ?? 0), 0),
      paidTotal: pays.reduce((a, p) => a + Number(p.amount ?? 0), 0),
    };
  }, [d]);

  const discrepancies = useMemo(() => {
    return (d?.receipts ?? []).filter(
      (r) => Number(r.total_damaged ?? 0) > 0 || Number(r.total_short ?? 0) > 0 || Number(r.total_over ?? 0) > 0
    );
  }, [d?.receipts]);

  function exportCSV() {
    if (!d?.receipts.length) return;
    const header = [
      "رقم_الاستلام",
      "التاريخ",
      "الفرع",
      "المورد",
      "رقم_الطلب",
      "الموظف",
      "المطلوب",
      "المقبول",
      "التالف",
      "النقص",
      "الزيادة",
      "الحالة",
    ];

    const rows = d.receipts.map((r: any) => [
      r.id.slice(0, 8),
      formatDateTimeAr(r.received_at),
      r.branch?.name ?? "-",
      r.supplier?.name ?? "-",
      r.order?.order_number ?? "-",
      r.employee?.full_name ?? "-",
      r.total_ordered ?? 0,
      r.total_accepted ?? 0,
      r.total_damaged ?? 0,
      r.total_short ?? 0,
      r.total_over ?? 0,
      r.status,
    ]);

    const csvContent = "\uFEFF" + [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-KUBE-${branchLabel}-${from}_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <AppShell title="التقارير المتقدمة والتصدير" back={{ to: "/admin" }} maxWidth="wide">
      {/* فلتر الفروع والتاريخ */}
      <div className="kube-card mb-6 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-primary" />
            <span>نطاق الفرع: <span className="font-bold text-foreground">{branchLabel}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={!d?.receipts.length}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-muted hover:bg-muted/80 border border-border transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              تصدير CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة التقرير
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> من تاريخ
            </label>
            <input
              type="date"
              className="kube-input w-full text-sm"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> إلى تاريخ
            </label>
            <input
              type="date"
              className="kube-input w-full text-sm"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-muted-foreground flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> المورد
            </label>
            <select
              className="kube-input w-full text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">كل الموردين</option>
              {(suppliers.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* فترات سريعة */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-muted-foreground ml-1">فترات جاهزة:</span>
          <button
            type="button"
            onClick={() => { setFrom(riyadhDayOffset(-7)); setTo(riyadhToday()); }}
            className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium transition"
          >
            آخر 7 أيام
          </button>
          <button
            type="button"
            onClick={() => { setFrom(riyadhDayOffset(-30)); setTo(riyadhToday()); }}
            className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium transition"
          >
            آخر 30 يوم
          </button>
          <button
            type="button"
            onClick={() => { setFrom(riyadhDayOffset(-90)); setTo(riyadhToday()); }}
            className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium transition"
          >
            آخر 3 أشهر
          </button>
          <button
            type="button"
            onClick={() => { setFrom(riyadhDayOffset(-365)); setTo(riyadhToday()); }}
            className="px-2.5 py-1 rounded bg-muted/60 hover:bg-muted font-medium transition"
          >
            السنة الحالية
          </button>
        </div>
      </div>

      {/* المؤشرات الإحصائية السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">الاستلامات</div>
          <div className="text-2xl font-extrabold">{totals.receiptCount}</div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">الكمية المقبولة</div>
          <div className="text-2xl font-extrabold text-foreground">{totals.accepted}</div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">إجمالي التالف</div>
          <div className={`text-2xl font-extrabold ${totals.damaged > 0 ? "text-kube-red" : "text-foreground"}`}>
            {totals.damaged}
          </div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">إجمالي النقص</div>
          <div className={`text-2xl font-extrabold ${totals.short > 0 ? "text-kube-red" : "text-foreground"}`}>
            {totals.short}
          </div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">إجمالي الفواتير</div>
          <div className="text-xl font-extrabold truncate">{formatMoneySar(totals.invoiceTotal)}</div>
        </div>
        <div className="kube-card">
          <div className="text-xs text-muted-foreground mb-1">إجمالي المسدَّد</div>
          <div className="text-xl font-extrabold text-success truncate">{formatMoneySar(totals.paidTotal)}</div>
        </div>
      </div>

      {/* أزرار التبويبات */}
      <div className="flex gap-2 mb-4 border-b border-border pb-2 print:hidden">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "summary" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          ملخص التحليل
        </button>
        <button
          onClick={() => setActiveTab("receipts")}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "receipts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          سجل الاستلامات التفصيلي ({d?.receipts.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("discrepancies")}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "discrepancies" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          الفروقات والتوالف ({discrepancies.length})
        </button>
        <button
          onClick={() => setActiveTab("invoices")}
          className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${activeTab === "invoices" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
        >
          الفواتير والدفعات ({d?.invoices.length ?? 0})
        </button>
      </div>

      {/* محتوى التبويبات */}
      {reportData.isLoading ? (
        <div className="kube-card text-center py-12 text-muted-foreground">جارٍ تحميل التقرير الشامل…</div>
      ) : activeTab === "summary" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="kube-card space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> مؤشرات دقة التوريد
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">نسبة المطابقة التامة:</span>
                  <span className="font-bold">
                    {totals.receiptCount > 0
                      ? `${(((totals.receiptCount - discrepancies.length) / totals.receiptCount) * 100).toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">استلامات بها ملاحظات/تالف:</span>
                  <span className={`font-bold ${discrepancies.length > 0 ? "text-kube-red" : ""}`}>{discrepancies.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">إجمالي القطع المطلوبة:</span>
                  <span className="font-bold">{totals.ordered}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">إجمالي القطع المستلمة المقبولة:</span>
                  <span className="font-bold text-success">{totals.accepted}</span>
                </div>
              </div>
            </div>

            <div className="kube-card space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> مؤشرات المالية والمطابقة
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">إجمالي مبالغ الفواتير:</span>
                  <span className="font-bold">{formatMoneySar(totals.invoiceTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">إجمالي المبالغ المسددة:</span>
                  <span className="font-bold text-success">{formatMoneySar(totals.paidTotal)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">المتبقي غير المسدد:</span>
                  <span className="font-bold text-kube-red">{formatMoneySar(totals.invoiceTotal - totals.paidTotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">عدد الفواتير المسجلة:</span>
                  <span className="font-bold">{totals.invoiceCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "receipts" ? (
        <div className="kube-card overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="p-2.5">التاريخ والوقت</th>
                <th className="p-2.5">رقم الطلب</th>
                <th className="p-2.5">المورد</th>
                <th className="p-2.5">الفرع</th>
                <th className="p-2.5">المستلم بواسطة</th>
                <th className="p-2.5 text-center">مطلوب</th>
                <th className="p-2.5 text-center">مقبول</th>
                <th className="p-2.5 text-center">تالف</th>
                <th className="p-2.5 text-center">نقص</th>
                <th className="p-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(d?.receipts ?? []).map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition">
                  <td className="p-2.5 font-medium whitespace-nowrap">{formatDateTimeAr(r.received_at)}</td>
                  <td className="p-2.5 font-bold whitespace-nowrap">{r.order?.order_number ?? "—"}</td>
                  <td className="p-2.5">{r.supplier?.name ?? "—"}</td>
                  <td className="p-2.5">{r.branch?.name ?? "—"}</td>
                  <td className="p-2.5">{r.employee?.full_name ?? "—"}</td>
                  <td className="p-2.5 text-center font-bold">{r.total_ordered ?? 0}</td>
                  <td className="p-2.5 text-center font-bold text-success">{r.total_accepted ?? 0}</td>
                  <td className={`p-2.5 text-center font-bold ${Number(r.total_damaged) > 0 ? "text-kube-red" : ""}`}>
                    {r.total_damaged ?? 0}
                  </td>
                  <td className={`p-2.5 text-center font-bold ${Number(r.total_short) > 0 ? "text-kube-red" : ""}`}>
                    {r.total_short ?? 0}
                  </td>
                  <td className="p-2.5 text-center"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {(d?.receipts ?? []).length === 0 && (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-muted-foreground">لا توجد استلامات في هذه الفترة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === "discrepancies" ? (
        <div className="space-y-3">
          {discrepancies.map((r: any) => (
            <div key={r.id} className="kube-card space-y-2 border-r-4 border-r-kube-red">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-kube-red" />
                  <span>{r.supplier?.name}</span>
                  <span className="text-muted-foreground text-xs">· طلب {r.order?.order_number}</span>
                  <span className="text-muted-foreground text-xs">· فرع {r.branch?.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{formatDateTimeAr(r.received_at)}</div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div>مطلوب: <span className="font-bold">{r.total_ordered}</span></div>
                <div>مقبول: <span className="font-bold text-success">{r.total_accepted}</span></div>
                <div>تالف: <span className="font-bold text-kube-red">{r.total_damaged}</span></div>
                <div>نقص: <span className="font-bold text-kube-red">{r.total_short}</span></div>
              </div>
              {r.items?.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">الأصناف المتأثرة:</div>
                  {r.items
                    .filter((it: any) => Number(it.damaged_qty) > 0 || Number(it.diff) !== 0)
                    .map((it: any, i: number) => (
                      <div key={i} className="text-xs bg-muted/40 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className="font-bold">{it.product?.name}</span>
                          {it.note && <span className="text-muted-foreground mr-2 font-normal">({it.note})</span>}
                        </div>
                        <div className="flex gap-3">
                          {Number(it.damaged_qty) > 0 && <span className="text-kube-red">تالف: {it.damaged_qty}</span>}
                          {Number(it.diff) < 0 && <span className="text-kube-red">نقص: {-Number(it.diff)}</span>}
                          {Number(it.diff) > 0 && <span className="text-amber-600">زيادة: {it.diff}</span>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
          {discrepancies.length === 0 && (
            <div className="kube-card text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
              <span>ممتاز! لا توجد أي فروقات أو توالف في هذه الفترة.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="kube-card overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="p-2.5">رقم الفاتورة</th>
                <th className="p-2.5">المورد</th>
                <th className="p-2.5">تاريخ الفاتورة</th>
                <th className="p-2.5">فترة المطابقة</th>
                <th className="p-2.5 text-center">المبلغ الإجمالي</th>
                <th className="p-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(d?.invoices ?? []).map((inv: any) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition">
                  <td className="p-2.5 font-bold">{inv.invoice_number}</td>
                  <td className="p-2.5">{inv.supplier?.name ?? "—"}</td>
                  <td className="p-2.5">{inv.invoice_date}</td>
                  <td className="p-2.5 text-muted-foreground">{inv.period_start} → {inv.period_end}</td>
                  <td className="p-2.5 text-center font-bold">{formatMoneySar(inv.total_amount)}</td>
                  <td className="p-2.5 text-center"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
              {(d?.invoices ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد فواتير مسجلة في هذه الفترة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
