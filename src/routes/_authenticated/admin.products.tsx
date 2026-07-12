import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const UNITS = [
  { v: "piece", l: "حبة" }, { v: "liter", l: "لتر" }, { v: "kilo", l: "كيلو" },
  { v: "carton", l: "كرتون" }, { v: "tray", l: "صينية" }, { v: "pack", l: "عبوة" },
] as const;

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<typeof UNITS[number]["v"]>("piece");

  const suppliers = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").eq("is_active", true).order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const products = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products")
        .select("id,name,unit,is_hidden,supplier:suppliers(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error("اختر المورد");
      const { error } = await supabase.from("products").insert({
        supplier_id: supplierId, name, unit,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      setName("");
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="المنتجات" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">إضافة منتج</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <select className="kube-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">— المورد —</option>
            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="kube-input" placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} />
          <select className="kube-input" value={unit} onChange={e => setUnit(e.target.value as typeof UNITS[number]["v"])}>
            {UNITS.map(u => <option key={u.v} value={u.v}>{u.l}</option>)}
          </select>
        </div>
        <button className="kube-btn-primary mt-3" disabled={!name || !supplierId || mut.isPending} onClick={() => mut.mutate()}>
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {products.isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {products.data!.map(p => (
            <div key={p.id} className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.supplier?.name} · {UNITS.find(u => u.v === p.unit)?.l}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
