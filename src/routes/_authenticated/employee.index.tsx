import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { PlusCircle, PackageCheck, Clock, History, CalendarX, Trash2, Droplets, BadgeDollarSign, ClipboardCheck, Boxes, ArrowLeftRight, CalendarClock, BookOpen, Sparkles } from "lucide-react";
import { Can } from "@/components/permission-guard";
import { formatDateAr } from "@/lib/format-date";
import { riyadhToday, riyadhDayStart } from "@/lib/riyadh-time";
import { usePendingOrders } from "@/lib/use-pending-orders";

import { useCurrentUser } from "@/lib/use-current-user";

export const Route = createFileRoute("/_authenticated/employee/")({
  head: () => ({
    meta: [
      { title: "صفحة الموظف — KUBE Kitchen" },
      { name: "description", content: "مهام موظف فرع KUBE المسندة إليه: الطلبات، الاستلام، الجرد، الهدر، الجودة، المبيعات." },
      { property: "og:title", content: "صفحة الموظف — KUBE Kitchen" },
      { property: "og:description", content: "المهام المسندة للموظف في شاشة واحدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmployeeHome,
});

function EmployeeHome() {
  const { data: cu } = useCurrentUser();
  const isAdminOrManager = cu?.roles?.some((r) => r === "admin" || r === "manager");
  const pending = usePendingOrders(20);

  const today = riyadhToday();
  const todayReceipts = useQuery({
    queryKey: ["receipts", "today", today],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("id, received_at, supplier:suppliers(name), total_received, total_damaged")
        .gte("received_at", riyadhDayStart(today))
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="واجهة موظف الفرع" maxWidth="narrow">
      {isAdminOrManager && (
        <div className="mb-4 p-3 bg-muted/70 border border-border rounded-xl flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">أنت مسجل بصلاحيات الإدارة والمالك.</span>
          <Link to="/admin" className="font-bold text-primary hover:underline flex items-center gap-1">
            الانتقال للوحة الإدارة ←
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 mb-7">
        <Can anyOf={["orders_create"]}>
          <Link to="/employee/new-order" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">تسجيل طلب جديد</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/pending" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Clock className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">بانتظار الاستلام</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted font-display font-bold text-muted-foreground">{pending.data?.length ?? 0} معلق</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/today" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-all">
              <PackageCheck className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">استلامات اليوم</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted font-display font-bold text-muted-foreground">{todayReceipts.data?.length ?? 0} مستلم</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/history" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <History className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">سجل آخر 7 أيام</span>
          </Link>
        </Can>
        <Can anyOf={["waste_record"]}>
          <Link to="/employee/waste" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Trash2 className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">تسجيل الهدر</span>
          </Link>
        </Can>
        <Can anyOf={["quality_record"]}>
          <Link to="/employee/quality" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <Droplets className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">قياسات المياه والجودة</span>
          </Link>
        </Can>
        <Can anyOf={["sales_record"]}>
          <Link to="/employee/sales" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <BadgeDollarSign className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">المبيعات اليومية</span>
          </Link>
        </Can>
        <Can anyOf={["count_perform"]}>
          <Link to="/admin/counts" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">الجرد الدوري</span>
          </Link>
        </Can>
        <Can anyOf={["inventory_receive_transfer"]}>
          <Link to="/admin/transfers" className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col items-center justify-center gap-2.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-95 group">
            <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <span className="font-display font-bold text-sm text-foreground text-center">استلام تحويل</span>
          </Link>
        </Can>
      </div>

      <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded-full bg-primary" />
              <h2 className="font-display font-bold text-sm text-foreground">أحدث الطلبات بانتظار الاستلام</h2>
            </div>
            <Can anyOf={["orders_receive"]}>
              <Link to="/employee/no-delivery" className="text-xs font-display font-semibold kube-btn-outline !min-h-0 !py-1.5 !px-3 rounded-xl">
                <CalendarX className="w-3.5 h-3.5" />
                لا يوجد استلام اليوم
              </Link>
            </Can>
          </div>
          {pending.isLoading ? (
            <div className="text-xs text-muted-foreground py-4 text-center">جارٍ تحميل الطلبات…</div>
          ) : (pending.data?.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-border/80 bg-card p-8 text-center text-xs text-muted-foreground">
              لا توجد طلبات معلقة لهذا الفرع اليوم.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pending.data!.map((o) => (
                <Link
                  key={o.id}
                  to="/employee/receive/$orderId"
                  params={{ orderId: o.id }}
                  className="rounded-2xl border border-border/80 bg-card p-4 flex items-center justify-between hover:border-foreground/30 hover:shadow-xs transition-all duration-150 active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-foreground truncate">{o.supplier?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {o.order_number} · طلب {o.order_date ? formatDateAr(`${o.order_date}T12:00:00+03:00`) : "—"}
                      {o.expected_delivery_date && <> · متوقع {formatDateAr(`${o.expected_delivery_date}T12:00:00+03:00`)}</>}
                    </div>
                  </div>
                  <StatusBadge status="pending_receipt" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </Can>
    </AppShell>
  );
}
