import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { PlusCircle, PackageCheck, Clock, History, CalendarX, Trash2, Droplets, BadgeDollarSign, ClipboardCheck, Boxes, ArrowLeftRight, CalendarClock, BookOpen } from "lucide-react";
import { Can } from "@/components/permission-guard";
import { formatDateAr } from "@/lib/format-date";
import { riyadhToday, riyadhDayStart } from "@/lib/riyadh-time";
import { usePendingOrders } from "@/lib/use-pending-orders";

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
    <AppShell title="واجهة موظف الفرع">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Can anyOf={["orders_create"]}>
          <Link to="/employee/new-order" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <PlusCircle className="w-8 h-8" />
            <span className="font-bold text-center">تسجيل طلب جديد</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/pending" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Clock className="w-8 h-8" />
            <span className="font-bold text-center">بانتظار الاستلام</span>
            <span className="text-xs text-muted-foreground">{pending.data?.length ?? 0}</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/today" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <PackageCheck className="w-8 h-8" />
            <span className="font-bold text-center">استلامات اليوم</span>
            <span className="text-xs text-muted-foreground">{todayReceipts.data?.length ?? 0}</span>
          </Link>
        </Can>
        <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
          <Link to="/employee/history" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <History className="w-8 h-8" />
            <span className="font-bold text-center">سجل آخر 7 أيام</span>
          </Link>
        </Can>
        <Can anyOf={["waste_record"]}>
          <Link to="/employee/waste" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Trash2 className="w-8 h-8" />
            <span className="font-bold text-center">تسجيل الهدر</span>
          </Link>
        </Can>
        <Can anyOf={["quality_record"]}>
          <Link to="/employee/quality" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Droplets className="w-8 h-8" />
            <span className="font-bold text-center">قياسات المياه والجودة</span>
          </Link>
        </Can>
        <Can anyOf={["sales_record"]}>
          <Link to="/employee/sales" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <BadgeDollarSign className="w-8 h-8" />
            <span className="font-bold text-center">المبيعات اليومية</span>
          </Link>
        </Can>
        <Can anyOf={["count_perform", "count_review", "count_approve"]}>
          <Link to="/admin/counts" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <ClipboardCheck className="w-8 h-8" />
            <span className="font-bold text-center">الجرد</span>
          </Link>
        </Can>
        <Can anyOf={["inventory_view"]}>
          <Link to="/admin/inventory" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Boxes className="w-8 h-8" />
            <span className="font-bold text-center">المخزون</span>
          </Link>
        </Can>
        <Can anyOf={["inventory_transfer", "inventory_receive_transfer"]}>
          <Link to="/admin/transfers" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <ArrowLeftRight className="w-8 h-8" />
            <span className="font-bold text-center">تحويلات المخزون</span>
          </Link>
        </Can>
        <Can anyOf={["waste_view"]}>
          <Link to="/admin/waste" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Trash2 className="w-8 h-8" />
            <span className="font-bold text-center">تقارير الهدر</span>
          </Link>
        </Can>
        <Can anyOf={["quality_view"]}>
          <Link to="/admin/quality" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <Droplets className="w-8 h-8" />
            <span className="font-bold text-center">تقارير الجودة والمياه</span>
          </Link>
        </Can>
        <Can anyOf={["sales_review", "sales_edit_approved"]}>
          <Link to="/admin/sales" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <BadgeDollarSign className="w-8 h-8" />
            <span className="font-bold text-center">مراجعة المبيعات</span>
          </Link>
        </Can>
        <Can anyOf={["schedules_manage"]}>
          <Link to="/admin/shifts" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <CalendarClock className="w-8 h-8" />
            <span className="font-bold text-center">الدوامات</span>
          </Link>
        </Can>
        <Can anyOf={["recipes_manage"]}>
          <Link to="/admin/recipes" className="kube-card flex flex-col items-center gap-2 py-6 hover:border-primary transition">
            <BookOpen className="w-8 h-8" />
            <span className="font-bold text-center">الوصفات</span>
          </Link>
        </Can>
      </div>

      <Can anyOf={["orders_receive", "orders_view", "orders_create"]}>
        <section>
          <h2 className="font-bold mb-3 flex items-center justify-between">
            <span>أحدث الطلبات بانتظار الاستلام</span>
            <Can anyOf={["orders_receive"]}>
              <Link to="/employee/no-delivery" className="text-xs kube-btn-outline !min-h-0 !py-1 !px-3">
                <CalendarX className="w-4 h-4" />
                لا يوجد استلام اليوم
              </Link>
            </Can>
          </h2>
          {pending.isLoading ? (
            <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
          ) : (pending.data?.length ?? 0) === 0 ? (
            <div className="kube-card text-center text-muted-foreground">لا توجد طلبات معلقة.</div>
          ) : (
            <div className="space-y-2">
              {pending.data!.map((o) => (
                <Link
                  key={o.id}
                  to="/employee/receive/$orderId"
                  params={{ orderId: o.id }}
                  className="kube-card flex items-center justify-between hover:border-primary transition"
                >
                  <div className="min-w-0">
                    <div className="font-bold truncate">{o.supplier?.name ?? "—"}</div>
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
