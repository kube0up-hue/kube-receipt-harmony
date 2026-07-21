import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, StatusBadge } from "@/components/app-shell";
import { toast } from "sonner";
import { Camera, Copy, X, Ban } from "lucide-react";
import { useCurrentUser } from "@/lib/use-current-user";
import { format } from "date-fns";
import { useServerFn } from "@tanstack/react-start";
import { notifyReceiptApproved } from "@/lib/telegram.functions";

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
  photos: File[];
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
  const queryClient = useQueryClient();
  const { data: cu } = useCurrentUser();
  const [lines, setLines] = useState<Line[] | null>(null);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const sendTelegram = useServerFn(notifyReceiptApproved);

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
          received: "", damaged: "", note: "", photos: [],
        })));
      }
      return data;
    },
  });

  const totals = useMemo(() => {
    if (!lines) return null;
    let ordered = 0, received = 0, accepted = 0, damaged = 0, short = 0, over = 0;
    let missingPhotos = false, requiresNote = false;
    for (const l of lines) {
      const r = Number(l.received || 0), d = Number(l.damaged || 0);
      const c = computeStatus(l.ordered, r, d);
      ordered += l.ordered; received += r; accepted += c.accepted; damaged += d;
      if (c.diff < 0) short += -c.diff;
      if (c.diff > 0) over += c.diff;
      if (c.status !== "matched") requiresNote = requiresNote || !l.note.trim();
      if (l.photos.length === 0) missingPhotos = true;
    }
    return { ordered, received, accepted, damaged, short, over, missingPhotos, requiresNote };
  }, [lines]);

  function updateLine(i: number, patch: Partial<Line>) {
    setLines((prev) => prev!.map((l, j) => j === i ? { ...l, ...patch } : l));
  }
  function addPhotos(i: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    setLines((prev) => prev!.map((l, j) => j === i ? { ...l, photos: [...l.photos, ...Array.from(files)] } : l));
  }
  function removePhoto(i: number, k: number) {
    setLines((prev) => prev!.map((l, j) => j === i ? { ...l, photos: l.photos.filter((_, x) => x !== k) } : l));
  }
  function copyOrdered() {
    setLines((prev) => prev!.map((l) => ({ ...l, received: String(l.ordered) })));
  }

  async function onSubmit() {
    if (!lines || !totals || !cu) return;
    if (totals.requiresNote) return toast.error("أدخل ملاحظة لكل منتج به فرق أو تالف");
    if (totals.missingPhotos) return toast.error("يجب تصوير كل صنف على حدة قبل التأكيد");
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("جلسة منتهية");
      const order = orderQ.data!;

      const { count: existingReceipts, error: existingErr } = await supabase
        .from("receipts").select("id", { count: "exact", head: true })
        .eq("order_id", order.id).in("status", ["submitted", "approved"]);
      if (existingErr) throw existingErr;
      if ((existingReceipts ?? 0) > 0) {
        toast.error("هذا الطلب مستلم مسبقاً");
        navigate({ to: "/employee" });
        return;
      }

      const receiptId = crypto.randomUUID();
      const photosPayload: { product_id: string; storage_path: string }[] = [];
      for (const l of lines) {
        for (const f of l.photos) {
          const storagePath = `${receiptId}/${l.productId}/${crypto.randomUUID()}-${f.name}`;
          const { error: upErr } = await supabase.storage.from("receipt-photos").upload(storagePath, f);
          if (upErr) throw upErr;
          photosPayload.push({ product_id: l.productId, storage_path: storagePath });
        }
      }

      const itemsPayload = lines.map((l) => ({
        product_id: l.productId,
        received_qty: Number(l.received || 0),
        damaged_qty: Number(l.damaged || 0),
        note: l.note || null,
      }));

      const { error: submitErr } = await supabase.rpc("submit_order_receipt", {
        p_receipt_id: receiptId,
        p_order_id: order.id,
        p_note: note || "",
        p_items: itemsPayload,
        p_photos: photosPayload,
      });
      if (submitErr) throw submitErr;

      try {
        await sendTelegram({ data: { receiptId } });
      } catch (error) {
        console.error("Telegram notification failed:", error);
      }

      await queryClient.invalidateQueries();
      toast.success("تم الاستلام");
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  async function onCancel() {
    if (!cancelReason.trim()) return toast.error("أدخل سبب الإلغاء");
    setSaving(true);
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) throw new Error("جلسة منتهية");
      const { data: updRows, error: updErr } = await supabase
        .from("orders").update({ status: "cancelled", note: cancelReason }).eq("id", orderId).select("id");
      if (updErr) throw updErr;
      if (!updRows || updRows.length === 0) {
        throw new Error("لا تملك صلاحية إلغاء هذا الطلب");
      }
      await supabase.from("activity_log").insert({
        actor_user: userRes.user.id, action: "cancel_order", entity: "orders", entity_id: orderId,
        details: { reason: cancelReason },
      });
      await queryClient.invalidateQueries();
      toast.success("تم إلغاء الطلب");
      navigate({ to: "/employee" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل الإلغاء");
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

      <div className="kube-card mb-3 bg-muted/50 text-xs text-muted-foreground">
        📸 تصوير كل صنف على حدة إلزامي قبل تأكيد الاستلام.
      </div>

      <div className="space-y-3">
        {lines.map((l, i) => {
          const r = Number(l.received || 0), d = Number(l.damaged || 0);
          const c = computeStatus(l.ordered, r, d);
          const needsNote = c.status !== "matched";
          const hasPhoto = l.photos.length > 0;
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

              <div className={`rounded-lg border p-2 space-y-2 ${hasPhoto ? "border-border" : "border-kube-red/60 bg-kube-red/5"}`}>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold">
                    صور الصنف {!hasPhoto && <span className="text-kube-red">(إلزامي)</span>}
                  </div>
                  <label className="kube-btn-outline !py-1.5 !px-2 text-xs cursor-pointer">
                    <Camera className="w-4 h-4" /> إضافة
                    <input type="file" accept="image/*" multiple capture="environment" hidden
                      onChange={(e) => addPhotos(i, e.target.files)} />
                  </label>
                </div>
                {l.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-1.5">
                    {l.photos.map((f, k) => (
                      <div key={k} className="relative aspect-square bg-muted rounded overflow-hidden">
                        <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removePhoto(i, k)}
                          className="absolute top-0.5 left-0.5 bg-background/80 rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="kube-card mt-4">
        <textarea rows={2} placeholder="ملاحظة عامة (اختياري)" value={note}
          onChange={(e) => setNote(e.target.value)} className="kube-input" />
      </div>

      <button type="button" onClick={() => setConfirming(true)} className="kube-btn-primary w-full mt-4">
        مراجعة وتأكيد
      </button>
      <button type="button" onClick={() => setCancelling(true)} className="w-full mt-2 py-3 rounded-lg border border-kube-red/40 text-kube-red font-bold flex items-center justify-center gap-2">
        <Ban className="w-4 h-4" /> إلغاء الطلب / لم يصل
      </button>

      {cancelling && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setCancelling(false)}>
          <div className="bg-background rounded-2xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg">إلغاء الطلب</h3>
            <p className="text-sm text-muted-foreground">سيتم إخراج الطلب من قائمة الاستلامات المعلقة.</p>
            <textarea rows={3} placeholder="سبب الإلغاء (إلزامي)" value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)} className="kube-input" />
            <div className="flex gap-2">
              <button onClick={() => setCancelling(false)} className="kube-btn-outline flex-1">تراجع</button>
              <button disabled={saving} onClick={onCancel} className="flex-1 py-3 rounded-lg bg-kube-red text-white font-bold disabled:opacity-50">
                {saving ? "..." : "تأكيد الإلغاء"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            {totals.missingPhotos && (
              <div className="text-xs text-kube-red font-bold">⚠ يجب تصوير كل صنف قبل التأكيد.</div>
            )}
            <div className="text-xs text-muted-foreground border-t pt-3">
              <div>الموظف: <span className="font-semibold text-foreground">{cu?.fullName ?? "—"}</span></div>
              <div>الوقت: {format(new Date(), "yyyy-MM-dd HH:mm")}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirming(false)} className="kube-btn-outline flex-1">تراجع</button>
              <button disabled={saving || totals.missingPhotos} onClick={onSubmit} className="kube-btn-primary flex-1 disabled:opacity-50">
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
