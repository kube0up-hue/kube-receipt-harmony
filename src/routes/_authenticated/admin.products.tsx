import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const UNITS = ["حبة", "لتر", "كيلو", "كرتون", "صينية", "عبوة"] as const;
type Unit = typeof UNITS[number];

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("حبة");
  const [price, setPrice] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});

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
        .select("id,name,unit,is_hidden,unit_price,supplier:suppliers(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const mut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error("اختر المورد");
      const { error } = await supabase.from("products").insert({
        supplier_id: supplierId, name, unit, unit_price: Number(price || 0),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم الحفظ");
      setName(""); setPrice("");
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const priceMut = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: number }) => {
      const { data, error } = await supabase.from("products")
        .update({ unit_price: value }).eq("id", id).select("id");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("لا تملك صلاحية تعديل التكلفة");
    },
    onSuccess: (_d, v) => {
      toast.success("تم تحديث التكلفة");
      setEdits(prev => { const n = { ...prev }; delete n[v.id]; return n; });
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="المنتجات" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">إضافة منتج</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <select className="kube-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">— المورد —</option>
            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="kube-input" placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} />
          <select className="kube-input" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="kube-input" type="number" inputMode="decimal" step="0.01" min="0"
            placeholder="تكلفة الوحدة" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <button className="kube-btn-primary mt-3" disabled={!name || !supplierId || mut.isPending} onClick={() => mut.mutate()}>
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      {products.isLoading ? <div>جارٍ التحميل...</div> : (
        <div className="space-y-2">
          {products.data!.map(p => {
            const current = String((p as { unit_price?: number | string }).unit_price ?? 0);
            const val = edits[p.id] ?? current;
            const dirty = Number(val || 0) !== Number(current || 0);
            return (
              <div key={p.id} className="kube-card flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.supplier?.name} · {p.unit}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input type="number" inputMode="decimal" step="0.01" min="0"
                    className="kube-input w-24 text-center"
                    value={val}
                    onChange={e => setEdits(prev => ({ ...prev, [p.id]: e.target.value }))} />
                  <button className="kube-btn-primary px-3 py-2 text-sm disabled:opacity-40"
                    disabled={!dirty || priceMut.isPending}
                    onClick={() => priceMut.mutate({ id: p.id, value: Number(val || 0) })}>
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

