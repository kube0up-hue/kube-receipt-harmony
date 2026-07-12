import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { upsertEmployee } from "@/lib/auth.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const qc = useQueryClient();
  const upsert = useServerFn(upsertEmployee);
  const [full_name, setFullName] = useState("");
  const [pin_code, setPin] = useState("");
  const [branch, setBranch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase.from("employees")
        .select("id,full_name,pin_code,branch,is_active").order("full_name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async () => upsert({ data: { full_name, pin_code, branch: branch || null, is_active: true } }),
    onSuccess: () => {
      toast.success("تم الحفظ");
      setFullName(""); setPin(""); setBranch("");
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
          <input className="kube-input" placeholder="الفرع" value={branch} onChange={e => setBranch(e.target.value)} />
        </div>
        <button className="kube-btn-primary mt-3" disabled={mut.isPending} onClick={() => mut.mutate()}>
          <UserPlus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {data!.map(e => (
            <div key={e.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{e.full_name}</div>
                <div className="text-xs text-muted-foreground">PIN: {e.pin_code} · {e.branch ?? "—"}</div>
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
