import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Package, Truck, ClipboardList, FileText, BarChart3, Wallet, Download, Printer, ImageIcon } from "lucide-react";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";

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

function ItemPhotos({ paths }: { paths: string[] }) {
  const [urls, setUrls] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (paths.length === 0) { setUrls([]); return; }
      const { data } = await supabase.storage.from("receipt-photos").createSignedUrls(paths, 3600);
      if (cancelled) return;
      setUrls((data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[]);
    })();
    return () => { cancelled = true; };
  }, [paths.join("|")]);
  if (paths.length === 0) {
    return <div className="text-[10px] text-kube-red flex items-center gap-1"><ImageIcon className="w-3 h-3" />بدون صور</div>;
  }
  return (
    <>
      <div className="flex flex-wrap gap-1">
        {urls.map((u, i) => (
          <button key={i} type="button" onClick={() => setOpen(u)}
            className="w-10 h-10 rounded overflow-hidden border">
            <img src={u} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <img src={open} alt="" className="max-w-full max-h-full rounded" />
        </div>
      )}
    </>
  );
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
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
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

  const detail = useQuery({
    enabled: openDetail !== null,
    queryKey: ["admin-stats-detail", openDetail],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
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
    { label: "استلامات هذا الأسبوع", v: s?.weekReceipts, onClick: () => setOpenDetail("all") },
    { label: "استلامات غير معتمدة", v: s?.unappr },
    { label: "تالف هذا الأسبوع", v: s?.damaged, onClick: () => setOpenDetail("damaged") },
    { label: "نقص هذا الأسبوع", v: s?.short, onClick: () => setOpenDetail("short") },
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
    { to: "/admin/reports", label: "التقارير", icon: BarChart3 },
  ];

  const totalQty = (detail.data ?? []).reduce((a, r) => a + r.qty, 0);
  const titleFor = (m: DetailMode) =>
    m === "short" ? "تفاصيل النقص هذا الأسبوع" : m === "damaged" ? "تفاصيل التالف هذا الأسبوع" : "تفاصيل استلامات هذا الأسبوع";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="kube-card flex items-center gap-3 hover:border-primary transition">
            <l.icon className="w-5 h-5 text-primary" />
            <span className="font-bold">{l.label}</span>
          </Link>
        ))}
      </div>

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
                    </tr>
                  </thead>
                  <tbody>
                    {detail.data!.map((r, i) => (
                      <tr key={i} className="border-t">
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
