import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { FileText, Truck, ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, Wallet } from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import type { Permission } from "@/lib/permissions";

import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/accountant/")({
  head: () => ({
    meta: [
      { title: "لوحة المحاسب — KUBE Kitchen" },
      { name: "description", content: "فواتير موردي KUBE ومطابقتها والدفعات والمبالغ المستحقة للسداد." },
      { property: "og:title", content: "لوحة المحاسب — KUBE Kitchen" },
      { property: "og:description", content: "إدارة الفواتير والمستحقات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["invoices_view", "suppliers_view", "reports_dues", "payments_view"]}>
      <AccountantHome />
    </PermissionGuard>
  ),
});

function AccountantHome() {
  const { canAny } = usePermissions();
  const stats = useQuery({
    queryKey: ["accountant-stats"],
    queryFn: async () => {
      const [pm, un, ready, paid] = await Promise.all([
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "pending_match"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "unmatched"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "matched_ready"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "paid"),
      ]);
      return { pm: pm.count ?? 0, un: un.count ?? 0, ready: ready.count ?? 0, paid: paid.count ?? 0 };
    },
  });
  const s = stats.data;
  const cards = [
    { label: "بانتظار المطابقة", v: s?.pm, icon: ClipboardCheck },
    { label: "غير مطابقة", v: s?.un, icon: AlertTriangle },
    { label: "جاهزة للتحويل", v: s?.ready, icon: CheckCircle2 },
    { label: "مسددة", v: s?.paid, icon: XCircle },
  ];
  const allLinks: { to: string; label: string; icon: typeof FileText; perms: Permission[] }[] = [
    { to: "/accountant/invoices/new", label: "فاتورة مورد جديدة", icon: FileText, perms: ["invoices_create_match"] },
    { to: "/accountant/invoices", label: "كل الفواتير", icon: FileText, perms: ["invoices_view"] },
    { to: "/accountant/suppliers", label: "الموردون", icon: Truck, perms: ["suppliers_view"] },
    { to: "/accountant/dues", label: "المبالغ المستحقة للسداد", icon: Wallet, perms: ["reports_dues"] },
    { to: "/accountant/receipts", label: "الاستلامات", icon: ClipboardCheck, perms: ["orders_view"] },
    { to: "/admin", label: "فحص سلامة البيانات (لوحة الإدارة)", icon: AlertTriangle, perms: ["reports_integrity"] },
  ];
  const links = allLinks.filter((l) => canAny(l.perms));
  return (
    <AppShell title="واجهة المحاسب">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => (
          <div key={c.label} className="kube-card">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <c.icon className="w-4 h-4" />{c.label}
            </div>
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
    </AppShell>
  );
}
