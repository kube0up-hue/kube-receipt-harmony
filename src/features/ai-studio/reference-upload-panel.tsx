import { useRef, useState } from "react";
import { ImagePlus, X, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { MAX_REFERENCES } from "@/lib/ai-studio.functions";
import { uploadReferenceImage, ALLOWED_REFERENCE_TYPES } from "@/lib/ai-studio-storage";

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
    <section className="kube-card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold">الصور المرجعية</h2>
        <span className="text-xs text-muted-foreground">{items.length} / {MAX_REFERENCES}</span>
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
        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {busy ? (
          <Loader2 className="w-7 h-7 mx-auto text-primary animate-spin" />
        ) : (
          <ImagePlus className="w-7 h-7 mx-auto text-primary" />
        )}
        <div className="mt-2 text-sm font-bold">اسحب الصور هنا أو اضغط للاختيار</div>
        <div className="text-xs text-muted-foreground mt-1">JPG أو PNG أو WebP — حتى {MAX_REFERENCES} صور</div>
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
            <div key={it.path} className="relative rounded-lg overflow-hidden border border-border group">
              <img src={it.previewUrl} alt={it.name} className="w-full h-24 object-cover" />
              <button
                type="button"
                onClick={() => setZoom(it.previewUrl)}
                className="absolute bottom-1 right-1 rounded-md bg-background/85 p-1"
                aria-label="معاينة"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x.path !== it.path))}
                className="absolute top-1 left-1 rounded-md bg-background/85 p-1 text-kube-red"
                aria-label="حذف"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        ارفع صور المنتج أو التغليف أو الشعار أو لوحات الإلهام أو مراجع التكوين.
      </p>

      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="معاينة" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </section>
  );
}
