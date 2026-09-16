import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { formatDateTimeAr } from "@/lib/format-date";
import { riyadhToday, riyadhDayStart } from "@/lib/riyadh-time";

import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/employee/today")({
  head: () => ({
    meta: [
      { title: "استلامات اليوم — KUBE Kitchen" },
      { name: "description", content: "استلامات فرع KUBE لهذا اليوم بالكميات المستلمة والتالفة." },
      { property: "og:title", content: "استلامات اليوم — KUBE Kitchen" },
      { property: "og:description", content: "ملخص استلامات اليوم في الفرع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["orders_view", "orders_create", "orders_receive"]}>
      <TodayPage />
    </PermissionGuard>
  ),
});

function TodayPage() {
  const today = riyadhToday();
  const { data, isLoading } = useQuery({
    queryKey: ["receipts", "today-full", today],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("id, received_at, status, total_received, total_accepted, total_damaged, total_short, total_over, supplier:suppliers(name)")
        .gte("received_at", riyadhDayStart(today))
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
              <div className="text-xs text-muted-foreground mb-2">{formatDateTimeAr(r.received_at)}</div>
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
