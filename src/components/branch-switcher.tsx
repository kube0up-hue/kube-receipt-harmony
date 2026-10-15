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
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-display font-semibold transition-all max-w-[12rem] shadow-xs active:scale-[0.98] cursor-pointer ${
            variant === "studio"
              ? "border-studio-border bg-studio-foreground text-studio-bg hover:bg-studio-foreground/90"
              : "border-border/80 bg-card/80 text-foreground hover:bg-card hover:border-foreground/30"
          }`}
          aria-label="تبديل الفرع"
        >
          {scope !== "all" && branches.find((b) => b.id === scope)?.kind === "warehouse" ? (
            <Warehouse className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">{label}</span>
          <span className="hidden text-[11px] font-normal opacity-60 sm:inline">
            {scope === "all" ? "نطاق" : branches.find((b) => b.id === scope)?.kind === "warehouse" ? "مستودع" : "فرع"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" dir="rtl" className="w-60 p-1.5 rounded-2xl border-border/80 bg-card shadow-lg backdrop-blur">
        <div className="px-2 py-1.5 text-[11px] font-display font-bold text-muted-foreground">
          اختر نطاق التشغيل
        </div>
        {canSeeAll && (
          <Option label="كل الفروع والمستودعات" active={scope === "all"} onClick={() => choose("all")} />
        )}
        {branches.map((b) => (
          <Option
            key={b.id}
            label={`${b.name} (${b.kind === "warehouse" ? "مستودع رئيسي" : "فرع"})`}
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
      className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-display text-start transition-all cursor-pointer ${
        active
          ? "bg-muted font-bold text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
    >
      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="flex-1 truncate">{label}</span>
      {active && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
    </button>
  );
}
