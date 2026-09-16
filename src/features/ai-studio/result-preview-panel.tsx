import { useState } from "react";
import { Download, Maximize2, RefreshCw, Copy, Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGeneratedImageUrl, downloadGeneratedImage } from "@/lib/ai-studio-storage";
import { Button } from "@/components/ui/button";

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
    <section className="studio-panel flex h-full min-h-[32rem] flex-col gap-3 p-3 lg:p-4">
      <div className="flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-success" /><h2 className="text-sm font-bold">مساحة النتيجة</h2></div><span className="text-[10px] font-semibold text-studio-muted">4K RENDER</span></div>

      {generating ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-studio-border bg-studio-bg/60 py-14 text-center space-y-3">
          <Loader2 className="studio-motion w-10 h-10 mx-auto text-studio-accent animate-spin" />
          <div className="font-bold text-sm">جارٍ توليد صورة 4K…</div>
          <p className="text-xs text-studio-muted">قد يستغرق الأمر دقيقة أو أكثر — لا تغلق الصفحة.</p>
        </div>
      ) : error ? (
        <div className="m-auto w-full max-w-lg rounded-md border border-studio-accent/40 bg-studio-accent/10 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-kube-red">
            <AlertTriangle className="w-4 h-4" /> تعذر التوليد
          </div>
          <p className="text-sm leading-relaxed break-words">{error}</p>
          <Button type="button" onClick={onRegenerate} variant="outline" size="sm" className="border-studio-border bg-studio-panel-raised text-studio-foreground">
            <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
          </Button>
        </div>
      ) : !path ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-md border border-dashed border-studio-border bg-studio-bg/50 px-5 py-14 text-center space-y-3">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-studio-border bg-studio-panel-raised"><Sparkles className="w-7 h-7 text-studio-muted" /></span>
          <div className="font-bold text-sm">لا نتيجة بعد</div>
          <p className="max-w-xs text-xs leading-6 text-studio-muted">ارفع الصور المرجعية، اكتب الوصف، ثم اضغط «توليد» لتظهر حملتك هنا.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-1 items-center justify-center overflow-hidden rounded-md border border-studio-border bg-studio-bg/60">
            {isLoading || !url ? (
              <div className="py-14 text-center text-studio-muted text-sm">جارٍ تحميل الصورة…</div>
            ) : (
              <img src={url} alt="النتيجة" className="h-full max-h-[38rem] w-full object-contain" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              onClick={() => downloadGeneratedImage(path).catch((e) => toast.error(e.message))}
              variant="outline" size="sm" className="border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised"
            >
              <Download className="w-3.5 h-3.5" /> تنزيل
            </Button>
            <Button type="button" onClick={() => setFull(true)} variant="outline" size="sm" className="border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised">
              <Maximize2 className="w-3.5 h-3.5" /> معاينة كاملة
            </Button>
            <Button type="button" onClick={onRegenerate} variant="outline" size="sm" className="border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised">
              <RefreshCw className="w-3.5 h-3.5" /> إعادة توليد
            </Button>
            <Button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(prompt);
                toast.success("تم نسخ الوصف");
              }}
              variant="outline" size="sm" className="border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised"
            >
              <Copy className="w-3.5 h-3.5" /> نسخ الوصف
            </Button>
          </div>
        </div>
      )}

      {full && url && (
        <div className="fixed inset-0 z-50 bg-studio-bg/95 flex items-center justify-center p-4" onClick={() => setFull(false)}>
          <img src={url} alt="النتيجة" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
