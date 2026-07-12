import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Users, Package, Truck, ClipboardList, FileText, BarChart3, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const [pending, todayR, unappr, invMatch, invUnmatch, invReady] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_receipt"),
        supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", `${today}T00:00:00`),
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
  const cards = [
    { label: "طلبات بانتظار الاستلام", v: s?.pending },
    { label: "استلامات اليوم", v: s?.today },
    { label: "استلامات غير معتمدة", v: s?.unappr },
    { label: "تالف هذا الأسبوع", v: s?.damaged },
    { label: "نقص هذا الأسبوع", v: s?.short },
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

  return (
    <AppShell title="لوحة الإدارة">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="kube-card">
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className="text-2xl font-extrabold">{c.v ?? "—"}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="kube-card flex items-center gap-3 hover:border-primary transition">
            <l.icon className="w-5 h-5 text-primary" />
            <span className="font-bold">{l.label}</span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-6 text-center">
        الأقسام التفصيلية (إدارة الموظفين/الموردين/المنتجات/الفواتير/التقارير) قيد الإنشاء وستُفعّل في الرسائل التالية.
      </p>
    </AppShell>
  );
}
