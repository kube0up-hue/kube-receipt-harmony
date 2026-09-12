import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { SALES_STATUS } from "@/lib/waste-reasons";
import { formatMoneySar } from "@/lib/money";
import { riyadhToday } from "@/lib/riyadh-time";
import { toast } from "sonner";
import { Save, Send, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/employee/sales")({
  head: () => ({
    meta: [
      { title: "المبيعات اليومية — KUBE Kitchen" },
      { name: "description", content: "إدخال مبيعات اليوم يدوياً (نقد وشبكة وعدد الطلبات) وإرسالها للمراجعة والاعتماد." },
      { property: "og:title", content: "المبيعات اليومية — KUBE Kitchen" },
      { property: "og:description", content: "مبيعات اليوم لكل فرع مع مراجعة واعتماد وقفل بعد الاعتماد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["sales_record"]}>
      <SalesPage />
    </PermissionGuard>
  ),
});

function SalesPage() {
  const qc = useQueryClient();
  const { branchId, label, loading } = useBranchFilter();
  const [date, setDate] = useState(() => riyadhToday());
  const [total, setTotal] = useState("");
  const [cash, setCash] = useState("");
  const [card, setCard] = useState("");
  const [other, setOther] = useState("");
  const [orders, setOrders] = useState("");
  const [note, setNote] = useState("");

  const row = useQuery({
    queryKey: ["daily-sales", branchId, date],
    enabled: !!branchId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_sales")
        .select("id, total_sales, cash_amount, card_amount, other_amount, orders_count, note, status, review_note")
        .eq("branch_id", branchId!).eq("sales_date", date).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const d = row.data;
    setTotal(d ? String(Number(d.total_sales)) : "");
    setCash(d ? String(Number(d.cash_amount)) : "");
    setCard(d ? String(Number(d.card_amount)) : "");
    setOther(d ? String(Number(d.other_amount)) : "");
    setOrders(d ? String(d.orders_count) : "");
    setNote(d?.note ?? "");
  }, [row.data]);

  const status = row.data?.status ?? "draft";
  const locked = status !== "draft";

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("save_daily_sales", {
        p_branch_id: branchId!,
        p_sales_date: date,
        p_total: Number(total || 0),
        p_cash: Number(cash || 0),
        p_card: Number(card || 0),
        p_other: Number(other || 0),
        p_orders_count: Number(orders || 0),
        p_note: note.trim() || undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ المبيعات كمسودة");
      qc.invalidateQueries({ queryKey: ["daily-sales"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("submit_daily_sales", { p_id: row.data!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("أُرسلت المبيعات للمراجعة");
      qc.invalidateQueries({ queryKey: ["daily-sales"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (loading) {
    return <AppShell title="المبيعات اليومية" back={{ to: "/employee" }}><div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div></AppShell>;
  }
  if (!branchId) {
    return (
      <AppShell title="المبيعات اليومية" back={{ to: "/employee" }}>
        <div className="kube-card text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-warning" />
          <p className="font-semibold">اختر فرعاً واحداً من الأعلى</p>
        </div>
      </AppShell>
    );
  }

  const st = SALES_STATUS[status] ?? SALES_STATUS.draft!;
  const split = Number(cash || 0) + Number(card || 0) + Number(other || 0);
  const mismatch = Number(total || 0) > 0 && split > 0 && Math.abs(split - Number(total || 0)) > 0.5;

  return (
    <AppShell title={`المبيعات اليومية — ${label}`} back={{ to: "/employee" }}>
      <div className="space-y-4">
        <div className="kube-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-muted-foreground">التاريخ</label>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="kube-input" />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">إجمالي المبيعات</label>
            <input type="number" inputMode="decimal" step="any" min="0" value={total} disabled={locked}
              onChange={(e) => setTotal(e.target.value)} className="kube-input" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">نقد</label>
              <input type="number" inputMode="decimal" step="any" min="0" value={cash} disabled={locked}
                onChange={(e) => setCash(e.target.value)} className="kube-input" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">شبكة</label>
              <input type="number" inputMode="decimal" step="any" min="0" value={card} disabled={locked}
                onChange={(e) => setCard(e.target.value)} className="kube-input" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">أخرى</label>
              <input type="number" inputMode="decimal" step="any" min="0" value={other} disabled={locked}
                onChange={(e) => setOther(e.target.value)} className="kube-input" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">عدد الطلبات</label>
            <input type="number" inputMode="numeric" min="0" value={orders} disabled={locked}
              onChange={(e) => setOrders(e.target.value)} className="kube-input" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">ملاحظة (اختياري)</label>
            <input value={note} disabled={locked} onChange={(e) => setNote(e.target.value)} className="kube-input" />
          </div>

          {mismatch && (
            <p className="text-xs font-semibold text-kube-red">
              مجموع النقد والشبكة وأخرى ({formatMoneySar(split)}) لا يساوي الإجمالي ({formatMoneySar(Number(total || 0))}).
            </p>
          )}
          {row.data?.review_note && status === "draft" && (
            <p className="text-xs font-semibold text-warning-foreground">أُعيد للتعديل: {row.data.review_note}</p>
          )}

          {locked ? (
            <p className="text-xs text-muted-foreground">
              {status === "approved" ? "المبيعات معتمدة ومقفلة — التعديل يحتاج صلاحية خاصة." : "أُرسلت للمراجعة — بانتظار الاعتماد."}
            </p>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => save.mutate()} disabled={save.isPending || Number(total || 0) < 0}
                className="kube-btn-outline flex-1 inline-flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> حفظ مسودة
              </button>
              <button onClick={() => submit.mutate()} disabled={!row.data?.id || submit.isPending || Number(total || 0) <= 0}
                className="kube-btn flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> إرسال للمراجعة
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
