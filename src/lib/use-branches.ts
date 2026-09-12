import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranchScope, setBranchScope, type BranchScope } from "@/lib/branch-store";

export interface Branch {
  id: string;
  name: string;
  code: string;
  kind: "branch" | "warehouse";
  is_active: boolean;
  sort_order: number;
}

/** الفروع المصرّح للمستخدم الحالي برؤيتها (تُرشَّح بقواعد الوصول في قاعدة البيانات). */
export function useAccessibleBranches() {
  return useQuery<Branch[]>({
    queryKey: ["branches", "accessible"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code, kind, is_active, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Branch[];
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * نطاق الفرع الفعلي: يمنع بقاء اختيار لفرع غير مصرح به،
 * ويثبّت الفرع الوحيد تلقائياً لمن لديه فرع واحد فقط.
 */
export function useBranchFilter() {
  const { data: branches, isLoading } = useAccessibleBranches();
  const [scope] = useBranchScope();

  const list = branches ?? [];
  const allowedIds = useMemo(() => new Set(list.map((b) => b.id)), [list]);
  const canSeeAll = list.length > 1;

  useEffect(() => {
    if (isLoading || list.length === 0) return;
    if (scope === "all" && !canSeeAll) {
      setBranchScope(list[0]!.id);
    } else if (scope !== "all" && !allowedIds.has(scope)) {
      setBranchScope(canSeeAll ? "all" : list[0]!.id);
    }
  }, [isLoading, scope, canSeeAll, allowedIds, list]);

  const effective: BranchScope =
    scope !== "all" && allowedIds.has(scope) ? scope : canSeeAll ? "all" : (list[0]?.id ?? "all");

  const selected = effective === "all" ? null : list.find((b) => b.id === effective) ?? null;

  return {
    branches: list,
    loading: isLoading,
    canSeeAll,
    /** معرّف الفرع، أو null عند "كل الفروع" */
    branchId: effective === "all" ? null : effective,
    scope: effective,
    selected,
    label: selected?.name ?? "كل الفروع",
  };
}
