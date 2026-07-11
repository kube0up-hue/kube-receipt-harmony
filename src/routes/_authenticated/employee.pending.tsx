import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/employee/pending")({
  component: PendingPage,
});

function PendingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "pending", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, order_date, expected_delivery_date, note, supplier:suppliers(name)")
        .eq("status", "pending_receipt")
        .order("order_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="الطلبات بانتظار الاستلام" back={{ to: "/employee" }}>
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
                  {o.order_number} · {format(new Date(o.order_date), "yyyy-MM-dd")}
                  {o.expected_delivery_date && <> · متوقع {format(new Date(o.expected_delivery_date), "yyyy-MM-dd")}</>}
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
