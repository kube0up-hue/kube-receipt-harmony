import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { FileText, Truck, ClipboardCheck, AlertTriangle, CheckCircle2, CheckCheck, Wallet, ArrowUpRight } from "lucide-react";
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
    { label: "بانتظار المطابقة", v: s?.pm, icon: ClipboardCheck, color: "text-amber-500 bg-amber-500/10" },
    { label: "فواتير غير مطابقة", v: s?.un, icon: AlertTriangle, color: "text-kube-red bg-kube-red/10" },
    { label: "جاهزة للتحويل المالي", v: s?.ready, icon: CheckCircle2, color: "text-success bg-success/10" },
    { label: "فواتير مسددة بالكامل", v: s?.paid, icon: CheckCheck, color: "text-muted-foreground bg-muted" },
  ];

  const allLinks: { to: string; label: string; desc: string; icon: typeof FileText; perms: Permission[] }[] = [
    { to: "/accountant/invoices/new", label: "فاتورة مورد جديدة", desc: "رفع ومطابقة فاتورة إلكترونية أو ورقية", icon: FileText, perms: ["invoices_create_match"] },
    { to: "/accountant/invoices", label: "سجل كل الفواتير", desc: "متابعة ومطابقة الفواتير الضريبية", icon: FileText, perms: ["invoices_view"] },
    { to: "/accountant/dues", label: "المبالغ المستحقة للسداد", desc: "أرصدة الموردين وجداول الاستحقاق", icon: Wallet, perms: ["reports_dues"] },
    { to: "/accountant/suppliers", label: "دليل وحسابات الموردين", desc: "بيانات التواصل والسجلات الضريبية", icon: Truck, perms: ["suppliers_view"] },
    { to: "/accountant/receipts", label: "استلامات الفروع", desc: "مراجعة إيصالات الاستلام الفعلية", icon: ClipboardCheck, perms: ["orders_view"] },
    { to: "/admin", label: "لوحة الإدارة والتحليلات", desc: "مؤشرات الفروع وتقارير التشغيل الشاملة", icon: AlertTriangle, perms: ["reports_integrity"] },
  ];

  const links = allLinks.filter((l) => canAny(l.perms));

  return (
    <AppShell title="لوحة المحاسبة والمطابقة" maxWidth="wide">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-border/80 bg-card p-4 md:p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-display font-medium text-muted-foreground mb-2">
              <span className={`p-1.5 rounded-lg ${c.color}`}>
                <c.icon className="w-3.5 h-3.5" />
              </span>
              <span>{c.label}</span>
            </div>
            <div className="text-2xl md:text-3xl font-display font-black text-foreground tabular-nums tracking-tight">
              {c.v ?? "—"}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <span className="w-1.5 h-3.5 rounded-full bg-primary" />
          <h2 className="text-xs font-display font-bold text-foreground/80 uppercase tracking-wider">
            الوظائف والعمليات المالية
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-2xl border border-border/80 bg-card p-4 flex items-start gap-3.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 group active:scale-[0.99]"
            >
              <div className="p-2.5 rounded-xl bg-muted/60 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-150 shrink-0 mt-0.5">
                <l.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    {l.label}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                  {l.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
