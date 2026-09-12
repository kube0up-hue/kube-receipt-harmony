import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard, Can } from "@/components/permission-guard";
import { useBranchFilter } from "@/lib/use-branches";
import { toast } from "sonner";
import { Plus, Send, X, PackageCheck, Trash2 } from "lucide-react";
import { num, round2 } from "@/lib/money";
import { formatDateTimeAr } from "@/lib/format-date";

export const Route = createFileRoute("/_authenticated/admin/transfers")({
  head: () => ({
    meta: [
      { title: "تحويلات المخزون — KUBE Kitchen" },
      { name: "description", content: "تحويل الأصناف بين المستودع والفروع مع توثيق من أرسل ومن استلم والكميات والتواريخ." },
      { property: "og:title", content: "تحويلات المخزون — KUBE Kitchen" },
      { property: "og:description", content: "تحويلات موثّقة بين المستودع والفروع مع الكميات المرسلة والمستلمة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["inventory_view", "inventory_transfer", "inventory_receive_transfer"]}>
      <TransfersPage />
    </PermissionGuard>
  ),
});

interface TransferItem {
  id: string;
  product_id: string;
  qty_sent: number;
  qty_received: number | null;
  productName: string;
  unit: string;
}

interface Transfer {
  id: string;
  transferNumber: string | null;
  fromBranchId: string;
  toBranchId: string;
  status: string;
  note: string | null;
  sentAt: string | null;
  receivedAt: string | null;
  items: TransferItem[];
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  sent: { label: "بانتظار الاستلام", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  received: { label: "تم الاستلام", cls: "bg-success/15 text-success border-success/30" },
  draft: { label: "مسودة", cls: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "ملغى", cls: "bg-muted text-muted-foreground border-border" },
};

function TransfersPage() {
  const qc = useQueryClient();
  const { branchId, branches, label } = useBranchFilter();
  const [creating, setCreating] = useState(false);
  const [receiving, setReceiving] = useState<Transfer | null>(null);

  const branchName = (id: string) => branches.find((b) => b.id === id)?.name ?? "—";

  const transfers = useQuery({
    queryKey: ["stock-transfers", branchId],
    queryFn: async (): Promise<Transfer[]> => {
      let query = supabase
        .from("stock_transfers")
        .select("id,transfer_number,from_branch_id,to_branch_id,status,note,sent_at,received_at,items:stock_transfer_items(id,product_id,qty_sent,qty_received,product:products(name,unit))")
        .order("created_at", { ascending: false })
        .limit(100);
      if (branchId) query = query.or(`from_branch_id.eq.${branchId},to_branch_id.eq.${branchId}`);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((t) => ({
        id: t.id,
        transferNumber: (t.transfer_number as string | null) ?? null,
        fromBranchId: t.from_branch_id,
        toBranchId: t.to_branch_id,
        status: t.status as string,
        note: (t.note as string | null) ?? null,
        sentAt: (t.sent_at as string | null) ?? null,
        receivedAt: (t.received_at as string | null) ?? null,
        items: ((t as { items?: Array<Record<string, unknown>> }).items ?? []).map((i) => ({
          id: i.id as string,
          product_id: i.product_id as string,
          qty_sent: num(i.qty_sent as number),
          qty_received: i.qty_received === null || i.qty_received === undefined ? null : num(i.qty_received as number),
          productName: (i.product as { name?: string } | null)?.name ?? "—",
          unit: (i.product as { unit?: string } | null)?.unit ?? "",
        })),
      }));
    },
  });

  const receiveMut = useMutation({
    mutationFn: async (input: { transferId: string; items: Array<{ product_id: string; qty_received: number }>; note: string }) => {
      const { error } = await supabase.rpc("stock_transfer_receive", {
        p_transfer_id: input.transferId,
        p_items: input.items,
        p_note: input.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم استلام التحويل وتحديث المخزون");
      setReceiving(null);
      qc.invalidateQueries({ queryKey: ["stock-transfers"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title={`التحويلات — ${label}`} back={{ to: "/admin/inventory", label: "المخزون" }}>
      <div className="space-y-4">
        <Can anyOf={["inventory_transfer"]}>
          <button onClick={() => setCreating(true)} disabled={!branchId} className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> تحويل جديد من {branchId ? label : "— اختر فرعاً"}
          </button>
        </Can>

        {transfers.isLoading ? (
          <div className="kube-card text-center text-muted-foreground">جارٍ التحميل...</div>
        ) : (transfers.data ?? []).length === 0 ? (
          <div className="kube-card text-center text-muted-foreground">لا تحويلات بعد</div>
        ) : (
          <div className="space-y-2">
            {(transfers.data ?? []).map((t) => {
              const s = STATUS_LABEL[t.status] ?? { label: t.status, cls: "bg-muted text-muted-foreground border-border" };
              const canReceive = t.status === "sent" && (!branchId || t.toBranchId === branchId);
              return (
                <div key={t.id} className="kube-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm">{t.transferNumber ?? "تحويل"}</div>
                      <div className="text-xs text-muted-foreground">
                        من {branchName(t.fromBranchId)} ← إلى {branchName(t.toBranchId)}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {t.sentAt ? formatDateTimeAr(t.sentAt) : ""}
                        {t.receivedAt ? ` · استُلم ${formatDateTimeAr(t.receivedAt)}` : ""}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0 ${s.cls}`}>{s.label}</span>
                  </div>
                  <ul className="text-sm space-y-1">
                    {t.items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-2">
                        <span className="truncate">{i.productName}</span>
                        <span className="shrink-0 font-semibold">
                          {i.qty_sent} {i.unit}
                          {i.qty_received !== null && i.qty_received !== i.qty_sent && (
                            <span className="text-kube-red"> ← {i.qty_received}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {t.note && <div className="text-xs text-muted-foreground">{t.note}</div>}
                  {canReceive && (
                    <Can anyOf={["inventory_receive_transfer"]}>
                      <button onClick={() => setReceiving(t)} className="kube-btn-outline text-xs inline-flex items-center gap-1">
                        <PackageCheck className="w-3 h-3" /> استلام التحويل
                      </button>
                    </Can>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {creating && branchId && (
        <CreateTransfer
          fromBranchId={branchId}
          fromLabel={label}
          targets={branches.filter((b) => b.id !== branchId).map((b) => ({ id: b.id, name: b.name }))}
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false);
            qc.invalidateQueries({ queryKey: ["stock-transfers"] });
            qc.invalidateQueries({ queryKey: ["inventory"] });
          }}
        />
      )}

      {receiving && (
        <ReceiveTransfer
          transfer={receiving}
          busy={receiveMut.isPending}
          onClose={() => setReceiving(null)}
          onSave={(items, note) => receiveMut.mutate({ transferId: receiving.id, items, note })}
        />
      )}
    </AppShell>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-background w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="p-2 -m-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateTransfer({
  fromBranchId,
  fromLabel,
  targets,
  onClose,
  onDone,
}: {
  fromBranchId: string;
  fromLabel: string;
  targets: Array<{ id: string; name: string }>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [toBranchId, setToBranchId] = useState(targets[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState<Array<{ product_id: string; qty: string }>>([]);
  const [pick, setPick] = useState("");

  const products = useQuery({
    queryKey: ["transfer-products", fromBranchId],
    queryFn: async () => {
      const [prodRes, levelRes] = await Promise.all([
        supabase.from("products").select("id,name,unit").eq("is_hidden", false).order("name"),
        supabase.from("stock_levels").select("product_id,qty").eq("branch_id", fromBranchId),
      ]);
      if (prodRes.error) throw prodRes.error;
      if (levelRes.error) throw levelRes.error;
      const levels = new Map<string, number>((levelRes.data ?? []).map((l) => [l.product_id, num(l.qty as unknown as number)]));
      return (prodRes.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit as string,
        qty: round2(levels.get(p.id) ?? 0),
      }));
    },
  });

  const byId = useMemo(() => new Map((products.data ?? []).map((p) => [p.id, p])), [products.data]);

  const sendMut = useMutation({
    mutationFn: async () => {
      const items = lines
        .map((l) => ({ product_id: l.product_id, qty: num(l.qty) }))
        .filter((l) => l.qty > 0);
      if (!toBranchId) throw new Error("اختر الفرع المستلم");
      if (items.length === 0) throw new Error("أضف صنفاً واحداً على الأقل بكمية");
      const { error } = await supabase.rpc("stock_transfer_send", {
        p_from_branch_id: fromBranchId,
        p_to_branch_id: toBranchId,
        p_note: note || null,
        p_items: items,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم إرسال التحويل وخصم الكميات");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Modal title={`تحويل جديد من ${fromLabel}`} onClose={onClose}>
      <label className="block text-sm font-semibold">إلى</label>
      <select value={toBranchId} onChange={(e) => setToBranchId(e.target.value)} className="kube-input">
        {targets.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <label className="block text-sm font-semibold">الأصناف</label>
      <div className="flex gap-2">
        <select value={pick} onChange={(e) => setPick(e.target.value)} className="kube-input">
          <option value="">اختر صنفاً</option>
          {(products.data ?? [])
            .filter((p) => !lines.some((l) => l.product_id === p.id))
            .map((p) => (
              <option key={p.id} value={p.id}>{p.name} (متاح {p.qty} {p.unit})</option>
            ))}
        </select>
        <button
          onClick={() => {
            if (!pick) return;
            setLines((ls) => [...ls, { product_id: pick, qty: "" }]);
            setPick("");
          }}
          className="kube-btn-outline shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {lines.length > 0 && (
        <div className="space-y-2">
          {lines.map((l, idx) => {
            const p = byId.get(l.product_id);
            return (
              <div key={l.product_id} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p?.name ?? "—"}</div>
                  <div className="text-[11px] text-muted-foreground">متاح {p?.qty ?? 0} {p?.unit}</div>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={l.qty}
                  onChange={(e) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, qty: e.target.value } : x)))}
                  placeholder="الكمية"
                  className="kube-input w-24 shrink-0"
                />
                <button onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))} className="text-kube-red p-2" aria-label="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="ملاحظة (اختياري)" className="kube-input" />

      <button
        disabled={sendMut.isPending}
        onClick={() => sendMut.mutate()}
        className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" /> إرسال التحويل
      </button>
    </Modal>
  );
}

function ReceiveTransfer({
  transfer,
  busy,
  onClose,
  onSave,
}: {
  transfer: Transfer;
  busy: boolean;
  onClose: () => void;
  onSave: (items: Array<{ product_id: string; qty_received: number }>, note: string) => void;
}) {
  const [qty, setQty] = useState<Record<string, string>>(
    Object.fromEntries(transfer.items.map((i) => [i.product_id, String(i.qty_sent)])),
  );
  const [note, setNote] = useState("");

  return (
    <Modal title={`استلام ${transfer.transferNumber ?? "تحويل"}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground">أدخل الكمية المستلمة فعلياً لكل صنف. الفرق يعود لرصيد الفرع المُرسل.</p>
      <div className="space-y-2">
        {transfer.items.map((i) => (
          <div key={i.id} className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{i.productName}</div>
              <div className="text-[11px] text-muted-foreground">مُرسل {i.qty_sent} {i.unit}</div>
            </div>
            <input
              type="number"
              inputMode="decimal"
              value={qty[i.product_id] ?? ""}
              onChange={(e) => setQty((q) => ({ ...q, [i.product_id]: e.target.value }))}
              className="kube-input w-24 shrink-0"
            />
          </div>
        ))}
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="ملاحظة الاستلام (اختياري)" className="kube-input" />
      <button
        disabled={busy}
        onClick={() =>
          onSave(
            transfer.items.map((i) => ({ product_id: i.product_id, qty_received: num(qty[i.product_id] ?? "0") })),
            note.trim(),
          )
        }
        className="kube-btn w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <PackageCheck className="w-4 h-4" /> تأكيد الاستلام
      </button>
    </Modal>
  );
}
