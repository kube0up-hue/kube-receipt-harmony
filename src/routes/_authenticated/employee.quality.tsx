import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { QUALITY_STATUS } from "@/lib/waste-reasons";
import { formatDateTimeAr } from "@/lib/format-date";
import { uploadOpsPhotos } from "@/lib/ops-photos";
import { toast } from "sonner";
import { Droplets, AlertTriangle, Camera, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/quality")({
  head: () => ({
    meta: [
      { title: "قياسات المياه والجودة — KUBE Kitchen" },
      { name: "description", content: "تسجيل جودة الماء (TDS) بصورة إلزامية للقياس، ودرجة حرارة الثلاجة 1 والثلاجة 2 مع النطاق المقبول." },
      { property: "og:title", content: "قياسات المياه والجودة — KUBE Kitchen" },
      { property: "og:description", content: "ثلاثة قياسات فقط: جودة الماء وحرارة الثلاجتين." },
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

type Metric = {
  id: string;
  code: string;
  label: string;
  unit: string;
  min_ok: number | null;
  max_ok: number | null;
  requires_photo: boolean;
};

function QualityPage() {
  const qc = useQueryClient();
  const { branchId, label, loading } = useBranchFilter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, File[]>>({});

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
      const files = photos[metricId] ?? [];
      const paths = files.length > 0 ? await uploadOpsPhotos(files, `quality/${branchId}`) : [];
      const { error } = await supabase.rpc("record_quality_reading", {
        p_branch_id: branchId!,
        p_metric_id: metricId,
        p_value: Number(values[metricId]),
        p_note: notes[metricId]?.trim() || undefined,
        p_photo_paths: paths,
      });
      if (error) throw error;
      return metricId;
    },
    onSuccess: (metricId) => {
      toast.success("تم تسجيل القياس");
      setValues((v) => ({ ...v, [metricId]: "" }));
      setNotes((n) => ({ ...n, [metricId]: "" }));
      setPhotos((p) => ({ ...p, [metricId]: [] }));
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
          const noteText = (notes[m.id] ?? "").trim();
          const files = photos[m.id] ?? [];
          const outOfRange = v !== "" && !Number.isNaN(num) &&
            ((m.min_ok !== null && num < Number(m.min_ok)) || (m.max_ok !== null && num > Number(m.max_ok)));
          const photoMissing = m.requires_photo && files.length === 0;
          const noteMissing = outOfRange && noteText === "";
          const disabled = v === "" || Number.isNaN(num) || photoMissing || noteMissing || save.isPending;

          return (
            <div key={m.id} className="kube-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.unit}</div>
                </div>
                <div className="text-xs text-muted-foreground text-left shrink-0">
                  النطاق المقبول
                  <div className="font-semibold">{m.min_ok ?? "—"} — {m.max_ok ?? "—"}</div>
                </div>
              </div>

              <input type="number" inputMode="decimal" step="any" value={v}
                onChange={(e) => setValues((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder={`القراءة (${m.unit})`} className="kube-input" />

              {m.requires_photo && (
                <PhotoPicker files={files} onChange={(f) => setPhotos((s) => ({ ...s, [m.id]: f }))} />
              )}

              <input value={notes[m.id] ?? ""} onChange={(e) => setNotes((s) => ({ ...s, [m.id]: e.target.value }))}
                placeholder={outOfRange ? "الملاحظة إلزامية — اذكر سبب القراءة" : "ملاحظة (اختياري)"} className="kube-input" />

              {outOfRange && (
                <p className="text-xs font-semibold text-kube-red">
                  القراءة خارج النطاق المقبول — تأكد من القراءة. إن كانت صحيحة فاكتب ملاحظة قبل الحفظ، وسيصل تنبيه للمالك.
                </p>
              )}
              {photoMissing && <p className="text-xs text-muted-foreground">صورة القياس إلزامية — صوّر شاشة الجهاز والرقم الظاهر.</p>}

              <button onClick={() => save.mutate(m.id)} disabled={disabled}
                className="kube-btn-primary w-full inline-flex items-center justify-center gap-1 disabled:opacity-50">
                <Droplets className="w-4 h-4" /> حفظ
              </button>
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

/** اختيار/تصوير صورة القياس (إلزامية لقياس جودة الماء). */
function PhotoPicker({ files, onChange }: { files: File[]; onChange: (f: File[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange([f]);
          e.target.value = "";
        }} />
      <button type="button" onClick={() => ref.current?.click()}
        className="kube-btn-outline w-full inline-flex items-center justify-center gap-2">
        <Camera className="w-4 h-4" /> {files.length > 0 ? "تغيير صورة القياس" : "تصوير القياس"}
      </button>
      {files.length > 0 && (
        <div className="relative w-28">
          <img src={URL.createObjectURL(files[0]!)} alt="صورة القياس" className="w-28 h-28 object-cover rounded-md border" />
          <button type="button" onClick={() => onChange([])}
            className="absolute -top-2 -left-2 bg-kube-red text-white rounded-full p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
