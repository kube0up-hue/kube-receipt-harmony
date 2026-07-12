import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/new-order")({
  component: NewOrderPage,
});

interface Line { productId: string; qty: string }

function NewOrderPage() {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState("");
  const [expected, setExpected] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  const suppliers = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").eq("is_active", true).order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const products = useQuery({
    queryKey: ["products", supplierId],
    enabled: !!supplierId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,unit")
        .eq("supplier_id", supplierId)
        .eq("is_hidden", false)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const availableProducts = useMemo(
    () => (products.data ?? []).filter((p) => !lines.find((l) => l.productId === p.id)),
    [products.data, lines],
  );

  function addLine(productId: string) {
    if (!productId) return;
    setLines((l) => [...l, { productId, qty: "" }]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) return toast.error("اختر المورد");
    const cleanLines = lines.filter((l) => Number(l.qty) > 0);
    if (cleanLines.length === 0) return toast.error("أضف منتجاً واحداً على الأقل بكمية");
    setSaving(true);
    try {
      // Ensure the auth token is fresh — a stale token makes auth.uid() null on the server
      // and the RLS check on orders.created_by_user fails.
      const { data: sessionRes } = await supabase.auth.getSession();
      if (sessionRes.session) {
        await supabase.auth.refreshSession();
      }
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) throw new Error("انتهت الجلسة، يرجى تسجيل الدخول مجدداً");
      const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userRes.user.id).single();
      if (!emp) throw new Error("الموظف غير موجود");

      const { data: order, error } = await supabase.from("orders").insert({
        supplier_id: supplierId,
        employee_id: emp.id,
        created_by_user: userRes.user.id,
        expected_delivery_date: expected || null,
        note: note || null,
      }).select("id, order_number").single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        cleanLines.map((l) => ({ order_id: order.id, product_id: l.productId, ordered_qty: Number(l.qty) })),
      );
      if (itemsErr) throw itemsErr;

      await supabase.from("activity_log").insert({
        actor_user: userRes.user.id, action: "create_order", entity: "orders", entity_id: order.id,
        details: { order_number: order.order_number },
      });

      toast.success(`تم حفظ الطلب ${order.order_number}`);
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="تسجيل طلب جديد" back={{ to: "/employee" }}>
      <form onSubmit={submit} className="space-y-4">
        <div className="kube-card space-y-4">
          <label className="block">
            <span className="block text-sm font-semibold mb-2">المورد</span>
            <select required value={supplierId} onChange={(e) => { setSupplierId(e.target.value); setLines([]); }} className="kube-input">
              <option value="">— اختر —</option>
              {suppliers.data?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">تاريخ التوصيل المتوقع (اختياري)</span>
            <input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} className="kube-input" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold mb-2">ملاحظة (اختياري)</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="kube-input" />
          </label>
        </div>

        {supplierId && (
          <div className="kube-card space-y-3">
            <div className="font-bold">المنتجات المطلوبة</div>
            {lines.length === 0 && <div className="text-sm text-muted-foreground">أضف منتجاً من القائمة أدناه.</div>}
            {lines.map((l, i) => {
              const p = products.data?.find((x) => x.id === l.productId);
              return (
                <div key={l.productId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{p?.name}</div>
                    <div className="text-xs text-muted-foreground">{p?.unit}</div>
                  </div>
                  <input
                    type="number" min="0" step="0.01" required
                    value={l.qty}
                    onChange={(e) => setLines((prev) => prev.map((x, j) => j === i ? { ...x, qty: e.target.value.replace(/^-/, "") } : x))}
                    className="kube-input !w-24 text-center"
                    placeholder="الكمية"
                  />
                  <button type="button" onClick={() => setLines((prev) => prev.filter((_, j) => j !== i))} className="p-2 text-kube-red">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
            {availableProducts.length > 0 && (
              <select className="kube-input" value="" onChange={(e) => addLine(e.target.value)}>
                <option value="">+ إضافة منتج</option>
                {availableProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
              </select>
            )}
          </div>
        )}

        <button disabled={saving} className="kube-btn-primary w-full disabled:opacity-50">
          {saving ? "جارٍ الحفظ..." : "حفظ الطلب"}
        </button>
      </form>
    </AppShell>
  );
}
