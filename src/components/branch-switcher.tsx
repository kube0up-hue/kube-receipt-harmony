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
export function BranchSwitcher({ variant = "default" }: { variant?: "default" | "studio" }) {
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
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold transition max-w-[11rem] ${
            variant === "studio"
              ? "border-studio-border bg-studio-foreground text-studio-bg hover:bg-studio-foreground/90"
              : "border-border bg-card hover:border-primary"
          }`}
          aria-label="تبديل الفرع"
        >
          {scope !== "all" && branches.find((b) => b.id === scope)?.kind === "warehouse" ? (
            <Warehouse className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{label}</span>
          <span className="hidden font-normal opacity-60 sm:inline">
            {scope === "all" ? "نطاق" : branches.find((b) => b.id === scope)?.kind === "warehouse" ? "مستودع" : "فرع"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" dir="rtl" className="w-56 p-1">
        {canSeeAll && (
          <Option label="كل الفروع" active={scope === "all"} onClick={() => choose("all")} />
        )}
        {branches.map((b) => (
          <Option
            key={b.id}
            label={`${b.name} · ${b.kind === "warehouse" ? "مستودع" : "فرع"}`}
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
