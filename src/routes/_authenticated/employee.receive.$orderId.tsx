import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { toast } from "sonner";
import { Camera, Copy, X } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/employee/receive/$orderId")({
  component: ReceivePage,
});

interface Line {
  itemId: string;
  productId: string;
  productName: string;
  unit: string;
  ordered: number;
  received: string;
  damaged: string;
  note: string;
}

function computeStatus(ordered: number, received: number, damaged: number): { status: string; accepted: number; diff: number } {
  const accepted = Math.max(0, received - damaged);
  const diff = accepted - ordered;
  let status = "matched";
  if (received === 0) status = "not_delivered";
  else if (damaged > 0) status = "has_damage";
  else if (diff < 0) status = "short";
  else if (diff > 0) status = "over";
  return { status, accepted, diff };
}

function ReceivePage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const { data: cu } = useCurrentUser();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const orderQ = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, status, supplier_id, supplier:suppliers(name), items:order_items(id, ordered_qty, product:products(id, name, unit))")
        .eq("id", orderId).single();
      if (error) throw error;
      if (!lines) {
        setLines(data.items.map((it: any) => ({
          itemId: it.id, productId: it.product.id, productName: it.product.name,
          unit: it.product.unit, ordered: Number(it.ordered_qty),
          received: "", damaged: "", note: "",
        })));
      }
      return data;
    },
  });

  const totals = useMemo(() => {
    if (!lines) return null;
    let ordered = 0, received = 0, accepted = 0, damaged = 0, short = 0, over = 0;
    let requiresPhoto = false, requiresNote = false;
    for (const l of lines) {
      const r = Number(l.received || 0), d = Number(l.damaged || 0);
      const c = computeStatus(l.ordered, r, d);
      ordered += l.ordered; received += r; accepted += c.accepted; damaged += d;
      if (c.diff < 0) short += -c.diff;
      if (c.diff > 0) over += c.diff;
      if (c.status !== "matched") requiresNote = requiresNote || !l.note.trim();
      if (d > 0 || c.diff !== 0) requiresPhoto = true;
    }
    return { ordered, received, accepted, damaged, short, over, requiresPhoto, requiresNote };
  }, [lines]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev!.map((l, j) => j === i ? { ...l, ...patch } : l));
  }

  function copyOrdered() {
    setLines((prev) => prev!.map((l) => ({ ...l, received: String(l.ordered) })));
  }

  async function onSubmit() {
    if (!lines || !totals || !cu) return;
    if (totals.requiresNote) return toast.error("أدخل ملاحظة لكل منتج به فرق أو تالف");
    if (totals.requiresPhoto && files.length === 0) return toast.error("رفع صورة إلزامي عند وجود فرق أو تالف");
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("جلسة منتهية");
      const order = orderQ.data!;
      const { data: emp } = await supabase.from("employees").select("id").eq("user_id", userRes.user.id).single();
      if (!emp) throw new Error("الموظف غير موجود");

      const { data: receipt, error } = await supabase.from("receipts").insert({
        order_id: order.id, supplier_id: order.supplier_id, employee_id: emp.id,
        received_by_user: userRes.user.id, status: "submitted", note: note || null,
      }).select("id").single();
      if (error) throw error;

      const itemsPayload = lines.map((l) => {
        const r = Number(l.received || 0), d = Number(l.damaged || 0);
        return {
          receipt_id: receipt.id, product_id: l.productId,
          ordered_qty: l.ordered, received_qty: r, damaged_qty: d, note: l.note || null,
        };
      });
      const { error: iErr } = await supabase.from("receipt_items").insert(itemsPayload);
      if (iErr) throw iErr;

      for (const f of files) {
        const storage_path = `${receipt.id}/${crypto.randomUUID()}-${f.name}`;
        const { error: upErr } = await supabase.storage.from("receipt-photos").upload(storage_path, f);
        if (upErr) throw upErr;
        await supabase.from("receipt_photos").insert({ receipt_id: receipt.id, storage_path, uploaded_by: userRes.user.id });
      }

      await supabase.from("orders").update({ status: "received" }).eq("id", order.id);
      await supabase.from("activity_log").insert({
        actor_user: userRes.user.id, action: "receive_order", entity: "receipts", entity_id: receipt.id,
        details: { order_id: order.id },
      });

      toast.success("تم الاستلام");
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (orderQ.isLoading || !lines || !totals) {
    return <AppShell title="استلام الطلب" back={{ to: "/employee" }}><div>جارٍ التحميل...</div></AppShell>;
  }
  const order = orderQ.data!;

  return (
    <AppShell title={`استلام: ${order.order_number}`} back={{ to: "/employee" }}>
      <div className="kube-card mb-4 flex items-center justify-between">
        <div>
          <div className="font-bold">{order.supplier?.name}</div>
          <div className="text-xs text-muted-foreground">{order.order_number}</div>
        </div>
        <button type="button" onClick={copyOrdered} className="kube-btn-outline !py-2 !px-3 text-sm">
          <Copy className="w-4 h-4" />تعبئة المستلم مثل المطلوب
        </button>
      </div>

      <div className="space-y-3">
        {lines.map((l, i) => {
          const r = Number(l.received || 0), d = Number(l.damaged || 0);
          const c = computeStatus(l.ordered, r, d);
          const needsNote = c.status !== "matched";
          return (
            <div key={l.itemId} className="kube-card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold truncate">{l.productName}</div>
                  <div className="text-xs text-muted-foreground">الوحدة: {l.unit}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Field label="المطلوب"><div className="kube-input bg-muted text-center font-bold">{l.ordered}</div></Field>
                <Field label="المستلم">
                  <input type="number" min="0" step="0.01" value={l.received}
                    onChange={(e) => updateLine(i, { received: e.target.value.replace(/^-/, "") })}
                    className="kube-input text-center" />
                </Field>
                <Field label="التالف">
                  <input type="number" min="0" step="0.01" value={l.damaged}
                    onChange={(e) => updateLine(i, { damaged: e.target.value.replace(/^-/, "") })}
                    className="kube-input text-center" />
                </Field>
                <Field label="المقبول"><div className="kube-input bg-muted text-center font-bold">{c.accepted}</div></Field>
              </div>
              <div className="text-sm">
                الفرق: <span className={c.diff === 0 ? "" : "font-bold text-kube-red"}>{c.diff}</span>
              </div>
              {needsNote && (
                <input type="text" placeholder="ملاحظة (إلزامية)" required
                  value={l.note} onChange={(e) => updateLine(i, { note: e.target.value })}
                  className="kube-input" />
              )}
            </div>
          );
        })}
      </div>

      <div className="kube-card mt-4 space-y-3">
        <div className="font-bold">صور الاستلام {totals.requiresPhoto && <span className="text-kube-red text-sm">(إلزامي)</span>}</div>
        <label className="kube-btn-outline w-full cursor-pointer">
          <Camera className="w-5 h-5" />
          إضافة صور
          <input type="file" accept="image/*" multiple capture="environment" hidden
            onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])} />
        </label>
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square bg-muted rounded overflow-hidden">
                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-1 left-1 bg-background/80 rounded-full p-1"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        )}
        <textarea rows={2} placeholder="ملاحظة عامة (اختياري)" value={note}
          onChange={(e) => setNote(e.target.value)} className="kube-input" />
      </div>

      <button type="button" onClick={() => setConfirming(true)} className="kube-btn-primary w-full mt-4">
        مراجعة وتأكيد
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setConfirming(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">تأكيد الاستلام</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Row k="إجمالي المطلوب" v={totals.ordered} />
              <Row k="إجمالي المستلم" v={totals.received} />
              <Row k="إجمالي المقبول" v={totals.accepted} />
              <Row k="إجمالي التالف" v={totals.damaged} danger />
              <Row k="إجمالي النقص" v={totals.short} danger />
              <Row k="إجمالي الزيادة" v={totals.over} danger />
            </div>
            <div className="text-xs text-muted-foreground border-t pt-3">
              <div>الموظف: <span className="font-semibold text-foreground">{cu?.fullName ?? "—"}</span></div>
              <div>الوقت: {format(new Date(), "yyyy-MM-dd HH:mm")}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="kube-btn-outline flex-1">تراجع</button>
              <button disabled={saving} onClick={onSubmit} className="kube-btn-primary flex-1 disabled:opacity-50">
                {saving ? "..." : "تم الاستلام"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs text-muted-foreground mb-1">{label}</span>{children}</label>;
}
function Row({ k, v, danger }: { k: string; v: number; danger?: boolean }) {
  return (
    <div className="flex justify-between bg-muted rounded-md px-3 py-2">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-bold ${danger && v > 0 ? "text-kube-red" : ""}`}>{Number(v).toLocaleString()}</span>
    </div>
  );
}
