import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTimeAr } from "@/lib/format-date";
import { formatQty, formatSigned } from "@/lib/money";
import { ImageIcon, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RefreshCw } from "lucide-react";

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

const SIGN_TTL = 3600;

/** معرض صور احترافي لبنود الاستلام: معاينة مصغّرة + عارض كامل الشاشة (جوال وكمبيوتر) */
export function ReceiptItemPhotos({ paths, meta }: { paths: string[]; meta: PhotoMeta }) {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [nonce, setNonce] = useState(0);
  const key = paths.join("|");

  const load = useCallback(async () => {
    if (paths.length === 0) { setUrls([]); return; }
    setUrls(null);
    setFailed(false);
    const { data, error } = await supabase.storage.from("receipt-photos").createSignedUrls(paths, SIGN_TTL);
    const list = (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
    if (error || list.length === 0) { setFailed(true); setUrls([]); return; }
    setUrls(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { void load(); }, [load, nonce]);

  if (paths.length === 0) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-dashed border-destructive/50 px-2 py-1 text-[10px] font-bold text-destructive">
        <ImageIcon className="w-3 h-3" /> بدون صور
      </div>
    );
  }

  if (urls === null) {
    return (
      <div className="flex gap-1.5">
        {paths.slice(0, 3).map((_, i) => (
          <div key={i} className="h-16 w-16 animate-pulse rounded-lg bg-muted sm:h-20 sm:w-20" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <button type="button" onClick={() => setNonce((n) => n + 1)}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:bg-muted">
        <RefreshCw className="w-3 h-3" /> تعذّر تحميل الصور — إعادة المحاولة
      </button>
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
            className="group relative aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary sm:h-20 sm:w-20"
          >
            <img src={u} alt={`${meta.product} ${i + 1}`} loading="lazy" decoding="async"
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
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
  const touchX = useRef<number | null>(null);
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, setIndex]);

  return (
    <div dir="rtl" className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-sm">
      {/* رأس المعلومات */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-white/10 px-3 py-3 text-white sm:px-4">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold sm:text-base">{meta.product}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70">
            {meta.supplier && <span>المورد: {meta.supplier}</span>}
            {meta.orderNumber && <span className="font-mono">الطلب: {meta.orderNumber}</span>}
            {meta.date && <span>{formatDateTimeAr(meta.date)}</span>}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
            {meta.ordered !== undefined && (
              <Chip label="مطلوب" value={`${formatQty(meta.ordered)} ${meta.unit ?? ""}`} />
            )}
            {meta.accepted !== undefined && (
              <Chip label="مقبول" value={`${formatQty(meta.accepted)} ${meta.unit ?? ""}`} tone="ok" />
            )}
            {!!meta.damaged && <Chip label="تالف" value={formatQty(meta.damaged)} tone="bad" />}
            {meta.diff !== undefined && meta.diff !== 0 && (
              <Chip label="الفرق" value={formatSigned(meta.diff, "qty")} tone={meta.diff < 0 ? "bad" : "ok"} />
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconBtn className="hidden sm:inline-flex" onClick={() => setZoom((z) => Math.min(4, z + 0.5))} title="تكبير"><ZoomIn className="w-4 h-4" /></IconBtn>
          <IconBtn className="hidden sm:inline-flex" onClick={() => setZoom((z) => Math.max(1, z - 0.5))} title="تصغير"><ZoomOut className="w-4 h-4" /></IconBtn>
          <a href={urls[index]} target="_blank" rel="noreferrer" title="فتح / تنزيل"
            className="rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
            <Download className="w-4 h-4" />
          </a>
          <IconBtn onClick={() => setIndex(null)} title="إغلاق"><X className="w-5 h-5" /></IconBtn>
        </div>
      </div>

      {/* الصورة */}
      <div
        className="relative flex-1 overflow-auto overscroll-contain"
        onTouchStart={(e) => { touchX.current = e.touches[0]?.clientX ?? null; }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          touchX.current = null;
          if (start === null || total < 2 || zoom !== 1) return;
          const dx = (e.changedTouches[0]?.clientX ?? start) - start;
          if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
        }}
      >
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <img
            src={urls[index]}
            alt={meta.product}
            onDoubleClick={() => setZoom((z) => (z === 1 ? 2 : 1))}
            style={{ transform: `scale(${zoom})` }}
            className="max-h-[65vh] max-w-full origin-center select-none rounded-lg shadow-2xl transition-transform duration-200 sm:max-h-[72vh]"
          />
        </div>
        {total > 1 && (
          <>
            <button type="button" onClick={() => go(1)} title="السابق"
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25 sm:p-3">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button type="button" onClick={() => go(-1)} title="التالي"
              className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/25 sm:p-3">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>

      {/* شريط المصغّرات */}
      <div className="border-t border-white/10 px-3 py-2 sm:px-4 sm:py-3">
        <div className="mb-2 text-center text-[11px] text-white/60">
          صورة {index + 1} من {total}
          {zoom !== 1 && <> · التكبير {Math.round(zoom * 100)}%</>}
        </div>
        {total > 1 && (
          <div className="flex justify-start gap-2 overflow-x-auto sm:justify-center">
            {urls.map((u, i) => (
              <button key={i} type="button" onClick={() => { setZoom(1); setIndex(i); }}
                className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-14 sm:w-14 ${i === index ? "border-primary" : "border-white/20 opacity-60 hover:opacity-100"}`}>
                <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
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

function IconBtn({ onClick, title, children, className = "" }: { onClick: () => void; title: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={onClick} title={title}
      className={`rounded-md p-2 text-white/80 transition hover:bg-white/10 hover:text-white ${className}`}>
      {children}
    </button>
  );
}
