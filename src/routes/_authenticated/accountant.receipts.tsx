import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";
import { Search, ChevronDown, ChevronUp, Camera, AlertTriangle, Filter, CheckCircle2, RefreshCw } from "lucide-react";
import { PermissionGuard } from "@/components/permission-guard";
import { useCurrentUser } from "@/lib/use-current-user";
import { useBranchFilter } from "@/lib/use-branches";
import { riyadhDayOffset, riyadhDayStart } from "@/lib/riyadh-time";

export const Route = createFileRoute("/_authenticated/accountant/receipts")({
  head: () => ({
    meta: [
      { title: "معرض وتوثيق صور الاستلامات — KUBE Kitchen" },
      { name: "description", content: "أرشيف ومعرض كامل لصور الاستلامات وتوثيق البضائع والتوالف لكافة الفروع." },
      { property: "og:title", content: "معرض وتوثيق صور الاستلامات — KUBE Kitchen" },
      { property: "og:description", content: "تدقيق بصري ومطابقة شحنات الموردين بالصور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["receipt_photos_view", "invoices_view", "reports_dues"]}>
      <ReceiptsPage />
    </PermissionGuard>
  ),
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
  employeeName: string;
  totalAccepted: number;
  totalDamaged: number;
  items: Item[];
  allPhotos: string[];
  photoCount: number;
  missingPhotos: number;
}

type PeriodFilter = "today" | "7" | "14" | "30" | "all";

function ReceiptsPage() {
  const [q, setQ] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("14");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [onlyIssues, setOnlyIssues] = useState(false);
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);

  const { data: cu } = useCurrentUser();
  const { branchId } = useBranchFilter();

  const isAdmin = cu?.roles?.includes("admin");
  const isEmployee = cu?.roles?.includes("employee") && !isAdmin;
  const backTo = isEmployee ? "/employee" : isAdmin ? "/admin/orders" : "/accountant";

  const since = useMemo(() => {
    if (period === "today") return riyadhDayStart(riyadhDayOffset(0));
    if (period === "7") return riyadhDayStart(riyadhDayOffset(-7));
    if (period === "14") return riyadhDayStart(riyadhDayOffset(-14));
    if (period === "30") return riyadhDayStart(riyadhDayOffset(-30));
    return "2020-01-01T00:00:00+03:00";
  }, [period]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["receipts-photos-gallery", since, branchId],
    queryFn: async () => {
      let query = supabase
        .from("receipts")
        .select(`
          id, received_at, status, total_accepted, total_damaged,
          suppliers(name),
          orders(order_number),
          employees(full_name),
          receipt_items(ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note, products(id, name, unit)),
          receipt_photos(storage_path, product_id)
        `)
        .gte("received_at", since)
        .order("received_at", { ascending: false });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const cards: ReceiptCard[] = (data ?? []).map((r: any) => {
        const photoMap: Record<string, string[]> = {};
        const allPhotos: string[] = [];

        (r.receipt_photos ?? []).forEach((p: any) => {
          if (p.storage_path) {
            allPhotos.push(p.storage_path);
            (photoMap[p.product_id ?? "_"] ||= []).push(p.storage_path);
          }
        });

        const items: Item[] = (r.receipt_items ?? []).map((it: any) => {
          const pid = it.products?.id ?? "";
          return {
            productId: pid,
            product: it.products?.name ?? "صنف",
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
          employeeName: r.employees?.full_name ?? "—",
          totalAccepted: Number(r.total_accepted ?? 0),
          totalDamaged: Number(r.total_damaged ?? 0),
          items,
          allPhotos,
          photoCount: allPhotos.length,
          missingPhotos: items.filter((i) => i.photos.length === 0).length,
        };
      });

      return cards;
    },
  });

  const filtered = useMemo(() => {
    return (data ?? []).filter((r) => {
      if (onlyIssues && r.totalDamaged === 0 && !r.items.some((i) => i.diff !== 0) && r.missingPhotos === 0) {
        return false;
      }
      if (onlyWithPhotos && r.photoCount === 0) {
        return false;
      }
      if (!q.trim()) return true;
      const t = q.trim();
      return (
        r.supplier.includes(t) ||
        r.orderNumber.includes(t) ||
        r.employeeName.includes(t) ||
        r.items.some((i) => i.product.includes(t))
      );
    });
  }, [data, onlyIssues, onlyWithPhotos, q]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (a, r) => ({
        accepted: a.accepted + r.totalAccepted,
        damaged: a.damaged + r.totalDamaged,
        photos: a.photos + r.photoCount,
      }),
      { accepted: 0, damaged: 0, photos: 0 },
    );
  }, [filtered]);

  return (
    <AppShell title="معرض وتوثيق صور الاستلامات" back={{ to: backTo }}>
      {/* Informational Guidance Banner */}
      <div className="mb-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0 mt-0.5">
            <Camera className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="font-display font-bold text-sm text-foreground flex items-center gap-2">
              <span>الأرشيف الميداني لصور وتوثيق الشحنات</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                توثيق إلزامي
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هنا يمكنك استعراض وفحص جميع الصور التي التقطها موظفو وباريستا الفروع عند استلام كل شحنة. انقر على أي صورة لتكبيرها، فحص التوالف، ومطابقتها مع فواتير المورد.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Control Hub */}
      <div className="kube-card mb-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-muted-foreground ms-1">الفترة:</span>
            <button
              type="button"
              onClick={() => setPeriod("today")}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${period === "today" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setPeriod("7")}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${period === "7" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              آخر 7 أيام
            </button>
            <button
              type="button"
              onClick={() => setPeriod("14")}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${period === "14" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              آخر 14 يوم
            </button>
            <button
              type="button"
              onClick={() => setPeriod("30")}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${period === "30" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              آخر 30 يوم
            </button>
            <button
              type="button"
              onClick={() => setPeriod("all")}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${period === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              كل السجلات
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="kube-btn-secondary !min-h-0 !py-1 !px-2.5 text-xs font-bold flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="kube-input w-full ps-9 text-xs"
            placeholder="بحث فوري باسم المورد، رقم الطلب، اسم الصنف، أو اسم الموظف..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Checkbox filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-border accent-primary"
              checked={onlyIssues}
              onChange={(e) => setOnlyIssues(e.target.checked)}
            />
            <span>إظهار التوالف والفروقات فقط</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-border accent-primary"
              checked={onlyWithPhotos}
              onChange={(e) => setOnlyWithPhotos(e.target.checked)}
            />
            <span>استلامات موثقة بصور فقط</span>
          </label>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 text-center pt-1">
          <Stat label="إجمالي الاستلامات" v={filtered.length} />
          <Stat label="صور التوثيق" v={totals.photos} tone="primary" />
          <Stat label="كميات مقبولة" v={totals.accepted} tone="ok" />
          <Stat label="كميات تالفة" v={totals.damaged} tone={totals.damaged > 0 ? "bad" : undefined} />
        </div>
      </div>

      {/* Receipts Cards */}
      {isLoading ? (
        <div className="kube-card text-center text-sm text-muted-foreground py-8">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          جارٍ تحميل صور واستلامات الشحنات...
        </div>
      ) : filtered.length === 0 ? (
        <div className="kube-card text-center text-muted-foreground py-8">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <div className="font-bold text-foreground">لا توجد استلامات مطابقة للبحث أو الفلتر</div>
          <div className="text-xs text-muted-foreground mt-1">جرّب تغيير الفترة الزمنية أو إزالة شروط التصفية</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isOpen = !!open[r.id];
            return (
              <div key={r.id} className="kube-card transition-all">
                {/* Header Toggle */}
                <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-right">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-base text-foreground">{r.supplier}</span>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {r.orderNumber !== "—" ? `طلب #${r.orderNumber}` : r.id.slice(0, 8)}
                      </span>
                      {r.photoCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <Camera className="w-3 h-3" />
                          {r.photoCount} صور توثيق
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                          <AlertTriangle className="w-3 h-3" />
                          بلا صور
                        </span>
                      )}
                      {r.missingPhotos > 0 && r.photoCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                          {r.missingPhotos} صنف غير مصور
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{formatDateTimeAr(r.date)}</span>
                      <span>·</span>
                      <span>المستلم: {r.employeeName}</span>
                      <span>·</span>
                      <span>مقبول: <b className="text-emerald-600">{r.totalAccepted}</b></span>
                      {r.totalDamaged > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-kube-red font-bold">تالف: {r.totalDamaged}</span>
                        </>
                      )}
                      <span>·</span>
                      <span>{r.items.length} أصناف</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <StatusBadge status={r.status} />
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                      className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1"
                    >
                      {isOpen ? "إخفاء التفاصيل" : "عرض الصور والبنود"}
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Quick Photos Preview Strip when Collapsed */}
                {!isOpen && r.allPhotos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {r.allPhotos.slice(0, 4).map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setOpen((o) => ({ ...o, [r.id]: true }))}
                          className="h-12 w-12 rounded-lg border border-border overflow-hidden bg-muted shrink-0 hover:border-primary transition"
                        >
                          <img
                            src={supabase.storage.from("receipt-photos").getPublicUrl(p).data.publicUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // If public URL fails, user clicks into full lightbox
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </button>
                      ))}
                      {r.allPhotos.length > 4 && (
                        <button
                          type="button"
                          onClick={() => setOpen((o) => ({ ...o, [r.id]: true }))}
                          className="h-12 px-2.5 rounded-lg border border-border bg-muted text-[11px] font-bold text-muted-foreground shrink-0 hover:bg-muted/80 transition"
                        >
                          +{r.allPhotos.length - 4} صور أخرى
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen((o) => ({ ...o, [r.id]: true }))}
                      className="text-xs font-bold text-primary hover:underline shrink-0"
                    >
                      معاينة كاملة ←
                    </button>
                  </div>
                )}

                {/* Expanded Details with Lightbox and Item Table */}
                {isOpen && (
                  <div className="mt-3.5 pt-3.5 border-t border-border space-y-3.5 animate-in fade-in-50 duration-200">
                    {/* Full Receipt Photos Gallery Strip */}
                    {r.allPhotos.length > 0 && (
                      <div className="p-3 rounded-xl bg-card border border-border/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                            <Camera className="w-3.5 h-3.5 text-primary" />
                            كافة صور الشحنة ({r.allPhotos.length} صورة ملتقطة)
                          </span>
                          <span className="text-[10px] text-muted-foreground">انقر على أي صورة للتكبير والتحميل</span>
                        </div>
                        <ReceiptItemPhotos
                          paths={r.allPhotos}
                          meta={{
                            product: `استلام ${r.supplier}`,
                            supplier: r.supplier,
                            orderNumber: r.orderNumber,
                            date: r.date,
                            accepted: r.totalAccepted,
                            damaged: r.totalDamaged,
                          }}
                        />
                      </div>
                    )}

                    {/* Items Table */}
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
                          {r.items.map((it) => (
                            <tr key={it.productId} className="hover:bg-muted/30 align-top">
                              <td className="p-2.5">
                                <div className="font-bold text-foreground">{it.product}</div>
                                <div className="text-[10px] text-muted-foreground">{it.unit}</div>
                                {it.note && (
                                  <div className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1">
                                    ملاحظة: {it.note}
                                  </div>
                                )}
                              </td>
                              <td className="p-2.5 text-center font-mono">{it.ordered}</td>
                              <td className="p-2.5 text-center font-mono">{it.received}</td>
                              <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{it.accepted}</td>
                              <td className={`p-2.5 text-center font-mono font-bold ${it.damaged > 0 ? "text-kube-red" : ""}`}>
                                {it.damaged || "—"}
                              </td>
                              <td className={`p-2.5 text-center font-mono font-bold ${it.diff < 0 ? "text-destructive" : it.diff > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                                {it.diff > 0 ? `+${it.diff}` : it.diff}
                              </td>
                              <td className="p-2.5">
                                <ReceiptItemPhotos
                                  paths={it.photos}
                                  meta={{
                                    product: it.product,
                                    unit: it.unit,
                                    supplier: r.supplier,
                                    orderNumber: r.orderNumber,
                                    date: r.date,
                                    ordered: it.ordered,
                                    accepted: it.accepted,
                                    damaged: it.damaged,
                                    diff: it.diff,
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
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, v, tone }: { label: string; v: number; tone?: "bad" | "ok" | "primary" }) {
  const color =
    tone === "bad"
      ? "text-kube-red"
      : tone === "ok"
      ? "text-emerald-600"
      : tone === "primary"
      ? "text-primary"
      : "text-foreground";

  return (
    <div className="rounded-xl bg-muted/50 p-2.5 border border-border/50">
      <div className="text-[10px] text-muted-foreground font-display font-medium truncate">{label}</div>
      <div className={`text-base font-extrabold font-mono mt-0.5 ${color}`}>{v.toLocaleString()}</div>
    </div>
  );
}
