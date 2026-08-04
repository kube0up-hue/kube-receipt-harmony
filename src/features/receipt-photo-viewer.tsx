import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTimeAr } from "@/lib/format-date";
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Loader2 } from "lucide-react";

export interface PhotoMeta {
  product: string;
  unit?: string;
  supplier?: string;
  orderNumber?: string;
  date?: string;
  ordered?: number;
  accepted?: number;
  damaged?: number;
  diff?: number;
}

/** معرض صور احترافي لبنود الاستلام: معاينة مصغّرة + عارض كامل الشاشة مع تكبير وتنقّل */
export function ReceiptItemPhotos({ paths, meta }: { paths: string[]; meta: PhotoMeta }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const key = paths.join("|");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (paths.length === 0) { setUrls([]); return; }
      setUrls(null);
      const { data } = await supabase.storage.from("receipt-photos").createSignedUrls(paths, 3600);
      if (cancelled) return;
      setUrls((data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[]);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (paths.length === 0) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-dashed border-destructive/50 px-2 py-1 text-[10px] font-bold text-destructive">
        <ImageIcon className="w-3 h-3" /> بدون صور
      </div>
    );
  }

  if (urls === null) {
    return (
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" /> جارٍ تحميل الصور…
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {urls.map((u, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            title={`${meta.product} — صورة ${i + 1}`}
            className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img src={u} alt={`${meta.product} ${i + 1}`} loading="lazy"
              className="h-full w-full object-cover transition duration-200 group-hover:scale-110" />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/60 py-0.5 text-[9px] font-bold text-white opacity-0 transition group-hover:opacity-100">
              <ZoomIn className="w-2.5 h-2.5" /> تكبير
            </span>
            {urls.length > 1 && (
              <span className="absolute top-0.5 start-0.5 rounded bg-black/70 px-1 text-[9px] font-bold text-white">
                {i + 1}/{urls.length}
              </span>
            )}
          </button>
        ))}
      </div>
      {index !== null && (
        <PhotoLightbox urls={urls} index={index} setIndex={setIndex} meta={meta} />
      )}
    </>
  );
}

function PhotoLightbox({
  urls, index, setIndex, meta,
}: { urls: string[]; index: number; setIndex: (i: number | null) => void; meta: PhotoMeta }) {
  const [zoom, setZoom] = useState(1);
  const total = urls.length;

  const go = useCallback((delta: number) => {
    setZoom(1);
    setIndex((index + delta + total) % total);
  }, [index, total, setIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      else if (e.key === "ArrowRight") go(-1);
      else if (e.key === "ArrowLeft") go(1);
      else if (e.key === "+") setZoom((z) => Math.min(4, z + 0.5));
      else if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, setIndex]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[80] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* رأس المعلومات */}
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">{meta.product}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
            {meta.supplier && <span>المورد: {meta.supplier}</span>}
            {meta.orderNumber && <span className="font-mono">الطلب: {meta.orderNumber}</span>}
            {meta.date && <span>{formatDateTimeAr(meta.date)}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {meta.ordered !== undefined && (
              <Chip label="مطلوب" value={`${meta.ordered} ${meta.unit ?? ""}`} />
            )}
            {meta.accepted !== undefined && (
              <Chip label="مقبول" value={`${meta.accepted} ${meta.unit ?? ""}`} tone="ok" />
            )}
            {!!meta.damaged && <Chip label="تالف" value={String(meta.damaged)} tone="bad" />}
            {meta.diff !== undefined && meta.diff !== 0 && (
              <Chip label="الفرق" value={meta.diff > 0 ? `+${meta.diff}` : String(meta.diff)} tone={meta.diff < 0 ? "bad" : "ok"} />
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconBtn onClick={() => setZoom((z) => Math.min(4, z + 0.5))} title="تكبير"><ZoomIn className="w-4 h-4" /></IconBtn>
          <IconBtn onClick={() => setZoom((z) => Math.max(1, z - 0.5))} title="تصغير"><ZoomOut className="w-4 h-4" /></IconBtn>
          <a href={urls[index]} target="_blank" rel="noreferrer" title="فتح / تنزيل"
            className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
            <Download className="w-4 h-4" />
          </a>
          <IconBtn onClick={() => setIndex(null)} title="إغلاق"><X className="w-5 h-5" /></IconBtn>
        </div>
      </div>

      {/* الصورة */}
      <div className="relative flex-1 overflow-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <img
            src={urls[index]}
            alt={meta.product}
            style={{ transform: `scale(${zoom})` }}
            className="max-h-[70vh] max-w-full origin-center rounded-lg shadow-2xl transition-transform duration-200"
          />
        </div>
        {total > 1 && (
          <>
            <button type="button" onClick={() => go(1)} title="السابق"
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25">
              <ChevronRight className="w-6 h-6" />
            </button>
            <button type="button" onClick={() => go(-1)} title="التالي"
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/25">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* شريط المصغّرات */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="mb-2 text-center text-[11px] text-white/60">صورة {index + 1} من {total} · التكبير {Math.round(zoom * 100)}%</div>
        {total > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto">
            {urls.map((u, i) => (
              <button key={i} type="button" onClick={() => { setZoom(1); setIndex(i); }}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition ${i === index ? "border-primary" : "border-white/20 opacity-60 hover:opacity-100"}`}>
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  const cls = tone === "bad" ? "bg-destructive/25 text-red-200" : tone === "ok" ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/80";
  return <span className={`rounded px-1.5 py-0.5 font-bold ${cls}`}>{label}: {value}</span>;
}

function IconBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
      {children}
    </button>
  );
}
