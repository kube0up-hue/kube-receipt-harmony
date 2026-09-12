import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { QUALITY_STATUS } from "@/lib/waste-reasons";
import { formatDateTimeAr } from "@/lib/format-date";
import { toast } from "sonner";
import { Droplets, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/quality")({
  head: () => ({
    meta: [
      { title: "قياسات المياه والجودة — KUBE Kitchen" },
      { name: "description", content: "تسجيل ملوحة المياه ودرجة الحموضة وحرارة الثلاجات مع تنبيه فوري عند تجاوز الحدود المسموحة." },
      { property: "og:title", content: "قياسات المياه والجودة — KUBE Kitchen" },
      { property: "og:description", content: "قياسات يومية بحدود مقبولة وتنبيه عند الخروج عنها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["quality_record"]}>
      <QualityPage />
    </PermissionGuard>
  ),
});

function QualityPage() {
  const qc = useQueryClient();
  const { branchId, label, loading } = useBranchFilter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const metrics = useQuery({
    queryKey: ["quality-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_metrics").select("id, code, label, unit, min_ok, max_ok")
        .eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const readings = useQuery({
    queryKey: ["quality-readings", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_readings")
        .select("id, value, status, note, reading_at, quality_metrics(label, unit)")
        .eq("branch_id", branchId!)
        .order("reading_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (metricId: string) => {
      const { error } = await supabase.rpc("record_quality_reading", {
        p_branch_id: branchId!,
        p_metric_id: metricId,
        p_value: Number(values[metricId]),
        p_note: notes[metricId]?.trim() || undefined,
        p_photo_paths: [],
      });
      if (error) throw error;
      return metricId;
    },
    onSuccess: (metricId) => {
      toast.success("تم تسجيل القياس");
      setValues((v) => ({ ...v, [metricId]: "" }));
      setNotes((n) => ({ ...n, [metricId]: "" }));
      qc.invalidateQueries({ queryKey: ["quality-readings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) {
    return <AppShell title="قياسات المياه والجودة" back={{ to: "/employee" }}><div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div></AppShell>;
  }
  if (!branchId) {
    return (
      <AppShell title="قياسات المياه والجودة" back={{ to: "/employee" }}>
        <div className="kube-card text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-warning" />
          <p className="font-semibold">اختر فرعاً واحداً من الأعلى</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`قياسات المياه والجودة — ${label}`} back={{ to: "/employee" }}>
      <div className="space-y-4">
        {(metrics.data ?? []).map((m) => {
          const v = values[m.id] ?? "";
          const num = Number(v);
          const outOfRange = v !== "" && !Number.isNaN(num) &&
            ((m.min_ok !== null && num < Number(m.min_ok)) || (m.max_ok !== null && num > Number(m.max_ok)));
          return (
            <div key={m.id} className="kube-card space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold">{m.label}</div>
                <div className="text-xs text-muted-foreground">
                  المقبول: {m.min_ok ?? "—"} إلى {m.max_ok ?? "—"} {m.unit}
                </div>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input type="number" inputMode="decimal" step="any" value={v}
                  onChange={(e) => setValues((s) => ({ ...s, [m.id]: e.target.value }))}
                  placeholder={`القيمة ${m.unit}`} className="kube-input" />
                <button onClick={() => save.mutate(m.id)} disabled={v === "" || Number.isNaN(num) || save.isPending}
                  className="kube-btn inline-flex items-center gap-1 disabled:opacity-50">
                  <Droplets className="w-4 h-4" /> حفظ
                </button>
              </div>
              <input value={notes[m.id] ?? ""} onChange={(e) => setNotes((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder="ملاحظة (اختياري)" className="kube-input" />
              {outOfRange && <p className="text-xs font-semibold text-kube-red">القيمة خارج الحد المسموح — أبلغ مسؤول التشغيل.</p>}
            </div>
          );
        })}

        <section>
          <h2 className="font-bold mb-2">آخر القياسات</h2>
          {(readings.data ?? []).length === 0 ? (
            <div className="kube-card text-center text-sm text-muted-foreground">لا توجد قياسات بعد.</div>
          ) : (
            <div className="space-y-2">
              {readings.data!.map((r: any) => {
                const st = QUALITY_STATUS[r.status] ?? QUALITY_STATUS.ok!;
                return (
                  <div key={r.id} className="kube-card flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{r.quality_metrics?.label ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(r.value)} {r.quality_metrics?.unit ?? ""} · {formatDateTimeAr(r.reading_at)}
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
