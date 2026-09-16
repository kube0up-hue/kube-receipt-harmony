import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/permission-guard";
import { listEmployeeAccess, saveEmployeePermissions } from "@/lib/employee-access.functions";
import { EMPLOYEE_ASSIGNABLE_GROUPS, PERMISSION_LABELS, type Permission } from "@/lib/permissions";
import { toast } from "sonner";
import { UserCog, Save, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employee-access")({
  head: () => ({
    meta: [
      { title: "مهام الموظفين وصلاحياتهم — KUBE Kitchen" },
      { name: "description", content: "إسناد المهام لكل موظف فرع: الجرد، الهدر، الاستلام، التحويلات، الجودة، المبيعات — وتظهر له في صفحته فقط." },
      { property: "og:title", content: "مهام الموظفين وصلاحياتهم — KUBE Kitchen" },
      { property: "og:description", content: "لكل موظف مهامه المسندة إليه فقط." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard>
      <EmployeeAccessPage />
    </RoleGuard>
  ),
});

function EmployeeAccessPage() {
  const qc = useQueryClient();
  const list = useServerFn(listEmployeeAccess);
  const save = useServerFn(saveEmployeePermissions);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Set<string>>(new Set());

  const employees = useQuery({
    queryKey: ["employee-access"],
    queryFn: async () => list(),
  });

  const current = (employees.data ?? []).find((e) => e.employeeId === openId) ?? null;

  useEffect(() => {
    setDraft(new Set(current?.permissions ?? []));
  }, [openId, employees.data]);

  const mut = useMutation({
    mutationFn: async () =>
      save({ data: { employeeId: openId!, permissions: [...draft] as any } }),
    onSuccess: () => {
      toast.success("حُفظت مهام الموظف");
      qc.invalidateQueries({ queryKey: ["employee-access"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="مهام الموظفين وصلاحياتهم" back={{ to: "/admin" }}>
      <p className="text-sm text-muted-foreground mb-3">
        اختر الموظف وحدّد ما يستطيع عمله. المهام المسندة فقط تظهر له في صفحته.
      </p>

      {employees.isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (
        <div className="space-y-2">
          {(employees.data ?? []).map((e) => {
            const isOpen = openId === e.employeeId;
            return (
              <div key={e.employeeId} className="kube-card">
                <button type="button" onClick={() => setOpenId(isOpen ? null : e.employeeId)}
                  className="w-full flex items-center justify-between gap-2 text-start">
                  <div className="min-w-0">
                    <div className="font-bold truncate flex items-center gap-2">
                      <UserCog className="w-4 h-4 shrink-0" /> {e.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {e.branchName ?? "—"} · {e.permissions.length} مهمة مسندة
                      {!e.isActive ? " · موقوف" : ""}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="mt-3 border-t pt-3 space-y-3">
                    {EMPLOYEE_ASSIGNABLE_GROUPS.map((g) => (
                      <div key={g.title}>
                        <div className="text-xs font-bold text-muted-foreground mb-1">{g.title}</div>
                        <div className="grid sm:grid-cols-2 gap-1">
                          {g.items.map((p: Permission) => (
                            <label key={p} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 accent-black"
                                checked={draft.has(p)}
                                onChange={(ev) => {
                                  const next = new Set(draft);
                                  if (ev.target.checked) next.add(p); else next.delete(p);
                                  setDraft(next);
                                }} />
                              <span>{PERMISSION_LABELS[p]}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => mut.mutate()} disabled={mut.isPending}
                      className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50">
                      <Save className="w-4 h-4" /> {mut.isPending ? "جارٍ الحفظ..." : "حفظ مهام الموظف"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
