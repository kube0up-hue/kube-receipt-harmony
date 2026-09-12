import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { listEmployeesAdmin, upsertEmployee } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { useAccessibleBranches } from "@/lib/use-branches";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertEmployee);
  const listEmployees = useServerFn(listEmployeesAdmin);
  const { data: branches } = useAccessibleBranches();
  const [full_name, setFullName] = useState("");
  const [pin_code, setPin] = useState("");
  const [branchId, setBranchId] = useState("");

  useEffect(() => {
    if (!branchId && branches && branches.length > 0) setBranchId(branches[0]!.id);
  }, [branches, branchId]);

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => listEmployees(),
  });

  const mut = useMutation({
    mutationFn: async () =>
      upsert({ data: { full_name, pin_code, branch_id: branchId || null, is_active: true } }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setFullName(""); setPin("");
      qc.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="الموظفون" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">إضافة موظف</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input className="kube-input" placeholder="الاسم" value={full_name} onChange={e => setFullName(e.target.value)} />
          <input className="kube-input" placeholder="PIN (4-8 أرقام)" value={pin_code} onChange={e => setPin(e.target.value)} />
          <select className="kube-input" value={branchId} onChange={e => setBranchId(e.target.value)}>
            <option value="">اختر الفرع</option>
            {(branches ?? []).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <button
          className="kube-btn-primary mt-3"
          disabled={mut.isPending || !full_name.trim() || !pin_code.trim() || !branchId}
          onClick={() => mut.mutate()}
        >
          <UserPlus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {data!.map((e: any) => (
            <div key={e.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{e.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  PIN: {e.pin_code} · {e.branches?.name ?? e.branch ?? "—"}
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${e.is_active ? "bg-success/15 text-success" : "bg-muted"}`}>
                {e.is_active ? "مفعّل" : "موقوف"}
              </span>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
