import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { toast } from "sonner";
import { ClipboardCheck, AlertTriangle, Plus, ChevronLeft } from "lucide-react";
import { formatDateTimeAr } from "@/lib/format-date";
import { formatMoneySar } from "@/lib/money";
import { COUNT_KIND_LABEL, COUNT_STATUS } from "@/lib/count-status";

export const Route = createFileRoute("/_authenticated/admin/counts/")({
  head: () => ({
    meta: [
      { title: "الجرد — KUBE Kitchen" },
      { name: "description", content: "جرد الفرع في الأول والخامس عشر مع الجرد الإضافي، وفرق الجرد المحسوب تلقائياً من حركة المخزون." },
      { property: "og:title", content: "الجرد — KUBE Kitchen" },
      { property: "og:description", content: "جلسات الجرد لكل فرع بحالاتها من الفتح حتى الاعتماد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["count_perform", "count_review", "count_approve", "inventory_view"]}>
      <CountsPage />
    </PermissionGuard>
  ),
});

interface SessionRow {
  id: string;
  count_date: string;
  kind: string;
  status: string;
  note: string | null;
  created_at: string;
  approved_at: string | null;
  lines: number;
  counted: number;
  variance: number;
}

function CountsPage() {
  const qc = useQueryClient();
  const { branchId, label, loading: branchLoading } = useBranchFilter();
  const [creating, setCreating] = useState(false);
  const [kind, setKind] = useState("cycle_1");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  const sessions = useQuery({
    queryKey: ["count-sessions", branchId],
    enabled: !!branchId,
    queryFn: async (): Promise<SessionRow[]> => {
      const { data, error } = await supabase
        .from("count_sessions")
        .select("id,count_date,kind,status,note,created_at,approved_at,count_lines(counted_qty,variance_value)")
        .eq("branch_id", branchId!)
        .order("count_date", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((s) => {
        const lines = (s.count_lines ?? []) as { counted_qty: number | null; variance_value: number | null }[];
        return {
          id: s.id,
          count_date: s.count_date,
          kind: s.kind as string,
          status: s.status as string,
          note: s.note,
          created_at: s.created_at,
          approved_at: s.approved_at,
          lines: lines.length,
          counted: lines.filter((l) => l.counted_qty !== null).length,
          variance: lines.reduce((a, l) => a + Number(l.variance_value ?? 0), 0),
        };
      });
    },
  });

  const openMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("open_count_session", {
        p_branch_id: branchId!,
        p_kind: kind,
        p_count_date: date,
        p_note: note,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast.success("تم فتح الجرد وتحميل الأصناف بأرقام النظام");
      setCreating(false);
      setNote("");
      qc.invalidateQueries({ queryKey: ["count-sessions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (branchLoading) {
    return (
      <AppShell title="الجرد" back={{ to: "/admin" }}>
        <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
      </AppShell>
    );
  }

  if (!branchId) {
    return (
      <AppShell title="الجرد" back={{ to: "/admin" }}>
        <div className="kube-card text-center space-y-2">
          <AlertTriangle className="w-6 h-6 mx-auto text-warning" />
          <p className="font-semibold">اختر فرعاً واحداً من الأعلى</p>
          <p className="text-sm text-muted-foreground">الجرد يُنفَّذ لكل فرع على حدة.</p>
        </div>
      </AppShell>
    );
  }

  const rows = sessions.data ?? [];
  const hasOpen = rows.some((r) => ["open", "in_progress", "submitted", "reviewed"].includes(r.status));

  return (
    <AppShell title={`الجرد — ${label}`} back={{ to: "/admin" }}>
      <div className="space-y-4">
        <Can anyOf={["count_perform"]}>
          {creating ? (
            <div className="kube-card space-y-3">
              <div className="font-bold">جرد جديد</div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">نوع الجرد</label>
                <select value={kind} onChange={(e) => setKind(e.target.value)} className="kube-input">
                  <option value="cycle_1">جرد الأول من الشهر</option>
                  <option value="cycle_15">جرد الخامس عشر</option>
                  <option value="extra">جرد إضافي</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">تاريخ الجرد</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="kube-input" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">ملاحظة (اختياري)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="kube-input" placeholder="مثال: جرد إضافي بعد التحويل" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openMut.mutate()}
                  disabled={openMut.isPending || hasOpen}
                  className="kube-btn flex-1 disabled:opacity-50"
                >
                  {openMut.isPending ? "جارٍ الفتح..." : "فتح الجرد"}
                </button>
                <button onClick={() => setCreating(false)} className="kube-btn-outline">إلغاء</button>
              </div>
              {hasOpen && (
                <p className="text-xs text-kube-red">يوجد جرد غير مكتمل لهذا الفرع — أكمله أو ألغه أولاً.</p>
              )}
            </div>
          ) : (
            <button onClick={() => setCreating(true)} className="kube-btn w-full inline-flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> فتح جرد جديد
            </button>
          )}
        </Can>

        {sessions.isLoading ? (
          <div className="kube-card text-center text-muted-foreground">جارٍ تحميل الجرد...</div>
        ) : rows.length === 0 ? (
          <div className="kube-card text-center space-y-2">
            <ClipboardCheck className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">لا يوجد جرد لهذا الفرع بعد.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const st = COUNT_STATUS[r.status] ?? COUNT_STATUS.open!;
              return (
                <Link
                  key={r.id}
                  to="/admin/counts/$sessionId"
                  params={{ sessionId: r.id }}
                  className="kube-card flex items-center gap-3 hover:border-primary transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{COUNT_KIND_LABEL[r.kind] ?? r.kind}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.count_date} · {r.counted}/{r.lines} صنف
                      {r.status === "approved" && r.approved_at ? ` · اعتُمد ${formatDateTimeAr(r.approved_at)}` : ""}
                    </div>
                    {r.status === "approved" && (
                      <div className={`text-xs font-semibold mt-1 ${r.variance < 0 ? "text-kube-red" : "text-muted-foreground"}`}>
                        قيمة الفرق: {formatMoneySar(r.variance)}
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${st.cls}`}>{st.label}</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
