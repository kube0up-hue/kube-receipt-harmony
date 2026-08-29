import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { format } from "date-fns";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: () => (
    <PermissionGuard anyOf={["payments_view"]}>
      <PaymentsPage />
    </PermissionGuard>
  ),
});

function PaymentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["payments-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments")
        .select("id,payment_date,amount,reference_number,invoice:invoices(invoice_number,supplier:suppliers(name))")
        .order("payment_date", { ascending: false }).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = (data ?? []).reduce((a, p) => a + Number(p.amount), 0);

  return (
    <AppShell title="السداد" back={{ to: "/admin" }}>
      <div className="kube-card mb-4 text-center">
        <div className="text-xs text-muted-foreground">إجمالي المسدَّد</div>
        <div className="text-3xl font-extrabold">{total.toFixed(2)}</div>
      </div>
      {isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {data!.map(p => (
            <div key={p.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{p.invoice?.supplier?.name} · {p.invoice?.invoice_number}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(p.payment_date), "yyyy-MM-dd")} · {p.reference_number ?? "بدون مرجع"}
                </div>
              </div>
              <div className="font-bold">{Number(p.amount).toFixed(2)}</div>
            </div>
          ))}
          {(data?.length ?? 0) === 0 && <div className="kube-card text-center text-muted-foreground">لا يوجد مدفوعات</div>}
        </div>
      )}
    </AppShell>
  );
}
