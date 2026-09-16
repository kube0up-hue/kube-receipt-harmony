import { Download, ExternalLink, Repeat2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeAr } from "@/lib/format-date";
import { useGeneratedImageUrls, downloadGeneratedImage } from "@/lib/ai-studio-storage";
import { GenerationStatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";

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
    <section className="studio-panel space-y-4 p-4 lg:p-5">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-studio-accent" /><h2 className="text-sm font-bold">سجل التوليد</h2></div><span className="text-xs text-studio-muted">{rows.length} عملية</span></div>

      {loading ? (
        <div className="py-8 text-center text-sm text-studio-muted">جارٍ التحميل…</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-studio-muted">لا توليدات سابقة بعد.</div>
      ) : (
        <div className="flex snap-x gap-3 overflow-x-auto pb-2">
          {rows.map((row) => {
            const url = row.generated_image_path ? urls?.[row.generated_image_path] : undefined;
            return (
              <article key={row.id} className="flex w-64 shrink-0 snap-start flex-col overflow-hidden rounded-md border border-studio-border bg-studio-bg/45">
                <div className="h-32 bg-studio-panel-raised flex items-center justify-center overflow-hidden">
                  {url ? (
                    <img src={url} alt={row.prompt.slice(0, 40)} className="w-full h-full object-cover" />
                  ) : (
                    <ImageOff className="w-7 h-7 text-studio-muted" />
                  )}
                </div>
                <div className="p-3 space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-studio-muted">{formatDateTimeAr(row.created_at)}</span>
                    <GenerationStatusBadge status={row.status} />
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-3 break-words" dir="auto">{row.prompt}</p>
                  {row.error_message && (
                    <p className="text-[11px] text-kube-red break-words line-clamp-2">{row.error_message}</p>
                  )}
                  <div className="text-[11px] text-studio-muted">
                    {row.aspect_ratio} · {row.resolution}
                    {row.brand_mode ? " · Brand Mode" : ""}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {row.generated_image_path && (
                      <>
                        <Button type="button" onClick={() => onOpen(row)} variant="outline" size="sm" className="h-7 border-studio-border bg-studio-panel-raised px-2 text-[11px] text-studio-foreground">
                          <ExternalLink className="w-3 h-3" /> فتح
                        </Button>
                        <Button
                          type="button"
                          onClick={() => row.generated_image_path && downloadGeneratedImage(row.generated_image_path).catch((e) => toast.error(e.message))}
                          variant="outline" size="sm" className="h-7 border-studio-border bg-studio-panel-raised px-2 text-[11px] text-studio-foreground"
                        >
                          <Download className="w-3 h-3" /> تنزيل
                        </Button>
                      </>
                    )}
                    <Button type="button" onClick={() => onReusePrompt(row)} variant="outline" size="sm" className="h-7 border-studio-border bg-studio-panel-raised px-2 text-[11px] text-studio-foreground">
                      <Repeat2 className="w-3 h-3" /> إعادة استخدام
                    </Button>
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
