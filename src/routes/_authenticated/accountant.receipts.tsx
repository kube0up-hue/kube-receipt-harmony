import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";
import { Search, ChevronDown, ChevronUp, Camera, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/accountant/receipts")({
  component: ReceiptsPage,
});

interface Item {
  productId: string;
  product: string;
  unit: string;
  ordered: number;
  received: number;
  damaged: number;
  accepted: number;
  diff: number;
  note: string | null;
  photos: string[];
}

interface ReceiptCard {
  id: string;
  date: string;
  status: string;
  supplier: string;
  orderNumber: string;
  totalAccepted: number;
  totalDamaged: number;
  items: Item[];
  photoCount: number;
  missingPhotos: number;
}

function ReceiptsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [onlyIssues, setOnlyIssues] = useState(false);

  const since = useMemo(() => new Date(Date.now() - 14 * 86400000).toISOString(), []);

  const { data, isLoading } = useQuery({
    queryKey: ["receipts-acc-14", since],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select("id, received_at, status, total_accepted, total_damaged, suppliers(name), orders(order_number), receipt_items(ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note, products(id, name, unit)), receipt_photos(storage_path, product_id)")
        .gte("received_at", since)
        .order("received_at", { ascending: false });
      if (error) throw error;
      const cards: ReceiptCard[] = (data ?? []).map((r: any) => {
        const photoMap: Record<string, string[]> = {};
        (r.receipt_photos ?? []).forEach((p: any) => {
          (photoMap[p.product_id ?? "_"] ||= []).push(p.storage_path);
        });
        const items: Item[] = (r.receipt_items ?? []).map((it: any) => {
          const pid = it.products?.id ?? "";
          return {
            productId: pid,
            product: it.products?.name ?? "-",
            unit: it.products?.unit ?? "",
            ordered: Number(it.ordered_qty ?? 0),
            received: Number(it.received_qty ?? 0),
            damaged: Number(it.damaged_qty ?? 0),
            accepted: Number(it.accepted_qty ?? 0),
            diff: Number(it.diff ?? 0),
            note: it.note ?? null,
            photos: [...(photoMap[pid] ?? []), ...(photoMap["_"] ?? [])],
          };
        });
        return {
          id: r.id,
          date: r.received_at,
          status: r.status,
          supplier: r.suppliers?.name ?? "-",
          orderNumber: r.orders?.order_number ?? "—",
          totalAccepted: Number(r.total_accepted ?? 0),
          totalDamaged: Number(r.total_damaged ?? 0),
          items,
          photoCount: (r.receipt_photos ?? []).length,
          missingPhotos: items.filter((i) => i.photos.length === 0).length,
        };
      });
      return cards;
    },
  });

  const filtered = (data ?? []).filter((r) => {
    if (onlyIssues && r.totalDamaged === 0 && !r.items.some((i) => i.diff !== 0) && r.missingPhotos === 0) return false;
    if (!q.trim()) return true;
    const t = q.trim();
    return r.supplier.includes(t) || r.orderNumber.includes(t) || r.items.some((i) => i.product.includes(t));
  });

  const totals = filtered.reduce(
    (a, r) => ({ accepted: a.accepted + r.totalAccepted, damaged: a.damaged + r.totalDamaged, photos: a.photos + r.photoCount }),
    { accepted: 0, damaged: 0, photos: 0 },
  );

  return (
    <AppShell title="استلامات آخر أسبوعين" back={{ to: "/accountant" }}>
      <div className="kube-card mb-4 space-y-3">
        <div className="text-xs text-muted-foreground">
          الفترة: {formatDateAr(since)} → {formatDateAr(new Date())}
        </div>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="kube-input w-full ps-9"
            placeholder="بحث بالمورد أو رقم الطلب أو المنتج"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-xs font-bold">
          <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} />
          إظهار الاستلامات ذات الفروقات أو التالف أو الناقصة الصور فقط
        </label>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="استلامات" v={filtered.length} />
          <Stat label="مقبول" v={totals.accepted} />
          <Stat label="تالف" v={totals.damaged} tone={totals.damaged > 0 ? "bad" : undefined} />
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">جارٍ التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="kube-card text-center text-muted-foreground">لا توجد استلامات مطابقة.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isOpen = !!open[r.id];
            return (
              <div key={r.id} className="kube-card">
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                  className="w-full flex items-start justify-between gap-3 text-right"
                >
                  <div className="min-w-0">
                    <div className="font-bold">{r.supplier} · <span className="font-mono text-xs">{r.orderNumber}</span></div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTimeAr(r.date)} · مقبول {r.totalAccepted}
                      {r.totalDamaged > 0 && <span className="text-kube-red"> · تالف {r.totalDamaged}</span>}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 font-bold">
                        <Camera className="w-3 h-3" /> {r.photoCount} صورة
                      </span>
                      {r.missingPhotos > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-destructive/15 px-1.5 py-0.5 font-bold text-destructive">
                          <AlertTriangle className="w-3 h-3" /> {r.missingPhotos} صنف بلا صورة
                        </span>
                      )}
                      <span className="rounded bg-muted px-1.5 py-0.5 font-bold">{r.items.length} صنف</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 overflow-x-auto border-t border-border pt-3">
                    <table className="w-full text-xs">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-right">المنتج</th>
                          <th className="p-2 text-center">مطلوب</th>
                          <th className="p-2 text-center">مستلم</th>
                          <th className="p-2 text-center">تالف</th>
                          <th className="p-2 text-center">مقبول</th>
                          <th className="p-2 text-center">الفرق</th>
                          <th className="p-2 text-right">الصور</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.items.map((it) => (
                          <tr key={it.productId} className="border-t align-top">
                            <td className="p-2">
                              <div className="font-bold">{it.product}</div>
                              <div className="text-[10px] text-muted-foreground">{it.unit}</div>
                              {it.note && <div className="text-[10px] text-muted-foreground mt-0.5">{it.note}</div>}
                            </td>
                            <td className="p-2 text-center">{it.ordered}</td>
                            <td className="p-2 text-center">{it.received}</td>
                            <td className={`p-2 text-center ${it.damaged > 0 ? "text-kube-red font-bold" : ""}`}>{it.damaged || "—"}</td>
                            <td className="p-2 text-center font-bold">{it.accepted}</td>
                            <td className={`p-2 text-center font-bold ${it.diff < 0 ? "text-destructive" : it.diff > 0 ? "text-amber-600" : "text-success"}`}>
                              {it.diff > 0 ? `+${it.diff}` : it.diff}
                            </td>
                            <td className="p-2">
                              <ReceiptItemPhotos
                                paths={it.photos}
                                meta={{
                                  product: it.product, unit: it.unit, supplier: r.supplier,
                                  orderNumber: r.orderNumber, date: r.date,
                                  ordered: it.ordered, accepted: it.accepted,
                                  damaged: it.damaged, diff: it.diff,
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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

function Stat({ label, v, tone }: { label: string; v: number; tone?: "bad" }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className={`text-lg font-extrabold ${tone === "bad" ? "text-kube-red" : ""}`}>{v}</div>
    </div>
  );
}
