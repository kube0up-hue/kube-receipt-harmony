import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { FilePlus2 } from "lucide-react";
import { format } from "date-fns";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/admin/invoices/")({
  component: () => (
    <PermissionGuard anyOf={["invoices_view"]}>
      <InvoicesList base="/admin" title="لوحة الإدارة" />
    </PermissionGuard>
  ),
});

export function InvoicesList({ base, title }: { base: "/admin" | "/accountant"; title: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id,invoice_number,invoice_date,period_start,period_end,total_amount,status,supplier:suppliers(name)")
        .order("invoice_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="الفواتير" back={{ to: base, label: title }}>
      <Link to={`${base}/invoices/new` as "/admin/invoices/new"} className="kube-btn-primary mb-4">
        <FilePlus2 className="w-4 h-4" /> فاتورة جديدة + مطابقة
      </Link>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا توجد فواتير بعد.</div>
      ) : (
        <div className="space-y-2">
          {data!.map((inv) => (
            <Link key={inv.id}
              to={`${base}/invoices/$invoiceId` as "/admin/invoices/$invoiceId"}
              params={{ invoiceId: inv.id }}
              className="kube-card flex items-center justify-between hover:border-primary transition">
              <div className="min-w-0">
                <div className="font-bold">{inv.supplier?.name} · {inv.invoice_number}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  فاتورة {format(new Date(inv.invoice_date), "yyyy-MM-dd")} ·
                  الفترة {format(new Date(inv.period_start), "yyyy-MM-dd")} → {format(new Date(inv.period_end), "yyyy-MM-dd")} ·
                  {" "}{Number(inv.total_amount).toFixed(2)}
                </div>
              </div>
              <StatusBadge status={inv.status} />
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
