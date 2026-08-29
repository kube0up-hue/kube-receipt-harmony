import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { riyadhToday } from "@/lib/riyadh-time";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { formatMoney, formatQty, formatSigned, num, round2, round3 } from "@/lib/money";


const M_LABEL: Record<string, string> = {
  matched: "مطابق",
  invoice_higher: "الفاتورة أعلى",
  invoice_lower: "الفاتورة أقل",
  in_invoice_not_received: "بالفاتورة ولم يستلم",
  received_not_in_invoice: "مستلم وغير مفوتر",
  has_damage_in_invoice: "تالف مع مطابقة",
  needs_review: "يحتاج مراجعة",
};


export function InvoiceDetail({ invoiceId, base }: { invoiceId: string; base: "/admin" | "/accountant" }) {
  const qc = useQueryClient();
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");

  const inv = useQuery({
    queryKey: ["invoice", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices")
        .select("*, supplier:suppliers(name)")
        .eq("id", invoiceId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const matches = useQuery({
    queryKey: ["invoice-matches", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoice_matches")
        .select("*, product:products(name,unit)")
        .eq("invoice_id", invoiceId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const payments = useQuery({
    queryKey: ["invoice-payments", invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments")
        .select("*").eq("invoice_id", invoiceId).order("payment_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const payMut = useMutation({
    mutationFn: async () => {
      const amt = round2(amount ? num(amount) : num(inv.data?.total_amount));
      const { error: pErr } = await supabase.from("payments").insert({

        invoice_id: invoiceId, amount: amt,
        reference_number: reference || null,
        payment_date: riyadhToday(),
      });
      if (pErr) throw pErr;
      const { error: uErr } = await supabase.from("invoices")
        .update({ status: "paid" }).eq("id", invoiceId);
      if (uErr) throw uErr;
    },
    onSuccess: () => {
      toast.success("تم التحويل بنجاح وترحيل الفاتورة");
      qc.invalidateQueries();
      setReference(""); setAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (inv.isLoading) return <AppShell title="فاتورة" back={{ to: `${base}/invoices` }}><div>جارٍ التحميل...</div></AppShell>;
  if (!inv.data) return <AppShell title="فاتورة" back={{ to: `${base}/invoices` }}><div className="kube-card">غير موجودة</div></AppShell>;

  const i = inv.data;
  const totalDiff = round3((matches.data ?? []).reduce((a, m) => a + round3(num(m.invoice_diff)), 0));

  return (
    <AppShell title={`فاتورة ${i.invoice_number}`} back={{ to: `${base}/invoices` }}>
      <div className="kube-card mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-lg">{i.supplier?.name}</div>
          <StatusBadge status={i.status} />
        </div>
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
          <div>رقم: <span className="text-foreground font-semibold">{i.invoice_number}</span></div>
          <div>تاريخ: <span className="text-foreground font-semibold">{format(new Date(i.invoice_date), "yyyy-MM-dd")}</span></div>
          <div>من: {format(new Date(i.period_start), "yyyy-MM-dd")}</div>
          <div>إلى: {format(new Date(i.period_end), "yyyy-MM-dd")}</div>
          <div className="col-span-2">الإجمالي: <span className="text-foreground font-bold">{formatMoney(num(i.total_amount))} ر.س</span></div>
        </div>
      </div>

      <div className="kube-card mb-4">
        <h2 className="font-bold mb-3">نتيجة المطابقة</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border">
                <th className="text-right py-2">المنتج</th>
                <th className="text-center">المستلم</th>
                <th className="text-center">التالف</th>
                <th className="text-center">المقبول</th>
                <th className="text-center">بالفاتورة</th>
                <th className="text-center">الفرق</th>
                <th className="text-center">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {matches.data?.map(m => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="py-2">
                    <div className="font-semibold">{m.product?.name}</div>
                    <div className="text-xs text-muted-foreground">{m.product?.unit ?? ""}</div>
                  </td>
                  <td className="text-center">{formatQty(num(m.total_received))}</td>
                  <td className="text-center text-kube-red">{num(m.total_damaged) ? formatQty(num(m.total_damaged)) : "—"}</td>
                  <td className="text-center font-bold">{formatQty(num(m.total_accepted))}</td>
                  <td className="text-center">{formatQty(num(m.total_invoiced))}</td>
                  <td className={`text-center font-bold ${round3(num(m.invoice_diff)) === 0 ? "text-success" : "text-kube-red"}`}>
                    {formatSigned(round3(num(m.invoice_diff)), "qty")}
                  </td>
                  <td className="text-center text-xs">{M_LABEL[m.status] ?? m.status}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold">
                <td className="py-2" colSpan={5}>إجمالي الفرق</td>
                <td className={`text-center ${totalDiff === 0 ? "text-success" : "text-kube-red"}`}>{formatSigned(totalDiff, "qty")}</td>
                <td></td>
              </tr>

            </tfoot>
          </table>
        </div>
      </div>

      {i.status !== "paid" && base === "/admin" && (
        <div className="kube-card mb-4">
          <h2 className="font-bold mb-3">تسجيل التحويل</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-muted-foreground">المبلغ المحوّل</span>
              <input type="number" inputMode="decimal" step="0.01" className="kube-input w-full" value={amount}
                onChange={e => setAmount(e.target.value)}
                onBlur={e => setAmount(e.target.value === "" ? "" : String(round2(num(e.target.value))))}
                placeholder={formatMoney(num(i.total_amount))} />

            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">رقم المرجع (اختياري)</span>
              <input className="kube-input w-full" value={reference} onChange={e => setReference(e.target.value)} />
            </label>
          </div>
          <button className="kube-btn-primary mt-4 w-full" disabled={payMut.isPending} onClick={() => payMut.mutate()}>
            {payMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            تم التحويل بنجاح
          </button>
        </div>
      )}

      {(payments.data?.length ?? 0) > 0 && (
        <div className="kube-card">
          <h2 className="font-bold mb-3">السداد</h2>
          <div className="space-y-2">
            {payments.data!.map(p => (
              <div key={p.id} className="flex justify-between text-sm border-b border-border/50 py-2">
                <span>{format(new Date(p.payment_date), "yyyy-MM-dd")} · {p.reference_number ?? "—"}</span>
                <span className="font-bold">{formatMoney(num(p.amount))} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
