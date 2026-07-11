import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/employee/today")({
  component: TodayPage,
});

function TodayPage() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useQuery({
    queryKey: ["receipts", "today-full", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("id, received_at, status, total_received, total_accepted, total_damaged, total_short, total_over, supplier:suppliers(name)")
        .gte("received_at", `${today}T00:00:00`)
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="استلامات اليوم" back={{ to: "/employee" }}>
      {isLoading ? (
        <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا توجد استلامات اليوم.</div>
      ) : (
        <div className="space-y-2">
          {data!.map((r) => (
            <div key={r.id} className="kube-card">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{r.supplier?.name}</div>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-xs text-muted-foreground mb-2">{format(new Date(r.received_at), "yyyy-MM-dd HH:mm")}</div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <Stat label="مستلم" val={r.total_received} />
                <Stat label="مقبول" val={r.total_accepted} />
                <Stat label="تالف" val={r.total_damaged} danger />
                <Stat label="نقص" val={r.total_short} danger />
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, val, danger }: { label: string; val: number; danger?: boolean }) {
  return (
    <div className="bg-muted rounded-md py-2">
      <div className={`font-bold ${danger && Number(val) > 0 ? "text-kube-red" : ""}`}>{Number(val).toLocaleString()}</div>
      <div className="text-muted-foreground text-[10px]">{label}</div>
    </div>
  );
}
