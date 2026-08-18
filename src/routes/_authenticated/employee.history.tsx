import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { formatDateTimeAr } from "@/lib/format-date";
import { riyadhDayOffset, riyadhDayStart } from "@/lib/riyadh-time";

export const Route = createFileRoute("/_authenticated/employee/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const from = riyadhDayOffset(-7);
  const { data, isLoading } = useQuery({
    queryKey: ["receipts", "history-7", from],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("id, received_at, status, total_received, total_damaged, supplier:suppliers(name)")
        .gte("received_at", riyadhDayStart(from))
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  return (
    <AppShell title="سجل آخر 7 أيام" back={{ to: "/employee" }}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا يوجد سجل.</div>
      ) : (
        <div className="space-y-2">
          {data!.map((r) => (
            <div key={r.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{r.supplier?.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{formatDateTimeAr(r.received_at)}</div>
              </div>
              <div className="text-left">
                <StatusBadge status={r.status} />
                <div className="text-xs text-muted-foreground mt-1">
                  مستلم: {Number(r.total_received).toLocaleString()}
                  {Number(r.total_damaged) > 0 && <span className="text-kube-red"> · تالف: {Number(r.total_damaged)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
