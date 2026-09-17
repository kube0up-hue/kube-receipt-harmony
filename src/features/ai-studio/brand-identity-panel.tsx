import { useEffect, useState } from "react";
import { Check, Pencil, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_INSTRUCTION } from "@/lib/ai-studio.functions";

export function BrandIdentityPanel({
  instruction,
  canEdit,
  saving,
  updatedAt,
  updatedByName,
  onSave,
}: {
  instruction: string;
  canEdit: boolean;
  saving: boolean;
  updatedAt: string | null;
  updatedByName: string | null;
  onSave: (instruction: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(instruction);
  const [confirmReset, setConfirmReset] = useState(false);
  useEffect(() => setDraft(instruction), [instruction]);
  const dirty = draft.trim() !== instruction.trim();
  const valid = draft.trim().length >= 20 && draft.trim().length <= 8000;

  return (
    <section className="rounded-md border border-studio-border bg-studio-bg/45">
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-studio-accent" />
          <div className="min-w-0">
            <div className="text-sm font-bold">هوية KUBEUP</div>
            <div className="truncate text-[11px] text-studio-muted">
              {dirty ? "تعديلات غير محفوظة" : "التعليمات المعتمدة تُضاف تلقائيًا"}
            </div>
            {!dirty && updatedAt && (
              <div className="mt-0.5 text-[10px] text-studio-muted">
                آخر تحديث {new Intl.DateTimeFormat("ar-SA", { dateStyle: "short", timeStyle: "short" }).format(new Date(updatedAt))}
                {updatedByName ? ` · ${updatedByName}` : ""}
              </div>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="h-8 border-studio-border bg-studio-panel-raised text-studio-foreground">
          {canEdit && <Pencil className="h-3.5 w-3.5" />}{open ? "إغلاق" : canEdit ? "تعديل" : "عرض"}
        </Button>
      </div>
      {open && (
        <div className="space-y-3 border-t border-studio-border p-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            readOnly={!canEdit}
            rows={9}
            dir="auto"
            className="studio-control min-h-48 w-full resize-y rounded-md p-3 text-xs leading-6 outline-none focus:border-studio-accent read-only:cursor-default read-only:opacity-80"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-[11px] ${valid ? "text-studio-muted" : "text-kube-red"}`}>{draft.length} / 8000</span>
            {canEdit && (
              <div className="flex gap-2">
                {confirmReset ? (
                  <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => { setDraft(BRAND_INSTRUCTION); setConfirmReset(false); }} className="border-studio-accent text-studio-foreground">
                    <Check /> تأكيد الاستعادة
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => setConfirmReset(true)} className="border-studio-border bg-studio-panel-raised text-studio-foreground">
                    <RotateCcw /> الافتراضي
                  </Button>
                )}
                <Button type="button" size="sm" disabled={!dirty || !valid || saving} onClick={() => void onSave(draft.trim())} className="bg-studio-accent text-studio-accent-foreground hover:bg-studio-accent/90">
                  <Save /> {saving ? "جارٍ الحفظ…" : "حفظ التعليمات"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}