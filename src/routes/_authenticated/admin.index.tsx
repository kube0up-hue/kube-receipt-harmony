import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Package, Truck, ClipboardList, FileText, BarChart3, Wallet, Download, Printer, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";


export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

type DetailMode = "short" | "damaged" | "all";

interface DetailRow {
  receiptId: string;
  productId: string;
  orderNumber: string;
  supplier: string;
  date: string;
  product: string;
  unit: string;
  ordered: number;
  accepted: number;
  damaged: number;
  diff: number;
  qty: number;
  note: string | null;
  photos: string[];
}



function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // بداية اليوم بتوقيت الرياض (UTC+3) كلحظة UTC
      const riyadhParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Riyadh",
        year: "numeric", month: "2-digit", day: "2-digit",
      }).formatToParts(new Date()).reduce<Record<string, string>>((a, p) => { a[p.type] = p.value; return a; }, {});
      const todayRiyadh = `${riyadhParts.year}-${riyadhParts.month}-${riyadhParts.day}`;
      const startOfTodayUTC = new Date(`${todayRiyadh}T00:00:00+03:00`).toISOString();
      const weekAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const [pending, todayR, unappr, invMatch, invUnmatch, invReady, weekReceipts] = await Promise.all([
        supabase.from("v_orders_effective").select("id", { count: "exact", head: true }).eq("effective_status", "pending_receipt"),
        supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", startOfTodayUTC),
        supabase.from("receipts").select("id", { count: "exact", head: true }).eq("status", "submitted"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "pending_match"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "unmatched"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "matched_ready"),
        supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", weekAgo),
      ]);
      const damagedSum = await supabase
        .from("receipts").select("total_damaged").gte("received_at", weekAgo);
      const shortSum = await supabase
        .from("receipts").select("total_short").gte("received_at", weekAgo);
      const sum = (rows: { total_damaged?: number; total_short?: number }[] | null, k: "total_damaged" | "total_short") =>
        (rows ?? []).reduce((a, r) => a + Number(r[k] ?? 0), 0);
      return {
        pending: pending.count ?? 0,
        today: todayR.count ?? 0,
        unappr: unappr.count ?? 0,
        damaged: sum(damagedSum.data as never, "total_damaged"),
        short: sum(shortSum.data as never, "total_short"),
        invMatch: invMatch.count ?? 0,
        invUnmatch: invUnmatch.count ?? 0,
        invReady: invReady.count ?? 0,
        weekReceipts: weekReceipts.count ?? 0,
      };
    },
  });

  const s = stats.data;
  const [openDetail, setOpenDetail] = useState<null | DetailMode>(null);
  const [integrityOpen, setIntegrityOpen] = useState(false);
  const [integrityRunning, setIntegrityRunning] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<null | {
    checkedAt: string;
    issues: Array<{ kind: string; severity: "error" | "warn"; title: string; detail: string; ref?: string }>;
  }>(null);

  async function runIntegrityCheck() {
    setIntegrityRunning(true);
    setIntegrityOpen(true);
    try {
      const since = new Date(Date.now() - 24 * 3600_000).toISOString();
      const issues: Array<{ kind: string; severity: "error" | "warn"; title: string; detail: string; ref?: string }> = [];

      // 1) orders created in last 24h with no items
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, order_number, created_at, status, supplier:suppliers(name), order_items(id)")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      (recentOrders ?? []).forEach((o: any) => {
        if (!o.order_items || o.order_items.length === 0) {
          issues.push({
            kind: "order_no_items",
            severity: "error",
            title: `طلب بلا بنود: ${o.order_number}`,
            detail: `المورد ${o.supplier?.name ?? "—"} · أُنشئ ${formatDateTimeAr(o.created_at)}`,
            ref: o.order_number,
          });
        }
      });

      // 2) orders pending_receipt older than 24h (should have been received or cancelled)
      const { data: staleOrders } = await supabase
        .from("v_orders_effective")
        .select("id, order_number, order_date, created_at, effective_status, supplier:suppliers(name)")
        .eq("effective_status", "pending_receipt")
        .lt("created_at", since)
        .order("created_at", { ascending: true })
        .limit(50);
      (staleOrders ?? []).forEach((o: any) => {
        const days = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 86400000);
        issues.push({
          kind: "order_stale_pending",
          severity: "warn",
          title: `طلب معلق منذ ${days} يوم: ${o.order_number}`,
          detail: `المورد ${o.supplier?.name ?? "—"} · تاريخ الطلب ${formatDateAr(o.order_date)}`,
          ref: o.order_number,
        });
      });

      // 3) receipts in last 24h with missing photos or item mismatch or telegram failures
      const { data: recentReceipts } = await supabase
        .from("receipts")
        .select("id, received_at, status, telegram_notification_status, telegram_error, order:orders(order_number, order_items(product_id)), supplier:suppliers(name), receipt_items(product_id), receipt_photos(product_id)")
        .gte("received_at", since)
        .order("received_at", { ascending: false });
      (recentReceipts ?? []).forEach((r: any) => {
        const orderProducts: string[] = (r.order?.order_items ?? []).map((i: any) => i.product_id);
        const receiptProducts: string[] = (r.receipt_items ?? []).map((i: any) => i.product_id);
        const photoProducts = new Set((r.receipt_photos ?? []).map((p: any) => p.product_id).filter(Boolean));
        const ordNum = r.order?.order_number ?? r.id.slice(0, 8);

        if (orderProducts.length > 0 && receiptProducts.length !== orderProducts.length) {
          issues.push({
            kind: "receipt_items_mismatch",
            severity: "error",
            title: `عدد بنود الاستلام لا يطابق الطلب: ${ordNum}`,
            detail: `بنود الطلب ${orderProducts.length} · بنود الاستلام ${receiptProducts.length}`,
            ref: ordNum,
          });
        }
        const missingPhotos = receiptProducts.filter((pid) => !photoProducts.has(pid));
        if (missingPhotos.length > 0) {
          issues.push({
            kind: "receipt_missing_photos",
            severity: "error",
            title: `استلام بدون صور لبعض الأصناف: ${ordNum}`,
            detail: `${missingPhotos.length} صنف بلا صورة · المورد ${r.supplier?.name ?? "—"}`,
            ref: ordNum,
          });
        }
        if (r.telegram_notification_status === "failed" || r.telegram_notification_status === "pending") {
          const failed = r.telegram_notification_status === "failed";
          issues.push({
            kind: "telegram_failed",
            severity: "warn",
            title: `${failed ? "فشل" : "لم يُرسل"} إشعار تيليجرام: ${ordNum}`,
            detail: r.telegram_error ?? (failed ? "سبب غير معروف" : "الإشعار معلّق — أعد الإرسال من سجل الاستلامات"),
            ref: ordNum,
          });
        }
      });

      setIntegrityResult({ checkedAt: new Date().toISOString(), issues });
    } catch (err) {
      setIntegrityResult({
        checkedAt: new Date().toISOString(),
        issues: [{
          kind: "check_failed",
          severity: "error",
          title: "تعذر إكمال الفحص",
          detail: err instanceof Error ? err.message : String(err),
        }],
      });
    } finally {
      setIntegrityRunning(false);
    }
  }


  const detail = useQuery({
    enabled: openDetail !== null,
    queryKey: ["admin-stats-detail", openDetail],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data: receipts } = await supabase
        .from("receipts")
        .select("id, received_at, order_id, orders(order_number, suppliers(name)), receipt_items(ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note, products(id, name, unit)), receipt_photos(storage_path, product_id)")
        .gte("received_at", weekAgo)
        .order("received_at", { ascending: false });
      const rows: DetailRow[] = [];
      (receipts ?? []).forEach((r: any) => {
        const photoMap: Record<string, string[]> = {};
        (r.receipt_photos ?? []).forEach((p: any) => {
          const key = p.product_id ?? "_";
          (photoMap[key] ||= []).push(p.storage_path);
        });
        (r.receipt_items ?? []).forEach((it: any) => {
          const shortQty = Number(it.diff) < 0 ? -Number(it.diff) : 0;
          const dmg = Number(it.damaged_qty ?? 0);
          const diff = Number(it.diff ?? 0);
          const qty = openDetail === "short" ? shortQty : openDetail === "damaged" ? dmg : Number(it.accepted_qty ?? 0);
          if (openDetail !== "all" && qty <= 0) return;
          const pid = it.products?.id ?? "";
          rows.push({
            receiptId: r.id,
            productId: pid,
            orderNumber: r.orders?.order_number ?? "-",
            supplier: r.orders?.suppliers?.name ?? "-",
            date: r.received_at,
            product: it.products?.name ?? "-",
            unit: it.products?.unit ?? "",
            ordered: Number(it.ordered_qty ?? 0),
            accepted: Number(it.accepted_qty ?? 0),
            damaged: dmg,
            diff,
            qty,
            note: it.note ?? null,
            photos: [...(photoMap[pid] ?? []), ...(photoMap["_"] ?? [])],
          });
        });
      });
      return rows;
    },
  });

  const cards: Array<{ label: string; v: number | undefined; onClick?: () => void }> = [
    { label: "طلبات بانتظار الاستلام", v: s?.pending },
    { label: "استلامات اليوم", v: s?.today },
    { label: "استلامات آخر أسبوعين", v: s?.weekReceipts, onClick: () => setOpenDetail("all") },
    { label: "استلامات غير معتمدة", v: s?.unappr },
    { label: "تالف آخر أسبوعين", v: s?.damaged, onClick: () => setOpenDetail("damaged") },
    { label: "نقص آخر أسبوعين", v: s?.short, onClick: () => setOpenDetail("short") },
    { label: "فواتير بانتظار المطابقة", v: s?.invMatch },
    { label: "فواتير غير مطابقة", v: s?.invUnmatch },
    { label: "فواتير جاهزة للتحويل", v: s?.invReady },
  ];

  const links: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { to: "/admin/employees", label: "الموظفون", icon: Users },
    { to: "/admin/suppliers", label: "الموردون", icon: Truck },
    { to: "/admin/products", label: "المنتجات", icon: Package },
    { to: "/admin/orders", label: "الطلبات والاستلامات", icon: ClipboardList },
    { to: "/admin/invoices", label: "الفواتير", icon: FileText },
    { to: "/admin/payments", label: "السداد", icon: Wallet },
    { to: "/admin/dues", label: "المبالغ المستحقة للسداد", icon: Wallet },
    { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
    { to: "/admin/permissions", label: "صلاحيات المستخدمين", icon: ShieldCheck },
  ];

  const totalQty = (detail.data ?? []).reduce((a, r) => a + r.qty, 0);
  const titleFor = (m: DetailMode) =>
    m === "short" ? "تفاصيل النقص — آخر أسبوعين" : m === "damaged" ? "تفاصيل التالف — آخر أسبوعين" : "تفاصيل الاستلامات — آخر أسبوعين";

  function exportCSV() {
    if (!openDetail || !detail.data) return;
    const rows = detail.data;
    const header = ["التاريخ", "رقم الطلب", "المورد", "المنتج", "الوحدة", "المطلوب", "المقبول", "التالف", "الفرق", "ملاحظة"];
    const esc = (v: string | number | null) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows.map((r) => [
      new Date(r.date).toISOString().slice(0, 16).replace("T", " "),
      r.orderNumber, r.supplier, r.product, r.unit,
      r.ordered, r.accepted, r.damaged, r.diff, r.note ?? "",
    ].map(esc).join(","));
    const csv = "\uFEFF" + [header.join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${titleFor(openDetail)}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    if (!openDetail || !detail.data) return;
    const rows = detail.data;
    const escHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
    const title = titleFor(openDetail);
    const generatedAt = formatDateTimeAr(new Date());
    const tbody = rows.map((r) => `
      <tr>
        <td>${escHtml(formatDateTimeAr(r.date))}</td>
        <td>${escHtml(r.orderNumber)}</td>
        <td>${escHtml(r.supplier)}</td>
        <td>${escHtml(r.product)}${r.note ? `<div class="note">${escHtml(r.note)}</div>` : ""}</td>
        <td class="c">${r.ordered} ${escHtml(r.unit)}</td>
        <td class="c">${r.accepted} ${escHtml(r.unit)}</td>
        <td class="c">${r.damaged}</td>
        <td class="c ${r.diff < 0 ? "neg" : ""}">${r.diff}</td>
      </tr>`).join("");
    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${escHtml(title)}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        body { font-family: "Cairo", "Tahoma", sans-serif; direction: rtl; color: #111; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .meta { font-size: 11px; color: #555; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: right; vertical-align: top; }
        th { background: #f2f2f2; }
        td.c { text-align: center; }
        td.neg { color: #c00; font-weight: 700; }
        .note { color: #777; font-size: 10px; margin-top: 2px; }
        tfoot td { font-weight: 700; background: #fafafa; }
      </style></head><body>
      <h1>${escHtml(title)}</h1>
      <div class="meta">تاريخ الإصدار: ${escHtml(generatedAt)} — عدد البنود: ${rows.length}</div>
      <table>
        <thead><tr>
          <th>التاريخ</th><th>رقم الطلب</th><th>المورد</th><th>المنتج</th>
          <th>المطلوب</th><th>المقبول</th><th>التالف</th><th>الفرق</th>
        </tr></thead>
        <tbody>${tbody}</tbody>
      </table>
      <script>window.onload = () => { window.print(); };</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <AppShell title="لوحة الإدارة">
      <div className="grid grid-cols-2 gap-3 mb-6">
        {cards.map((c) => {
          const clickable = !!c.onClick;
          return (
            <button
              key={c.label}
              type="button"
              onClick={c.onClick}
              disabled={!clickable}
              className={`kube-card text-right ${clickable ? "hover:border-primary transition cursor-pointer" : "cursor-default"}`}
            >
              <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
              <div className="text-2xl font-extrabold">{c.v ?? "—"}</div>
              {clickable && <div className="text-[10px] text-muted-foreground mt-1">اضغط للتفاصيل</div>}
            </button>
          );
        })}
      </div>
      <div className="mb-4">
        <button
          type="button"
          onClick={runIntegrityCheck}
          disabled={integrityRunning}
          className="w-full kube-card flex items-center justify-center gap-2 font-bold hover:border-primary transition disabled:opacity-60"
        >
          <ShieldCheck className="w-5 h-5" />
          {integrityRunning ? "جارٍ فحص سلامة البيانات…" : "فحص سلامة البيانات (آخر 24 ساعة)"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="kube-card flex items-center gap-3 hover:border-primary transition">
            <l.icon className="w-5 h-5 text-primary" />
            <span className="font-bold">{l.label}</span>
          </Link>
        ))}
      </div>

      <Dialog open={integrityOpen} onOpenChange={setIntegrityOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> فحص سلامة البيانات
            </DialogTitle>
          </DialogHeader>
          {integrityRunning ? (
            <div className="py-8 text-center text-muted-foreground">جارِ الفحص…</div>
          ) : !integrityResult ? null : integrityResult.issues.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-600 mb-2" />
              <div className="font-bold">لا توجد مشاكل خلال آخر 24 ساعة</div>
              <div className="text-xs text-muted-foreground mt-1">آخر فحص: {formatDateTimeAr(integrityResult.checkedAt)}</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                عُثر على {integrityResult.issues.length} تنبيه · آخر فحص: {formatDateTimeAr(integrityResult.checkedAt)}
              </div>
              {integrityResult.issues.map((it, i) => (
                <div key={i} className={`kube-card border-r-4 ${it.severity === "error" ? "border-r-destructive" : "border-r-amber-500"}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${it.severity === "error" ? "text-destructive" : "text-amber-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{it.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{it.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex justify-end">
                <button type="button" onClick={runIntegrityCheck} className="kube-btn-secondary text-xs">إعادة الفحص</button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>



      <Dialog open={openDetail !== null} onOpenChange={(o) => !o && setOpenDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{openDetail ? titleFor(openDetail) : ""}</DialogTitle>
          </DialogHeader>
          {detail.isLoading ? (
            <div className="py-8 text-center text-muted-foreground">جارِ التحميل…</div>
          ) : (detail.data ?? []).length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm text-muted-foreground">
                  {openDetail === "all" ? (
                    <>عدد البنود: <span className="font-extrabold text-foreground">{detail.data!.length}</span></>
                  ) : (
                    <>الإجمالي: <span className="font-extrabold text-foreground">{totalQty}</span> وحدة عبر {detail.data!.length} بند</>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={exportCSV}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-bold hover:bg-muted">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button type="button" onClick={exportPDF}
                    className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-bold hover:bg-muted">
                    <Printer className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-right">الطلب</th>
                      <th className="p-2 text-right">المورد</th>
                      <th className="p-2 text-right">المنتج</th>
                      <th className="p-2 text-center">مطلوب</th>
                      <th className="p-2 text-center">مقبول</th>
                      <th className="p-2 text-center">تالف</th>
                      <th className="p-2 text-center">الفرق</th>
                      <th className="p-2 text-right">الصور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.data!.map((r, i) => (
                      <tr key={i} className="border-t align-top">
                        <td className="p-2 font-mono">{r.orderNumber}</td>
                        <td className="p-2">{r.supplier}</td>
                        <td className="p-2">
                          <div className="font-bold">{r.product}</div>
                          {r.note && <div className="text-[10px] text-muted-foreground mt-0.5">{r.note}</div>}
                          <div className="text-[10px] text-muted-foreground">{formatDateAr(r.date)}</div>
                        </td>
                        <td className="p-2 text-center">{r.ordered} {r.unit}</td>
                        <td className="p-2 text-center">{r.accepted} {r.unit}</td>
                        <td className="p-2 text-center">{r.damaged}</td>
                        <td className={`p-2 text-center font-bold ${r.diff < 0 ? "text-destructive" : ""}`}>{r.diff}</td>
                        <td className="p-2">
                          <ReceiptItemPhotos
                            paths={r.photos}
                            meta={{
                              product: r.product, unit: r.unit, supplier: r.supplier,
                              orderNumber: r.orderNumber, date: r.date,
                              ordered: r.ordered, accepted: r.accepted,
                              damaged: r.damaged, diff: r.diff,
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
