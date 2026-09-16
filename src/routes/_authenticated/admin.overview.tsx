import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { formatMoneySar } from "@/lib/money";
import { AlertTriangle, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/overview")({
  head: () => ({
    meta: [
      { title: "لوحة المالك — KUBE Kitchen" },
      { name: "description", content: "نظرة شاملة على فروع KUBE: النواقص، الجرد، الهدر، المبيعات، الجودة، والفواتير المعلّقة." },
      { property: "og:title", content: "لوحة المالك — KUBE Kitchen" },
      { property: "og:description", content: "مؤشرات وتنبيهات كل الفروع في شاشة واحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard>
      <OverviewPage />
    </RoleGuard>
  ),
});

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

function OverviewPage() {
  const { branchId, label } = useBranchFilter();

  const q = useQuery({
    queryKey: ["owner-overview", branchId],
    queryFn: async () => {
      const bq = <T,>(p: any) => (branchId ? p.eq("branch_id", branchId) : p) as T;

      const [low, counts, quality, sales, waste, invoices, transfers] = await Promise.all([
        bq<any>(supabase.from("stock_levels").select("qty, products(name, min_qty), branches(name)")),
        bq<any>(supabase.from("count_sessions").select("id, status, count_date, branches(name)").in("status", ["open", "in_progress", "submitted", "reviewed"])),
        bq<any>(supabase.from("quality_readings").select("id, status, value, reading_at, quality_metrics(label), branches(name)").neq("status", "ok").gte("reading_at", daysAgo(7))),
        bq<any>(supabase.from("daily_sales").select("id, sales_date, total_sales, status, branches(name)").gte("sales_date", daysAgo(7).slice(0, 10))),
        bq<any>(supabase.from("waste_entries").select("qty, waste_value, created_at").gte("created_at", daysAgo(7))),
        supabase.from("invoices").select("id, invoice_number, status, total_amount").in("status", ["pending_match", "unmatched", "approved_for_payment"]),
        (branchId
          ? supabase.from("stock_transfers").select("id, status").eq("status", "sent").or(`from_branch_id.eq.${branchId},to_branch_id.eq.${branchId}`)
          : supabase.from("stock_transfers").select("id, status").eq("status", "sent")) as any,
      ]);

      const lowStock = ((low.data ?? []) as any[]).filter(
        (r) => Number(r.products?.min_qty ?? 0) > 0 && Number(r.qty) < Number(r.products?.min_qty ?? 0),
      );
      const sessions = (counts.data ?? []) as any[];
      const pendingSales = ((sales.data ?? []) as any[]).filter((s) => s.status !== "approved");
      const approvedSales = ((sales.data ?? []) as any[]).filter((s) => s.status === "approved");

      return {
        lowStock,
        sessions,
        quality: (quality.data ?? []) as any[],
        pendingSales,
        salesTotal: approvedSales.reduce((a, s) => a + Number(s.total_sales ?? 0), 0),
        wasteValue: ((waste.data ?? []) as any[]).reduce((a, w) => a + Number(w.waste_value ?? 0), 0),
        wasteCount: ((waste.data ?? []) as any[]).length,
        invoices: (invoices.data ?? []) as any[],
        transfersInTransit: ((transfers.data ?? []) as any[]).length,
      };
    },
  });

  const d = q.data;

  const alerts: Array<{ text: string; to: string }> = [];
  if (d) {
    if (d.lowStock.length) alerts.push({ text: `${d.lowStock.length} صنف تحت الحد الأدنى`, to: "/admin/inventory" });
    if (d.quality.length) alerts.push({ text: `${d.quality.length} قياس جودة/مياه خارج الحد`, to: "/admin/quality" });
    if (d.pendingSales.length) alerts.push({ text: `${d.pendingSales.length} يوم مبيعات بانتظار الاعتماد`, to: "/admin/sales" });
    if (d.sessions.length) alerts.push({ text: `${d.sessions.length} جرد غير معتمد`, to: "/admin/counts" });
    if (d.transfersInTransit) alerts.push({ text: `${d.transfersInTransit} تحويل مخزون بانتظار الاستلام`, to: "/admin/transfers" });
    if (d.invoices.length) alerts.push({ text: `${d.invoices.length} فاتورة معلّقة`, to: "/admin/invoices" });
  }

  const money = (n: number) => formatMoneySar(n);

  const cards = [
    { label: "مبيعات معتمدة (7 أيام)", v: d ? money(d.salesTotal) : "—" },
    { label: "قيمة الهدر (7 أيام)", v: d ? money(d.wasteValue) : "—" },
    { label: "عدد عمليات الهدر", v: d ? String(d.wasteCount) : "—" },
    { label: "أصناف تحت الحد الأدنى", v: d ? String(d.lowStock.length) : "—" },
  ];

  return (
    <AppShell title={`لوحة المالك — ${label}`} back={{ to: "/admin" }}>
      {q.isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {cards.map((c) => (
              <div key={c.label} className="kube-card">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="text-lg font-extrabold mt-1">{c.v}</div>
              </div>
            ))}
          </div>

          <section>
            <h2 className="font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${alerts.length ? "text-kube-red" : ""}`} /> التنبيهات
            </h2>
            {alerts.length === 0 ? (
              <div className="kube-card text-center text-sm text-muted-foreground">لا توجد تنبيهات — كل شيء منتظم.</div>
            ) : (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <Link key={a.text} to={a.to} className="kube-card border-r-4 border-r-kube-red flex items-center justify-between">
                    <span className="font-semibold text-sm">{a.text}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {d && d.lowStock.length > 0 && (
            <section>
              <h2 className="font-bold mb-2">النواقص</h2>
              <div className="space-y-2">
                {d.lowStock.slice(0, 20).map((r: any, i: number) => (
                  <div key={i} className="kube-card flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{r.products?.name ?? "—"}</div>
                      {!branchId && r.branches?.name && <div className="text-xs text-muted-foreground">{r.branches.name}</div>}
                    </div>
                    <div className="text-xs text-kube-red font-semibold shrink-0">
                      {Number(r.qty)} / الحد {Number(r.products?.min_qty)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}
