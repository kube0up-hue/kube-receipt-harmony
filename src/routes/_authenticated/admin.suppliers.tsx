import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/admin/suppliers")({
  component: () => (
    <PermissionGuard anyOf={["suppliers_view"]}>
      <SuppliersPage />
    </PermissionGuard>
  ),
});

function SuppliersPage() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productType, setProductType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("suppliers").insert({
        name, contact_phone: phone || null, product_type: productType || null, is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      setName(""); setPhone(""); setProductType("");
      qc.invalidateQueries({ queryKey: ["suppliers-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("suppliers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers-all"] }),
  });

  return (
    <AppShell title="الموردون" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">إضافة مورد</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <input className="kube-input" placeholder="الاسم" value={name} onChange={e => setName(e.target.value)} />
          <input className="kube-input" placeholder="نوع المنتجات" value={productType} onChange={e => setProductType(e.target.value)} />
          <input className="kube-input" placeholder="هاتف" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <button className="kube-btn-primary mt-3" disabled={!name || mut.isPending} onClick={() => mut.mutate()}>
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {data!.map(s => (
            <div key={s.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.product_type ?? "—"} · {s.contact_phone ?? "—"}</div>
              </div>
              <button onClick={() => toggleActive.mutate({ id: s.id, is_active: !s.is_active })}
                className={`text-xs px-3 py-1.5 rounded-full ${s.is_active ? "bg-success/15 text-success" : "bg-muted"}`}>
                {s.is_active ? "مفعّل" : "موقوف"}
              </button>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
