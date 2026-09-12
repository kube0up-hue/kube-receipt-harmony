import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { QUALITY_STATUS } from "@/lib/waste-reasons";
import { formatDateTimeAr } from "@/lib/format-date";
import { Droplets, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/quality")({
  head: () => ({
    meta: [
      { title: "الجودة والمياه — KUBE Kitchen" },
      { name: "description", content: "متابعة قياسات ملوحة المياه والحموضة وحرارة الثلاجات لكل فرع مع تنبيه القياسات الخارجة عن الحد." },
      { property: "og:title", content: "الجودة والمياه — KUBE Kitchen" },
      { property: "og:description", content: "قياسات الجودة لكل فرع والقياسات الخارجة عن الحد المسموح." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["quality_view", "quality_record"]}>
      <QualityAdmin />
    </PermissionGuard>
  ),
});

function QualityAdmin() {
  const { branchId, label } = useBranchFilter();

  const readings = useQuery({
    queryKey: ["admin-quality", branchId],
    queryFn: async () => {
      let q = supabase
        .from("quality_readings")
        .select("id, value, status, note, reading_at, branch_id, quality_metrics(label, unit, min_ok, max_ok), branches(name)")
        .order("reading_at", { ascending: false })
        .limit(200);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const list = (readings.data ?? []) as any[];
  const alerts = list.filter((r) => r.status !== "ok");

  return (
    <AppShell title={`الجودة والمياه — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <div className="kube-card flex items-center justify-between">
          <div className="text-sm text-muted-foreground">قياسات خارج الحد أو قريبة منه</div>
          <div className={`text-xl font-extrabold ${alerts.length > 0 ? "text-kube-red" : ""}`}>{alerts.length}</div>
        </div>

        {alerts.length > 0 && (
          <section>
            <h2 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-kube-red" /> تنبيهات</h2>
            <div className="space-y-2">
              {alerts.slice(0, 10).map((r) => {
                const st = QUALITY_STATUS[r.status] ?? QUALITY_STATUS.ok!;
                return (
                  <div key={r.id} className="kube-card border-r-4 border-r-kube-red flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{r.quality_metrics?.label ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(r.value)} {r.quality_metrics?.unit ?? ""} · المقبول {r.quality_metrics?.min_ok ?? "—"} إلى {r.quality_metrics?.max_ok ?? "—"} ·{" "}
                        {formatDateTimeAr(r.reading_at)}{!branchId && r.branches?.name ? ` · ${r.branches.name}` : ""}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${st.cls}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-bold mb-2">كل القياسات</h2>
          {readings.isLoading ? (
            <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
          ) : list.length === 0 ? (
            <div className="kube-card text-center space-y-2">
              <Droplets className="w-6 h-6 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">لا توجد قياسات مسجَّلة بعد.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((r) => {
                const st = QUALITY_STATUS[r.status] ?? QUALITY_STATUS.ok!;
                return (
                  <div key={r.id} className="kube-card flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{r.quality_metrics?.label ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(r.value)} {r.quality_metrics?.unit ?? ""} · {formatDateTimeAr(r.reading_at)}
                        {!branchId && r.branches?.name ? ` · ${r.branches.name}` : ""}
                      </div>
                      {r.note && <div className="text-xs mt-1">{r.note}</div>}
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${st.cls}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
