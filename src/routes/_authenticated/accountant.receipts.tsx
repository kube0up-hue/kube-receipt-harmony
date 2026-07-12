import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/accountant/receipts")({
  component: () => {
    const { data } = useQuery({
      queryKey: ["receipts-acc"],
      queryFn: async () => {
        const { data } = await supabase.from("receipts")
          .select("id,received_at,status,total_accepted,total_damaged,supplier:suppliers(name)")
          .order("received_at", { ascending: false }).limit(100);
        return data ?? [];
      },
    });
    return (
      <AppShell title="الاستلامات" back={{ to: "/accountant" }}>
        <div className="space-y-2">
          {data?.map(r => (
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
        </div>
      </AppShell>
    );
  },
});
