import { CheckCircle2, PlugZap, Loader2 } from "lucide-react";

/** شريحة حالة مفتاح Gemini. */
export function StudioStatusBadge({ configured, loading }: { configured: boolean; loading?: boolean }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-studio-border bg-studio-panel-raised px-3 py-1 text-xs font-bold text-studio-muted">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> جارٍ التحقق
      </span>
    );
  }
  return configured ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
      <CheckCircle2 className="w-3.5 h-3.5" /> متصل
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-kube-red/30 bg-kube-red/10 px-3 py-1 text-xs font-bold text-kube-red">
      <PlugZap className="w-3.5 h-3.5" /> غير مُهيأ
    </span>
  );
}

/** حالة سجل التوليد. */
export function GenerationStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: { label: "بالانتظار", cls: "bg-muted text-muted-foreground border-border" },
    processing: { label: "قيد التوليد", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    completed: { label: "مكتمل", cls: "bg-success/15 text-success border-success/30" },
    failed: { label: "فاشل", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
  };
  const s = map[status] ?? map.pending!;
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${s.cls}`}>{s.label}</span>;
}
