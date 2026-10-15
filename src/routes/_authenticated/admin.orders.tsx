import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { format } from "date-fns";
import { useServerFn } from "@tanstack/react-start";
import { resendReceiptTelegram } from "@/lib/telegram.functions";
import { useCurrentUser } from "@/lib/use-current-user";
import { toast } from "sonner";
import { Send, RotateCw, CheckCircle2, AlertTriangle, Clock, Camera, ChevronDown, ChevronUp, Image as ImageIcon, Sparkles, ExternalLink } from "lucide-react";
import { riyadhDayEndExclusive, riyadhDayOffset, riyadhDayStart, riyadhToday } from "@/lib/riyadh-time";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";
import { formatDateTimeAr } from "@/lib/format-date";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: () => (
    <PermissionGuard anyOf={["orders_view"]}>
      <OrdersPage />
    </PermissionGuard>
  ),
});

type Tab = "receipts" | "orders";

function todayISO() { return riyadhToday(); }
function daysAgoISO(n: number) { return riyadhDayOffset(-n); }

function OrdersPage() {
  const [tab, setTab] = useState<Tab>("receipts");
  const [from, setFrom] = useState(() => daysAgoISO(30));
  const [to, setTo] = useState(() => todayISO());
  const [supplierId, setSupplierId] = useState<string>("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const qc = useQueryClient();
  const resendFn = useServerFn(resendReceiptTelegram);
  const { data: cu } = useCurrentUser();
  const isAdmin = !!cu?.roles?.includes("admin");
  const { branchId } = useBranchFilter();

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  async function handleResend(receiptId: string, currentStatus: string) {
    if (!isAdmin) { toast.error("صلاحية المدير مطلوبة"); return; }
    const force = currentStatus === "sent";
    if (force) {
      const ok = window.confirm("هذا الإشعار تم إرساله مسبقاً. هل تريد إعادة إرسال نسخة ثانية؟");
      if (!ok) return;
    }
    setResendingId(receiptId);
    try {
      const res: any = await resendFn({ data: { receiptId, force } });
      if (res?.ok && res?.skipped) toast.info("الإشعار مُرسل مسبقاً");
      else if (res?.ok) toast.success("تم إرسال الإشعار");
      else toast.error(`فشل الإرسال: ${res?.reason ?? "unknown"}`);
      await qc.invalidateQueries({ queryKey: ["admin-receipts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الإرسال");
    } finally {
      setResendingId(null);
    }
  }

  const suppliers = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const receipts = useQuery({
    queryKey: ["admin-receipts", from, to, supplierId, branchId],
    queryFn: async () => {
      let q = supabase.from("receipts")
        .select(`
          id,received_at,status,total_ordered,total_received,total_accepted,total_damaged,total_short,total_over,
          telegram_notification_status,telegram_sent_at,telegram_message_id,telegram_error,
          supplier:suppliers(name),employee:employees(full_name),order:orders(order_number),
          receipt_items(
            id,ordered_qty,received_qty,accepted_qty,damaged_qty,diff,note,
            products(id,name,unit)
          ),
          receipt_photos(
            storage_path,product_id
          )
        `)
        .gte("received_at", riyadhDayStart(from))
        .lt("received_at", riyadhDayEndExclusive(to))
        .order("received_at", { ascending: false })
        .limit(1000);
      if (supplierId) q = q.eq("supplier_id", supplierId);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders", from, to, supplierId, branchId],
    queryFn: async () => {
      let q = supabase.from("orders")
        .select("id,order_number,order_date,status,supplier:suppliers(name),employee:employees(full_name)")
        .gte("order_date", from).lte("order_date", to)
        .order("order_date", { ascending: false }).limit(1000);
      if (supplierId) q = q.eq("supplier_id", supplierId);
      if (branchId) q = q.eq("branch_id", branchId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const totals = useMemo(() => {
    const list = receipts.data ?? [];
    return {
      count: list.length,
      accepted: list.reduce((a, r) => a + Number(r.total_accepted ?? 0), 0),
      damaged: list.reduce((a, r) => a + Number(r.total_damaged ?? 0), 0),
      short: list.reduce((a, r) => a + Number(r.total_short ?? 0), 0),
      over: list.reduce((a, r) => a + Number(r.total_over ?? 0), 0),
    };
  }, [receipts.data]);

  function exportCSV() {
    const rows = (receipts.data ?? []).map(r => ({
      رقم_الاستلام: r.id.slice(0,8),
      التاريخ: format(new Date(r.received_at), "yyyy-MM-dd HH:mm"),
      المورد: r.supplier?.name ?? "",
      الموظف: r.employee?.full_name ?? "",
      رقم_الطلب: r.order?.order_number ?? "",
      الحالة: r.status,
      مطلوب: r.total_ordered,
      مستلم: r.total_received,
      مقبول: r.total_accepted,
      تالف: r.total_damaged,
      ناقص: r.total_short,
      زائد: r.total_over,
    }));
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify((r as any)[h] ?? "")).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `receipts-${from}_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell title="الطلبات والاستلامات" back={{ to: "/admin" }}>
      <div className="kube-card mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">من تاريخ</span>
            <input type="date" className="kube-input w-full" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">إلى تاريخ</span>
            <input type="date" className="kube-input w-full" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setFrom(daysAgoISO(7)); setTo(todayISO()); }} className="kube-btn-secondary text-xs">آخر ٧ أيام</button>
          <button type="button" onClick={() => { setFrom(daysAgoISO(30)); setTo(todayISO()); }} className="kube-btn-secondary text-xs">آخر ٣٠ يوم</button>
          <button type="button" onClick={() => { setFrom(daysAgoISO(90)); setTo(todayISO()); }} className="kube-btn-secondary text-xs">آخر ٩٠ يوم</button>
          <button type="button" onClick={() => { setFrom(daysAgoISO(365)); setTo(todayISO()); }} className="kube-btn-secondary text-xs">آخر سنة</button>
          <button type="button" onClick={() => { setFrom("2000-01-01"); setTo(todayISO()); }} className="kube-btn-secondary text-xs">كل السجلات</button>
        </div>
        <label className="block">
          <span className="text-xs text-muted-foreground">المورد</span>
          <select className="kube-input w-full" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
            <option value="">كل الموردين</option>
            {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setTab("receipts")} className={`flex-1 py-2 rounded-lg font-bold ${tab === "receipts" ? "bg-black text-white" : "bg-muted"}`}>الاستلامات ({receipts.data?.length ?? 0})</button>
        <button onClick={() => setTab("orders")} className={`flex-1 py-2 rounded-lg font-bold ${tab === "orders" ? "bg-black text-white" : "bg-muted"}`}>الطلبات ({orders.data?.length ?? 0})</button>
      </div>

      {tab === "receipts" && (
        <>
          {/* Quick-Access Photo Gallery Banner */}
          <div className="p-4 mb-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-foreground flex items-center gap-2">
                  <span>أرشيف ومعرض صور وتوثيق الاستلامات</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">توثيق إلزامي</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  استعراض كامل الصور الملتقطة من الفروع، فحص البضائع التالفة، والتدقيق البصري الفوري
                </div>
              </div>
            </div>
            <Link
              to="/accountant/receipts"
              className="kube-btn-primary !min-h-0 !py-2 !px-4 text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              فتح معرض الصور الشامل
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">العدد</div><div className="font-bold">{totals.count}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">مقبول</div><div className="font-bold text-emerald-600">{totals.accepted}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">تالف</div><div className={`font-bold ${totals.damaged > 0 ? "text-kube-red" : ""}`}>{totals.damaged}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">ناقص</div><div className="font-bold text-amber-600">{totals.short}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">زائد</div><div className="font-bold">{totals.over}</div></div>
          </div>
          <button onClick={exportCSV} disabled={!receipts.data?.length} className="kube-btn-secondary w-full mb-3 disabled:opacity-50">تصدير CSV</button>
          
          <div className="space-y-3">
            {receipts.data?.map(r => {
              const tgStatus = (r as any).telegram_notification_status as "pending" | "sent" | "failed" | undefined;
              const tgError = (r as any).telegram_error as string | null | undefined;
              const tgSentAt = (r as any).telegram_sent_at as string | null | undefined;
              
              const rawPhotos: Array<{ storage_path: string; product_id?: string | null }> = (r as any).receipt_photos ?? [];
              const rawItems: any[] = (r as any).receipt_items ?? [];
              const allPhotos = rawPhotos.map(p => p.storage_path).filter(Boolean);
              const photoMap: Record<string, string[]> = {};
              rawPhotos.forEach((p) => {
                (photoMap[p.product_id ?? "_"] ||= []).push(p.storage_path);
              });

              const isOpen = !!expanded[r.id];

              return (
                <div key={r.id} className="kube-card transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-foreground">{r.supplier?.name ?? "مورد غير محدد"}</span>
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.id.slice(0, 8)}</span>
                        {allPhotos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <Camera className="w-3 h-3" />
                            {allPhotos.length} {allPhotos.length === 1 ? "صورة" : "صور"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            <AlertTriangle className="w-3 h-3" />
                            بلا صور
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{formatDateTimeAr(r.received_at)}</span>
                        <span>·</span>
                        <span>بواسطة: {r.employee?.full_name ?? "—"}</span>
                        {r.order?.order_number && (
                          <>
                            <span>·</span>
                            <span className="font-mono">طلب #{r.order.order_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <StatusBadge status={r.status} />
                      <button
                        type="button"
                        onClick={() => toggleExpanded(r.id)}
                        className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5"
                      >
                        {isOpen ? "إخفاء التفاصيل" : "عرض الصور والبنود"}
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs flex flex-wrap items-center gap-3 py-1.5 px-2.5 rounded-lg bg-muted/40 text-muted-foreground font-mono">
                    <span>مطلوب: <b className="text-foreground">{r.total_ordered}</b></span>
                    <span>·</span>
                    <span>مستلم: <b className="text-foreground">{r.total_received}</b></span>
                    <span>·</span>
                    <span>مقبول: <b className="text-emerald-600 font-bold">{r.total_accepted}</b></span>
                    {Number(r.total_damaged) > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-kube-red font-bold">تالف: {r.total_damaged}</span>
                      </>
                    )}
                    {Number(r.total_short) > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 font-bold">نقص: {r.total_short}</span>
                      </>
                    )}
                  </div>

                  {/* Expanded Section with Items & Photos */}
                  {isOpen && (
                    <div className="mt-3.5 pt-3.5 border-t border-border space-y-3.5 animate-in fade-in-50 duration-200">
                      {/* Photo preview strip */}
                      {allPhotos.length > 0 ? (
                        <div className="p-3 rounded-xl bg-card border border-border/80">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                              <Camera className="w-3.5 h-3.5 text-primary" />
                              معاينة صور التوثيق الملتقطة ({allPhotos.length} صورة)
                            </span>
                            <span className="text-[10px] text-muted-foreground">انقر على أي صورة للتكبير والتحميل</span>
                          </div>
                          <ReceiptItemPhotos
                            paths={allPhotos}
                            meta={{
                              product: `استلام ${r.supplier?.name ?? "المورد"}`,
                              supplier: r.supplier?.name,
                              orderNumber: r.order?.order_number,
                              date: r.received_at,
                              ordered: Number(r.total_ordered ?? 0),
                              accepted: Number(r.total_accepted ?? 0),
                              damaged: Number(r.total_damaged ?? 0),
                            }}
                          />
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>لم يقم الموظف بإرفاق صور لهذا الاستلام.</span>
                        </div>
                      )}

                      {/* Items details table */}
                      {rawItems.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full text-xs">
                            <thead className="bg-muted text-muted-foreground">
                              <tr>
                                <th className="p-2.5 text-right font-bold">المنتج</th>
                                <th className="p-2.5 text-center font-bold">مطلوب</th>
                                <th className="p-2.5 text-center font-bold">مستلم</th>
                                <th className="p-2.5 text-center font-bold">مقبول</th>
                                <th className="p-2.5 text-center font-bold">تالف</th>
                                <th className="p-2.5 text-center font-bold">الفرق</th>
                                <th className="p-2.5 text-right font-bold min-w-[120px]">صور الصنف</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {rawItems.map((it: any) => {
                                const pid = it.products?.id ?? "";
                                const itemPhotos = [...(photoMap[pid] ?? []), ...(photoMap["_"] ?? [])];
                                return (
                                  <tr key={it.id || pid} className="hover:bg-muted/30 align-top">
                                    <td className="p-2.5">
                                      <div className="font-bold text-foreground">{it.products?.name ?? "صنف"}</div>
                                      <div className="text-[10px] text-muted-foreground">{it.products?.unit ?? ""}</div>
                                      {it.note && (
                                        <div className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1">
                                          ملاحظة: {it.note}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-2.5 text-center font-mono">{it.ordered_qty}</td>
                                    <td className="p-2.5 text-center font-mono">{it.received_qty}</td>
                                    <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{it.accepted_qty}</td>
                                    <td className={`p-2.5 text-center font-mono font-bold ${Number(it.damaged_qty) > 0 ? "text-kube-red" : ""}`}>
                                      {it.damaged_qty || "—"}
                                    </td>
                                    <td className={`p-2.5 text-center font-mono font-bold ${Number(it.diff) < 0 ? "text-destructive" : Number(it.diff) > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                                      {Number(it.diff) > 0 ? `+${it.diff}` : it.diff}
                                    </td>
                                    <td className="p-2.5">
                                      <ReceiptItemPhotos
                                        paths={itemPhotos}
                                        meta={{
                                          product: it.products?.name ?? "صنف",
                                          unit: it.products?.unit,
                                          supplier: r.supplier?.name,
                                          orderNumber: r.order?.order_number,
                                          date: r.received_at,
                                          ordered: Number(it.ordered_qty ?? 0),
                                          accepted: Number(it.accepted_qty ?? 0),
                                          damaged: Number(it.damaged_qty ?? 0),
                                          diff: Number(it.diff ?? 0),
                                        }}
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                    <TelegramBadge status={tgStatus} sentAt={tgSentAt} error={tgError} />
                    {isAdmin && tgStatus === "failed" && (
                      <button
                        onClick={() => handleResend(r.id, tgStatus)}
                        disabled={resendingId === r.id}
                        className="inline-flex items-center gap-1 text-xs font-bold rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-50"
                      >
                        <RotateCw className="w-3 h-3" />
                        إعادة إرسال إشعار تيليجرام
                      </button>
                    )}
                    {isAdmin && tgStatus === "sent" && (
                      <button
                        onClick={() => handleResend(r.id, tgStatus)}
                        disabled={resendingId === r.id}
                        className="inline-flex items-center gap-1 text-[10px] rounded-md border px-2 py-1 hover:bg-muted disabled:opacity-50"
                        title="إعادة إرسال قسرية (مدير)"
                      >
                        <Send className="w-3 h-3" />
                        إعادة إرسال قسرية
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {(receipts.data?.length ?? 0) === 0 && <div className="kube-card text-center text-muted-foreground">لا توجد استلامات في هذه الفترة</div>}
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="space-y-2">
          {orders.data?.map(o => (
            <Link key={o.id} to="/admin/orders" className="kube-card flex items-center justify-between">
              <div>
                <div className="font-bold">{o.supplier?.name} · {o.order_number}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(o.order_date), "yyyy-MM-dd")} · {o.employee?.full_name ?? "—"}</div>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
          {(orders.data?.length ?? 0) === 0 && <div className="kube-card text-center text-muted-foreground">لا توجد طلبات في هذه الفترة</div>}
        </div>
      )}
    </AppShell>
  );
}

function TelegramBadge({ status, sentAt, error }: { status?: string; sentAt?: string | null; error?: string | null }) {
  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] rounded-md bg-green-100 text-green-800 px-2 py-1" title={sentAt ? `أُرسل: ${format(new Date(sentAt), "yyyy-MM-dd HH:mm")}` : undefined}>
        <CheckCircle2 className="w-3 h-3" /> تيليجرام: تم الإرسال
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] rounded-md bg-red-100 text-red-800 px-2 py-1" title={error ?? undefined}>
        <AlertTriangle className="w-3 h-3" /> تيليجرام: فشل
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] rounded-md bg-muted text-muted-foreground px-2 py-1">
      <Clock className="w-3 h-3" /> تيليجرام: بانتظار
    </span>
  );
}
