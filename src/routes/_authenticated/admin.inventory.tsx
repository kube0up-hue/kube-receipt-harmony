import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { toast } from "sonner";
import { Search, AlertTriangle, Save, Settings2, X, ArrowLeftRight } from "lucide-react";
import { num, round2 } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  head: () => ({
    meta: [
      { title: "المخزون — KUBE Kitchen" },
      { name: "description", content: "كميات المخزون الحالية لكل فرع مع الحد الأدنى وتنبيهات النقص والتعديل اليدوي الموثّق." },
      { property: "og:title", content: "المخزون — KUBE Kitchen" },
      { property: "og:description", content: "كميات المخزون الحالية لكل فرع مع تنبيهات النقص والتعديل الموثّق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["inventory_view"]}>
      <InventoryPage />
    </PermissionGuard>
  ),
});

interface Row {
  productId: string;
  name: string;
  unit: string;
  category: string | null;
  minQty: number;
  location: string | null;
  isCounted: boolean;
  foodicsStock: number | null;
  qty: number;
  supplierName: string;
}

function InventoryPage() {
  const qc = useQueryClient();
  const { branchId, label, loading: branchLoading } = useBranchFilter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const [adjust, setAdjust] = useState<Row | null>(null);
  const [settings, setSettings] = useState<Row | null>(null);

  const data = useQuery({
    queryKey: ["inventory", branchId],
    enabled: !!branchId,
    queryFn: async (): Promise<Row[]> => {
      const [prodRes, levelRes] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,unit,category,min_qty,storage_location,is_counted,foodics_stock,is_hidden,supplier:suppliers(name)")
          .eq("is_hidden", false)
          .order("name"),
        supabase.from("stock_levels").select("product_id,qty").eq("branch_id", branchId!),
      ]);
      if (prodRes.error) throw prodRes.error;
      if (levelRes.error) throw levelRes.error;
      const levels = new Map<string, number>((levelRes.data ?? []).map((l) => [l.product_id, num(l.qty as unknown as number)]));
      return (prodRes.data ?? []).map((p) => ({
        productId: p.id,
        name: p.name,
        unit: p.unit as string,
        category: (p.category as string | null) ?? null,
        minQty: num(p.min_qty as unknown as number),
        location: (p.storage_location as string | null) ?? null,
        isCounted: !!p.is_counted,
        foodicsStock: p.foodics_stock === null || p.foodics_stock === undefined ? null : num(p.foodics_stock as unknown as number),
        qty: round2(levels.get(p.id) ?? 0),
        supplierName: (p as { supplier?: { name: string } | null }).supplier?.name ?? "—",
      }));
    },
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of data.data ?? []) if (r.category) set.add(r.category);
    return [...set].sort();
  }, [data.data]);

  const rows = useMemo(() => {
    const term = q.trim();
    return (data.data ?? []).filter((r) => {
      if (term && !r.name.includes(term)) return false;
      if (category && r.category !== category) return false;
      if (onlyLow && !(r.minQty > 0 && r.qty <= r.minQty)) return false;
      return true;
    });
  }, [data.data, q, category, onlyLow]);

  const lowCount = useMemo(() => (data.data ?? []).filter((r) => r.minQty > 0 && r.qty <= r.minQty).length, [data.data]);

  const adjustMut = useMutation({
    mutationFn: async (input: { productId: string; delta: number; reason: string; note: string }) => {
      const { error } = await supabase.rpc("stock_adjust", {
        p_branch_id: branchId!,
        p_product_id: input.productId,
        p_delta: input.delta,
        p_reason: input.reason,
        p_note: input.note,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تعديل الكمية وتسجيل الحركة");
      setAdjust(null);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["stock-ledger"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const settingsMut = useMutation({
    mutationFn: async (input: {
      productId: string;
      category: string | null;
      minQty: number;
      location: string | null;
      isCounted: boolean;
      foodicsStock: number | null;
    }) => {
      const { error } = await supabase
        .from("products")
        .update({
          category: input.category,
          min_qty: input.minQty,
          storage_location: input.location,
          is_counted: input.isCounted,
          foodics_stock: input.foodicsStock,
        })
        .eq("id", input.productId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ بيانات الصنف");
      setSettings(null);
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (branchLoading) {
    return (
      <AppShell title="المخزون" back={{ to: "/admin" }}>
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      </AppShell>
    );
  }

  if (!branchId) {
    return (
      <AppShell title="المخزون" back={{ to: "/admin" }}>
        <div className="kube-card text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-warning" />
          <p className="font-semibold">اختر فرعاً واحداً من الأعلى</p>
          <p className="text-sm text-muted-foreground">المخزون يُدار لكل فرع على حدة، لذلك لا يمكن عرض «كل الفروع».</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`المخزون — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">{rows.length} صنف</div>
          <Can anyOf={["inventory_transfer", "inventory_receive_transfer"]}>
            <a href="/admin/transfers" className="kube-btn-outline text-sm inline-flex items-center gap-1">
              <ArrowLeftRight className="w-4 h-4" /> التحويلات
            </a>
          </Can>
        </div>

        {lowCount > 0 && (
          <button
            onClick={() => setOnlyLow((v) => !v)}
            className={`w-full text-right kube-card flex items-center gap-2 ${onlyLow ? "border-kube-red/50" : ""}`}
          >
            <AlertTriangle className="w-5 h-5 text-kube-red shrink-0" />
            <span className="font-semibold text-sm">{lowCount} صنف وصل للحد الأدنى أو أقل</span>
            <span className="text-xs text-muted-foreground ms-auto">{onlyLow ? "إظهار الكل" : "عرض النواقص"}</span>
          </button>
        )}

        <div className="kube-card space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث باسم الصنف"
              className="kube-input ps-9"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCategory("")} className={`px-3 py-1 rounded-full text-xs font-semibold border ${category === "" ? "bg-foreground text-background" : "border-border"}`}>
                الكل
              </button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-xs font-semibold border ${category === c ? "bg-foreground text-background" : "border-border"}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {data.isLoading ? (
          <div className="kube-card text-center text-muted-foreground">جارٍ تحميل المخزون...</div>
        ) : rows.length === 0 ? (
          <div className="kube-card text-center text-muted-foreground">لا أصناف مطابقة</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const low = r.minQty > 0 && r.qty <= r.minQty;
              return (
                <div key={r.productId} className={`kube-card ${low ? "border-kube-red/40" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {r.category ?? "بدون تصنيف"} · {r.supplierName}
                        {r.location ? ` · ${r.location}` : ""}
                      </div>
                    </div>
                    <div className="text-end shrink-0">
                      <div className={`text-lg font-extrabold ${low ? "text-kube-red" : ""}`}>
                        {r.qty} <span className="text-xs font-semibold text-muted-foreground">{r.unit}</span>
                      </div>
                      {r.minQty > 0 && <div className="text-[11px] text-muted-foreground">الحد الأدنى {r.minQty}</div>}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Can anyOf={["inventory_adjust"]}>
                      <button onClick={() => setAdjust(r)} className="kube-btn-outline text-xs">تعديل الكمية</button>
                    </Can>
                    <Can anyOf={["products_write"]}>
                      <button onClick={() => setSettings(r)} className="kube-btn-outline text-xs inline-flex items-center gap-1">
                        <Settings2 className="w-3 h-3" /> بيانات الصنف
                      </button>
                    </Can>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {adjust && (
        <AdjustDialog
          row={adjust}
          busy={adjustMut.isPending}
          onClose={() => setAdjust(null)}
          onSave={(delta, reason, note) => adjustMut.mutate({ productId: adjust.productId, delta, reason, note })}
        />
      )}

      {settings && (
        <SettingsDialog
          row={settings}
          busy={settingsMut.isPending}
          onClose={() => setSettings(null)}
          onSave={(v) => settingsMut.mutate({ productId: settings.productId, ...v })}
        />
      )}
    </AppShell>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-background w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 -m-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AdjustDialog({
  row,
  busy,
  onClose,
  onSave,
}: {
  row: Row;
  busy: boolean;
  onClose: () => void;
  onSave: (delta: number, reason: string, note: string) => void;
}) {
  const [mode, setMode] = useState<"set" | "delta">("set");
  const [value, setValue] = useState(String(row.qty));
  const [reason, setReason] = useState("manual_adjust");
  const [note, setNote] = useState("");

  const delta = mode === "set" ? round2(num(value) - row.qty) : round2(num(value));

  return (
    <Dialog title={`تعديل كمية: ${row.name}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground">
        الكمية الحالية {row.qty} {row.unit}. كل تعديل يُسجَّل في سجل الحركة باسمك.
      </p>
      <div className="flex gap-2">
        <button onClick={() => { setMode("set"); setValue(String(row.qty)); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${mode === "set" ? "bg-foreground text-background" : "border-border"}`}>
          كمية صحيحة جديدة
        </button>
        <button onClick={() => { setMode("delta"); setValue(""); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${mode === "delta" ? "bg-foreground text-background" : "border-border"}`}>
          إضافة / خصم
        </button>
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={mode === "set" ? "الكمية الفعلية" : "مثال: 5 أو -3"}
        className="kube-input"
      />
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="kube-input">
        <option value="manual_adjust">تعديل يدوي</option>
        <option value="return">إرجاع للمورد</option>
        <option value="correction">تصحيح خطأ إدخال</option>
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="السبب (إلزامي)"
        rows={2}
        className="kube-input"
      />
      <div className="text-sm font-semibold">
        الفرق: <span className={delta < 0 ? "text-kube-red" : "text-success"}>{delta > 0 ? `+${delta}` : delta}</span> {row.unit}
      </div>
      <button
        disabled={busy || delta === 0 || !note.trim()}
        onClick={() => onSave(delta, reason, note.trim())}
        className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> حفظ التعديل
      </button>
    </Dialog>
  );
}

function SettingsDialog({
  row,
  busy,
  onClose,
  onSave,
}: {
  row: Row;
  busy: boolean;
  onClose: () => void;
  onSave: (v: { category: string | null; minQty: number; location: string | null; isCounted: boolean; foodicsStock: number | null }) => void;
}) {
  const [category, setCategory] = useState(row.category ?? "");
  const [minQty, setMinQty] = useState(String(row.minQty));
  const [location, setLocation] = useState(row.location ?? "");
  const [isCounted, setIsCounted] = useState(row.isCounted);
  const [foodics, setFoodics] = useState(row.foodicsStock === null ? "" : String(row.foodicsStock));

  return (
    <Dialog title={`بيانات الصنف: ${row.name}`} onClose={onClose}>
      <label className="block text-sm font-semibold">التصنيف</label>
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="حلا، بن، حليب، أكواب، تغليف، تنظيف..." className="kube-input" />
      <label className="block text-sm font-semibold">الحد الأدنى ({row.unit})</label>
      <input type="number" inputMode="decimal" value={minQty} onChange={(e) => setMinQty(e.target.value)} className="kube-input" />
      <label className="block text-sm font-semibold">موقع التخزين</label>
      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="مستودع، ثلاجة، رف..." className="kube-input" />
      <label className="block text-sm font-semibold">كمية Foodics (للمقارنة اليدوية)</label>
      <input type="number" inputMode="decimal" value={foodics} onChange={(e) => setFoodics(e.target.value)} className="kube-input" />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={isCounted} onChange={(e) => setIsCounted(e.target.checked)} className="w-4 h-4" />
        يدخل في الجرد
      </label>
      <button
        disabled={busy}
        onClick={() =>
          onSave({
            category: category.trim() || null,
            minQty: num(minQty),
            location: location.trim() || null,
            isCounted,
            foodicsStock: foodics.trim() === "" ? null : num(foodics),
          })
        }
        className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> حفظ
      </button>
    </Dialog>
  );
}
