import { useState } from "react";
import { Download, Maximize2, RefreshCw, Copy, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGeneratedImageUrl, downloadGeneratedImage } from "@/lib/ai-studio-storage";

export function ResultPreviewPanel({
  path,
  prompt,
  generating,
  error,
  onRegenerate,
}: {
  path: string | null;
  prompt: string;
  generating: boolean;
  error: string | null;
  onRegenerate: () => void;
}) {
  const { data: url, isLoading } = useGeneratedImageUrl(path);
  const [full, setFull] = useState(false);

  return (
    <section className="kube-card space-y-3">
      <h2 className="font-bold">النتيجة</h2>

      {generating ? (
        <div className="rounded-xl border border-border bg-muted/40 py-14 text-center space-y-3">
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
          <div className="font-bold text-sm">جارٍ توليد صورة 4K…</div>
          <p className="text-xs text-muted-foreground">قد يستغرق الأمر دقيقة أو أكثر — لا تغلق الصفحة.</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-kube-red/30 bg-kube-red/5 p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-kube-red">
            <AlertTriangle className="w-4 h-4" /> تعذر التوليد
          </div>
          <p className="text-sm leading-relaxed break-words">{error}</p>
          <button type="button" onClick={onRegenerate} className="kube-btn-outline inline-flex items-center gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
          </button>
        </div>
      ) : !path ? (
        <div className="rounded-xl border border-dashed border-border py-14 text-center space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-muted-foreground" />
          <div className="font-bold text-sm">لا نتيجة بعد</div>
          <p className="text-xs text-muted-foreground">ارفع الصور المرجعية، اكتب الوصف، ثم اضغط «توليد».</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
            {isLoading || !url ? (
              <div className="py-14 text-center text-muted-foreground text-sm">جارٍ تحميل الصورة…</div>
            ) : (
              <img src={url} alt="النتيجة" className="w-full object-contain max-h-[28rem]" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => downloadGeneratedImage(path).catch((e) => toast.error(e.message))}
              className="kube-btn-outline inline-flex items-center justify-center gap-2 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> تنزيل
            </button>
            <button type="button" onClick={() => setFull(true)} className="kube-btn-outline inline-flex items-center justify-center gap-2 text-xs">
              <Maximize2 className="w-3.5 h-3.5" /> معاينة كاملة
            </button>
            <button type="button" onClick={onRegenerate} className="kube-btn-outline inline-flex items-center justify-center gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> إعادة توليد
            </button>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(prompt);
                toast.success("تم نسخ الوصف");
              }}
              className="kube-btn-outline inline-flex items-center justify-center gap-2 text-xs"
            >
              <Copy className="w-3.5 h-3.5" /> نسخ الوصف
            </button>
          </div>
        </div>
      )}

      {full && url && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFull(false)}>
          <img src={url} alt="النتيجة" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
