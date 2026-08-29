import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { listManagedUsers, saveUserPermissions } from "@/lib/permissions.functions";
import {
  ACCOUNTANT_PRESET,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  isPermission,
  type Permission,
} from "@/lib/permissions";
import { ShieldCheck, Save, RotateCcw, Check, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/permissions")({
  head: () => ({
    meta: [
      { title: "صلاحيات المستخدمين | KUBE Supplier Receiving" },
      { name: "description", content: "منح وسحب صلاحيات المنصة لكل مستخدم مع تطبيق فوري." },
      { property: "og:title", content: "صلاحيات المستخدمين | KUBE" },
      { property: "og:description", content: "لوحة إدارة صلاحيات المحاسبين ومستخدمي المنصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PermissionsPage,
});

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  accountant: "محاسب",
  branch_employee: "موظف فرع",
};

function PermissionsPage() {
  const qc = useQueryClient();
  const loadUsers = useServerFn(listManagedUsers);
  const save = useServerFn(saveUserPermissions);

  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<Permission> | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["managed-users"],
    queryFn: async () => loadUsers(),
    staleTime: 0,
  });

  const current = useMemo(() => users?.find((u) => u.userId === selected) ?? null, [users, selected]);
  const isAdminTarget = (current?.roles ?? []).includes("admin");

  const savedSet = useMemo(
    () => new Set((current?.permissions ?? []).filter(isPermission) as Permission[]),
    [current],
  );
  const active = draft ?? savedSet;

  const dirty = useMemo(() => {
    if (!draft) return false;
    if (draft.size !== savedSet.size) return true;
    for (const p of draft) if (!savedSet.has(p)) return true;
    return false;
  }, [draft, savedSet]);

  const mut = useMutation({
    mutationFn: async () => {
      if (!current) throw new Error("اختر مستخدماً أولاً");
      return save({ data: { userId: current.userId, permissions: [...active] } });
    },
    onSuccess: () => {
      toast.success("تم حفظ الصلاحيات وتطبيقها فوراً");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["managed-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function pick(userId: string) {
    setSelected(userId);
    setDraft(null);
  }

  function toggle(p: Permission) {
    const next = new Set(active);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setDraft(next);
  }

  function setAll(list: Permission[], on: boolean) {
    const next = new Set(active);
    for (const p of list) {
      if (on) next.add(p);
      else next.delete(p);
    }
    setDraft(next);
  }

  return (
    <AppShell title="صلاحيات المستخدمين" back={{ to: "/admin" }}>
      <div className="kube-card mb-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          اختر مستخدماً ثم فعّل الصلاحيات المطلوبة واضغط <span className="font-bold text-foreground">حفظ</span>.
          تُطبَّق الصلاحيات على حسابه فوراً دون تسجيل خروج، والصلاحية المُوقفة تُخفى تماماً من واجهته.
        </div>
      </div>

      {error && <div className="kube-card text-kube-red mb-4">{(error as Error).message}</div>}

      {isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          <div className="space-y-2">
            {(users ?? []).map((u) => {
              const isSel = u.userId === selected;
              return (
                <button
                  key={u.userId}
                  onClick={() => pick(u.userId)}
                  className={`kube-card w-full text-right transition ${isSel ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-bold truncate">{u.fullName ?? "بدون اسم"}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate" dir="ltr">{u.email ?? "—"}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {u.roles.map((r) => (
                      <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-semibold">
                        {ROLE_LABELS[r] ?? r}
                      </span>
                    ))}
                    {!u.roles.includes("admin") && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {u.permissions.length} صلاحية
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {(users ?? []).length === 0 && (
              <div className="kube-card text-center text-muted-foreground">لا يوجد مستخدمون</div>
            )}
          </div>

          <div>
            {!current ? (
              <div className="kube-card text-center text-muted-foreground py-10">
                اختر مستخدماً من القائمة لعرض صلاحياته
              </div>
            ) : isAdminTarget ? (
              <div className="kube-card text-center py-10">
                <ShieldCheck className="w-8 h-8 mx-auto text-primary mb-2" />
                <div className="font-bold">{current.fullName ?? "المدير"} يملك كل صلاحيات المنصة</div>
                <p className="text-sm text-muted-foreground mt-1">لا يمكن تقييد المدير من هذه الشاشة.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="kube-card flex flex-wrap items-center gap-2 justify-between sticky top-14 z-20">
                  <div>
                    <div className="font-bold">{current.fullName ?? "بدون اسم"}</div>
                    <div className="text-xs text-muted-foreground">
                      {active.size} صلاحية مفعّلة {dirty && <span className="text-kube-red font-bold">· تغييرات غير محفوظة</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="kube-btn-outline text-sm"
                      onClick={() => setDraft(new Set(ACCOUNTANT_PRESET))}
                      type="button"
                    >
                      <Check className="w-4 h-4" /> حزمة المحاسب
                    </button>
                    <button
                      className="kube-btn-outline text-sm disabled:opacity-40"
                      disabled={!dirty}
                      onClick={() => setDraft(null)}
                      type="button"
                    >
                      <RotateCcw className="w-4 h-4" /> تراجع
                    </button>
                    <button
                      className="kube-btn-primary text-sm disabled:opacity-50"
                      disabled={!dirty || mut.isPending}
                      onClick={() => mut.mutate()}
                      type="button"
                    >
                      <Save className="w-4 h-4" /> {mut.isPending ? "جارٍ الحفظ..." : "حفظ"}
                    </button>
                  </div>
                </div>

                {PERMISSION_GROUPS.map((g) => {
                  const allOn = g.items.every((p) => active.has(p));
                  return (
                    <div key={g.title} className="kube-card">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold">{g.title}</h2>
                        <button
                          type="button"
                          className="text-xs font-semibold text-primary"
                          onClick={() => setAll(g.items, !allOn)}
                        >
                          {allOn ? "إلغاء الكل" : "تحديد الكل"}
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {g.items.map((p) => {
                          const on = active.has(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => toggle(p)}
                              aria-pressed={on}
                              className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm font-semibold transition ${
                                on ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                              }`}
                            >
                              <span className="text-right">{PERMISSION_LABELS[p]}</span>
                              <span
                                className={`relative w-10 h-6 rounded-full shrink-0 transition ${on ? "bg-primary" : "bg-muted"}`}
                              >
                                <span
                                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-all ${on ? "left-0.5" : "left-[1.125rem]"}`}
                                />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
