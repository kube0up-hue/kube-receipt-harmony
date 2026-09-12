import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { OpsPhotos } from "@/components/ops-photos";
import { useBranchFilter } from "@/lib/use-branches";
import { WASTE_REASON_LABEL } from "@/lib/waste-reasons";
import { formatMoneySar } from "@/lib/money";
import { formatDateAr } from "@/lib/format-date";
import { riyadhToday } from "@/lib/riyadh-time";
import { Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/waste")({
  head: () => ({
    meta: [
      { title: "تقارير الهدر — KUBE Kitchen" },
      { name: "description", content: "تقارير الهدر اليومية والأسبوعية والشهرية لكل فرع بالكمية والقيمة والسبب وصور الإثبات." },
      { property: "og:title", content: "تقارير الهدر — KUBE Kitchen" },
      { property: "og:description", content: "قيمة الهدر وأسبابه لكل فرع مع صور الإثبات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["waste_view", "waste_record"]}>
      <WasteReports />
    </PermissionGuard>
  ),
});

type Period = "day" | "week" | "month";

function startFor(period: Period): string {
  const d = new Date(`${riyadhToday()}T00:00:00+03:00`);
  if (period === "week") d.setDate(d.getDate() - 6);
  if (period === "month") d.setDate(d.getDate() - 29);
  return d.toISOString().slice(0, 10);
}

function WasteReports() {
  const { branchId, label } = useBranchFilter();
  const [period, setPeriod] = useState<Period>("week");
  const from = startFor(period);

  const rows = useQuery({
    queryKey: ["admin-waste", branchId, from],
    queryFn: async () => {
      let q = supabase
        .from("waste_entries")
        .select("id, waste_date, qty, unit_price, waste_value, reason_code, reason, note, photo_paths, branch_id, products(name, unit, category), branches(name)")
        .gte("waste_date", from)
        .order("waste_date", { ascending: false });
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const list = rows.data ?? [];
  const totals = useMemo(() => {
    const value = list.reduce((a: number, r: any) => a + Number(r.waste_value), 0);
    const byReason = new Map<string, number>();
    for (const r of list as any[]) byReason.set(r.reason_code, (byReason.get(r.reason_code) ?? 0) + Number(r.waste_value));
    return { value, byReason: [...byReason.entries()].sort((a, b) => b[1] - a[1]) };
  }, [list]);

  function exportCSV() {
    const header = ["التاريخ", "الفرع", "الصنف", "الوحدة", "الكمية", "سعر الوحدة", "القيمة", "السبب", "الشرح"];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = (list as any[]).map((r) => [
      r.waste_date, r.branches?.name ?? "", r.products?.name ?? "", r.products?.unit ?? "",
      Number(r.qty), Number(r.unit_price), Number(r.waste_value),
      WASTE_REASON_LABEL[r.reason_code] ?? r.reason_code, r.reason,
    ].map(esc).join(","));
    const csv = "\uFEFF" + [header.join(","), ...body].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `تقرير-الهدر-${riyadhToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title={`تقارير الهدر — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {([["day", "اليوم"], ["week", "آخر 7 أيام"], ["month", "آخر 30 يوماً"]] as [Period, string][]).map(([p, l]) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`text-xs font-bold px-3 py-1.5 rounded-md border ${period === p ? "bg-foreground text-background" : "hover:bg-muted"}`}>
              {l}
            </button>
          ))}
          <button onClick={exportCSV} disabled={list.length === 0}
            className="text-xs font-bold px-3 py-1.5 rounded-md border inline-flex items-center gap-1 hover:bg-muted disabled:opacity-50 ms-auto">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>

        <div className="kube-card">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">إجمالي قيمة الهدر</div>
            <div className="text-xl font-extrabold text-kube-red">{formatMoneySar(totals.value)}</div>
          </div>
          {totals.byReason.length > 0 && (
            <div className="mt-3 space-y-1">
              {totals.byReason.map(([code, v]) => (
                <div key={code} className="flex items-center justify-between text-xs">
                  <span>{WASTE_REASON_LABEL[code] ?? code}</span>
                  <span className="font-bold">{formatMoneySar(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {rows.isLoading ? (
          <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : list.length === 0 ? (
          <div className="kube-card text-center space-y-2">
            <Trash2 className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا يوجد هدر مسجَّل في هذه الفترة.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(list as any[]).map((r) => (
              <div key={r.id} className="kube-card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{r.products?.name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {Number(r.qty)} {r.products?.unit ?? ""} · {WASTE_REASON_LABEL[r.reason_code] ?? r.reason_code} ·{" "}
                      {formatDateAr(`${r.waste_date}T12:00:00+03:00`)}
                      {!branchId && r.branches?.name ? ` · ${r.branches.name}` : ""}
                    </div>
                    <div className="text-xs mt-1">{r.reason}</div>
                  </div>
                  <div className="text-end shrink-0">
                    <div className="font-bold text-kube-red">{formatMoneySar(Number(r.waste_value))}</div>
                    <div className="mt-1"><OpsPhotos paths={(r.photo_paths ?? []) as string[]} /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
