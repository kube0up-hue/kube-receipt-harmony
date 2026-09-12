import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { WASTE_REASONS, WASTE_REASON_LABEL } from "@/lib/waste-reasons";
import { uploadOpsPhotos } from "@/lib/ops-photos";
import { formatMoneySar } from "@/lib/money";
import { formatDateTimeAr } from "@/lib/format-date";
import { toast } from "sonner";
import { Trash2, Camera, AlertTriangle, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/waste")({
  head: () => ({
    meta: [
      { title: "تسجيل الهدر — KUBE Kitchen" },
      { name: "description", content: "تسجيل هدر الأصناف بسبب إلزامي وصورة إثبات، ويُخصم تلقائياً من مخزون الفرع." },
      { property: "og:title", content: "تسجيل الهدر — KUBE Kitchen" },
      { property: "og:description", content: "سبب إلزامي وصورة إثبات لكل هدر، مع خصم فوري من المخزون." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["waste_record"]}>
      <WastePage />
    </PermissionGuard>
  ),
});

function WastePage() {
  const qc = useQueryClient();
  const { branchId, label, loading } = useBranchFilter();
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [reasonCode, setReasonCode] = useState("expired");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const products = useQuery({
    queryKey: ["waste-products", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const [pRes, sRes] = await Promise.all([
        supabase.from("products").select("id, name, unit, unit_price, category").eq("is_hidden", false).order("name"),
        supabase.from("stock_levels").select("product_id, qty").eq("branch_id", branchId!),
      ]);
      if (pRes.error) throw pRes.error;
      if (sRes.error) throw sRes.error;
      const stock = new Map((sRes.data ?? []).map((s) => [s.product_id, Number(s.qty)]));
      return (pRes.data ?? []).map((p) => ({ ...p, stock: stock.get(p.id) ?? 0 }));
    },
  });

  const recent = useQuery({
    queryKey: ["waste-recent", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waste_entries")
        .select("id, qty, waste_value, reason_code, reason, created_at, products(name, unit)")
        .eq("branch_id", branchId!)
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const list = products.data ?? [];
    const q = search.trim();
    return q ? list.filter((p) => p.name.includes(q)) : list;
  }, [products.data, search]);

  const selected = (products.data ?? []).find((p) => p.id === productId) ?? null;
  const estValue = selected ? Number(qty || 0) * Number(selected.unit_price ?? 0) : 0;

  const save = useMutation({
    mutationFn: async () => {
      const paths = await uploadOpsPhotos(files, `waste/${branchId}`);
      const { error } = await supabase.rpc("record_waste", {
        p_branch_id: branchId!,
        p_product_id: productId,
        p_qty: Number(qty),
        p_reason_code: reasonCode,
        p_reason: reason.trim(),
        p_note: null,
        p_photo_paths: paths,
        p_waste_date: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تسجيل الهدر وخُصم من المخزون");
      setProductId(""); setQty(""); setReason(""); setFiles([]);
      qc.invalidateQueries({ queryKey: ["waste-recent"] });
      qc.invalidateQueries({ queryKey: ["waste-products"] });
      qc.invalidateQueries({ queryKey: ["stock"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) {
    return <AppShell title="تسجيل الهدر" back={{ to: "/employee" }}><div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div></AppShell>;
  }
  if (!branchId) {
    return (
      <AppShell title="تسجيل الهدر" back={{ to: "/employee" }}>
        <div className="kube-card text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-warning" />
          <p className="font-semibold">اختر فرعاً واحداً من الأعلى</p>
        </div>
      </AppShell>
    );
  }

  const valid = productId && Number(qty) > 0 && reason.trim().length >= 3 && files.length > 0;

  return (
    <AppShell title={`تسجيل الهدر — ${label}`} back={{ to: "/employee" }}>
      <div className="space-y-4">
        <div className="kube-card space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 start-3 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن الصنف" className="kube-input ps-9" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">الصنف</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="kube-input">
              <option value="">اختر الصنف</option>
              {filtered.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — الرصيد {p.stock} {p.unit}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">الكمية {selected ? `(${selected.unit})` : ""}</label>
              <input type="number" inputMode="decimal" min="0" step="any" value={qty} onChange={(e) => setQty(e.target.value)} className="kube-input" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">قيمة الهدر التقديرية</label>
              <div className="kube-input flex items-center font-bold">{formatMoneySar(estValue)}</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">سبب الهدر</label>
            <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="kube-input">
              {WASTE_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">شرح السبب (إلزامي)</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="kube-input" placeholder="مثال: انتهت صلاحية الحليب في ثلاجة البار" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">صورة الإثبات (إلزامية)</label>
            <label className="kube-btn-outline w-full inline-flex items-center justify-center gap-2 cursor-pointer">
              <Camera className="w-4 h-4" />
              {files.length > 0 ? `${files.length} صورة مختارة` : "إضافة صورة"}
              <input type="file" accept="image/*" multiple capture="environment" className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
            </label>
          </div>
          <button onClick={() => save.mutate()} disabled={!valid || save.isPending}
            className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Trash2 className="w-4 h-4" />
            {save.isPending ? "جارٍ الحفظ..." : "تسجيل الهدر"}
          </button>
        </div>

        <section>
          <h2 className="font-bold mb-2">آخر ما سُجِّل</h2>
          {(recent.data ?? []).length === 0 ? (
            <div className="kube-card text-center text-sm text-muted-foreground">لا يوجد هدر مسجَّل لهذا الفرع.</div>
          ) : (
            <div className="space-y-2">
              {recent.data!.map((w: any) => (
                <div key={w.id} className="kube-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold truncate">{w.products?.name ?? "—"}</div>
                    <div className="text-sm font-bold text-kube-red shrink-0">{formatMoneySar(Number(w.waste_value))}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Number(w.qty)} {w.products?.unit ?? ""} · {WASTE_REASON_LABEL[w.reason_code] ?? w.reason_code} · {formatDateTimeAr(w.created_at)}
                  </div>
                  <div className="text-xs mt-1">{w.reason}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
