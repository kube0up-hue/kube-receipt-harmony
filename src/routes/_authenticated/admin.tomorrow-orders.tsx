import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { num } from "@/lib/money";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";

export const Route = createFileRoute("/_authenticated/admin/tomorrow-orders")({
  head: () => ({
    meta: [
      { title: "طلبات الغد — KUBE Kitchen" },
      { name: "description", content: "مراجعة نواقص الفروع لنهاية اليوم واعتمادها أو رفضها قبل الطلب من الموردين." },
      { property: "og:title", content: "طلبات الغد — KUBE Kitchen" },
      { property: "og:description", content: "اعتماد أو رفض نواقص الفروع قبل الطلب من الموردين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["tomorrow_orders_approve", "tomorrow_orders_create", "orders_view"]}>
      <TomorrowOrdersAdmin />
    </PermissionGuard>
  ),
});

const STATUS: Record<string, { label: string; cls: string }> = {
  submitted: { label: "بانتظار الاعتماد", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  approved: { label: "معتمد", cls: "bg-success/15 text-success border-success/30" },
  rejected: { label: "مرفوض", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
  draft: { label: "مسودة", cls: "bg-muted text-muted-foreground border-border" },
};

function TomorrowOrdersAdmin() {
  const qc = useQueryClient();
  const { branchId, branches, label } = useBranchFilter();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "—";

  const list = useQuery({
    queryKey: ["tomorrow-orders", branchId],
    queryFn: async () => {
      let q = supabase
        .from("tomorrow_orders")
        .select("id, branch_id, for_date, status, note, review_note, reviewed_at, items:tomorrow_order_items(id, qty, note, product:products(name, unit))")
        .order("for_date", { ascending: false })
        .limit(60);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const review = useMutation({
    mutationFn: async (input: { id: string; approve: boolean; note: string }) => {
      const { error } = await supabase.rpc("review_tomorrow_order", {
        p_id: input.id,
        p_approve: input.approve,
        p_note: input.note,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.approve ? "تم اعتماد طلب الغد" : "تم رفض طلب الغد");
      setRejecting(null);
      setReason("");
      qc.invalidateQueries({ queryKey: ["tomorrow-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title={`طلبات الغد — ${label}`} back={{ to: "/admin", label: "لوحة الإدارة" }}>
      {list.isLoading ? (
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      ) : (list.data ?? []).length === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا توجد طلبات غد بعد</div>
      ) : (
        <div className="space-y-2">
          {(list.data ?? []).map((t) => {
            const s = STATUS[t.status as string] ?? STATUS.draft!;
            const items = (t as { items?: Array<Record<string, unknown>> }).items ?? [];
            return (
              <div key={t.id} className="kube-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm">{branchName(t.branch_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      ليوم {formatDateAr(`${t.for_date}T12:00:00+03:00`)}
                    </div>
                    {t.reviewed_at && (
                      <div className="text-[11px] text-muted-foreground">روجع {formatDateTimeAr(t.reviewed_at)}</div>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${s.cls}`}>
                    {s.label}
                  </span>
                </div>

                <ul className="text-sm space-y-1">
                  {items.map((i) => (
                    <li key={i.id as string} className="flex justify-between gap-2">
                      <span className="truncate">
                        {(i.product as { name?: string } | null)?.name ?? "—"}
                        {i.note ? <span className="text-xs text-muted-foreground"> — {i.note as string}</span> : null}
                      </span>
                      <span className="shrink-0 font-semibold">
                        {num(i.qty as number)} {(i.product as { unit?: string } | null)?.unit ?? ""}
                      </span>
                    </li>
                  ))}
                </ul>

                {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                {t.review_note && <div className="text-xs text-kube-red">سبب الرفض: {t.review_note}</div>}

                {t.status === "submitted" && (
                  <Can anyOf={["tomorrow_orders_approve"]}>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={review.isPending}
                        onClick={() => review.mutate({ id: t.id, approve: true, note: "" })}
                        className="kube-btn-outline text-xs inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3 h-3" /> اعتماد
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejecting(t.id);
                          setReason("");
                        }}
                        className="text-xs inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-kube-red/40 text-kube-red font-bold"
                      >
                        <XCircle className="w-3 h-3" /> رفض
                      </button>
                    </div>
                  </Can>
                )}

                {rejecting === t.id && (
                  <div className="space-y-2 border-t pt-2">
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="سبب الرفض (إلزامي)"
                      className="kube-input"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setRejecting(null)} className="kube-btn-outline flex-1 text-xs">
                        تراجع
                      </button>
                      <button
                        type="button"
                        disabled={review.isPending}
                        onClick={() => {
                          if (!reason.trim()) return toast.error("أدخل سبب الرفض");
                          review.mutate({ id: t.id, approve: false, note: reason.trim() });
                        }}
                        className="flex-1 text-xs py-2 rounded-lg bg-kube-red text-white font-bold disabled:opacity-50"
                      >
                        تأكيد الرفض
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
