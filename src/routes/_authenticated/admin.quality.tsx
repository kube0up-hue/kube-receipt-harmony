import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { useCurrentUser } from "@/lib/use-current-user";
import { QUALITY_STATUS } from "@/lib/waste-reasons";
import { formatDateTimeAr } from "@/lib/format-date";
import { OpsPhotos } from "@/components/ops-photos";
import { toast } from "sonner";
import { Droplets, AlertTriangle, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/quality")({
  head: () => ({
    meta: [
      { title: "الجودة والمياه — KUBE Kitchen" },
      { name: "description", content: "متابعة جودة الماء (TDS) وحرارة الثلاجتين لكل فرع مع صور القياس والنطاقات المقبولة والقراءات خارج النطاق." },
      { property: "og:title", content: "الجودة والمياه — KUBE Kitchen" },
      { property: "og:description", content: "آخر القراءات وصورة قياس الماء والقياسات خارج النطاق لكل فرع." },
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

type Metric = {
  id: string;
  code: string;
  label: string;
  unit: string;
  min_ok: number | null;
  max_ok: number | null;
  requires_photo: boolean;
};

const todayRiyadh = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

function QualityAdmin() {
  const { branchId, label } = useBranchFilter();
  const { data: me } = useCurrentUser();
  const roles = me?.roles ?? [];
  const canEditLimits = roles.includes("admin") || roles.includes("owner");

  const metrics = useQuery({
    queryKey: ["quality-metrics-active"],
    queryFn: async (): Promise<Metric[]> => {
      const { data, error } = await supabase
        .from("quality_metrics")
        .select("id, code, label, unit, min_ok, max_ok, requires_photo")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Metric[];
    },
  });

  const readings = useQuery({
    queryKey: ["admin-quality", branchId],
    queryFn: async () => {
      let q = supabase
        .from("quality_readings")
        .select("id, value, status, note, reading_at, branch_id, metric_id, photo_paths, recorded_by, quality_metrics(label, unit, min_ok, max_ok), branches(name)")
        .order("reading_at", { ascending: false })
        .limit(200);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as any[];

      const ids = [...new Set(rows.map((r) => r.recorded_by).filter(Boolean))] as string[];
      let names: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        names = Object.fromEntries(((profs ?? []) as any[]).map((p) => [p.id, p.full_name]));
      }
      return rows.map((r) => ({ ...r, recorded_name: names[r.recorded_by] ?? "—" }));
    },
  });

  const list = (readings.data ?? []) as any[];
  const alerts = list.filter((r) => r.status !== "ok");
  const today = todayRiyadh();
  const isToday = (iso: string) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso)) === today;

  const todayList = list.filter((r) => isToday(r.reading_at));
  const activeMetrics = metrics.data ?? [];
  const latestOf = (code: string) => {
    const m = activeMetrics.find((x) => x.code === code);
    if (!m) return null;
    return list.find((r) => r.metric_id === m.id) ?? null;
  };
  const missingToday = activeMetrics.filter((m) => !todayList.some((r) => r.metric_id === m.id));

  const tds = latestOf("water_tds");
  const fridge1 = latestOf("fridge_temp");
  const fridge2 = latestOf("fridge_temp_2");

  const latestCard = (title: string, r: any, unit: string) => (
    <div className="kube-card">
      <div className="text-xs text-muted-foreground">{title}</div>
      {r ? (
        <>
          <div className={`text-lg font-extrabold mt-1 ${r.status !== "ok" ? "text-kube-red" : ""}`}>
            {Number(r.value)} <span className="text-xs font-semibold">{unit}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">{formatDateTimeAr(r.reading_at)} · {r.recorded_name}</div>
          {(r.photo_paths ?? []).length > 0 && <div className="mt-1"><OpsPhotos paths={r.photo_paths} /></div>}
        </>
      ) : (
        <div className="text-sm text-muted-foreground mt-1">لا قراءة بعد</div>
      )}
    </div>
  );

  return (
    <AppShell title={`الجودة والمياه — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {latestCard("آخر قراءة جودة الماء (TDS)", tds, "ppm")}
          {latestCard("آخر حرارة الثلاجة 1", fridge1, "°م")}
          {latestCard("آخر حرارة الثلاجة 2", fridge2, "°م")}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="kube-card">
            <div className="text-xs text-muted-foreground">قياسات اليوم</div>
            <div className="text-lg font-extrabold mt-1">{todayList.length}</div>
          </div>
          <div className="kube-card">
            <div className="text-xs text-muted-foreground">خارج النطاق</div>
            <div className={`text-lg font-extrabold mt-1 ${alerts.length > 0 ? "text-kube-red" : ""}`}>{alerts.length}</div>
          </div>
          <div className="kube-card">
            <div className="text-xs text-muted-foreground">غير مسجّل اليوم</div>
            <div className={`text-lg font-extrabold mt-1 ${missingToday.length > 0 ? "text-kube-red" : ""}`}>{missingToday.length}</div>
          </div>
        </div>

        {missingToday.length > 0 && (
          <div className="kube-card border-r-4 border-r-kube-red">
            <div className="font-bold text-sm mb-1">قياسات متأخرة اليوم</div>
            <div className="text-xs text-muted-foreground">{missingToday.map((m) => m.label).join(" · ")}</div>
          </div>
        )}

        <LimitsSection metrics={activeMetrics} canEdit={canEditLimits} />

        {alerts.length > 0 && (
          <section>
            <h2 className="font-bold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-kube-red" /> تنبيهات</h2>
            <div className="space-y-2">
              {alerts.slice(0, 10).map((r) => (
                <div key={r.id} className="kube-card border-r-4 border-r-kube-red flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold truncate">{r.quality_metrics?.label ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {Number(r.value)} {r.quality_metrics?.unit ?? ""} · المقبول {r.quality_metrics?.min_ok ?? "—"} إلى {r.quality_metrics?.max_ok ?? "—"} ·{" "}
                      {formatDateTimeAr(r.reading_at)} · {r.recorded_name}{!branchId && r.branches?.name ? ` · ${r.branches.name}` : ""}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full border shrink-0 bg-kube-red/10 text-kube-red border-kube-red/30">خارج النطاق</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-bold mb-2">سجل القياسات</h2>
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
                        {Number(r.value)} {r.quality_metrics?.unit ?? ""} · {r.recorded_name} · {formatDateTimeAr(r.reading_at)}
                        {r.branches?.name ? ` · ${r.branches.name}` : ""}
                      </div>
                      {r.note && <div className="text-xs mt-1">{r.note}</div>}
                      {(r.photo_paths ?? []).length > 0 && <div className="mt-1"><OpsPhotos paths={r.photo_paths} /></div>}
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

/** الحدود المقبولة لكل قياس — التعديل للمالك والمدير فقط. */
function LimitsSection({ metrics, canEdit }: { metrics: Metric[]; canEdit: boolean }) {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Record<string, { min: string; max: string }>>({});

  useEffect(() => {
    setDraft(
      Object.fromEntries(
        metrics.map((m) => [m.id, { min: m.min_ok === null ? "" : String(m.min_ok), max: m.max_ok === null ? "" : String(m.max_ok) }]),
      ),
    );
  }, [metrics]);

  const save = useMutation({
    mutationFn: async (m: Metric) => {
      const d = draft[m.id] ?? { min: "", max: "" };
      const { error } = await supabase.rpc("update_quality_metric_limits", {
        p_metric_id: m.id,
        p_min: d.min === "" ? (null as any) : Number(d.min),
        p_max: d.max === "" ? (null as any) : Number(d.max),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ النطاق المقبول");
      qc.invalidateQueries({ queryKey: ["quality-metrics-active"] });
      qc.invalidateQueries({ queryKey: ["admin-quality"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section>
      <h2 className="font-bold mb-2 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> النطاقات المقبولة</h2>
      <div className="space-y-2">
        {metrics.map((m) => {
          const d = draft[m.id] ?? { min: "", max: "" };
          return (
            <div key={m.id} className="kube-card space-y-2">
              <div className="font-bold text-sm">{m.label} <span className="text-xs text-muted-foreground font-normal">{m.unit}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-muted-foreground">
                  الحد الأدنى
                  <input type="number" step="any" inputMode="decimal" value={d.min} disabled={!canEdit}
                    onChange={(e) => setDraft((s) => ({ ...s, [m.id]: { ...d, min: e.target.value } }))}
                    className="kube-input mt-1 disabled:opacity-70" />
                </label>
                <label className="text-xs text-muted-foreground">
                  الحد الأعلى
                  <input type="number" step="any" inputMode="decimal" value={d.max} disabled={!canEdit}
                    onChange={(e) => setDraft((s) => ({ ...s, [m.id]: { ...d, max: e.target.value } }))}
                    className="kube-input mt-1 disabled:opacity-70" />
                </label>
              </div>
              {canEdit ? (
                <button onClick={() => save.mutate(m)} disabled={save.isPending}
                  className="kube-btn-primary w-full disabled:opacity-50">حفظ النطاق</button>
              ) : (
                <p className="text-xs text-muted-foreground">التعديل متاح للمالك والمدير فقط.</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
