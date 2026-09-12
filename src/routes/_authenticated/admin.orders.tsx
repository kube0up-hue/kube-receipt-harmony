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
import { Send, RotateCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { riyadhDayEndExclusive, riyadhDayOffset, riyadhDayStart, riyadhToday } from "@/lib/riyadh-time";
import { PermissionGuard } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";

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
  const qc = useQueryClient();
  const resendFn = useServerFn(resendReceiptTelegram);
  const { data: cu } = useCurrentUser();
  const isAdmin = !!cu?.roles?.includes("admin");
  const { branchId } = useBranchFilter();

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
        .select("id,received_at,status,total_ordered,total_received,total_accepted,total_damaged,total_short,total_over,telegram_notification_status,telegram_sent_at,telegram_message_id,telegram_error,supplier:suppliers(name),employee:employees(full_name),order:orders(order_number)")
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
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">العدد</div><div className="font-bold">{totals.count}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">مقبول</div><div className="font-bold">{totals.accepted}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">تالف</div><div className="font-bold">{totals.damaged}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">ناقص</div><div className="font-bold">{totals.short}</div></div>
            <div className="kube-card p-2 text-center"><div className="text-[10px] text-muted-foreground">زائد</div><div className="font-bold">{totals.over}</div></div>
          </div>
          <button onClick={exportCSV} disabled={!receipts.data?.length} className="kube-btn-secondary w-full mb-3 disabled:opacity-50">تصدير CSV</button>
          <div className="space-y-2">
            {receipts.data?.map(r => {
              const tgStatus = (r as any).telegram_notification_status as "pending" | "sent" | "failed" | undefined;
              const tgError = (r as any).telegram_error as string | null | undefined;
              const tgSentAt = (r as any).telegram_sent_at as string | null | undefined;
              return (
                <div key={r.id} className="kube-card">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-bold">{r.supplier?.name} · {r.id.slice(0,8)}</div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(r.received_at), "yyyy-MM-dd HH:mm")} · بواسطة {r.employee?.full_name ?? "—"}
                    {r.order?.order_number && ` · طلب ${r.order.order_number}`}
                  </div>
                  <div className="text-xs mt-1">مطلوب {r.total_ordered} · مستلم {r.total_received} · مقبول {r.total_accepted} · تالف {r.total_damaged}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-2">
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
