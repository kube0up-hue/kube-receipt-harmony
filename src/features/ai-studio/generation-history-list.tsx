import { Download, ExternalLink, Repeat2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeAr } from "@/lib/format-date";
import { useGeneratedImageUrls, downloadGeneratedImage } from "@/lib/ai-studio-storage";
import { GenerationStatusBadge } from "./status-badge";

export interface GenerationRow {
  id: string;
  created_at: string;
  status: string;
  prompt: string;
  aspect_ratio: string;
  resolution: string;
  generated_image_path: string | null;
  error_message: string | null;
  brand_mode: boolean;
  reference_images: unknown;
}

export function GenerationHistoryList({
  rows,
  loading,
  onOpen,
  onReusePrompt,
}: {
  rows: GenerationRow[];
  loading: boolean;
  onOpen: (row: GenerationRow) => void;
  onReusePrompt: (row: GenerationRow) => void;
}) {
  const paths = rows.map((r) => r.generated_image_path).filter((p): p is string => !!p);
  const { data: urls } = useGeneratedImageUrls(paths);

  return (
    <section className="kube-card space-y-3">
      <h2 className="font-bold">سجل التوليد</h2>

      {loading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">جارٍ التحميل…</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">لا توليدات سابقة بعد.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const url = row.generated_image_path ? urls?.[row.generated_image_path] : undefined;
            return (
              <article key={row.id} className="rounded-xl border border-border overflow-hidden flex flex-col">
                <div className="h-36 bg-muted/40 flex items-center justify-center overflow-hidden">
                  {url ? (
                    <img src={url} alt={row.prompt.slice(0, 40)} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{formatDateTimeAr(row.created_at)}</span>
                    <GenerationStatusBadge status={row.status} />
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-3 break-words" dir="auto">{row.prompt}</p>
                  {row.error_message && (
                    <p className="text-[11px] text-kube-red break-words line-clamp-2">{row.error_message}</p>
                  )}
                  <div className="text-[11px] text-muted-foreground">
                    {row.aspect_ratio} · {row.resolution}
                    {row.brand_mode ? " · Brand Mode" : ""}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {row.generated_image_path && (
                      <>
                        <button type="button" onClick={() => onOpen(row)} className="kube-btn-outline inline-flex items-center gap-1 text-[11px] px-2 py-1">
                          <ExternalLink className="w-3 h-3" /> فتح
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadGeneratedImage(row.generated_image_path!).catch((e) => toast.error(e.message))}
                          className="kube-btn-outline inline-flex items-center gap-1 text-[11px] px-2 py-1"
                        >
                          <Download className="w-3 h-3" /> تنزيل
                        </button>
                      </>
                    )}
                    <button type="button" onClick={() => onReusePrompt(row)} className="kube-btn-outline inline-flex items-center gap-1 text-[11px] px-2 py-1">
                      <Repeat2 className="w-3 h-3" /> إعادة استخدام
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
