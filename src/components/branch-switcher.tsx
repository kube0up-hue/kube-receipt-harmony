import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown, Warehouse } from "lucide-react";
import { useBranchFilter } from "@/lib/use-branches";
import { setBranchScope } from "@/lib/branch-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * مبدّل الفروع: نخلة / سلطانة / المستودع / كل الفروع.
 * يظهر فقط لمن لديه أكثر من فرع، وعند التغيير تُحدَّث كل بيانات الصفحة.
 */
export function BranchSwitcher() {
  const { branches, canSeeAll, scope, label, loading } = useBranchFilter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  if (loading || branches.length <= 1) return null;

  function choose(next: string) {
    setBranchScope(next);
    setOpen(false);
    void qc.invalidateQueries();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold hover:border-primary transition max-w-[9.5rem]"
          aria-label="تبديل الفرع"
        >
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" dir="rtl" className="w-56 p-1">
        {canSeeAll && (
          <Option label="كل الفروع" active={scope === "all"} onClick={() => choose("all")} />
        )}
        {branches.map((b) => (
          <Option
            key={b.id}
            label={b.name}
            warehouse={b.kind === "warehouse"}
            active={scope === b.id}
            onClick={() => choose(b.id)}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

function Option({
  label,
  active,
  warehouse,
  onClick,
}: {
  label: string;
  active: boolean;
  warehouse?: boolean;
  onClick: () => void;
}) {
  const Icon = warehouse ? Warehouse : Building2;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm text-right hover:bg-muted ${active ? "font-bold" : ""}`}
    >
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {active && <Check className="w-4 h-4 text-primary shrink-0" />}
    </button>
  );
}
