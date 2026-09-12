import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { SALES_STATUS } from "@/lib/waste-reasons";
import { formatMoneySar } from "@/lib/money";
import { formatDateAr } from "@/lib/format-date";
import { toast } from "sonner";
import { BadgeDollarSign, Check, Undo2, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/sales")({
  head: () => ({
    meta: [
      { title: "المبيعات اليومية — KUBE Kitchen" },
      { name: "description", content: "مراجعة واعتماد مبيعات الفروع اليومية المُدخلة يدوياً، مع قفل السجل بعد الاعتماد وتعديله بصلاحية خاصة." },
      { property: "og:title", content: "المبيعات اليومية — KUBE Kitchen" },
      { property: "og:description", content: "مراجعة واعتماد مبيعات الفروع مع سجل تعديل موثّق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["sales_review", "sales_record", "sales_edit_approved"]}>
      <SalesAdmin />
    </PermissionGuard>
  ),
});

interface EditState {
  id: string;
  total: string;
  cash: string;
  card: string;
  other: string;
  orders: string;
  reason: string;
}

function SalesAdmin() {
  const qc = useQueryClient();
  const { branchId, label } = useBranchFilter();
  const [edit, setEdit] = useState<EditState | null>(null);

  const rows = useQuery({
    queryKey: ["admin-sales", branchId],
    queryFn: async () => {
      let q = supabase
        .from("daily_sales")
        .select("id, sales_date, total_sales, cash_amount, card_amount, other_amount, orders_count, note, status, review_note, branch_id, branches(name)")
        .order("sales_date", { ascending: false })
        .limit(90);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const review = useMutation({
    mutationFn: async (v: { id: string; accept: boolean; note?: string }) => {
      const { error } = await supabase.rpc("review_daily_sales", {
        p_id: v.id, p_accept: v.accept, p_note: v.note || undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تنفيذ المراجعة");
      qc.invalidateQueries({ queryKey: ["admin-sales"] });
      qc.invalidateQueries({ queryKey: ["daily-sales"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveEdit = useMutation({
    mutationFn: async (v: EditState) => {
      const { error } = await supabase.rpc("edit_approved_daily_sales", {
        p_id: v.id,
        p_total: Number(v.total || 0),
        p_cash: Number(v.cash || 0),
        p_card: Number(v.card || 0),
        p_other: Number(v.other || 0),
        p_orders_count: Number(v.orders || 0),
        p_reason: v.reason.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تعديل المبيعات المعتمدة وسُجِّل السبب");
      setEdit(null);
      qc.invalidateQueries({ queryKey: ["admin-sales"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (rows.data ?? []) as any[];
  const pending = list.filter((r) => r.status === "submitted").length;

  return (
    <AppShell title={`المبيعات اليومية — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <div className="kube-card flex items-center justify-between">
          <div className="text-sm text-muted-foreground">بانتظار الاعتماد</div>
          <div className={`text-xl font-extrabold ${pending > 0 ? "text-kube-red" : ""}`}>{pending}</div>
        </div>

        {rows.isLoading ? (
          <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : list.length === 0 ? (
          <div className="kube-card text-center space-y-2">
            <BadgeDollarSign className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا توجد مبيعات مُدخلة بعد.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map((r) => {
              const st = SALES_STATUS[r.status] ?? SALES_STATUS.draft!;
              const isEditing = edit?.id === r.id;
              return (
                <div key={r.id} className="kube-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold">{formatDateAr(`${r.sales_date}T12:00:00+03:00`)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        نقد {formatMoneySar(Number(r.cash_amount))} · شبكة {formatMoneySar(Number(r.card_amount))} · أخرى {formatMoneySar(Number(r.other_amount))} · {r.orders_count} طلب
                        {!branchId && r.branches?.name ? ` · ${r.branches.name}` : ""}
                      </div>
                      {r.note && <div className="text-xs mt-1">{r.note}</div>}
                      {r.review_note && <div className="text-xs mt-1 text-muted-foreground">ملاحظة المراجعة: {r.review_note}</div>}
                    </div>
                    <div className="text-end shrink-0">
                      <div className="font-extrabold">{formatMoneySar(Number(r.total_sales))}</div>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
                    </div>
                  </div>

                  {r.status === "submitted" && (
                    <Can anyOf={["sales_review"]}>
                      <div className="flex gap-2">
                        <button onClick={() => review.mutate({ id: r.id, accept: true })} disabled={review.isPending}
                          className="kube-btn flex-1 inline-flex items-center justify-center gap-1 text-sm">
                          <Check className="w-4 h-4" /> اعتماد
                        </button>
                        <button
                          onClick={() => {
                            const note = window.prompt("سبب الإرجاع للتعديل:");
                            if (note && note.trim().length >= 3) review.mutate({ id: r.id, accept: false, note: note.trim() });
                          }}
                          disabled={review.isPending}
                          className="kube-btn-outline flex-1 inline-flex items-center justify-center gap-1 text-sm">
                          <Undo2 className="w-4 h-4" /> إرجاع للتعديل
                        </button>
                      </div>
                    </Can>
                  )}

                  {r.status === "approved" && (
                    <Can anyOf={["sales_edit_approved"]}>
                      {isEditing ? (
                        <div className="space-y-2 border-t pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <input type="number" step="any" min="0" className="kube-input" placeholder="الإجمالي"
                              value={edit.total} onChange={(e) => setEdit({ ...edit, total: e.target.value })} />
                            <input type="number" min="0" className="kube-input" placeholder="عدد الطلبات"
                              value={edit.orders} onChange={(e) => setEdit({ ...edit, orders: e.target.value })} />
                            <input type="number" step="any" min="0" className="kube-input" placeholder="نقد"
                              value={edit.cash} onChange={(e) => setEdit({ ...edit, cash: e.target.value })} />
                            <input type="number" step="any" min="0" className="kube-input" placeholder="شبكة"
                              value={edit.card} onChange={(e) => setEdit({ ...edit, card: e.target.value })} />
                            <input type="number" step="any" min="0" className="kube-input" placeholder="أخرى"
                              value={edit.other} onChange={(e) => setEdit({ ...edit, other: e.target.value })} />
                          </div>
                          <input className="kube-input" placeholder="سبب التعديل (إلزامي)"
                            value={edit.reason} onChange={(e) => setEdit({ ...edit, reason: e.target.value })} />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit.mutate(edit)} disabled={edit.reason.trim().length < 3 || saveEdit.isPending}
                              className="kube-btn flex-1 text-sm disabled:opacity-50">حفظ التعديل</button>
                            <button onClick={() => setEdit(null)} className="kube-btn-outline text-sm">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEdit({
                            id: r.id,
                            total: String(Number(r.total_sales)),
                            cash: String(Number(r.cash_amount)),
                            card: String(Number(r.card_amount)),
                            other: String(Number(r.other_amount)),
                            orders: String(r.orders_count),
                            reason: "",
                          })}
                          className="kube-btn-outline text-xs inline-flex items-center gap-1">
                          <Pencil className="w-3.5 h-3.5" /> تعديل مبيعات معتمدة
                        </button>
                      )}
                    </Can>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
