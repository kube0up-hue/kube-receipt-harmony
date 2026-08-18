import { useEffect } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PendingOrder {
  id: string;
  order_number: string | null;
  order_date: string | null;
  created_at: string | null;
  expected_delivery_date: string | null;
  note: string | null;
  supplier: { name: string | null } | null;
}

export const PENDING_ORDERS_KEY = ["orders", "pending"] as const;

/**
 * Single source of truth for "waiting to be received".
 * Reads the effective status view (computed live from receipt rows), never a cached
 * status column, and never serves stale data: an order that was already received
 * must not reappear on the employee's phone.
 */
async function fetchPendingOrders(limit?: number): Promise<PendingOrder[]> {
  let q = supabase
    .from("v_orders_effective")
    .select("id, order_number, order_date, created_at, expected_delivery_date, note, supplier:suppliers(name)")
    .eq("effective_status", "pending_receipt")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as PendingOrder[];
}

export function usePendingOrders(limit?: number) {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("orders-pending-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "receipts" }, () => {
        void refreshOrderQueries(qc);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void refreshOrderQueries(qc);
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: [...PENDING_ORDERS_KEY, limit ?? "all"],
    queryFn: () => fetchPendingOrders(limit),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
}

/** Drop an order from every cached pending list immediately (optimistic). */
export function removePendingOrderFromCache(qc: QueryClient, orderId: string) {
  qc.setQueriesData<PendingOrder[]>({ queryKey: PENDING_ORDERS_KEY }, (prev) =>
    prev ? prev.filter((o) => o.id !== orderId) : prev,
  );
}

/** Invalidate + await refetch of orders/receipts so the UI never shows a stale list. */
export async function refreshOrderQueries(qc: QueryClient) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: ["orders"] }),
    qc.invalidateQueries({ queryKey: ["receipts"] }),
    qc.invalidateQueries({ queryKey: ["order"] }),
  ]);
}
