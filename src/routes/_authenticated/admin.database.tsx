import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { RoleGuard } from "@/components/permission-guard";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Table as TableIcon,
  Server,
  Zap,
  Shield,
  Eye,
  X,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/database")({
  head: () => ({
    meta: [
      { title: "مستكشف قاعدة البيانات والاتصال — KUBE Kitchen" },
      { name: "description", content: "فحص الاتصال المباشر واستعراض وتدقيق كامل جداول وبيانات منصة KUBE." },
      { property: "og:title", content: "مستكشف قاعدة البيانات والاتصال — KUBE Kitchen" },
      { property: "og:description", content: "استعراض حي ومباشر لكافة جداول وسجلات النظام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard>
      <DatabaseExplorerPage />
    </RoleGuard>
  ),
});

interface TableConfig {
  id: string;
  name: string;
  desc: string;
}

const AVAILABLE_TABLES: TableConfig[] = [
  { id: "orders", name: "orders (الطلبات)", desc: "طلبات التوريد المرفوعة من الفروع" },
  { id: "receipts", name: "receipts (الاستلامات)", desc: "إيصالات استلام شحنات الموردين" },
  { id: "receipt_items", name: "receipt_items (بنود الاستلام)", desc: "تفاصيل الكميات المستلمة والمقبولة والتالفة" },
  { id: "receipt_photos", name: "receipt_photos (صور التوثيق)", desc: "مسارات الصور الملتقطة بالكاميرا" },
  { id: "products", name: "products (المنتجات)", desc: "دليل المواد الخام ووحدات القياس والأسعار" },
  { id: "suppliers", name: "suppliers (الموردون)", desc: "سجل شركات التوريد وجهات الاتصال" },
  { id: "branches", name: "branches (الفروع)", desc: "فروع KUBE والمستودعات المركزية" },
  { id: "employees", name: "employees (الموظفون)", desc: "سجل العاملين ورموز PIN الميدانية" },
  { id: "invoices", name: "invoices (الفواتير)", desc: "فواتير الموردين وحالات المطابقة الثلاثية" },
  { id: "waste_records", name: "waste_records (الهدر والتوالف)", desc: "سجلات التوالف وأسباب الهدر بالمطبخ" },
  { id: "quality_checks", name: "quality_checks (الجودة والمياه)", desc: "قياسات نقاوة الفلاتر ونسبة أملاح TDS" },
  { id: "daily_sales", name: "daily_sales (المبيعات اليومية)", desc: "إيرادات الكاش ومطابقة تقارير الشبكة POS" },
  { id: "count_sessions", name: "count_sessions (جلسات الجرد)", desc: "دورات الجرد الميدانية في الفروع" },
  { id: "stock_transfers", name: "stock_transfers (تحويلات المخزون)", desc: "حركة نقل الأصناف بين الفروع والمستودع" },
  { id: "user_roles", name: "user_roles (أدوار وصلاحيات)", desc: "أدوار المستخدمين المسجلة في النظام" },
  { id: "profiles", name: "profiles (الملفات الشخصية)", desc: "أسماء وبيانات المستخدمين" },
  { id: "activity_log", name: "activity_log (سجل الرقابة)", desc: "أرشيف الأحداث والعمليات المنفذة في النظام" },
];

function DatabaseExplorerPage() {
  const { data: cu } = useCurrentUser();
  const [selectedTable, setSelectedTable] = useState<string>("orders");
  const [search, setSearch] = useState("");
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [inspectedRow, setInspectedRow] = useState<any | null>(null);

  // Ping test
  async function testConnection() {
    setPinging(true);
    const start = performance.now();
    try {
      const { error } = await supabase.from("branches").select("id", { count: "exact", head: true });
      const duration = Math.round(performance.now() - start);
      if (error) throw error;
      setPingMs(duration);
      toast.success(`الاتصال بقاعدة البيانات سليم ومستقر (${duration} ms)`);
    } catch (err: any) {
      toast.error(`تعذّر فحص الاتصال: ${err.message}`);
      setPingMs(null);
    } finally {
      setPinging(false);
    }
  }

  useEffect(() => {
    void testConnection();
  }, []);

  // Fetch table data
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-db-table", selectedTable],
    queryFn: async () => {
      const { data: rows, error, count } = await (supabase as any)
        .from(selectedTable)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        // Fallback without order by created_at if table lacks created_at
        const fallback = await (supabase as any)
          .from(selectedTable)
          .select("*", { count: "exact" })
          .limit(100);
        if (fallback.error) throw fallback.error;
        return { rows: fallback.data ?? [], count: fallback.count ?? 0 };
      }

      return { rows: rows ?? [], count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];
  const totalCount = data?.count ?? 0;

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter((r: any) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, search]);

  // Extract columns
  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).slice(0, 7); // Show first 7 columns for neatness
  }, [rows]);

  function exportJSON() {
    if (rows.length === 0) return toast.info("لا توجد بيانات للتصدير");
    const jsonStr = JSON.stringify(rows, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTable}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير ملف JSON بنجاح");
  }

  return (
    <AppShell title="مستكشف قاعدة البيانات والاتصال المباشر" back={{ to: "/admin" }} maxWidth="wide">
      {/* Live Connection Diagnostics Card */}
      <div className="mb-6 p-4 md:p-5 rounded-2xl bg-card border border-border shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-base text-foreground">
                  حالة الاتصال المباشر بقاعدة بيانات KUBE
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  متصل ومستقر
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                تصفح وفحص كامل الجداول والسجلات الحية مباشرة داخل المنصة دون الحاجة للانتظار في لوحات خارجية.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {pingMs !== null && (
              <div className="px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold flex items-center gap-1.5 text-foreground">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{pingMs} ms</span>
              </div>
            )}
            <button
              type="button"
              onClick={testConnection}
              disabled={pinging}
              className="kube-btn-secondary !min-h-0 !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pinging ? "animate-spin" : ""}`} />
              <span>فحص الاتصال</span>
            </button>
          </div>
        </div>

        {/* Server & User Details Ribbon */}
        <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-primary" />
            <span>المشروع:</span>
            <span className="font-mono font-bold text-foreground">bvcvpopdscufsgtgxsaq</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>جلسة المالك:</span>
            <span className="font-bold text-foreground">{cu?.email ?? "جلسة مصادقة نشطة"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-500" />
            <span>الجداول المتاحة:</span>
            <span className="font-mono font-bold text-foreground">{AVAILABLE_TABLES.length} جداول رئيسية</span>
          </div>
        </div>
      </div>

      {/* Main Table Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-display font-bold text-muted-foreground mb-1">اختر الجدول للاستعراض:</div>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pe-1">
            {AVAILABLE_TABLES.map((t) => {
              const isSel = selectedTable === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setSelectedTable(t.id);
                    setSearch("");
                  }}
                  className={`w-full p-2.5 rounded-xl border text-start transition flex items-start justify-between gap-2 ${
                    isSel
                      ? "border-primary bg-primary/10 text-foreground font-bold shadow-xs ring-1 ring-primary/30"
                      : "border-border/70 bg-card hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs truncate flex items-center gap-1.5">
                      <TableIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>{t.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-0.5">{t.desc}</div>
                  </div>
                  {isSel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-mono shrink-0">
                      نشط
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Records Viewport */}
        <div className="lg:col-span-8 space-y-3">
          <div className="kube-card space-y-3">
            {/* Table Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-foreground">{selectedTable}</span>
                  <span className="px-2 py-0.5 rounded-full bg-muted font-mono text-xs font-bold text-foreground">
                    {totalCount} سجل
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  عرض أحدث 100 سجل في الجدول مع البحث الفوري
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  <span>تحديث</span>
                </button>
                <button
                  type="button"
                  onClick={exportJSON}
                  className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير JSON</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث فوري في أعمدة وقيم هذا الجدول..."
                className="kube-input w-full ps-9 text-xs"
              />
            </div>

            {/* Records Table */}
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary" />
                <div>جارٍ تحميل سجلات الجدول من قاعدة البيانات...</div>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                لا توجد سجلات مطابقة في هذا الجدول.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      {columns.map((c) => (
                        <th key={c} className="p-2.5 text-right font-bold truncate max-w-[140px]">
                          {c}
                        </th>
                      ))}
                      <th className="p-2.5 text-center font-bold w-16">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRows.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        {columns.map((c) => {
                          const val = r[c];
                          const str = typeof val === "object" ? JSON.stringify(val) : String(val ?? "—");
                          return (
                            <td key={c} className="p-2.5 truncate max-w-[140px] text-foreground" title={str}>
                              {str}
                            </td>
                          );
                        })}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setInspectedRow(r)}
                            className="p-1.5 rounded-lg hover:bg-muted text-primary"
                            title="معاينة السجل بالكامل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row Inspection Modal */}
      {inspectedRow && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-2xl w-full shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  تفاصيل السجل الكاملة ({selectedTable})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedRow(null)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <pre className="p-4 rounded-xl bg-muted/50 border border-border text-xs font-mono leading-relaxed whitespace-pre-wrap text-foreground select-text">
                {JSON.stringify(inspectedRow, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setInspectedRow(null)}
                className="kube-btn-secondary !min-h-0 !py-1.5 !px-4 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
