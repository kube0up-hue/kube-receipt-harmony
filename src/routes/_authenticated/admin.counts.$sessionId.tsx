import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { toast } from "sonner";
import { Search, Save, RefreshCw, Send, CheckCircle2, Undo2, X, Pencil, AlertTriangle } from "lucide-react";
import { num, round3, formatQty, formatSigned, formatMoneySar, round2 } from "@/lib/money";
import { formatDateTimeAr } from "@/lib/format-date";
import { COUNT_KIND_LABEL, COUNT_STATUS } from "./admin.counts";

export const Route = createFileRoute("/_authenticated/admin/counts/$sessionId")({
  head: () => ({
    meta: [
      { title: "ورقة الجرد — KUBE Kitchen" },
      { name: "description", content: "إدخال الكميات الفعلية ومقارنتها بأرقام النظام وFoodics مع فرق الجرد المحسوب تلقائياً." },
      { property: "og:title", content: "ورقة الجرد — KUBE Kitchen" },
      { property: "og:description", content: "ورقة جرد الفرع: الكمية الفعلية، أرقام النظام، فرق الجرد وقيمته." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["count_perform", "count_review", "count_approve", "inventory_view"]}>
      <CountSheetPage />
    </PermissionGuard>
  ),
  errorComponent: () => (
    <AppShell title="ورقة الجرد" back={{ to: "/admin/counts" }}>
      <div className="kube-card text-center text-kube-red">تعذّر تحميل الجرد.</div>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell title="ورقة الجرد" back={{ to: "/admin/counts" }}>
      <div className="kube-card text-center text-muted-foreground">الجرد غير موجود.</div>
    </AppShell>
  ),
});

const MATCH: Record<string, { label: string; cls: string }> = {
  matched: { label: "متطابق", cls: "bg-success/15 text-success border-success/30" },
  minor_diff: { label: "فرق بسيط", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  mismatch: { label: "غير متطابق", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
};

interface Line {
  id: string;
  productId: string;
  name: string;
  unit: string;
  category: string | null;
  unitPrice: number;
  prev: number;
  purchases: number;
  tIn: number;
  tOut: number;
  waste: number;
  adjust: number;
  expected: number;
  counted: number | null;
  foodics: number | null;
  varianceQty: number;
  varianceValue: number;
  foodicsDiff: number | null;
  match: string | null;
  note: string | null;
}

interface SessionData {
  id: string;
  branchId: string;
  branchName: string;
  countDate: string;
  kind: string;
  status: string;
  note: string | null;
  reviewNote: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  lines: Line[];
}

function CountSheetPage() {
  const { sessionId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [draft, setDraft] = useState<Record<string, { counted?: string; foodics?: string; note?: string }>>({});
  const [confirm, setConfirm] = useState<null | "submit" | "approve" | "return" | "cancel">(null);
  const [reasonText, setReasonText] = useState("");
  const [editLine, setEditLine] = useState<Line | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editReason, setEditReason] = useState("");

  const session = useQuery({
    queryKey: ["count-session", sessionId],
    queryFn: async (): Promise<SessionData> => {
      const { data, error } = await supabase
        .from("count_sessions")
        .select(
          "id,branch_id,count_date,kind,status,note,review_note,submitted_at,reviewed_at,approved_at,branch:branches(name)," +
            "count_lines(id,product_id,unit_price,prev_count_qty,purchases_qty,transfer_in_qty,transfer_out_qty,waste_qty,adjust_qty,expected_qty,counted_qty,foodics_qty,variance_qty,variance_value,foodics_diff,match_status,note,product:products(name,unit,category))",
        )
        .eq("id", sessionId)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("الجرد غير موجود");
      const row = data as unknown as Record<string, unknown>;
      const raw = (row.count_lines ?? []) as Record<string, unknown>[];
      const lines: Line[] = raw
        .map((l) => {
          const p = l.product as { name: string; unit: string; category: string | null } | null;
          return {
            id: l.id as string,
            productId: l.product_id as string,
            name: p?.name ?? "—",
            unit: p?.unit ?? "",
            category: p?.category ?? null,
            unitPrice: num(l.unit_price as number),
            prev: num(l.prev_count_qty as number),
            purchases: num(l.purchases_qty as number),
            tIn: num(l.transfer_in_qty as number),
            tOut: num(l.transfer_out_qty as number),
            waste: num(l.waste_qty as number),
            adjust: num(l.adjust_qty as number),
            expected: num(l.expected_qty as number),
            counted: l.counted_qty === null || l.counted_qty === undefined ? null : num(l.counted_qty as number),
            foodics: l.foodics_qty === null || l.foodics_qty === undefined ? null : num(l.foodics_qty as number),
            varianceQty: num(l.variance_qty as number),
            varianceValue: num(l.variance_value as number),
            foodicsDiff: l.foodics_diff === null || l.foodics_diff === undefined ? null : num(l.foodics_diff as number),
            match: (l.match_status as string | null) ?? null,
            note: (l.note as string | null) ?? null,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name, "ar"));
      return {
        id: data.id,
        branchId: data.branch_id,
        branchName: (data.branch as { name: string } | null)?.name ?? "—",
        countDate: data.count_date,
        kind: data.kind as string,
        status: data.status as string,
        note: data.note,
        reviewNote: data.review_note,
        submittedAt: data.submitted_at,
        reviewedAt: data.reviewed_at,
        approvedAt: data.approved_at,
        lines,
      };
    },
  });

  const s = session.data;
  const editable = s?.status === "open" || s?.status === "in_progress";

  // حركة المخزون تُحدّث الجرد تلقائياً في قاعدة البيانات — نعيد التحميل عند أي حركة جديدة للفرع.
  useEffect(() => {
    if (!s?.branchId || s.status === "approved" || s.status === "cancelled") return;
    const channel = supabase
      .channel(`count-live-${s.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stock_ledger", filter: `branch_id=eq.${s.branchId}` },
        () => qc.invalidateQueries({ queryKey: ["count-session", s.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [s?.branchId, s?.id, s?.status, qc]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const l of s?.lines ?? []) if (l.category) set.add(l.category);
    return [...set].sort();
  }, [s?.lines]);

  const rows = useMemo(() => {
    const term = q.trim();
    return (s?.lines ?? []).filter((l) => {
      if (term && !l.name.includes(term)) return false;
      if (category && l.category !== category) return false;
      return true;
    });
  }, [s?.lines, q, category]);

  const stats = useMemo(() => {
    const all = s?.lines ?? [];
    const counted = all.filter((l) => l.counted !== null);
    return {
      total: all.length,
      counted: counted.length,
      varianceValue: round2(counted.reduce((a, l) => a + l.varianceValue, 0)),
      mismatch: counted.filter((l) => l.match === "mismatch").length,
      minor: counted.filter((l) => l.match === "minor_diff").length,
      foodicsGap: counted.filter((l) => l.foodicsDiff !== null && Math.abs(l.foodicsDiff) > 0).length,
    };
  }, [s?.lines]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["count-session", sessionId] });
    qc.invalidateQueries({ queryKey: ["count-sessions"] });
    qc.invalidateQueries({ queryKey: ["inventory"] });
    qc.invalidateQueries({ queryKey: ["stock-ledger"] });
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = Object.entries(draft).map(([productId, v]) => {
        const line = (s?.lines ?? []).find((l) => l.productId === productId);
        const countedRaw = v.counted !== undefined ? v.counted.trim() : line?.counted !== null && line?.counted !== undefined ? String(line.counted) : "";
        const foodicsRaw = v.foodics !== undefined ? v.foodics.trim() : line?.foodics !== null && line?.foodics !== undefined ? String(line.foodics) : "";
        return {
          product_id: productId,
          counted_qty: countedRaw === "" ? null : round3(num(countedRaw)),
          foodics_qty: foodicsRaw === "" ? null : round3(num(foodicsRaw)),
          note: v.note !== undefined ? v.note : (line?.note ?? ""),
        };
      });
      if (payload.length === 0) return;
      const { error } = await supabase.rpc("save_count_lines", { p_session_id: sessionId, p_lines: payload });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ الكميات");
      setDraft({});
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const refreshMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("refresh_count_session", { p_session_id: sessionId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث أرقام النظام من حركة المخزون");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("submit_count_session", { p_session_id: sessionId, p_note: reasonText });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال الجرد للمراجعة");
      setConfirm(null);
      setReasonText("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewMut = useMutation({
    mutationFn: async (accept: boolean) => {
      const { error } = await supabase.rpc("review_count_session", {
        p_session_id: sessionId,
        p_accept: accept,
        p_note: reasonText,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تسجيل المراجعة");
      setConfirm(null);
      setReasonText("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("approve_count_session", { p_session_id: sessionId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم اعتماد الجرد وتسوية المخزون على الكميات الفعلية");
      setConfirm(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("cancel_count_session", { p_session_id: sessionId, p_reason: reasonText });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إلغاء الجرد");
      setConfirm(null);
      setReasonText("");
      invalidate();
      navigate({ to: "/admin/counts" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const editMut = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("edit_approved_count_line", {
        p_line_id: editLine!.id,
        p_counted_qty: round3(num(editQty)),
        p_reason: editReason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تعديل البند وتسجيل التصحيح في حركة المخزون");
      setEditLine(null);
      setEditQty("");
      setEditReason("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (session.isLoading) {
    return (
      <AppShell title="ورقة الجرد" back={{ to: "/admin/counts" }}>
        <div className="kube-card text-center text-muted-foreground">جارٍ تحميل ورقة الجرد...</div>
      </AppShell>
    );
  }
  if (!s) {
    return (
      <AppShell title="ورقة الجرد" back={{ to: "/admin/counts" }}>
        <div className="kube-card text-center text-muted-foreground">الجرد غير موجود.</div>
      </AppShell>
    );
  }

  const st = COUNT_STATUS[s.status] ?? COUNT_STATUS.open!;
  const progress = stats.total === 0 ? 0 : Math.round((stats.counted / stats.total) * 100);
  const dirty = Object.keys(draft).length > 0;

  return (
    <AppShell title={`${COUNT_KIND_LABEL[s.kind] ?? s.kind} — ${s.branchName}`} back={{ to: "/admin/counts" }}>
      <div className="space-y-4 pb-24">
        <div className="kube-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-muted-foreground">{s.countDate}</div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.counted} من {stats.total} صنف · {progress}%
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-border p-2">
              <div className="text-xs text-muted-foreground">قيمة الفرق</div>
              <div className={`font-extrabold ${stats.varianceValue < 0 ? "text-kube-red" : ""}`}>{formatMoneySar(stats.varianceValue)}</div>
            </div>
            <div className="rounded-xl border border-border p-2">
              <div className="text-xs text-muted-foreground">أصناف غير متطابقة</div>
              <div className={`font-extrabold ${stats.mismatch > 0 ? "text-kube-red" : ""}`}>{stats.mismatch}</div>
            </div>
            <div className="rounded-xl border border-border p-2">
              <div className="text-xs text-muted-foreground">فرق بسيط</div>
              <div className="font-extrabold">{stats.minor}</div>
            </div>
            <div className="rounded-xl border border-border p-2">
              <div className="text-xs text-muted-foreground">اختلاف مع Foodics</div>
              <div className="font-extrabold">{stats.foodicsGap}</div>
            </div>
          </div>
          {s.reviewNote && (
            <div className="text-xs rounded-xl border border-warning/40 bg-warning/10 p-2">
              ملاحظة المراجعة: {s.reviewNote}
            </div>
          )}
          {s.approvedAt && <div className="text-xs text-muted-foreground">اعتُمد: {formatDateTimeAr(s.approvedAt)}</div>}
          {editable && (
            <button
              onClick={() => refreshMut.mutate()}
              disabled={refreshMut.isPending}
              className="kube-btn-outline w-full text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshMut.isPending ? "animate-spin" : ""}`} /> تحديث أرقام النظام
            </button>
          )}
        </div>

        <div className="kube-card space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث باسم الصنف" className="kube-input ps-9" />
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

        {rows.length === 0 ? (
          <div className="kube-card text-center text-muted-foreground">لا أصناف مطابقة</div>
        ) : (
          <div className="space-y-2">
            {rows.map((l) => {
              const d = draft[l.productId] ?? {};
              const countedStr = d.counted !== undefined ? d.counted : l.counted === null ? "" : String(l.counted);
              const foodicsStr = d.foodics !== undefined ? d.foodics : l.foodics === null ? "" : String(l.foodics);
              const liveCounted = countedStr.trim() === "" ? null : num(countedStr);
              const liveVar = liveCounted === null ? null : round3(liveCounted - l.expected);
              const m = l.match ? MATCH[l.match] : null;
              return (
                <div key={l.id} className="kube-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold truncate">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.category ?? "بدون تصنيف"} · الوحدة: {l.unit}
                        {l.unitPrice > 0 ? ` · ${formatMoneySar(l.unitPrice)}` : " · بدون سعر"}
                      </div>
                    </div>
                    {m && <span className={`text-xs font-semibold px-2 py-1 rounded-full border shrink-0 ${m.cls}`}>{m.label}</span>}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                    <div>جرد سابق: <b className="text-foreground">{formatQty(l.prev)}</b></div>
                    <div>مشتريات واستلام: <b className="text-foreground">{formatQty(l.purchases)}</b></div>
                    <div>تحويل وارد: <b className="text-foreground">{formatQty(l.tIn)}</b></div>
                    <div>تحويل صادر: <b className="text-foreground">{formatQty(l.tOut)}</b></div>
                    <div>هدر: <b className="text-foreground">{formatQty(l.waste)}</b></div>
                    <div>تعديلات: <b className="text-foreground">{formatQty(l.adjust)}</b></div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm rounded-xl bg-muted/50 px-3 py-2">
                    <span className="text-xs text-muted-foreground">كمية النظام</span>
                    <b>{formatQty(l.expected)}</b>
                  </div>

                  {editable ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">الكمية الفعلية</label>
                        <input
                          inputMode="decimal"
                          value={countedStr}
                          onChange={(e) => setDraft((p) => ({ ...p, [l.productId]: { ...p[l.productId], counted: e.target.value } }))}
                          className="kube-input"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">كمية Foodics</label>
                        <input
                          inputMode="decimal"
                          value={foodicsStr}
                          onChange={(e) => setDraft((p) => ({ ...p, [l.productId]: { ...p[l.productId], foodics: e.target.value } }))}
                          className="kube-input"
                          placeholder="اختياري"
                        />
                      </div>
                      <input
                        value={d.note !== undefined ? d.note : (l.note ?? "")}
                        onChange={(e) => setDraft((p) => ({ ...p, [l.productId]: { ...p[l.productId], note: e.target.value } }))}
                        className="kube-input col-span-2"
                        placeholder="ملاحظة (اختياري)"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-xl border border-border p-2">
                        <div className="text-xs text-muted-foreground">الكمية الفعلية</div>
                        <div className="font-extrabold">{l.counted === null ? "—" : formatQty(l.counted)}</div>
                      </div>
                      <div className="rounded-xl border border-border p-2">
                        <div className="text-xs text-muted-foreground">Foodics</div>
                        <div className="font-extrabold">{l.foodics === null ? "—" : formatQty(l.foodics)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-xs text-muted-foreground">فرق الجرد</span>
                    <b className={liveVar !== null && liveVar !== 0 ? "text-kube-red" : ""}>
                      {liveVar === null ? "—" : `${formatSigned(liveVar, "qty")} ${l.unit}`}
                      {liveVar !== null && l.unitPrice > 0 ? ` · ${formatSigned(round2(liveVar * l.unitPrice))} ر.س` : ""}
                    </b>
                  </div>
                  {l.foodicsDiff !== null && (
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>فرق Foodics</span>
                      <b className={l.foodicsDiff !== 0 ? "text-kube-red" : ""}>{formatSigned(l.foodicsDiff, "qty")}</b>
                    </div>
                  )}
                  {l.note && !editable && <div className="text-xs text-muted-foreground">ملاحظة: {l.note}</div>}

                  {s.status === "approved" && (
                    <Can anyOf={["count_edit_approved"]}>
                      <button
                        onClick={() => {
                          setEditLine(l);
                          setEditQty(l.counted === null ? "" : String(l.counted));
                          setEditReason("");
                        }}
                        className="kube-btn-outline text-xs inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> تعديل بعد الاعتماد
                      </button>
                    </Can>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* شريط الإجراءات */}
        <div className="fixed bottom-0 inset-x-0 z-20 bg-background/95 backdrop-blur border-t border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex gap-2">
            {editable && (
              <Can anyOf={["count_perform"]}>
                <>
                  <button
                    onClick={() => saveMut.mutate()}
                    disabled={!dirty || saveMut.isPending}
                    className="kube-btn-outline flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saveMut.isPending ? "جارٍ الحفظ..." : "حفظ"}
                  </button>
                  <button
                    onClick={() => {
                      if (dirty) {
                        toast.error("احفظ الكميات أولاً");
                        return;
                      }
                      setConfirm("submit");
                    }}
                    disabled={stats.counted < stats.total}
                    className="kube-btn flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> إرسال للمراجعة
                  </button>
                </>
              </Can>
            )}
            {s.status === "submitted" && (
              <Can anyOf={["count_review"]}>
                <>
                  <button onClick={() => setConfirm("return")} className="kube-btn-outline flex-1 inline-flex items-center justify-center gap-2">
                    <Undo2 className="w-4 h-4" /> إرجاع للتعديل
                  </button>
                  <button onClick={() => reviewMut.mutate(true)} disabled={reviewMut.isPending} className="kube-btn flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50">
                    <CheckCircle2 className="w-4 h-4" /> قبول المراجعة
                  </button>
                </>
              </Can>
            )}
            {(s.status === "submitted" || s.status === "reviewed") && (
              <Can anyOf={["count_approve"]}>
                <button onClick={() => setConfirm("approve")} className="kube-btn flex-1 inline-flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> اعتماد الجرد
                </button>
              </Can>
            )}
            {s.status !== "approved" && s.status !== "cancelled" && (
              <Can anyOf={["count_approve", "count_review"]}>
                <button onClick={() => setConfirm("cancel")} className="kube-btn-outline inline-flex items-center justify-center gap-1 text-kube-red">
                  <X className="w-4 h-4" /> إلغاء
                </button>
              </Can>
            )}
          </div>
        </div>

        {/* نوافذ التأكيد */}
        {confirm && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="kube-card w-full max-w-md space-y-3">
              {confirm === "submit" && (
                <>
                  <div className="font-bold">إرسال الجرد للمراجعة</div>
                  <p className="text-sm text-muted-foreground">بعد الإرسال لا يمكن تعديل الكميات إلا بإرجاع الجرد من المراجع.</p>
                  <input value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="kube-input" placeholder="ملاحظة (اختياري)" />
                  <div className="flex gap-2">
                    <button onClick={() => submitMut.mutate()} disabled={submitMut.isPending} className="kube-btn flex-1 disabled:opacity-50">تأكيد الإرسال</button>
                    <button onClick={() => setConfirm(null)} className="kube-btn-outline">إلغاء</button>
                  </div>
                </>
              )}
              {confirm === "return" && (
                <>
                  <div className="font-bold">إرجاع الجرد للتعديل</div>
                  <input value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="kube-input" placeholder="سبب الإرجاع (إلزامي)" />
                  <div className="flex gap-2">
                    <button onClick={() => reviewMut.mutate(false)} disabled={reviewMut.isPending || !reasonText.trim()} className="kube-btn flex-1 disabled:opacity-50">تأكيد الإرجاع</button>
                    <button onClick={() => setConfirm(null)} className="kube-btn-outline">إلغاء</button>
                  </div>
                </>
              )}
              {confirm === "approve" && (
                <>
                  <div className="font-bold">اعتماد الجرد</div>
                  <div className="rounded-xl border border-warning/40 bg-warning/10 p-2 text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <span>سيتم تسوية كميات المخزون على الكميات الفعلية وتسجيل حركة «تسوية جرد» لكل فرق، ولن يمكن التعديل بعدها إلا بصلاحية خاصة.</span>
                  </div>
                  <div className="text-sm">قيمة الفرق: <b className={stats.varianceValue < 0 ? "text-kube-red" : ""}>{formatMoneySar(stats.varianceValue)}</b></div>
                  <div className="flex gap-2">
                    <button onClick={() => approveMut.mutate()} disabled={approveMut.isPending} className="kube-btn flex-1 disabled:opacity-50">
                      {approveMut.isPending ? "جارٍ الاعتماد..." : "تأكيد الاعتماد"}
                    </button>
                    <button onClick={() => setConfirm(null)} className="kube-btn-outline">إلغاء</button>
                  </div>
                </>
              )}
              {confirm === "cancel" && (
                <>
                  <div className="font-bold">إلغاء الجرد</div>
                  <input value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="kube-input" placeholder="سبب الإلغاء (إلزامي)" />
                  <div className="flex gap-2">
                    <button onClick={() => cancelMut.mutate()} disabled={cancelMut.isPending || !reasonText.trim()} className="kube-btn flex-1 disabled:opacity-50">تأكيد الإلغاء</button>
                    <button onClick={() => setConfirm(null)} className="kube-btn-outline">رجوع</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {editLine && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-end sm:items-center justify-center p-4">
            <div className="kube-card w-full max-w-md space-y-3">
              <div className="font-bold">تعديل بند بعد الاعتماد — {editLine.name}</div>
              <input inputMode="decimal" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="kube-input" placeholder="الكمية الفعلية الصحيحة" />
              <input value={editReason} onChange={(e) => setEditReason(e.target.value)} className="kube-input" placeholder="سبب التعديل (إلزامي)" />
              <div className="flex gap-2">
                <button onClick={() => editMut.mutate()} disabled={editMut.isPending || !editReason.trim() || editQty.trim() === ""} className="kube-btn flex-1 disabled:opacity-50">
                  حفظ التعديل
                </button>
                <button onClick={() => setEditLine(null)} className="kube-btn-outline">إلغاء</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
