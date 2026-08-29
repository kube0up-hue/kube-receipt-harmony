import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { riyadhDayEndExclusive, riyadhDayOffset, riyadhDayStart, riyadhToday } from "@/lib/riyadh-time";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [from, setFrom] = useState(() => riyadhDayOffset(-30));
  const [to, setTo] = useState(() => riyadhToday());

  const { data } = useQuery({
    queryKey: ["report", from, to],
    queryFn: async () => {
      const { data: recs } = await supabase.from("receipts")
        .select("total_accepted,total_damaged,total_short,total_over,supplier_id")
        .gte("received_at", riyadhDayStart(from)).lt("received_at", riyadhDayEndExclusive(to));
      const { data: invs } = await supabase.from("invoices")
        .select("total_amount,status,supplier_id")
        .gte("invoice_date", from).lte("invoice_date", to);
      const { data: pays } = await supabase.from("payments")
        .select("amount").gte("payment_date", from).lte("payment_date", to);
      return {
        accepted: (recs ?? []).reduce((a, r) => a + Number(r.total_accepted), 0),
        damaged: (recs ?? []).reduce((a, r) => a + Number(r.total_damaged), 0),
        short: (recs ?? []).reduce((a, r) => a + Number(r.total_short), 0),
        over: (recs ?? []).reduce((a, r) => a + Number(r.total_over), 0),
        invoiceTotal: (invs ?? []).reduce((a, i) => a + Number(i.total_amount), 0),
        paidTotal: (pays ?? []).reduce((a, p) => a + Number(p.amount), 0),
        invCount: invs?.length ?? 0,
        recCount: recs?.length ?? 0,
      };
    },
  });

  const cards = [
    { l: "استلامات", v: data?.recCount },
    { l: "كمية مقبولة", v: data?.accepted },
    { l: "تالف", v: data?.damaged },
    { l: "نقص", v: data?.short },
    { l: "زائد", v: data?.over },
    { l: "عدد الفواتير", v: data?.invCount },
    { l: "إجمالي الفواتير", v: data?.invoiceTotal?.toFixed(2) },
    { l: "إجمالي المسدَّد", v: data?.paidTotal?.toFixed(2) },
  ];

  return (
    <AppShell title="التقارير" back={{ to: "/admin" }}>
      <div className="kube-card mb-4 grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-muted-foreground">من</span>
          <input type="date" className="kube-input w-full" value={from} onChange={e => setFrom(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground">إلى</span>
          <input type="date" className="kube-input w-full" value={to} onChange={e => setTo(e.target.value)} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <div key={c.l} className="kube-card">
            <div className="text-xs text-muted-foreground">{c.l}</div>
            <div className="text-2xl font-extrabold">{c.v ?? "—"}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
