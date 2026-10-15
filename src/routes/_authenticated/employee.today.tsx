import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { formatDateTimeAr } from "@/lib/format-date";
import { riyadhToday, riyadhDayStart } from "@/lib/riyadh-time";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";
import { Camera, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/employee/today")({
  head: () => ({
    meta: [
      { title: "استلامات اليوم — KUBE Kitchen" },
      { name: "description", content: "استلامات فرع KUBE لهذا اليوم بالكميات المستلمة والتالفة وصور التوثيق." },
      { property: "og:title", content: "استلامات اليوم — KUBE Kitchen" },
      { property: "og:description", content: "ملخص وتوثيق صور استلامات اليوم في الفرع." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["orders_view", "orders_create", "orders_receive"]}>
      <TodayPage />
    </PermissionGuard>
  ),
});

function TodayPage() {
  const today = riyadhToday();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["receipts", "today-full", today],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("receipts")
        .select(`
          id, received_at, status, total_received, total_accepted, total_damaged, total_short, total_over,
          supplier:suppliers(name),
          order:orders(order_number),
          receipt_items(
            id, ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note,
            products(id, name, unit)
          ),
          receipt_photos(
            storage_path, product_id
          )
        `)
        .gte("received_at", riyadhDayStart(today))
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell title="استلامات اليوم" back={{ to: "/employee" }}>
      {/* Informational Guidance Ribbon */}
      <div className="mb-4 p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-xs">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display font-bold text-xs text-foreground">سجل استلامات وتوثيق اليوم</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">انقر على أي شحنة لمعاينة الأصناف وصور الكاميرا</div>
          </div>
        </div>
        <Link
          to="/accountant/receipts"
          className="text-xs font-bold text-primary hover:underline shrink-0 flex items-center gap-1"
        >
          أرشيف الصور
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="kube-card text-center text-sm text-muted-foreground py-8">جارٍ التحميل...</div>
      ) : (data?.length ?? 0) === 0 ? (
        <div className="kube-card text-center text-muted-foreground py-8 space-y-1">
          <div className="font-bold text-foreground">لا توجد استلامات مسجلة اليوم</div>
          <div className="text-xs text-muted-foreground">عند استلام شحنة جديدة من المورد ستظهر هنا فوراً مع صورها.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {data!.map((r: any) => {
            const rawPhotos = r.receipt_photos ?? [];
            const rawItems = r.receipt_items ?? [];
            const allPhotos = rawPhotos.map((p: any) => p.storage_path).filter(Boolean);
            const photoMap: Record<string, string[]> = {};
            rawPhotos.forEach((p: any) => {
              (photoMap[p.product_id ?? "_"] ||= []).push(p.storage_path);
            });
            const isOpen = !!open[r.id];

            return (
              <div key={r.id} className="kube-card transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-foreground">{r.supplier?.name ?? "مورد"}</span>
                      {r.order?.order_number && (
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          طلب #{r.order.order_number}
                        </span>
                      )}
                      {allPhotos.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDateTimeAr(r.received_at)} · {rawItems.length} صنف
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <StatusBadge status={r.status} />
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                      className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1"
                    >
                      {isOpen ? "إخفاء التفاصيل" : "عرض الصور"}
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3">
                  <Stat label="مستلم" val={r.total_received} />
                  <Stat label="مقبول" val={r.total_accepted} tone="ok" />
                  <Stat label="تالف" val={r.total_damaged} danger />
                  <Stat label="نقص" val={r.total_short} danger />
                </div>

                {/* Expanded Details and Photos */}
                {isOpen && (
                  <div className="mt-3.5 pt-3.5 border-t border-border space-y-3.5 animate-in fade-in-50 duration-200">
                    {allPhotos.length > 0 ? (
                      <div className="p-3 rounded-xl bg-card border border-border/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                            <Camera className="w-3.5 h-3.5 text-primary" />
                            صور الشحنة الملتقطة ({allPhotos.length} صورة)
                          </span>
                          <span className="text-[10px] text-muted-foreground">انقر على أي صورة للتكبير والتدقيق</span>
                        </div>
                        <ReceiptItemPhotos
                          paths={allPhotos}
                          meta={{
                            product: `استلام ${r.supplier?.name ?? "المورد"}`,
                            supplier: r.supplier?.name,
                            orderNumber: r.order?.order_number,
                            date: r.received_at,
                            accepted: Number(r.total_accepted ?? 0),
                            damaged: Number(r.total_damaged ?? 0),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>لم يتم إرفاق صور لهذا الاستلام.</span>
                      </div>
                    )}

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
                              <th className="p-2.5 text-right font-bold min-w-[100px]">الصور</th>
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
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, val, danger, tone }: { label: string; val: number; danger?: boolean; tone?: "ok" }) {
  const isDanger = danger && Number(val) > 0;
  const isOk = tone === "ok";
  const cls = isDanger ? "text-kube-red" : isOk ? "text-emerald-600" : "text-foreground";
  return (
    <div className="bg-muted/50 rounded-xl py-2 px-1 border border-border/40">
      <div className={`font-mono font-bold text-sm ${cls}`}>{Number(val || 0).toLocaleString()}</div>
      <div className="text-muted-foreground text-[10px] mt-0.5">{label}</div>
    </div>
  );
}
