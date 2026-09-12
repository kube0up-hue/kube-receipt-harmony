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
            <div key={e.id} className="kube-card">
              <button className="w-full text-right flex items-center justify-between" onClick={() => setOpenId(openId === e.id ? null : e.id)}>
                <div>
                  <div className="font-bold">{e.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    PIN: {e.pin_code} · {e.branches?.name ?? e.branch ?? "—"}
                    {e.job_title ? ` · ${e.job_title}` : ""}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${e.is_active ? "bg-success/15 text-success" : "bg-muted"}`}>
                  {e.is_active ? "مفعّل" : "موقوف"}
                </span>
              </button>
              {openId === e.id && <EmployeeProfile emp={e} onSaved={() => qc.invalidateQueries({ queryKey: ["employees"] })} />}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function EmployeeProfile({ emp, onSaved }: { emp: any; onSaved: () => void }) {
  const [phone, setPhone] = useState(emp.phone ?? "");
  const [jobTitle, setJobTitle] = useState(emp.job_title ?? "");
  const [hireDate, setHireDate] = useState(emp.hire_date ?? "");
  const [pin, setPin] = useState(emp.pin_code ?? "");
  const [note, setNote] = useState(emp.note ?? "");

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("employees")
        .update({
          phone: phone.trim() || null,
          job_title: jobTitle.trim() || null,
          hire_date: hireDate || null,
          pin_code: pin.trim(),
          note: note.trim() || null,
        })
        .eq("id", emp.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم حفظ بيانات الموظف"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("employees").update({ is_active: !emp.is_active }).eq("id", emp.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("تم التحديث"); onSaved(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-3 pt-3 border-t space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input className="kube-input" placeholder="الجوال" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input className="kube-input" placeholder="المسمى الوظيفي" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <input className="kube-input" type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} />
        <input className="kube-input" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
      </div>
      <input className="kube-input" placeholder="ملاحظات" value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2">
        <button className="kube-btn-primary" disabled={save.isPending || !pin.trim()} onClick={() => save.mutate()}>حفظ</button>
        <button className="kube-btn-ghost" disabled={toggle.isPending} onClick={() => toggle.mutate()}>
          {emp.is_active ? "إيقاف" : "تفعيل"}
        </button>
      </div>
    </div>
  );
}
