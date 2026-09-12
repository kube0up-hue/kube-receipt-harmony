import { useEffect, useState } from "react";

/** "all" = كل الفروع، أو معرّف فرع محدد. */
export type BranchScope = "all" | string;

const KEY = "kube.selected-branch";
const EVENT = "kube:branch-changed";

let current: BranchScope = "all";
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const saved = window.localStorage.getItem(KEY);
  if (saved) current = saved;
}

export function getBranchScope(): BranchScope {
  hydrate();
  return current;
}

export function setBranchScope(scope: BranchScope) {
  current = scope;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, scope);
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

/**
 * الفرع المختار حالياً. يُعاد "all" على السيرفر لتجنب اختلاف الترطيب،
 * ثم يُقرأ المحفوظ بعد الترطيب.
 */
export function useBranchScope(): [BranchScope, (s: BranchScope) => void] {
  const [scope, setScope] = useState<BranchScope>("all");

  useEffect(() => {
    setScope(getBranchScope());
    const onChange = () => setScope(getBranchScope());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  return [scope, setBranchScope];
}
