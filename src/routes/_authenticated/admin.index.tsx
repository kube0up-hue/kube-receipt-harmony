import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Users,
  Package,
  Truck,
  ClipboardList,
  FileText,
  BarChart3,
  Wallet,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Boxes,
  ArrowLeftRight,
  ClipboardCheck,
  UserCog,
  Trash2,
  Droplets,
  BadgeDollarSign,
  CalendarClock,
  BookOpen,
  Sparkles,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Layers,
  ArrowRight,
  Camera,
} from "lucide-react";
import { formatDateAr, formatDateTimeAr } from "@/lib/format-date";
import { ReceiptItemPhotos } from "@/features/receipt-photo-viewer";
import { useBranchFilter } from "@/lib/use-branches";
import { RoleGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "مركز القيادة والتحكم — KUBE Kitchen" },
      { name: "description", content: "مركز القيادة والحوكمة التشغيلية الشاملة لمنظومة مطابخ وفروع KUBE." },
      { property: "og:title", content: "مركز القيادة والتحكم — KUBE Kitchen" },
      { property: "og:description", content: "إدارة العمليات، المخزون، الحوكمة المالية، والجودة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard>
      <AdminHome />
    </RoleGuard>
  ),
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
  const { branchId, label: branchLabel, scope } = useBranchFilter();
  const onBranch = <T extends { eq: (c: string, v: string) => T }>(q: T): T =>
    branchId ? q.eq("branch_id", branchId) : q;

  const [activeTab, setActiveTab] = useState<"all" | "ops" | "finance" | "kitchen" | "gov">("all");

  const stats = useQuery({
    queryKey: ["admin-stats", branchId],
    queryFn: async () => {
      // توقيت الرياض UTC+3
      const riyadhParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date()).reduce<Record<string, string>>((a, p) => {
        a[p.type] = p.value;
        return a;
      }, {});
      const todayRiyadh = `${riyadhParts.year}-${riyadhParts.month}-${riyadhParts.day}`;
      const startOfTodayUTC = new Date(`${todayRiyadh}T00:00:00+03:00`).toISOString();
      const weekAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const [pending, todayR, unappr, invMatch, invUnmatch, invReady, weekReceipts] = await Promise.all([
        onBranch(supabase.from("v_orders_effective").select("id", { count: "exact", head: true }).eq("effective_status", "pending_receipt")),
        onBranch(supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", startOfTodayUTC)),
        onBranch(supabase.from("receipts").select("id", { count: "exact", head: true }).eq("status", "submitted")),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "pending_match"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "unmatched"),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "matched_ready"),
        onBranch(supabase.from("receipts").select("id", { count: "exact", head: true }).gte("received_at", weekAgo)),
      ]);
      const damagedSum = await onBranch(
        supabase.from("receipts").select("total_damaged").gte("received_at", weekAgo),
      );
      const shortSum = await onBranch(
        supabase.from("receipts").select("total_short").gte("received_at", weekAgo),
      );
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

      // 2) orders pending_receipt older than 24h
      const { data: staleOrders } = await supabase
        .from("v_orders_effective")
        .select("id, order_number, order_date, created_at, effective_status, supplier:suppliers(name)")
        .eq("effective_status", "pending_receipt")
        .lt("created_at", since)
        .order("created_at", { ascending: true })
        .limit(50);
      (staleOrders ?? []).forEach((o: any) => {
        issues.push({
          kind: "order_stale_pending",
          severity: "warn",
          title: `طلب معلق منذ أكثر من 24 ساعة: ${o.order_number}`,
          detail: `المورد ${o.supplier?.name ?? "—"} · تاريخ الطلب ${formatDateAr(o.order_date ?? o.created_at)}`,
          ref: o.order_number,
        });
      });

      // 3) receipts checks
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
      });

      setIntegrityResult({ checkedAt: new Date().toISOString(), issues });
    } catch (err) {
      setIntegrityResult({
        checkedAt: new Date().toISOString(),
        issues: [
          {
            kind: "check_failed",
            severity: "error",
            title: "تعذر إكمال الفحص",
            detail: err instanceof Error ? err.message : String(err),
          },
        ],
      });
    } finally {
      setIntegrityRunning(false);
    }
  }

  const detail = useQuery({
    enabled: openDetail !== null,
    queryKey: ["admin-stats-detail", openDetail, branchId],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const { data: receipts } = await onBranch(
        supabase
          .from("receipts")
          .select("id, received_at, order_id, orders(order_number, suppliers(name)), receipt_items(ordered_qty, received_qty, accepted_qty, damaged_qty, diff, note, products(id, name, unit)), receipt_photos(storage_path, product_id)")
          .gte("received_at", weekAgo),
      ).order("received_at", { ascending: false });
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

  interface LinkItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
    badge?: string;
    color: string;
  }

  interface HubCategory {
    id: "ops" | "finance" | "kitchen" | "gov";
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    links: LinkItem[];
  }

  const hubs: HubCategory[] = useMemo(
    () => [
      {
        id: "ops",
        title: "سلاسل الإمداد والمخزون",
        description: "متابعة أوامر الشراء، استلام الشحنات، حركة المستودعات، والجرد الفعلي",
        icon: Boxes,
        links: [
          {
            to: "/admin/orders",
            label: "الطلبات والاستلامات",
            icon: ClipboardList,
            desc: "جدولة أوامر الشراء ومتابعة وصول بضائع الموردين",
            badge: s?.pending ? `${s.pending} معلق` : undefined,
            color: "text-emerald-500 bg-emerald-500/10",
          },
          {
            to: "/accountant/receipts",
            label: "معرض وتوثيق صور الاستلامات",
            icon: Camera,
            desc: "استعراض كامل الصور الملتقطة من الفروع للبضائع والتوالف والتدقيق البصري",
            badge: "توثيق بصري",
            color: "text-amber-500 bg-amber-500/10",
          },
          {
            to: "/admin/inventory",
            label: "المخزون والمستودعات",
            icon: Boxes,
            desc: "الأرصدة الحالية في الفروع والمستودع وحدود إعادة الطلب",
            color: "text-blue-500 bg-blue-500/10",
          },
          {
            to: "/admin/counts",
            label: "الجرد الدوري والرقابة",
            icon: ClipboardCheck,
            desc: "جلسات الجرد الميدانية ومطابقة الفعلي مع الدفتري",
            color: "text-indigo-500 bg-indigo-500/10",
          },
          {
            to: "/admin/transfers",
            label: "تحويلات المخزون بين الفروع",
            icon: ArrowLeftRight,
            desc: "توثيق نقل المواد الأولية بين الفروع والمستودع الرئيسي",
            color: "text-cyan-500 bg-cyan-500/10",
          },
          {
            to: "/admin/overview",
            label: "لوحة مؤشرات المالك الحية",
            icon: BarChart3,
            desc: "نظرة شمولية عليا ومؤشرات تشغيلية حية لكافة الفروع",
            badge: "تنفيذي",
            color: "text-purple-500 bg-purple-500/10",
          },
        ],
      },
      {
        id: "finance",
        title: "الحوكمة المالية والموردين",
        description: "المطابقة الثلاثية للفواتير، جداول الاستحقاق، سجل الدفعات، وأسعار التوريد",
        icon: Wallet,
        links: [
          {
            to: "/admin/invoices",
            label: "فواتير الموردين والمطابقة",
            icon: FileText,
            desc: "مطابقة الفواتير مع إيصالات الاستلام والطلبات المعتمدة",
            badge: s?.invUnmatch ? `${s.invUnmatch} غير مطابق` : undefined,
            color: "text-amber-500 bg-amber-500/10",
          },
          {
            to: "/admin/dues",
            label: "المبالغ المستحقة للسداد",
            icon: Wallet,
            desc: "أرصدة الموردين الجاهزة للدفع والتواريخ المعتمدة",
            badge: s?.invReady ? `${s.invReady} جاهز للدفع` : undefined,
            color: "text-emerald-500 bg-emerald-500/10",
          },
          {
            to: "/admin/payments",
            label: "توثيق السداد والحوالات",
            icon: CheckCircle2,
            desc: "أرشيف الحوالات البنكية ومطابقة أرقام المراجع",
            color: "text-teal-500 bg-teal-500/10",
          },
          {
            to: "/admin/suppliers",
            label: "دليل وحسابات الموردين",
            icon: Truck,
            desc: "السجلات الضريبية، جهات الاتصال، ودورات الفوترة",
            color: "text-orange-500 bg-orange-500/10",
          },
          {
            to: "/admin/products",
            label: "قائمة المنتجات والتسعير",
            icon: Package,
            desc: "كتالوج المواد الخام ومواصفاتها ووحدات القياس المعتمدة",
            color: "text-slate-500 bg-slate-500/10",
          },
        ],
      },
      {
        id: "kitchen",
        title: "المطبخ والجودة والتشغيل",
        description: "الحد من الهدر، فحص المياه، مطابقة المبيعات اليومية، ومعايير التحضير",
        icon: Droplets,
        links: [
          {
            to: "/admin/waste",
            label: "سجل الهدر والتوالف",
            icon: Trash2,
            desc: "تحليل وتتبع أسباب الهدر وتكاليف المواد المهدرة بالمطابخ",
            badge: s?.damaged ? `${s.damaged} تالف` : undefined,
            color: "text-kube-red bg-kube-red/10",
          },
          {
            to: "/admin/quality",
            label: "قياسات الجودة والمياه",
            icon: Droplets,
            desc: "تسجيل فحص نقاوة المياه، درجات الحرارة ومعايير القهوة",
            color: "text-sky-500 bg-sky-500/10",
          },
          {
            to: "/admin/sales",
            label: "المبيعات اليومية للفروع",
            icon: BadgeDollarSign,
            desc: "متابعة الإيرادات اليومية ومطابقة مبيعات نقاط البيع (POS)",
            color: "text-emerald-500 bg-emerald-500/10",
          },
          {
            to: "/admin/recipes",
            label: "دليل الوصفات المعيارية",
            icon: BookOpen,
            desc: "معايير تحضير المشروبات والمخبوزات وحساب التكلفة الدقيقة",
            color: "text-rose-500 bg-rose-500/10",
          },
          {
            to: "/admin/shifts",
            label: "جدولة الشفتات والدوامات",
            icon: CalendarClock,
            desc: "تنظيم فترات العمل اليومية لطاقم المطبخ والباريستا",
            color: "text-violet-500 bg-violet-500/10",
          },
        ],
      },
      {
        id: "gov",
        title: "الذكاء الاصطناعي والإدارة والحوكمة",
        description: "استوديو الذكاء الاصطناعي، التقارير التحليلية، الصلاحيات، وهيكل الفروع",
        icon: ShieldCheck,
        links: [
          {
            to: "/ai-kubeup-studio",
            label: "AI KUBEUP Studio",
            icon: Sparkles,
            desc: "استوديو التوليد الذكي لصور المنيو وتغليف المنتجات لـ KUBE",
            badge: "حصري AI",
            color: "text-amber-400 bg-amber-400/10",
          },
          {
            to: "/admin/reports",
            label: "التقارير المتقدمة والتصدير",
            icon: BarChart3,
            desc: "تقارير شاملة مع تصدير جداول Excel ومستندات PDF للطباعة",
            badge: "Excel / PDF",
            color: "text-blue-500 bg-blue-500/10",
          },
          {
            to: "/admin/employees",
            label: "إدارة الموظفين ورموز PIN",
            icon: Users,
            desc: "سجل حسابات العاملين وضبط رموز PIN السريعة للفروع",
            color: "text-indigo-500 bg-indigo-500/10",
          },
          {
            to: "/admin/employee-access",
            label: "مهام وصلاحيات الفروع",
            icon: UserCog,
            desc: "تخصيص المهام الميدانية لكل باريستا ومشرف فرع",
            color: "text-teal-500 bg-teal-500/10",
          },
          {
            to: "/admin/branches",
            label: "الفروع والمستودعات",
            icon: Building2,
            desc: "هيكلة مواقع KUBE وإعدادات المستودعات الرئيسية",
            color: "text-neutral-500 bg-neutral-500/10",
          },
          {
            to: "/admin/permissions",
            label: "حوكمة الصلاحيات والأدوار",
            icon: ShieldCheck,
            desc: "مصفوفة الصلاحيات المتقدمة وسياسات الحوكمة والأمان",
            color: "text-emerald-500 bg-emerald-500/10",
          },
        ],
      },
    ],
    [s],
  );

  const displayedHubs = useMemo(() => {
    if (activeTab === "all") return hubs;
    return hubs.filter((h) => h.id === activeTab);
  }, [activeTab, hubs]);

  const totalQty = (detail.data ?? []).reduce((a, r) => a + r.qty, 0);
  const titleFor = (m: DetailMode) =>
    m === "short"
      ? "تفاصيل النقص في التوريد — آخر أسبوعين"
      : m === "damaged"
        ? "تفاصيل التالف المسجل — آخر أسبوعين"
        : "تفاصيل استلامات البضائع — آخر أسبوعين";

  function exportCSV() {
    if (!openDetail || !detail.data) return;
    const rows = detail.data;
    const header = ["التاريخ", "رقم الطلب", "المورد", "المنتج", "الوحدة", "المطلوب", "المقبول", "التالف", "الفرق", "ملاحظة"];
    const esc = (v: string | number | null) => {
      const str = v == null ? "" : String(v);
      return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const body = rows
      .map((r) =>
        [
          new Date(r.date).toISOString().slice(0, 16).replace("T", " "),
          r.orderNumber,
          r.supplier,
          r.product,
          r.unit,
          r.ordered,
          r.accepted,
          r.damaged,
          r.diff,
          r.note ?? "",
        ]
          .map(esc)
          .join(","),
      );
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
    const escHtml = (str: string) =>
      str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
    const title = titleFor(openDetail);
    const generatedAt = formatDateTimeAr(new Date());
    const tbody = rows
      .map(
        (r) => `
      <tr>
        <td>${escHtml(formatDateTimeAr(r.date))}</td>
        <td>${escHtml(r.orderNumber)}</td>
        <td>${escHtml(r.supplier)}</td>
        <td>${escHtml(r.product)}${r.note ? `<div class="note">${escHtml(r.note)}</div>` : ""}</td>
        <td class="c">${r.ordered} ${escHtml(r.unit)}</td>
        <td class="c">${r.accepted} ${escHtml(r.unit)}</td>
        <td class="c">${r.damaged}</td>
        <td class="c ${r.diff < 0 ? "neg" : ""}">${r.diff}</td>
      </tr>`,
      )
      .join("");
    const html = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${escHtml(title)}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        body { font-family: "Alexandria", "Cairo", "Tahoma", sans-serif; direction: rtl; color: #111; }
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

  const hasUrgentIssue = (s?.invUnmatch ?? 0) > 0 || (s?.pending ?? 0) > 0;

  return (
    <AppShell title="مركز القيادة والتحكم التشغيلي" maxWidth="wide">
      {/* 1. الشريط السياقي والنبض التشغيلي المباشر */}
      <div className="mb-6 rounded-2xl border border-border/80 bg-card/60 p-4 md:p-5 shadow-xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-foreground">
                  نطاق التشغيل: {branchLabel}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-display font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  متزامن حياً
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {scope === "all" ? "مؤشرات مجمعة لكافة فروع ومستودعات KUBE" : "مؤشرات مخصصة للفرع الحالي المختار"}
              </p>
            </div>
          </div>

          {/* Quick Action Ribbon */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-display font-semibold text-foreground hover:bg-muted/70 hover:border-foreground/20 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-primary" />
              <span>طلب مورد جديد</span>
            </Link>
            <Link
              to="/accountant/receipts"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-display font-semibold text-foreground hover:bg-muted/70 hover:border-foreground/20 transition-all active:scale-[0.98]"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-500" />
              <span>معرض صور الاستلامات</span>
            </Link>
            <Link
              to="/admin/invoices"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 py-2 text-xs font-display font-semibold text-foreground hover:bg-muted/70 hover:border-foreground/20 transition-all active:scale-[0.98]"
            >
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              <span>مطابقة الفواتير</span>
            </Link>
            <button
              type="button"
              onClick={runIntegrityCheck}
              disabled={integrityRunning}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-display font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{integrityRunning ? "جارٍ الفحص…" : "فحص سلامة العمليات"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. شريط التنبيهات التشغيلية والحوكمة الفورية (إذا وجدت معلقات) */}
      {hasUrgentIssue && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-foreground">
                إجراءات حوكمة تتطلب المتابعة الفورية
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {(s?.pending ?? 0) > 0 && <span>يوجد {s?.pending} طلبات بانتظار استلام الشحنة · </span>}
                {(s?.invUnmatch ?? 0) > 0 && <span>يوجد {s?.invUnmatch} فواتير غير متطابقة تحتاج مراجعة المحاسب</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(s?.pending ?? 0) > 0 && (
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-1 text-xs font-display font-bold px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition"
              >
                معاينة الطلبات ←
              </Link>
            )}
            {(s?.invUnmatch ?? 0) > 0 && (
              <Link
                to="/admin/invoices"
                className="inline-flex items-center gap-1 text-xs font-display font-bold px-3 py-1.5 rounded-xl bg-card border border-amber-500/30 text-amber-600 hover:bg-muted transition"
              >
                مراجعة الفواتير ←
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. مصفوفة المؤشرات التنفيذية الثلاثية (The 3 Governance Metagrids) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* عمود 1: حركة الإمداد والتوريد */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-foreground">الإمداد والتوريد</span>
              </div>
              <span className="text-[11px] font-display font-semibold text-muted-foreground">نبض اليوم</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-[11px] text-muted-foreground font-medium mb-1">استلامات اليوم</div>
                <div className="text-2xl font-display font-black text-foreground tabular-nums">
                  {s?.today ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-[11px] text-muted-foreground font-medium mb-1">بانتظار الاستلام</div>
                <div className="text-2xl font-display font-black text-amber-500 tabular-nums">
                  {s?.pending ?? "—"}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>استلامات معلقة للاعتماد: <strong className="text-foreground">{s?.unappr ?? 0}</strong></span>
            <button
              onClick={() => setOpenDetail("all")}
              className="font-display font-bold text-primary hover:underline text-[11px] cursor-pointer"
            >
              عرض استلامات الأسبوعين ←
            </button>
          </div>
        </div>

        {/* عمود 2: الرقابة والحد من التوالف */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-kube-red/10 text-kube-red">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-foreground">الجودة والتوالف</span>
              </div>
              <span className="text-[11px] font-display font-semibold text-muted-foreground">آخر أسبوعين</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setOpenDetail("damaged")}
                className="rounded-xl bg-muted/40 p-3 text-start hover:border-kube-red/40 border border-transparent transition cursor-pointer"
              >
                <div className="text-[11px] text-muted-foreground font-medium mb-1">مجموع التالف</div>
                <div className="text-2xl font-display font-black text-kube-red tabular-nums">
                  {s?.damaged ?? "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">اضغط للتفاصيل والصور</div>
              </button>
              <button
                type="button"
                onClick={() => setOpenDetail("short")}
                className="rounded-xl bg-muted/40 p-3 text-start hover:border-amber-500/40 border border-transparent transition cursor-pointer"
              >
                <div className="text-[11px] text-muted-foreground font-medium mb-1">عجز التوريد (النقص)</div>
                <div className="text-2xl font-display font-black text-amber-500 tabular-nums">
                  {s?.short ?? "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">اضغط لقائمة البنود</div>
              </button>
            </div>
          </div>
          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>إجمالي استلامات الفترة: <strong className="text-foreground">{s?.weekReceipts ?? 0}</strong></span>
            <Link to="/admin/waste" className="font-display font-bold text-primary hover:underline text-[11px]">
              سجل الهدر الكامل ←
            </Link>
          </div>
        </div>

        {/* عمود 3: الحوكمة المالية والمطابقة */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-foreground">الحوكمة المالية</span>
              </div>
              <span className="text-[11px] font-display font-semibold text-muted-foreground">فواتير ومطابقة</span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">بانتظار المطابقة</div>
                <div className="text-xl font-display font-black text-foreground tabular-nums">
                  {s?.invMatch ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">غير متطابقة</div>
                <div className="text-xl font-display font-black text-kube-red tabular-nums">
                  {s?.invUnmatch ?? "—"}
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-2.5 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">جاهزة للدفع</div>
                <div className="text-xl font-display font-black text-emerald-600 tabular-nums">
                  {s?.invReady ?? "—"}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>المطابقة الثلاثية التلقائية</span>
            <Link to="/admin/dues" className="font-display font-bold text-primary hover:underline text-[11px]">
              جدول المستحقات ←
            </Link>
          </div>
        </div>
      </div>

      {/* 4. بطاقة استوديو الذكاء الاصطناعي المميزة (AI KUBEUP Studio Command) */}
      <div className="mb-8 rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-muted/50 p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-primary text-primary-foreground shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg text-foreground">
                  AI KUBEUP Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-600 text-[10px] font-display font-bold border border-amber-400/20">
                  استوديو الجيل الجديد
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                توليد وتصميم صور المنتجات الاحترافية، تصميم قوالب المنيو، تغليف الماتشا والحلويات، والمواد التسويقية الحصرية لعلامة KUBE بالذكاء الاصطناعي.
              </p>
            </div>
          </div>
          <Link
            to="/ai-kubeup-studio"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-xs font-display font-bold hover:bg-primary/90 transition shadow-sm active:scale-95 shrink-0"
          >
            <span>فتح استوديو الإبداع</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. بوابات الحوكمة والتشغيل المقسمة والمصنفة (Segmented Domain Hubs) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="font-display font-bold text-base text-foreground">
              بوابات الحوكمة والإدارة التشغيلية
            </h3>
            <span className="text-xs text-muted-foreground">({hubs.reduce((a, b) => a + b.links.length, 0)} وحدة تحكم)</span>
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ops")}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "ops" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الإمداد والمخزون
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("finance")}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "finance" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              المالية والموردين
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kitchen")}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "kitchen" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              المطبخ والجودة
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("gov")}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold transition-all cursor-pointer ${
                activeTab === "gov" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              الحوكمة والـ AI
            </button>
          </div>
        </div>

        {/* عرض الوحدات المقسمة */}
        <div className="space-y-8">
          {displayedHubs.map((hub) => (
            <div key={hub.id} className="space-y-3">
              <div className="flex items-baseline justify-between px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-3.5 rounded-full bg-primary" />
                    <h4 className="font-display font-bold text-sm text-foreground">
                      {hub.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{hub.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {hub.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="rounded-2xl border border-border/80 bg-card p-4 flex items-start gap-3.5 hover:border-foreground/30 hover:shadow-xs transition-all duration-150 group active:scale-[0.99]"
                  >
                    <div className={`p-2.5 rounded-xl ${link.color} shrink-0 mt-0.5 transition-transform group-hover:scale-105`}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {link.label}
                        </span>
                        {link.badge && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-display font-bold bg-muted text-foreground border border-border/60 shrink-0">
                            {link.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نافذة فحص سلامة العمليات */}
      <Dialog open={integrityOpen} onOpenChange={setIntegrityOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display">
              <ShieldCheck className="w-5 h-5 text-primary" /> فحص سلامة العمليات والحوكمة
            </DialogTitle>
          </DialogHeader>
          {integrityRunning ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-display">جارِ فحص قاعدة البيانات وتتبع الحركات النشطة…</span>
            </div>
          ) : !integrityResult ? null : integrityResult.issues.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <div className="font-display font-bold text-base text-foreground">المنظومة سليمة 100%</div>
              <p className="text-xs text-muted-foreground mt-1">لا توجد أخطاء بيانات أو طلبات غير مكتملة خلال آخر 24 ساعة.</p>
              <div className="text-[11px] text-muted-foreground mt-3">آخر فحص: {formatDateTimeAr(integrityResult.checkedAt)}</div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                عُثر على {integrityResult.issues.length} تنبيه يتطلب التدخل · آخر فحص: {formatDateTimeAr(integrityResult.checkedAt)}
              </div>
              {integrityResult.issues.map((it, i) => (
                <div key={i} className={`rounded-xl border p-3.5 bg-card ${it.severity === "error" ? "border-r-4 border-r-destructive" : "border-r-4 border-r-amber-500"}`}>
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${it.severity === "error" ? "text-destructive" : "text-amber-600"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-sm text-foreground">{it.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{it.detail}</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={runIntegrityCheck}
                  className="rounded-xl border border-border/80 px-4 py-2 text-xs font-display font-bold hover:bg-muted cursor-pointer"
                >
                  إعادة الفحص الآن
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة تفاصيل الاستلامات / التوالف / النقص */}
      <Dialog open={openDetail !== null} onOpenChange={(o) => !o && setOpenDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="font-display">{openDetail ? titleFor(openDetail) : ""}</DialogTitle>
          </DialogHeader>
          {detail.isLoading ? (
            <div className="py-12 text-center text-muted-foreground">جارِ تحميل السجلات التفصيلية…</div>
          ) : (detail.data ?? []).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">لا توجد سجلات مطابقة في هذه الفترة</div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/40 rounded-xl">
                <div className="text-xs text-muted-foreground">
                  {openDetail === "all" ? (
                    <>عدد البنود الإجمالي: <strong className="font-display font-bold text-foreground">{detail.data!.length}</strong></>
                  ) : (
                    <>الكمية الكلية: <strong className="font-display font-bold text-foreground">{totalQty}</strong> وحدة عبر {detail.data!.length} بند</>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-display font-bold hover:bg-muted"
                  >
                    <Download className="w-3.5 h-3.5" /> تصدير CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportPDF}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-display font-bold hover:bg-muted"
                  >
                    <Printer className="w-3.5 h-3.5" /> طباعة تقرير PDF
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border/70">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 border-b border-border/80 font-display">
                    <tr>
                      <th className="p-2.5 text-start">الطلب</th>
                      <th className="p-2.5 text-start">المورد</th>
                      <th className="p-2.5 text-start">المنتج</th>
                      <th className="p-2.5 text-center">المطلوب</th>
                      <th className="p-2.5 text-center">المقبول</th>
                      <th className="p-2.5 text-center">التالف</th>
                      <th className="p-2.5 text-center">الفرق</th>
                      <th className="p-2.5 text-center">الصور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {detail.data!.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-mono text-[11px]">{r.orderNumber}</td>
                        <td className="p-2.5 font-medium">{r.supplier}</td>
                        <td className="p-2.5">
                          <div className="font-display font-bold text-foreground">{r.product}</div>
                          {r.note && <div className="text-[10px] text-muted-foreground mt-0.5">{r.note}</div>}
                          <div className="text-[10px] text-muted-foreground">{formatDateAr(r.date)}</div>
                        </td>
                        <td className="p-2.5 text-center tabular-nums">{r.ordered} {r.unit}</td>
                        <td className="p-2.5 text-center tabular-nums">{r.accepted} {r.unit}</td>
                        <td className="p-2.5 text-center tabular-nums text-kube-red font-bold">{r.damaged}</td>
                        <td className={`p-2.5 text-center font-bold tabular-nums ${r.diff < 0 ? "text-kube-red" : ""}`}>
                          {r.diff}
                        </td>
                        <td className="p-2.5 text-center">
                          <ReceiptItemPhotos
                            paths={r.photos}
                            meta={{
                              product: r.product,
                              unit: r.unit,
                              supplier: r.supplier,
                              orderNumber: r.orderNumber,
                              date: r.date,
                              ordered: r.ordered,
                              accepted: r.accepted,
                              damaged: r.damaged,
                              diff: r.diff,
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
