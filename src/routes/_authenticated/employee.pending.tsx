import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";
import { usePendingOrders } from "@/lib/use-pending-orders";
import { RefreshCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/pending")({
  component: PendingPage,
});

function PendingPage() {
  const { data, isLoading, isFetching, dataUpdatedAt, refetch } = usePendingOrders();

  function ageLabel(d: string) {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (diff <= 0) return "اليوم";
    if (diff === 1) return "أمس";
    return `منذ ${diff} يوم`;
  }

  return (
    <AppShell title="الطلبات بانتظار الاستلام" back={{ to: "/employee" }}>
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <span>آخر تحديث: {dataUpdatedAt ? formatDateTimeAr(dataUpdatedAt) : "—"}</span>
        <button type="button" onClick={() => void refetch()} className="kube-btn-outline !min-h-0 !py-1 !px-3">
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          تحديث
        </button>
      </div>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا توجد طلبات معلقة.</div>
      ) : (
        <div className="space-y-2">
          {data!.map((o) => (
            <Link key={o.id} to="/employee/receive/$orderId" params={{ orderId: o.id }} className="kube-card flex items-center justify-between hover:border-primary transition">
              <div className="min-w-0">
                <div className="font-bold">{o.supplier?.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {o.order_number} · {o.order_date ? formatDateAr(`${o.order_date}T12:00:00+03:00`) : "—"} · <span className="font-semibold">{ageLabel(o.created_at ?? new Date().toISOString())}</span>
                  {o.expected_delivery_date && <> · متوقع {formatDateAr(`${o.expected_delivery_date}T12:00:00+03:00`)}</>}
                </div>
                {o.note && <div className="text-xs text-muted-foreground mt-1">📝 {o.note}</div>}
              </div>
              <StatusBadge status="pending_receipt" />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
