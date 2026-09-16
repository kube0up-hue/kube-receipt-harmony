import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";

import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/employee/no-delivery")({
  head: () => ({
    meta: [
      { title: "تسجيل عدم توريد — KUBE Kitchen" },
      { name: "description", content: "تسجيل عدم وصول توريد من مورد لفرع KUBE مع سبب التوثيق." },
      { property: "og:title", content: "تسجيل عدم توريد — KUBE Kitchen" },
      { property: "og:description", content: "توثيق أيام عدم التوريد لكل مورد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["orders_receive", "orders_create"]}>
      <NoDeliveryPage />
    </PermissionGuard>
  ),
});

function NoDeliveryPage() {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const suppliers = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").eq("is_active", true).order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) return toast.error("اختر المورد");
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("جلسة منتهية");
      const { data: emp } = await supabase.from("employees").select("id, branch_id").eq("user_id", userRes.user.id).single();
      if (!emp) throw new Error("الموظف غير موجود");
      const { data: r, error } = await supabase.from("receipts").insert({
        supplier_id: supplierId,
        employee_id: emp.id,
        branch_id: emp.branch_id,
        received_by_user: userRes.user.id,
        status: "no_delivery",
        note: note || null,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("activity_log").insert({
        actor_user: userRes.user.id, action: "no_delivery", entity: "receipts", entity_id: r.id,
      });
      toast.success("تم تسجيل: لا يوجد استلام اليوم");
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="لا يوجد استلام اليوم" back={{ to: "/employee" }}>
      <form onSubmit={submit} className="space-y-4">
        <div className="kube-card space-y-4">
          <div className="text-sm bg-warning/10 border border-warning/30 rounded-md p-3">
            هذا الإجراء يسجّل عدم الاستلام لمورد معيّن اليوم فقط. الطلبات المفتوحة الأخرى تبقى بانتظار الاستلام.
          </div>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">المورد</span>
            <select required value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="kube-input">
              <option value="">— اختر —</option>
              {suppliers.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">ملاحظة (اختياري)</span>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className="kube-input" />
          </label>
        </div>
        <button disabled={saving} className="kube-btn-primary w-full disabled:opacity-50">
          {saving ? "جارٍ الحفظ..." : "تسجيل"}
        </button>
      </form>
    </AppShell>
  );
}
