import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Save, FileDown } from "lucide-react";
import { formatMoney, formatQty, formatSigned, lineAmount, num, round2, round3, sumMoney } from "@/lib/money";
import { downloadCsv } from "@/lib/csv";



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
  const [periodStart, setPeriodStart] = useState<string>(() => {
    const d = new Date(); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [totalAmount, setTotalAmount] = useState("");
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState(false);

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
      .gte("received_at", `${periodStart}T00:00:00`)
      .lte("received_at", `${periodEnd}T23:59:59`);
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
      const price = Number((p as { unit_price?: number | string }).unit_price ?? 0);
      return {
        product_id: p.id, product_name: p.name, unit: p.unit,
        accepted_qty: a.a, received_qty: a.r, damaged_qty: a.d, ordered_qty: a.o,
        invoiced_qty: a.a ? String(a.a) : "",
        unit_price: price ? String(price) : "",
      };
    });
    setRows(newRows);
    setLoaded(true);
    if (items.length === 0) toast.warning("لا توجد استلامات في هذه الفترة");
  };

  const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    if (rows.length === 0) { toast.error("لا توجد بيانات"); return; }
    const supplierName = suppliers.data?.find(s => s.id === supplierId)?.name ?? "";
    const headers = ["المنتج","الوحدة","المطلوب","المستلم","التالف","المقبول","الكمية بالفاتورة","سعر الوحدة","الفرق","المستحق (المقبول)","قيمة الفاتورة","فرق المبلغ"];
    const lines = rows.map(r => {
      const iq = Number(r.invoiced_qty || 0);
      const up = Number(r.unit_price || 0);
      const diff = r.invoiced_qty === "" ? "" : iq - r.accepted_qty;
      const due = r.accepted_qty * up;
      const invAmt = iq * up;
      return [r.product_name, r.unit, r.ordered_qty, r.received_qty, r.damaged_qty, r.accepted_qty, r.invoiced_qty, r.unit_price, diff, due.toFixed(2), invAmt.toFixed(2), (invAmt - due).toFixed(2)];
    });
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const meta = [
      [`المورد:`, supplierName],
      [`الفترة:`, `${periodStart} → ${periodEnd}`],
      [],
    ];
    const foot = [
      [],
      ["الإجمالي المستحق للسداد", totals.due.toFixed(2)],
      ["إجمالي قيمة الفاتورة", totals.sum.toFixed(2)],
      ["فرق المبلغ", (totals.sum - totals.due).toFixed(2)],
    ];
    const csv = "\uFEFF" + [...meta, headers, ...lines, ...foot].map(r => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `مطابقة-${supplierName}-${periodStart}-${periodEnd}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم التصدير");
  };


  const totals = useMemo(() => {
    let acc = 0, inv = 0, sum = 0, due = 0;
    for (const r of rows) {
      acc += r.accepted_qty;
      const iq = Number(r.invoiced_qty || 0);
      const up = Number(r.unit_price || 0);
      inv += iq;
      sum += iq * up;
      due += r.accepted_qty * up;
    }
    return { acc, inv, sum, due };
  }, [rows]);


  const saveMut = useMutation({
    mutationFn: async () => {
      if (!supplierId || !invoiceNumber || !invoiceDate) throw new Error("أكمل بيانات الفاتورة");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("جلسة غير صالحة");

      const totalAmt = totalAmount ? Number(totalAmount) : totals.sum;

      // Determine invoice status
      const hasDiff = rows.some(r => Number(r.invoiced_qty || 0) !== r.accepted_qty);
      const status = hasDiff ? "unmatched" : "matched_ready";

      const { data: inv, error: invErr } = await supabase.from("invoices").insert({
        supplier_id: supplierId,
        invoice_number: invoiceNumber.trim(),
        invoice_date: invoiceDate,
        period_start: periodStart,
        period_end: periodEnd,
        total_amount: totalAmt,
        status,
        accountant_note: note || null,
        created_by: user.id,
      }).select("id").single();
      if (invErr) throw invErr;

      const itemsToInsert = rows
        .filter(r => Number(r.invoiced_qty || 0) > 0)
        .map(r => {
          const iq = Number(r.invoiced_qty);
          const up = Number(r.unit_price || 0);
          return {
            invoice_id: inv.id, product_id: r.product_id,
            invoiced_qty: iq, unit_price: up, line_total: iq * up,
          };
        });
      if (itemsToInsert.length) {
        const { error } = await supabase.from("invoice_items").insert(itemsToInsert);
        if (error) throw error;
      }

      type MStatus = "matched" | "invoice_higher" | "invoice_lower" | "in_invoice_not_received" | "received_not_in_invoice" | "has_damage_in_invoice" | "needs_review";
      const matchesToInsert = rows
        .filter(r => r.accepted_qty > 0 || Number(r.invoiced_qty || 0) > 0)
        .map(r => {
          const iq = Number(r.invoiced_qty || 0);
          const diff = iq - r.accepted_qty;
          let mstatus: MStatus = "matched";
          if (r.accepted_qty === 0 && iq > 0) mstatus = "in_invoice_not_received";
          else if (iq === 0 && r.accepted_qty > 0) mstatus = "received_not_in_invoice";
          else if (diff > 0) mstatus = "invoice_higher";
          else if (diff < 0) mstatus = "invoice_lower";
          else if (r.damaged_qty > 0) mstatus = "has_damage_in_invoice";
          return {
            invoice_id: inv.id, product_id: r.product_id,
            total_ordered: r.ordered_qty, total_received: r.received_qty,
            total_damaged: r.damaged_qty, total_accepted: r.accepted_qty,
            total_invoiced: iq, invoice_diff: diff, status: mstatus,
          };
        });
      if (matchesToInsert.length) {
        const { error } = await supabase.from("invoice_matches").insert(matchesToInsert);
        if (error) throw error;
      }
      return inv.id;
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
                  const iq = Number(r.invoiced_qty || 0);
                  const up = Number(r.unit_price || 0);
                  const diff = iq - r.accepted_qty;
                  const due = r.accepted_qty * up;
                  const invAmt = iq * up;
                  const amtDiff = invAmt - due;
                  return (
                    <tr key={r.product_id} className="border-b border-border/50">
                      <td className="py-2">
                        <div className="font-semibold">{r.product_name}</div>
                        <div className="text-xs text-muted-foreground">{r.unit}</div>
                      </td>
                      <td className="text-center">{r.received_qty}</td>
                      <td className="text-center text-kube-red">{r.damaged_qty || "—"}</td>
                      <td className="text-center font-bold">{r.accepted_qty}</td>
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
                          onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, unit_price: e.target.value } : x))} />
                      </td>
                      <td className={`text-center font-bold ${diff === 0 ? "text-success" : "text-kube-red"}`}>
                        {r.invoiced_qty === "" ? "—" : diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="text-center font-bold whitespace-nowrap">{money(due)}</td>
                      <td className="text-center whitespace-nowrap">{money(invAmt)}</td>
                      <td className={`text-center font-bold whitespace-nowrap ${amtDiff === 0 ? "text-success" : "text-kube-red"}`}>
                        {amtDiff > 0 ? `+${money(amtDiff)}` : money(amtDiff)}
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
                  <td className="text-center">{totals.acc}</td>
                  <td className="text-center">{totals.inv}</td>
                  <td></td><td></td>
                  <td className="text-center whitespace-nowrap">{money(totals.due)}</td>
                  <td className="text-center whitespace-nowrap">{money(totals.sum)}</td>
                  <td className={`text-center whitespace-nowrap ${totals.sum - totals.due === 0 ? "text-success" : "text-kube-red"}`}>
                    {money(totals.sum - totals.due)}
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
              <div className={`text-2xl font-extrabold ${totals.sum - totals.due === 0 ? "text-success" : "text-kube-red"}`}>
                {money(totals.sum - totals.due)}
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
                placeholder={String(totals.sum.toFixed(2))} />
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
