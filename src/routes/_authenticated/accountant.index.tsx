import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { FileText, Truck, ClipboardCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/accountant/")({
  component: AccountantHome,
});

function AccountantHome() {
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
  const links = [
    { to: "/accountant/invoices/new", label: "فاتورة مورد جديدة", icon: FileText },
    { to: "/accountant/invoices", label: "كل الفواتير", icon: FileText },
    { to: "/accountant/suppliers", label: "الموردون", icon: Truck },
    { to: "/accountant/receipts", label: "الاستلامات", icon: ClipboardCheck },
    { to: "/admin", label: "فحص سلامة البيانات (لوحة الإدارة)", icon: AlertTriangle },
  ];
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
      <p className="text-xs text-muted-foreground mt-6 text-center">
        شاشات إنشاء الفواتير والمطابقة قيد الإنشاء وستُفعّل قريبًا.
      </p>
    </AppShell>
  );
}
