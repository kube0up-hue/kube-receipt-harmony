import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated/accountant/suppliers")({
  component: () => {
    const { data } = useQuery({
      queryKey: ["suppliers-acc"],
      queryFn: async () => {
        const { data } = await supabase.from("suppliers").select("*").order("name");
        return data ?? [];
      },
    });
    return (
      <AppShell title="الموردون" back={{ to: "/accountant" }}>
        <div className="space-y-2">
          {data?.map(s => (
            <div key={s.id} className="kube-card">
              <div className="font-bold">{s.name}</div>
              <div className="text-xs text-muted-foreground">{s.product_type ?? "—"} · {s.contact_phone ?? "—"}</div>
            </div>
          ))}
        </div>
      </AppShell>
    );
  },
});
