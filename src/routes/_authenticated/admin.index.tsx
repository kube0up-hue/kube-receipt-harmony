import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Package, Truck, ClipboardList, FileText, BarChart3, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});


function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // بداية اليوم بتوقيت الرياض (UTC+3) كلحظة UTC
      const riyadhParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Riyadh",
        year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(new Date()).reduce<Record<string, string>>((a, p) => { a[p.type] = p.value; return a; }, {});
      const todayRiyadh = `${riyadhParts.year}-${riyadhParts.month}-${riyadhParts.day}`;
      const startOfTodayUTC = new Date(`${todayRiyadh}T00:00:00+03:00`).toISOString();
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [pending, todayR, unappr, invMatch, invUnmatch, invReady] = await Promise.all([
        supabase.from("v_orders_effective").select("id", { count: "exact", head: true }).eq("effective_status", "pending_receipt"),
        supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", startOfTodayUTC),
        supabase.from("receipts").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "pending_match"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "unmatched"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "matched_ready"),
      ]);
      const damagedSum = await supabase
        .from("receipts").select("total_damaged").gte("received_at", weekAgo);
      const shortSum = await supabase
        .from("receipts").select("total_short").gte("received_at", weekAgo);
      const sum = (rows: { total_damaged?: number; total_short?: number }[] | null, k: "total_damaged" | "total_short") =>
        (rows ?? []).reduce((a, r) => a + Number(r[k] ?? 0), 0);
      return {
        pending: pending.count ?? 0,
        today: todayR.count ?? 0,
        unappr: unappr.count ?? 0,
        damaged: sum(damagedSum.data as never, "total_damaged"),
        short: sum(shortSum.data as never, "total_short"),
        invMatch: invMatch.count ?? 0,
        invUnmatch: invUnmatch.count ?? 0,
        invReady: invReady.count ?? 0,
      };
    },
  });

  const s = stats.data;
  const [openDetail, setOpenDetail] = useState<null | "short" | "damaged">(null);

  const detail = useQuery({
    enabled: openDetail !== null,
    queryKey: ["admin-stats-detail", openDetail],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: receipts } = await supabase
        .from("receipts")
        .select("id, received_at, order_id, orders(order_number, suppliers(name)), receipt_items(ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note, products(name, unit))")
        .gte("received_at", weekAgo)
        .order("received_at", { ascending: false });
      const rows: Array<{
        receiptId: string; orderNumber: string; supplier: string; date: string;
        product: string; unit: string; ordered: number; accepted: number; damaged: number; qty: number; note: string | null;
      }> = [];
      (receipts ?? []).forEach((r: any) => {
        (r.receipt_items ?? []).forEach((it: any) => {
          const shortQty = Number(it.diff) < 0 ? -Number(it.diff) : 0;
          const dmg = Number(it.damaged_qty ?? 0);
          const qty = openDetail === "short" ? shortQty : dmg;
          if (qty > 0) {
            rows.push({
              receiptId: r.id,
              orderNumber: r.orders?.order_number ?? "-",
              supplier: r.orders?.suppliers?.name ?? "-",
              date: r.received_at,
              product: it.products?.name ?? "-",
              unit: it.products?.unit ?? "",
              ordered: Number(it.ordered_qty ?? 0),
              accepted: Number(it.accepted_qty ?? 0),
              damaged: dmg,
              qty,
              note: it.note ?? null,
            });
          }
        });
      });
      return rows;
    },
  });

  const cards: Array<{ label: string; v: number | undefined; onClick?: () => void }> = [
    { label: "طلبات بانتظار الاستلام", v: s?.pending },
    { label: "استلامات اليوم", v: s?.today },
    { label: "استلامات غير معتمدة", v: s?.unappr },
    { label: "تالف هذا الأسبوع", v: s?.damaged, onClick: () => setOpenDetail("damaged") },
    { label: "نقص هذا الأسبوع", v: s?.short, onClick: () => setOpenDetail("short") },
    { label: "فواتير بانتظار المطابقة", v: s?.invMatch },
    { label: "فواتير غير مطابقة", v: s?.invUnmatch },
    { label: "فواتير جاهزة للتحويل", v: s?.invReady },
  ];

  const links: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { to: "/admin/employees", label: "الموظفون", icon: Users },
    { to: "/admin/suppliers", label: "الموردون", icon: Truck },
    { to: "/admin/products", label: "المنتجات", icon: Package },
    { to: "/admin/orders", label: "الطلبات والاستلامات", icon: ClipboardList },
    { to: "/admin/invoices", label: "الفواتير", icon: FileText },
    { to: "/admin/payments", label: "السداد", icon: Wallet },
    { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
  ];

  const totalQty = (detail.data ?? []).reduce((a, r) => a + r.qty, 0);

  return (
    <AppShell title="لوحة الإدارة">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => {
          const clickable = !!c.onClick;
          return (
            <button
              key={c.label}
              type="button"
              onClick={c.onClick}
              disabled={!clickable}
              className={`kube-card text-right ${clickable ? "hover:border-primary transition cursor-pointer" : "cursor-default"}`}
            >
              <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
              <div className="text-2xl font-extrabold">{c.v ?? "—"}</div>
              {clickable && <div className="text-[10px] text-muted-foreground mt-1">اضغط للتفاصيل</div>}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="kube-card flex items-center gap-3 hover:border-primary transition">
            <l.icon className="w-5 h-5 text-primary" />
            <span className="font-bold">{l.label}</span>
          </Link>
        ))}
      </div>

      <Dialog open={openDetail !== null} onOpenChange={(o) => !o && setOpenDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {openDetail === "short" ? "تفاصيل النقص هذا الأسبوع" : "تفاصيل التالف هذا الأسبوع"}
            </DialogTitle>
          </DialogHeader>
          {detail.isLoading ? (
            <div className="py-8 text-center text-muted-foreground">جارِ التحميل…</div>
          ) : (detail.data ?? []).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                الإجمالي: <span className="font-extrabold text-foreground">{totalQty}</span> وحدة عبر {detail.data!.length} بند
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-right">الطلب</th>
                      <th className="p-2 text-right">المورد</th>
                      <th className="p-2 text-right">المنتج</th>
                      <th className="p-2 text-center">مطلوب</th>
                      <th className="p-2 text-center">مقبول</th>
                      {openDetail === "damaged" && <th className="p-2 text-center">تالف</th>}
                      <th className="p-2 text-center">{openDetail === "short" ? "نقص" : "الكمية"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.data!.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-mono">{r.orderNumber}</td>
                        <td className="p-2">{r.supplier}</td>
                        <td className="p-2">
                          <div className="font-bold">{r.product}</div>
                          {r.note && <div className="text-[10px] text-muted-foreground mt-0.5">{r.note}</div>}
                          <div className="text-[10px] text-muted-foreground">{new Date(r.date).toLocaleDateString("ar-SA")}</div>
                        </td>
                        <td className="p-2 text-center">{r.ordered} {r.unit}</td>
                        <td className="p-2 text-center">{r.accepted} {r.unit}</td>
                        {openDetail === "damaged" && <td className="p-2 text-center text-destructive font-bold">{r.damaged}</td>}
                        <td className="p-2 text-center text-destructive font-bold">{r.qty} {r.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

