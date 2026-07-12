import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders")
        .select("id,order_number,order_date,status,supplier:suppliers(name)")
        .order("order_date", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const receipts = useQuery({
    queryKey: ["admin-receipts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("receipts")
        .select("id,received_at,status,total_accepted,total_damaged,supplier:suppliers(name)")
        .order("received_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="الطلبات والاستلامات" back={{ to: "/admin" }}>
      <h2 className="font-bold mb-3">الاستلامات الأخيرة</h2>
      <div className="space-y-2 mb-6">
        {receipts.data?.map(r => (
          <div key={r.id} className="kube-card flex items-center justify-between">
            <div>
              <div className="font-bold">{r.supplier?.name}</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(r.received_at), "yyyy-MM-dd HH:mm")} · مقبول {r.total_accepted} · تالف {r.total_damaged}
              </div>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
        {(receipts.data?.length ?? 0) === 0 && <div className="kube-card text-center text-muted-foreground">لا استلامات</div>}
      </div>

      <h2 className="font-bold mb-3">الطلبات الأخيرة</h2>
      <div className="space-y-2">
        {orders.data?.map(o => (
          <div key={o.id} className="kube-card flex items-center justify-between">
            <div>
              <div className="font-bold">{o.supplier?.name} · {o.order_number}</div>
              <div className="text-xs text-muted-foreground">{format(new Date(o.order_date), "yyyy-MM-dd")}</div>
            </div>
            <StatusBadge status={o.status} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
