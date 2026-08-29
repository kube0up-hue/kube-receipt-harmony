import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Plus, Save, Pencil, Trash2, X, Eye, EyeOff, Search, AlertTriangle } from "lucide-react";
import { formatMoney, num, round2 } from "@/lib/money";

const UNITS = ["حبة", "لتر", "كيلو", "كرتون", "صينية", "عبوة"] as const;
type Unit = typeof UNITS[number];

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsPage,
});

interface ProductRow {
  id: string;
  name: string;
  unit: Unit;
  unit_price: number;
  is_hidden: boolean;
  supplier_id: string;
  supplierName: string;
}

interface EditState {
  name: string;
  unit: Unit;
  price: string;
  supplier_id: string;
}

function ProductsPage() {
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<Unit>("حبة");
  const [price, setPrice] = useState("");
  const [q, setQ] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [onlyNoPrice, setOnlyNoPrice] = useState(false);
  const [editing, setEditing] = useState<Record<string, EditState>>({});
  const [confirmDelete, setConfirmDelete] = useState<ProductRow | null>(null);

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
    queryFn: async (): Promise<ProductRow[]> => {
      const { data, error } = await supabase.from("products")
        .select("id,name,unit,is_hidden,unit_price,supplier_id,supplier:suppliers(name)")
        .order("name");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit as Unit,
        unit_price: round2(num(p.unit_price as unknown as number)),
        is_hidden: !!p.is_hidden,
        supplier_id: p.supplier_id,
        supplierName: (p as { supplier?: { name: string } | null }).supplier?.name ?? "—",
      }));
    },
  });

  const addMut = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error("اختر المورد");
      if (!name.trim()) throw new Error("اسم الصنف مطلوب");
      if (round2(num(price)) <= 0) throw new Error("أدخل سعر وحدة أكبر من صفر — الصنف بدون سعر يفسد مطابقة الفواتير");
      const { error } = await supabase.from("products").insert({
        supplier_id: supplierId, name: name.trim(), unit, unit_price: round2(num(price)),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إضافة الصنف");
      setName(""); setPrice("");
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async ({ id, v }: { id: string; v: EditState }) => {
      if (!v.name.trim()) throw new Error("اسم الصنف مطلوب");
      if (!v.supplier_id) throw new Error("اختر المورد");
      const { data, error } = await supabase.from("products").update({
        name: v.name.trim(), unit: v.unit, unit_price: round2(num(v.price)), supplier_id: v.supplier_id,
      }).eq("id", id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("لا تملك صلاحية تعديل الأصناف");
    },
    onSuccess: (_d, v) => {
      toast.success("تم تحديث الصنف");
      setEditing((prev) => { const n = { ...prev }; delete n[v.id]; return n; });
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const visibilityMut = useMutation({
    mutationFn: async ({ id, hidden }: { id: string; hidden: boolean }) => {
      const { data, error } = await supabase.from("products").update({ is_hidden: hidden }).eq("id", id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("لا تملك صلاحية التعديل");
    },
    onSuccess: (_d, v) => {
      toast.success(v.hidden ? "تم إخفاء الصنف" : "تم إظهار الصنف");
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (p: ProductRow) => {
      const [oi, ri, ii] = await Promise.all([
        supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", p.id),
        supabase.from("receipt_items").select("id", { count: "exact", head: true }).eq("product_id", p.id),
        supabase.from("invoice_items").select("id", { count: "exact", head: true }).eq("product_id", p.id),
      ]);
      const used = (oi.count ?? 0) + (ri.count ?? 0) + (ii.count ?? 0);
      if (used > 0) {
        return { used } as const;
      }
      const { data, error } = await supabase.from("products").delete().eq("id", p.id).select("id");
      if (error) throw error;
      if (!data?.length) throw new Error("لا تملك صلاحية حذف الأصناف");
      return { used: 0 } as const;
    },
    onSuccess: (res, p) => {
      if (res.used > 0) {
        toast.error(`الصنف مستخدم في ${res.used} سجل سابق — استخدم «إخفاء» للحفاظ على السجلات`);
        return;
      }
      setConfirmDelete(null);
      toast.success(`تم حذف «${p.name}»`);
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const groups = useMemo(() => {
    const rows = (products.data ?? []).filter((p) => {
      if (filterSupplier && p.supplier_id !== filterSupplier) return false;
      if (q.trim() && !p.name.includes(q.trim())) return false;
      if (onlyNoPrice && p.unit_price > 0) return false;
      return true;
    });
    const map = new Map<string, { name: string; items: ProductRow[] }>();
    for (const p of rows) {
      const g = map.get(p.supplier_id) ?? { name: p.supplierName, items: [] };
      g.items.push(p);
      map.set(p.supplier_id, g);
    }
    return [...map.entries()].map(([id, g]) => ({ id, ...g }));
  }, [products.data, q, filterSupplier, onlyNoPrice]);

  const noPrice = (products.data ?? []).filter((p) => !p.is_hidden && p.unit_price <= 0).length;

  return (
    <AppShell title="الأصناف والأسعار" back={{ to: "/admin" }}>
      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">إضافة صنف</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <select className="kube-input" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">— المورد —</option>
            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="kube-input" placeholder="اسم الصنف" value={name} onChange={e => setName(e.target.value)} />
          <select className="kube-input" value={unit} onChange={e => setUnit(e.target.value as Unit)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <input className="kube-input" type="number" inputMode="decimal" step="0.01" min="0"
            placeholder="سعر الوحدة" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <button className="kube-btn-primary mt-3" disabled={!name.trim() || !supplierId || addMut.isPending} onClick={() => addMut.mutate()}>
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>

      <div className="kube-card mb-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="kube-input w-full ps-9" placeholder="بحث باسم الصنف" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="kube-input w-full" value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}>
            <option value="">كل الموردين</option>
            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {noPrice > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {noPrice} صنف بدون سعر — سيؤثر على دقة المطابقة المالية
            <button type="button" className="ms-auto underline" onClick={() => setOnlyNoPrice(true)}>
              عرضها لإدخال الأسعار
            </button>
          </div>
        )}
        {onlyNoPrice && (
          <button type="button" className="kube-btn-outline !min-h-0 !py-1 !px-3 text-xs" onClick={() => setOnlyNoPrice(false)}>
            إلغاء فلتر «بدون سعر»
          </button>
        )}
      </div>

      {products.isLoading ? (
        <div className="kube-card text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : groups.length === 0 ? (
        <div className="kube-card text-center text-sm text-muted-foreground">لا توجد أصناف مطابقة</div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.id} className="kube-card">
              <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h3 className="truncate font-extrabold">{g.name}</h3>
                <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[11px] font-bold">{g.items.length} صنف</span>
              </div>
              <div className="space-y-2">
                {g.items.map((p) => {
                  const ed = editing[p.id];
                  if (ed) {
                    return (
                      <div key={p.id} className="rounded-xl border-2 border-primary/40 p-3 space-y-2">
                        <div className="grid gap-2 sm:grid-cols-4">
                          <input className="kube-input" value={ed.name}
                            onChange={e => setEditing(s => ({ ...s, [p.id]: { ...ed, name: e.target.value } }))} />
                          <select className="kube-input" value={ed.supplier_id}
                            onChange={e => setEditing(s => ({ ...s, [p.id]: { ...ed, supplier_id: e.target.value } }))}>
                            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <select className="kube-input" value={ed.unit}
                            onChange={e => setEditing(s => ({ ...s, [p.id]: { ...ed, unit: e.target.value as Unit } }))}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <input className="kube-input" type="number" inputMode="decimal" step="0.01" min="0" value={ed.price}
                            onChange={e => setEditing(s => ({ ...s, [p.id]: { ...ed, price: e.target.value } }))} />
                        </div>
                        <div className="flex gap-2">
                          <button className="kube-btn-primary px-4 py-2 text-sm" disabled={saveMut.isPending}
                            onClick={() => saveMut.mutate({ id: p.id, v: ed })}>
                            <Save className="w-4 h-4" /> حفظ
                          </button>
                          <button className="inline-flex items-center gap-1 rounded-xl border-2 border-border px-4 py-2 text-sm font-bold"
                            onClick={() => setEditing(s => { const n = { ...s }; delete n[p.id]; return n; })}>
                            <X className="w-4 h-4" /> إلغاء
                          </button>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate font-bold">{p.name}</span>
                          {p.is_hidden && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">مخفي</span>}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {p.unit} ·{" "}
                          {p.unit_price > 0
                            ? <span className="font-bold text-foreground">{formatMoney(p.unit_price)} ر.س</span>
                            : <span className="font-bold text-destructive">بدون سعر</span>}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconAction title="تعديل" onClick={() => setEditing(s => ({
                          ...s, [p.id]: { name: p.name, unit: p.unit, price: String(p.unit_price || ""), supplier_id: p.supplier_id },
                        }))}>
                          <Pencil className="w-4 h-4" />
                        </IconAction>
                        <IconAction title={p.is_hidden ? "إظهار" : "إخفاء"}
                          onClick={() => visibilityMut.mutate({ id: p.id, hidden: !p.is_hidden })}>
                          {p.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </IconAction>
                        <IconAction title="حذف" danger onClick={() => setConfirmDelete(p)}>
                          <Trash2 className="w-4 h-4" />
                        </IconAction>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center" dir="rtl">
          <div className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-2xl">
            <h3 className="font-extrabold">حذف الصنف</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              سيتم حذف «{confirmDelete.name}» نهائياً. إذا كان مستخدماً في طلبات أو فواتير سابقة فلن يُحذف — استخدم «إخفاء» بدلاً منه.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-xl bg-destructive px-4 py-3 font-bold text-destructive-foreground disabled:opacity-50"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete)}>
                تأكيد الحذف
              </button>
              <button className="flex-1 rounded-xl border-2 border-border px-4 py-3 font-bold"
                onClick={() => setConfirmDelete(null)}>إلغاء</button>
            </div>
            <button className="mt-2 w-full rounded-xl border-2 border-border px-4 py-2 text-sm font-bold"
              onClick={() => { visibilityMut.mutate({ id: confirmDelete.id, hidden: true }); setConfirmDelete(null); }}>
              إخفاء الصنف بدل الحذف
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function IconAction({ onClick, title, danger, children }: { onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={title} onClick={onClick}
      className={`rounded-lg border-2 p-2 transition ${danger ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border hover:bg-muted"}`}>
      {children}
    </button>
  );
}
