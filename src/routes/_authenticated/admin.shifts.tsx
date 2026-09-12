import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { toast } from "sonner";
import { CalendarClock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/shifts")({
  head: () => ({
    meta: [
      { title: "الدوامات — KUBE Kitchen" },
      { name: "description", content: "جدولة دوامات موظفي كل فرع بالتاريخ ووقت البداية والنهاية." },
      { property: "og:title", content: "الدوامات — KUBE Kitchen" },
      { property: "og:description", content: "جدول دوامات الموظفين لكل فرع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["schedules_manage", "employees_manage"]}>
      <ShiftsPage />
    </PermissionGuard>
  ),
});

function ShiftsPage() {
  const qc = useQueryClient();
  const { branchId, label } = useBranchFilter();
  const today = new Date().toISOString().slice(0, 10);
  const [employeeId, setEmployeeId] = useState("");
  const [shiftDate, setShiftDate] = useState(today);
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("16:00");
  const [note, setNote] = useState("");

  const employees = useQuery({
    queryKey: ["shift-employees", branchId],
    queryFn: async () => {
      let q = supabase.from("employees").select("id, full_name, branch_id").eq("is_active", true).order("full_name");
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const shifts = useQuery({
    queryKey: ["shifts", branchId],
    queryFn: async () => {
      let q = supabase
        .from("shifts")
        .select("id, shift_date, start_time, end_time, note, branch_id, employees(full_name), branches(name)")
        .gte("shift_date", today)
        .order("shift_date")
        .order("start_time")
        .limit(200);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const emp = (employees.data ?? []).find((e) => e.id === employeeId);
      const bid = branchId ?? emp?.branch_id;
      if (!bid) throw new Error("اختر الفرع من الأعلى");
      const { error } = await supabase.from("shifts").insert({
        branch_id: bid,
        employee_id: employeeId,
        shift_date: shiftDate,
        start_time: start,
        end_time: end,
        note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إضافة الدوام");
      setNote("");
      qc.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shifts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = shifts.data ?? [];

  return (
    <AppShell title={`الدوامات — ${label}`} back={{ to: "/admin" }}>
      <Can anyOf={["schedules_manage"]}>
        <div className="kube-card mb-4 space-y-3">
          <h2 className="font-bold">إضافة دوام</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <select className="kube-input" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
              <option value="">اختر الموظف</option>
              {(employees.data ?? []).map((e) => (
                <option key={e.id} value={e.id}>{e.full_name}</option>
              ))}
            </select>
            <input className="kube-input" type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
            <input className="kube-input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            <input className="kube-input" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <input className="kube-input" placeholder="ملاحظة (اختياري)" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="kube-btn-primary" disabled={!employeeId || add.isPending} onClick={() => add.mutate()}>
            <CalendarClock className="w-4 h-4" /> إضافة الدوام
          </button>
        </div>
      </Can>

      <h2 className="font-bold mb-2">الدوامات القادمة</h2>
      {shifts.isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : list.length === 0 ? (
        <div className="kube-card text-center text-sm text-muted-foreground">لا توجد دوامات مجدولة.</div>
      ) : (
        <div className="space-y-2">
          {list.map((s) => (
            <div key={s.id} className="kube-card flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-bold truncate">{s.employees?.full_name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {s.shift_date} · {String(s.start_time).slice(0, 5)} — {String(s.end_time).slice(0, 5)}
                  {!branchId && s.branches?.name ? ` · ${s.branches.name}` : ""}
                </div>
                {s.note && <div className="text-xs mt-1">{s.note}</div>}
              </div>
              <Can anyOf={["schedules_manage"]}>
                <button className="kube-btn-ghost text-kube-red" onClick={() => remove.mutate(s.id)} aria-label="حذف الدوام">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Can>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
