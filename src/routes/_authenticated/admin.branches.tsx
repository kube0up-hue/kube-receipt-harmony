import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, Warehouse, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { listBranchAccess, setUserBranches } from "@/lib/branches.functions";

export const Route = createFileRoute("/_authenticated/admin/branches")({
  component: () => (
    <PermissionGuard anyOf={["branches_manage"]}>
      <BranchesPage />
    </PermissionGuard>
  ),
});

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  owner: "مالك",
  accountant: "محاسب",
  branch_manager: "مدير فرع",
  operations: "مسؤول تشغيل",
  branch_employee: "موظف فرع",
};

function BranchesPage() {
  const qc = useQueryClient();
  const fetchAccess = useServerFn(listBranchAccess);
  const saveAccess = useServerFn(setUserBranches);

  const { data, isLoading } = useQuery({
    queryKey: ["branch-access"],
    queryFn: async () => fetchAccess(),
  });

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [draft, setDraft] = useState<string[]>([]);

  const users = data?.users ?? [];
  const branches = data?.branches ?? [];
  const current = users.find((u) => u.userId === selectedUser) ?? null;

  useEffect(() => {
    if (!selectedUser && users.length > 0) setSelectedUser(users[0]!.userId);
  }, [users, selectedUser]);

  useEffect(() => {
    if (current) setDraft([...current.branchIds]);
  }, [selectedUser, current?.branchIds.join(",")]);

  const mut = useMutation({
    mutationFn: async () => saveAccess({ data: { userId: selectedUser!, branchIds: draft } }),
    onSuccess: () => {
      toast.success("تم حفظ فروع المستخدم");
      void qc.invalidateQueries({ queryKey: ["branch-access"] });
      void qc.invalidateQueries({ queryKey: ["branches", "accessible"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isPrivileged = (current?.roles ?? []).some((r) => r === "admin" || r === "owner");
  const dirty = current ? draft.slice().sort().join(",") !== current.branchIds.slice().sort().join(",") : false;

  return (
    <AppShell title="الفروع ووصول المستخدمين" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">الفروع</h2>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">جارٍ التحميل…</div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-2">
            {branches.map((b) => (
              <div key={b.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                {b.kind === "warehouse" ? (
                  <Warehouse className="w-4 h-4 text-primary" />
                ) : (
                  <Building2 className="w-4 h-4 text-primary" />
                )}
                <span className="font-bold text-sm">{b.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="kube-card">
        <h2 className="font-bold mb-1">وصول المستخدمين للفروع</h2>
        <p className="text-xs text-muted-foreground mb-3">
          المستخدم يرى بيانات الفروع المحددة له فقط. المالك والمدير يرون كل الفروع دائماً.
        </p>

        {isLoading ? (
          <div className="text-sm text-muted-foreground">جارٍ التحميل…</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted-foreground">لا يوجد مستخدمون</div>
        ) : (
          <div className="grid md:grid-cols-[15rem_1fr] gap-4">
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {users.map((u) => (
                <button
                  key={u.userId}
                  type="button"
                  onClick={() => setSelectedUser(u.userId)}
                  className={`w-full text-right rounded-md px-3 py-2 border transition ${
                    selectedUser === u.userId ? "border-primary bg-muted" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="font-bold text-sm truncate">{u.fullName ?? u.email ?? "مستخدم"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {(u.roles.map((r) => ROLE_LABELS[r] ?? r).join(" · ")) || "بدون دور"}
                  </div>
                </button>
              ))}
            </div>

            <div>
              {!current ? null : isPrivileged ? (
                <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                  هذا المستخدم {current.roles.includes("owner") ? "مالك" : "مدير"} ويرى كل الفروع تلقائياً.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {branches.map((b) => {
                      const checked = draft.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className="flex items-center gap-3 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted"
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={checked}
                            onChange={(e) =>
                              setDraft((prev) =>
                                e.target.checked ? [...prev, b.id] : prev.filter((x) => x !== b.id),
                              )
                            }
                          />
                          <span className="font-bold text-sm">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="kube-btn-primary mt-3"
                    disabled={!dirty || mut.isPending}
                    onClick={() => mut.mutate()}
                  >
                    <Save className="w-4 h-4" /> {mut.isPending ? "جارٍ الحفظ…" : "حفظ الفروع"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
