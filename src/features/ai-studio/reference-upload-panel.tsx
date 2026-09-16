import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { MAX_REFERENCES } from "@/lib/ai-studio.functions";
import { uploadReferenceImage, ALLOWED_REFERENCE_TYPES } from "@/lib/ai-studio-storage";
import { Button } from "@/components/ui/button";

export interface ReferenceItem {
  path: string;
  previewUrl: string;
  name: string;
}

export function ReferenceUploadPanel({
  items,
  onChange,
  disabled,
}: {
  items: ReferenceItem[];
  onChange: (next: ReferenceItem[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);

  async function addFiles(files: File[]) {
    if (files.length === 0) return;
    const room = MAX_REFERENCES - items.length;
    if (room <= 0) {
      toast.error(`الحد الأقصى ${MAX_REFERENCES} صور مرجعية`);
      return;
    }
    setBusy(true);
    const added: ReferenceItem[] = [];
    for (const file of files.slice(0, room)) {
      try {
        const path = await uploadReferenceImage(file);
        added.push({ path, previewUrl: URL.createObjectURL(file), name: file.name });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "تعذر رفع الصورة");
      }
    }
    if (files.length > room) toast.error(`تم رفع ${room} صورة فقط — الحد الأقصى ${MAX_REFERENCES}`);
    setBusy(false);
    if (added.length > 0) onChange([...items, ...added]);
  }

  return (
    <section className="studio-panel flex h-full flex-col gap-4 p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-studio-accent" /><h2 className="text-sm font-bold">الصور المرجعية</h2></div>
        <span className="rounded-md border border-studio-border bg-studio-panel-raised px-2 py-1 text-[11px] text-studio-muted">{items.length} / {MAX_REFERENCES}</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          void addFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`studio-motion min-h-40 rounded-md border border-dashed p-5 text-center cursor-pointer transition ${
          dragOver ? "border-studio-accent bg-studio-accent/10" : "border-studio-border bg-studio-bg/50 hover:border-studio-muted"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {busy ? (
          <Loader2 className="w-7 h-7 mx-auto text-studio-accent animate-spin" />
        ) : (
          <ImagePlus className="w-7 h-7 mx-auto text-studio-muted" />
        )}
        <div className="mt-2 text-sm font-bold">اسحب الصور هنا أو اضغط للاختيار</div>
        <div className="text-xs text-studio-muted mt-1">JPG أو PNG أو WebP — حتى {MAX_REFERENCES} صور</div>
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_REFERENCE_TYPES.join(",")}
          multiple
          hidden
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => (
            <div key={it.path} className="relative rounded-md overflow-hidden border border-studio-border group">
              <img src={it.previewUrl} alt={it.name} className="w-full h-24 object-cover" />
              <Button
                type="button"
                onClick={() => setZoom(it.previewUrl)}
                variant="secondary" size="icon" className="absolute bottom-1 right-1 h-7 w-7 bg-studio-panel/90 text-studio-foreground"
                aria-label="معاينة"
              >
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                onClick={() => onChange(items.filter((x) => x.path !== it.path))}
                variant="secondary" size="icon" className="absolute top-1 left-1 h-7 w-7 bg-studio-panel/90 text-studio-accent"
                aria-label="حذف"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-studio-muted leading-relaxed">
        ارفع صور المنتج أو التغليف أو الشعار أو لوحات الإلهام أو مراجع التكوين.
      </p>

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-studio-bg/95 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="معاينة" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
