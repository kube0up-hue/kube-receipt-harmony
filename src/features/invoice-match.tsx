import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Save, FileDown, AlertTriangle } from "lucide-react";
import { formatMoney, formatQty, formatSigned, lineAmount, num, round2, round3, sumMoney } from "@/lib/money";
import { downloadCsv } from "@/lib/csv";
import { riyadhDayEndExclusive, riyadhDayStart, riyadhToday } from "@/lib/riyadh-time";



type Row = {
  product_id: string;
  product_name: string;
  unit: string;
  accepted_qty: number;
  received_qty: number;
  damaged_qty: number;
  ordered_qty: number;
  invoiced_qty: string;
  unit_price: string;
};

export function InvoiceMatchForm({ basePath }: { basePath: "/admin" | "/accountant" }) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [supplierId, setSupplierId] = useState<string>("");
  const [periodStart, setPeriodStart] = useState<string>(() => `${riyadhToday().slice(0, 8)}01`);
  const [periodEnd, setPeriodEnd] = useState<string>(() => riyadhToday());
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => riyadhToday());
  const [totalAmount, setTotalAmount] = useState("");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [allowZeroPrice, setAllowZeroPrice] = useState(false);

  const suppliers = useQuery({
    queryKey: ["suppliers-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id,name").eq("is_active", true).order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const loadMatch = async () => {
    if (!supplierId) { toast.error("اختر المورد"); return; }
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      toast.error("بداية الفترة يجب أن تكون قبل نهايتها");
      return;
    }
    setAllowZeroPrice(false);
    // Get all products for supplier
    const { data: prods, error: pErr } = await supabase
      .from("products").select("id,name,unit,sort_order,unit_price")
      .eq("supplier_id", supplierId).eq("is_hidden", false)
      .order("sort_order").order("name");
    if (pErr) { toast.error(pErr.message); return; }

    // Get receipts in period
    const { data: recs, error: rErr } = await supabase
      .from("receipts").select("id")
      .eq("supplier_id", supplierId)
      .gte("received_at", riyadhDayStart(periodStart))
      .lt("received_at", riyadhDayEndExclusive(periodEnd));
    if (rErr) { toast.error(rErr.message); return; }

    const recIds = (recs ?? []).map(r => r.id);
    const items = recIds.length
      ? (await supabase.from("receipt_items")
          .select("product_id,ordered_qty,received_qty,damaged_qty,accepted_qty")
          .in("receipt_id", recIds)).data ?? []
      : [];

    const agg = new Map<string, { o: number; r: number; d: number; a: number }>();
    for (const it of items) {
      const k = it.product_id;
      const cur = agg.get(k) ?? { o: 0, r: 0, d: 0, a: 0 };
      cur.o += Number(it.ordered_qty); cur.r += Number(it.received_qty);
      cur.d += Number(it.damaged_qty); cur.a += Number(it.accepted_qty);
      agg.set(k, cur);
    }

    const newRows: Row[] = (prods ?? []).map(p => {
      const a = agg.get(p.id) ?? { o: 0, r: 0, d: 0, a: 0 };
      const price = round2(num((p as { unit_price?: number | string }).unit_price));
      return {
        product_id: p.id, product_name: p.name, unit: p.unit,
        accepted_qty: round3(a.a), received_qty: round3(a.r), damaged_qty: round3(a.d), ordered_qty: round3(a.o),
        invoiced_qty: a.a ? String(round3(a.a)) : "",
        unit_price: price ? String(price) : "",
      };
    });
    setRows(newRows);
    setLoaded(true);
    if (items.length === 0) toast.warning("لا توجد استلامات في هذه الفترة");
  };

  const money = formatMoney;

  const exportCSV = () => {
    if (rows.length === 0) { toast.error("لا توجد بيانات"); return; }
    const supplierName = suppliers.data?.find(s => s.id === supplierId)?.name ?? "";
    downloadCsv(`مطابقة-${supplierName}-${periodStart}_${periodEnd}`, {
      title: "تقرير مطابقة فاتورة مورد",
      meta: [
        ["المورد", supplierName],
        ["فترة المطابقة", `${periodStart} → ${periodEnd}`],
        ["رقم الفاتورة", invoiceNumber || "—"],
        ["تاريخ الفاتورة", invoiceDate || "—"],
        ["عدد الأصناف", rows.length],
      ],
      columns: [
        "#", "الصنف", "الوحدة", "المطلوب", "المستلم", "التالف", "المقبول",
        "الكمية بالفاتورة", "فرق الكمية", "سعر الوحدة (ر.س)",
        "المستحق للسداد (ر.س)", "قيمة الفاتورة (ر.س)", "فرق المبلغ (ر.س)", "الحالة",
      ],
      rows: rows.map((r, i) => {
        const iq = round3(num(r.invoiced_qty));
        const up = round2(num(r.unit_price));
        const diff = r.invoiced_qty === "" ? null : round3(iq - r.accepted_qty);
        const due = lineAmount(r.accepted_qty, up);
        const invAmt = lineAmount(iq, up);
        const amtDiff = round2(invAmt - due);
        const state = r.invoiced_qty === "" ? "غير مُدخل" : diff === 0 ? "مطابق" : (diff ?? 0) > 0 ? "الفاتورة أعلى" : "الفاتورة أقل";
        return [
          i + 1, r.product_name, r.unit,
          formatQty(r.ordered_qty), formatQty(r.received_qty), formatQty(r.damaged_qty), formatQty(r.accepted_qty),
          r.invoiced_qty === "" ? "" : formatQty(iq),
          diff === null ? "" : formatSigned(diff, "qty"),
          formatMoney(up), formatMoney(due), formatMoney(invAmt), formatSigned(amtDiff), state,
        ];
      }),
      totals: [
        ["الإجمالي", "", "", "", "", "", formatQty(totals.acc), formatQty(totals.inv), "", "", formatMoney(totals.due), formatMoney(totals.sum), formatSigned(round2(totals.sum - totals.due)), ""],
        ["الإجمالي المستحق للسداد (ر.س)", formatMoney(totals.due)],
        ["إجمالي قيمة الفاتورة (ر.س)", formatMoney(totals.sum)],
        ["فرق المبلغ (ر.س)", formatSigned(round2(totals.sum - totals.due))],
      ],
      notes: ["المستحق للسداد = الكمية المقبولة × سعر الوحدة", "جميع المبالغ مقرَّبة إلى خانتين عشريتين"],
    });
    toast.success("تم التصدير");
  };


  const totals = useMemo(() => {
    let acc = 0, inv = 0;
    const sums: number[] = [];
    const dues: number[] = [];
    for (const r of rows) {
      acc += r.accepted_qty;
      const iq = round3(num(r.invoiced_qty));
      const up = round2(num(r.unit_price));
      inv += iq;
      sums.push(lineAmount(iq, up));
      dues.push(lineAmount(r.accepted_qty, up));
    }
    return { acc: round3(acc), inv: round3(inv), sum: sumMoney(sums), due: sumMoney(dues) };
  }, [rows]);



  /** أصناف لها كمية (مقبولة أو مفوترة) لكن سعرها صفر — سبب أساسي لمبالغ خاطئة */
  const missingPriceRows = useMemo(
    () => rows.filter((r) => {
      const iq = round3(num(r.invoiced_qty));
      const hasQty = r.accepted_qty > 0 || iq > 0;
      return hasQty && round2(num(r.unit_price)) <= 0;
    }),
    [rows],
  );

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!supplierId || !invoiceNumber.trim() || !invoiceDate) throw new Error("أكمل بيانات الفاتورة");
      if (!periodStart || !periodEnd || periodStart > periodEnd) {
        throw new Error("بداية الفترة يجب أن تكون قبل نهايتها");
      }
      if (missingPriceRows.length > 0 && !allowZeroPrice) {
        throw new Error(`${missingPriceRows.length} صنف بدون سعر — أدخل السعر أو أكّد أن السعر صفر فعلاً`);
      }

      // فواتير سابقة لنفس المورد بفترة متقاطعة = خطر احتساب نفس الاستلامات مرتين
      const { data: overlaps, error: oErr } = await supabase.rpc("find_overlapping_invoices", {
        p_supplier_id: supplierId,
        p_period_start: periodStart,
        p_period_end: periodEnd,
      });
      if (oErr) throw oErr;
      if ((overlaps ?? []).length > 0) {
        const list = (overlaps as Array<{ invoice_number: string; period_start: string; period_end: string }>)
          .slice(0, 5)
          .map((o) => `• ${o.invoice_number} (${o.period_start} → ${o.period_end})`)
          .join("\n");
        const ok = window.confirm(
          `تنبيه: توجد فاتورة/فواتير لنفس المورد بفترة متقاطعة مع هذه الفترة:\n${list}\n\nالمتابعة قد تعني احتساب نفس الاستلامات مرتين. هل تريد المتابعة؟`,
        );
        if (!ok) throw new Error("تم إلغاء الحفظ");
      }

      const totalAmt = totalAmount === "" ? totals.sum : round2(num(totalAmount));
      if (totalAmount !== "" && totalAmt !== totals.sum) {
        const ok = window.confirm(
          `الإجمالي المُدخل (${formatMoney(totalAmt)}) يختلف عن مجموع البنود (${formatMoney(totals.sum)}). هل تريد الحفظ بهذا الاختلاف؟`,
        );
        if (!ok) throw new Error("تم إلغاء الحفظ");
      }

      const items = rows
        .filter((r) => round3(num(r.invoiced_qty)) > 0)
        .map((r) => {
          const iq = round3(num(r.invoiced_qty));
          const up = round2(num(r.unit_price));
          return { product_id: r.product_id, invoiced_qty: iq, unit_price: up, line_total: lineAmount(iq, up) };
        });

      type MStatus = "matched" | "invoice_higher" | "invoice_lower" | "in_invoice_not_received" | "received_not_in_invoice" | "has_damage_in_invoice" | "needs_review";
      const matches = rows
        .filter((r) => r.accepted_qty > 0 || round3(num(r.invoiced_qty)) > 0)
        .map((r) => {
          const iq = round3(num(r.invoiced_qty));
          const diff = round3(iq - r.accepted_qty);
          let mstatus: MStatus = "matched";
          if (r.accepted_qty === 0 && iq > 0) mstatus = "in_invoice_not_received";
          else if (iq === 0 && r.accepted_qty > 0) mstatus = "received_not_in_invoice";
          else if (diff > 0) mstatus = "invoice_higher";
          else if (diff < 0) mstatus = "invoice_lower";
          else if (r.damaged_qty > 0) mstatus = "has_damage_in_invoice";
          return {
            product_id: r.product_id,
            total_ordered: r.ordered_qty, total_received: r.received_qty,
            total_damaged: r.damaged_qty, total_accepted: r.accepted_qty,
            total_invoiced: iq, invoice_diff: diff, status: mstatus,
          };
        });

      // عملية واحدة ذرّية: الفاتورة + البنود + المطابقة
      const { data: newId, error } = await supabase.rpc("submit_invoice_match", {
        p_supplier_id: supplierId,
        p_invoice_number: invoiceNumber.trim(),
        p_invoice_date: invoiceDate,
        p_period_start: periodStart,
        p_period_end: periodEnd,
        p_total_amount: totalAmt,
        p_note: note || null,
        p_items: items,
        p_matches: matches,
      });
      if (error) {
        const msg = error.message ?? "";
        if (msg.includes("invoices_supplier_id_invoice_number_key") || msg.includes("duplicate key")) {
          throw new Error("رقم الفاتورة مستخدم مسبقاً لهذا المورد");
        }
        throw new Error(msg || "فشل حفظ الفاتورة");
      }
      if (!newId) throw new Error("فشل حفظ الفاتورة");
      return newId as unknown as string;
    },
    onSuccess: (id) => {
      toast.success("تم حفظ الفاتورة والمطابقة");
      qc.invalidateQueries();
      nav({ to: `${basePath}/invoices/$invoiceId` as "/admin/invoices/$invoiceId", params: { invoiceId: id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="kube-card space-y-3">
        <h2 className="font-bold">١. اختر المورد والفترة</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">المورد</span>
            <select className="kube-input w-full" value={supplierId} onChange={e => { setSupplierId(e.target.value); setLoaded(false); }}>
              <option value="">— اختر —</option>
              {suppliers.data?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">من تاريخ</span>
            <input type="date" className="kube-input w-full" value={periodStart} onChange={e => { setPeriodStart(e.target.value); setLoaded(false); }} />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">إلى تاريخ</span>
            <input type="date" className="kube-input w-full" value={periodEnd} onChange={e => { setPeriodEnd(e.target.value); setLoaded(false); }} />
          </label>
        </div>
        <button className="kube-btn-primary" onClick={loadMatch}>
          <Search className="w-4 h-4" /> جلب الاستلامات
        </button>
      </div>

      {loaded && (
        <div className="kube-card">
          <h2 className="font-bold mb-3">٢. أدخل كميات فاتورة المورد</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-right py-2">المنتج</th>
                  <th className="text-center py-2">المستلم</th>
                  <th className="text-center py-2">التالف</th>
                  <th className="text-center py-2 font-bold text-foreground">المقبول</th>
                  <th className="text-center py-2">الكمية بالفاتورة</th>
                  <th className="text-center py-2">سعر الوحدة</th>
                  <th className="text-center py-2">الفرق</th>
                  <th className="text-center py-2 font-bold text-foreground">المستحق</th>
                  <th className="text-center py-2">قيمة الفاتورة</th>
                  <th className="text-center py-2">فرق المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const iq = round3(num(r.invoiced_qty));
                  const up = round2(num(r.unit_price));
                  const diff = round3(iq - r.accepted_qty);
                  const due = lineAmount(r.accepted_qty, up);
                  const invAmt = lineAmount(iq, up);
                  const amtDiff = round2(invAmt - due);
                  return (
                    <tr key={r.product_id} className="border-b border-border/50">
                      <td className="py-2">
                        <div className="font-semibold">{r.product_name}</div>
                        <div className="text-xs text-muted-foreground">{r.unit}</div>
                      </td>
                      <td className="text-center">{formatQty(r.received_qty)}</td>
                      <td className="text-center text-kube-red">{r.damaged_qty ? formatQty(r.damaged_qty) : "—"}</td>
                      <td className="text-center font-bold">{formatQty(r.accepted_qty)}</td>
                      <td>
                        <input type="number" inputMode="decimal" step="0.001" min="0"
                          className="kube-input w-24 text-center mx-auto"
                          value={r.invoiced_qty}
                          onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, invoiced_qty: e.target.value } : x))} />
                      </td>
                      <td>
                        <input type="number" inputMode="decimal" step="0.01" min="0"
                          className="kube-input w-24 text-center mx-auto"
                          value={r.unit_price}
                          onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, unit_price: e.target.value } : x))}
                          onBlur={e => {
                            const v = e.target.value === "" ? "" : String(round2(num(e.target.value)));
                            setRows(rows.map((x, j) => j === i ? { ...x, unit_price: v } : x));
                          }} />
                      </td>
                      <td className={`text-center font-bold ${diff === 0 ? "text-success" : "text-kube-red"}`}>
                        {r.invoiced_qty === "" ? "—" : formatSigned(diff, "qty")}
                      </td>
                      <td className="text-center font-bold whitespace-nowrap">{money(due)}</td>
                      <td className="text-center whitespace-nowrap">{money(invAmt)}</td>
                      <td className={`text-center font-bold whitespace-nowrap ${amtDiff === 0 ? "text-success" : "text-kube-red"}`}>
                        {formatSigned(amtDiff)}
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && <tr><td colSpan={10} className="text-center py-6 text-muted-foreground">لا توجد منتجات</td></tr>}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-2">الإجمالي</td>
                  <td></td><td></td>
                  <td className="text-center">{formatQty(totals.acc)}</td>
                  <td className="text-center">{formatQty(totals.inv)}</td>
                  <td></td><td></td>
                  <td className="text-center whitespace-nowrap">{money(totals.due)}</td>
                  <td className="text-center whitespace-nowrap">{money(totals.sum)}</td>
                  <td className={`text-center whitespace-nowrap ${round2(totals.sum - totals.due) === 0 ? "text-success" : "text-kube-red"}`}>
                    {formatSigned(round2(totals.sum - totals.due))}
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="kube-card bg-muted/40 text-center">
              <div className="text-xs text-muted-foreground">المستحق للسداد (حسب المقبول)</div>
              <div className="text-2xl font-extrabold">{money(totals.due)}</div>
            </div>
            <div className="kube-card bg-muted/40 text-center">
              <div className="text-xs text-muted-foreground">إجمالي قيمة الفاتورة</div>
              <div className="text-2xl font-extrabold">{money(totals.sum)}</div>
            </div>
            <div className="kube-card bg-muted/40 text-center">
              <div className="text-xs text-muted-foreground">فرق المبلغ</div>
              <div className={`text-2xl font-extrabold ${round2(totals.sum - totals.due) === 0 ? "text-success" : "text-kube-red"}`}>
                {formatSigned(round2(totals.sum - totals.due))}
              </div>
            </div>
          </div>


          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <label className="block">
              <span className="text-xs text-muted-foreground">رقم الفاتورة</span>
              <input className="kube-input w-full" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-2026-001" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">تاريخ الفاتورة</span>
              <input type="date" className="kube-input w-full" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">الإجمالي (اختياري)</span>
              <input type="number" inputMode="decimal" step="0.01" className="kube-input w-full"
                value={totalAmount} onChange={e => setTotalAmount(e.target.value)}
                onBlur={e => setTotalAmount(e.target.value === "" ? "" : String(round2(num(e.target.value))))}
                placeholder={formatMoney(totals.sum)} />
              {totalAmount !== "" && round2(num(totalAmount)) !== totals.sum && (
                <span className="mt-1 block text-[11px] font-bold text-kube-red">
                  يختلف عن مجموع البنود ({money(totals.sum)}) بفرق {formatSigned(round2(num(totalAmount) - totals.sum))}
                </span>
              )}
            </label>
          </div>

          <label className="block mt-3">
            <span className="text-xs text-muted-foreground">ملاحظة</span>
            <textarea className="kube-input w-full" rows={2} value={note} onChange={e => setNote(e.target.value)} />
          </label>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-foreground text-foreground rounded-xl px-4 py-3 font-bold hover:bg-foreground hover:text-background transition" onClick={exportCSV} type="button">
              <FileDown className="w-4 h-4" /> تصدير الأعداد (Excel)
            </button>
            <button className="kube-btn-primary flex-1" disabled={saveMut.isPending} onClick={() => saveMut.mutate()}>
              {saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ الفاتورة والمطابقة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
