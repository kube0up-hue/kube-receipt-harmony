import { useState } from "react";
import { useOpsPhotoUrls } from "@/lib/ops-photos";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";

/** عرض صور الإثبات (الهدر/الجودة) بروابط مؤقتة. */
export function OpsPhotos({ paths }: { paths: string[] }) {
  const [open, setOpen] = useState(false);
  const { data: urls, isLoading } = useOpsPhotoUrls(open ? paths : []);

  if (paths.length === 0) return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ImageIcon className="w-3.5 h-3.5" /> {paths.length}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">جارٍ تحميل الصور...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-[75vh] overflow-y-auto">
              {(urls ?? []).map((u, i) => (
                <img key={i} src={u} alt={`إثبات ${i + 1}`} loading="lazy" className="w-full rounded-md border" />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
