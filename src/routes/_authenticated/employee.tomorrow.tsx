import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { toast } from "sonner";
import { Plus, Trash2, Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { num } from "@/lib/money";
import { riyadhDayOffset } from "@/lib/riyadh-time";
import { formatDateAr } from "@/lib/format-date";

export const Route = createFileRoute("/_authenticated/employee/tomorrow")({
  head: () => ({
    meta: [
      { title: "طلب الغد — KUBE Kitchen" },
      { name: "description", content: "تسجيل نواقص الفرع في نهاية اليوم ليعتمدها المدير قبل الطلب من الموردين." },
      { property: "og:title", content: "طلب الغد — KUBE Kitchen" },
      { property: "og:description", content: "نواقص نهاية اليوم بانتظار اعتماد المدير." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TomorrowOrderPage,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  submitted: { label: "بانتظار الاعتماد", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  approved: { label: "معتمد", cls: "bg-success/15 text-success border-success/30" },
  rejected: { label: "مرفوض", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
  draft: { label: "مسودة", cls: "bg-muted text-muted-foreground border-border" },
};

function TomorrowOrderPage() {
  const qc = useQueryClient();
  const forDate = riyadhDayOffset(1);
  const [lines, setLines] = useState<Array<{ product_id: string; qty: string; note: string }>>([]);
  const [pick, setPick] = useState("");
  const [note, setNote] = useState("");

  const me = useQuery({
    queryKey: ["my-employee-branch"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("جلسة منتهية");
      const { data, error } = await supabase
        .from("employees")
        .select("id, branch_id, branches(name)")
        .eq("user_id", userRes.user.id)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const branchId = me.data?.branch_id ?? null;
  const branchName = (me.data as { branches?: { name?: string } } | null | undefined)?.branches?.name ?? "فرعي";

  const products = useQuery({
    queryKey: ["tomorrow-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, unit, category")
        .eq("is_hidden", false)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const existing = useQuery({
    queryKey: ["tomorrow-order", branchId, forDate],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tomorrow_orders")
        .select("id, status, note, review_note, reviewed_at, items:tomorrow_order_items(id, qty, note, product:products(name, unit))")
        .eq("branch_id", branchId!)
        .eq("for_date", forDate)
        .neq("status", "rejected")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const byId = useMemo(() => new Map((products.data ?? []).map((p) => [p.id, p])), [products.data]);

  const saveMut = useMutation({
    mutationFn: async () => {
      const items = lines
        .map((l) => ({ product_id: l.product_id, qty: num(l.qty), note: l.note.trim() }))
        .filter((l) => l.qty > 0);
      if (!branchId) throw new Error("لا يوجد فرع مرتبط بحسابك");
      if (items.length === 0) throw new Error("أضف صنفاً واحداً على الأقل بكمية");
      const { error } = await supabase.rpc("submit_tomorrow_order", {
        p_branch_id: branchId,
        p_for_date: forDate,
        p_note: note.trim(),
        p_items: items,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال طلب الغد للاعتماد");
      setLines([]);
      setNote("");
      qc.invalidateQueries({ queryKey: ["tomorrow-order"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const current = existing.data;
  const locked = current?.status === "approved";

  return (
    <AppShell title="طلب الغد" back={{ to: "/employee" }}>
      <div className="kube-card mb-4">
        <div className="font-bold">{branchName}</div>
        <div className="text-xs text-muted-foreground">
          نواقص يوم {formatDateAr(`${forDate}T12:00:00+03:00`)}
        </div>
      </div>

      {current && (
        <div className="kube-card mb-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-sm">الطلب المُسجَّل</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${(STATUS[current.status] ?? STATUS.draft)!.cls}`}>
              {current.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : current.status === "rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {(STATUS[current.status] ?? STATUS.draft)!.label}
            </span>
          </div>
          <ul className="text-sm space-y-1">
            {((current as { items?: Array<Record<string, unknown>> }).items ?? []).map((i) => (
              <li key={i.id as string} className="flex justify-between gap-2">
                <span className="truncate">{(i.product as { name?: string } | null)?.name ?? "—"}</span>
                <span className="shrink-0 font-semibold">
                  {num(i.qty as number)} {(i.product as { unit?: string } | null)?.unit ?? ""}
                </span>
              </li>
            ))}
          </ul>
          {current.note && <div className="text-xs text-muted-foreground">{current.note}</div>}
          {current.review_note && (
            <div className="text-xs text-kube-red">ملاحظة المراجعة: {current.review_note}</div>
          )}
          {locked && <div className="text-xs text-muted-foreground">الطلب معتمد ولا يمكن تعديله.</div>}
        </div>
      )}

      {!locked && (
        <div className="kube-card space-y-3">
          <div className="font-bold text-sm">{current ? "تعديل النواقص" : "تسجيل النواقص"}</div>
          <div className="flex gap-2">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="kube-input">
              <option value="">اختر صنفاً</option>
              {(products.data ?? [])
                .filter((p) => !lines.some((l) => l.product_id === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={() => {
                if (!pick) return;
                setLines((ls) => [...ls, { product_id: pick, qty: "", note: "" }]);
                setPick("");
              }}
              className="kube-btn-outline shrink-0"
              aria-label="إضافة صنف"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {lines.map((l, idx) => {
            const p = byId.get(l.product_id);
            return (
              <div key={l.product_id} className="space-y-2 border-t pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{p?.name ?? "—"}</div>
                    <div className="text-[11px] text-muted-foreground">{p?.unit}</div>
                  </div>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    value={l.qty}
                    onChange={(e) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))}
                    placeholder="الكمية"
                    className="kube-input w-24 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                    className="text-kube-red p-2"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={l.note}
                  onChange={(e) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, note: e.target.value } : x)))}
                  placeholder="ملاحظة (اختياري)"
                  className="kube-input"
                />
              </div>
            );
          })}

          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="ملاحظة عامة (اختياري)"
            className="kube-input"
          />

          <button
            type="button"
            disabled={saveMut.isPending || !branchId}
            onClick={() => saveMut.mutate()}
            className="kube-btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> إرسال للاعتماد
          </button>
        </div>
      )}
    </AppShell>
  );
}
