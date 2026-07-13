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

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersPage,
});

type Tab = "receipts" | "orders";

function todayISO() { return new Date().toISOString().slice(0, 10); }
function daysAgoISO(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function OrdersPage() {
  const [tab, setTab] = useState<Tab>("receipts");
  const [from, setFrom] = useState(() => daysAgoISO(30));
  const [to, setTo] = useState(() => todayISO());
  const [supplierId, setSupplierId] = useState<string>("");

  const suppliers = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const receipts = useQuery({
    queryKey: ["admin-receipts", from, to, supplierId],
    queryFn: async () => {
      let q = supabase.from("receipts")
        .select("id,received_at,status,total_ordered,total_received,total_accepted,total_damaged,total_short,total_over,telegram_notification_status,telegram_sent_at,telegram_message_id,telegram_error,supplier:suppliers(name),employee:employees(full_name),order:orders(order_number)")
        .gte("received_at", `${from}T00:00:00`)
        .lte("received_at", `${to}T23:59:59`)
        .order("received_at", { ascending: false })
        .limit(1000);
      if (supplierId) q = q.eq("supplier_id", supplierId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const orders = useQuery({
    queryKey: ["admin-orders", from, to, supplierId],
    queryFn: async () => {
      let q = supabase.from("orders")
        .select("id,order_number,order_date,status,supplier:suppliers(name),employee:employees(full_name)")
        .gte("order_date", from).lte("order_date", to)
        .order("order_date", { ascending: false }).limit(1000);
      if (supplierId) q = q.eq("supplier_id", supplierId);
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
            {receipts.data?.map(r => (
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
              </div>
            ))}
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
