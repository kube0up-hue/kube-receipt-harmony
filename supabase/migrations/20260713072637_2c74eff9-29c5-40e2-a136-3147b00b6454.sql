CREATE OR REPLACE FUNCTION public.recompute_receipt_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  rid UUID;
BEGIN
  rid := COALESCE(NEW.receipt_id, OLD.receipt_id);

  UPDATE public.receipts SET
    total_ordered = COALESCE((SELECT SUM(ordered_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_received = COALESCE((SELECT SUM(received_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_accepted = COALESCE((SELECT SUM(accepted_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_damaged = COALESCE((SELECT SUM(damaged_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_short = COALESCE((SELECT SUM(CASE WHEN diff<0 THEN -diff ELSE 0 END) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_over = COALESCE((SELECT SUM(CASE WHEN diff>0 THEN diff ELSE 0 END) FROM public.receipt_items WHERE receipt_id = rid),0)
  WHERE id = rid;

  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_order_status_regression()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'pending_receipt'::order_status
     AND (
       OLD.status = 'received'::order_status
       OR EXISTS (
         SELECT 1
         FROM public.receipts r
         WHERE r.order_id = OLD.id
           AND r.status IN ('submitted'::receipt_status, 'approved'::receipt_status)
       )
     ) THEN
    RAISE EXCEPTION 'لا يمكن إعادة طلب مستلم أو لديه سجل استلام إلى حالة بانتظار الاستلام';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_order_status_from_receipts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_order_id uuid;
BEGIN
  affected_order_id := COALESCE(NEW.order_id, OLD.order_id);

  IF affected_order_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.receipts r
    WHERE r.order_id = affected_order_id
      AND r.status IN ('submitted'::receipt_status, 'approved'::receipt_status)
  ) THEN
    UPDATE public.orders
    SET status = 'received'::order_status,
        updated_at = now()
    WHERE id = affected_order_id
      AND status <> 'cancelled'::order_status;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

DROP TRIGGER IF EXISTS trg_sync_order_status_from_receipts ON public.receipts;
CREATE TRIGGER trg_sync_order_status_from_receipts
AFTER INSERT OR UPDATE OF order_id, status OR DELETE ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_status_from_receipts();

DROP VIEW IF EXISTS public.v_orders_effective;
CREATE VIEW public.v_orders_effective
WITH (security_invoker=on) AS
SELECT
  o.id,
  o.order_number,
  o.order_date,
  o.expected_delivery_date,
  o.note,
  o.supplier_id,
  o.employee_id,
  o.created_by_user,
  o.created_at,
  o.status AS stored_status,
  CASE
    WHEN o.status = 'cancelled'::order_status THEN 'cancelled'::order_status
    WHEN o.status = 'received'::order_status THEN 'received'::order_status
    WHEN EXISTS (
      SELECT 1
      FROM public.receipts r
      WHERE r.order_id = o.id
        AND r.status IN ('submitted'::receipt_status, 'approved'::receipt_status)
    ) THEN 'received'::order_status
    ELSE 'pending_receipt'::order_status
  END AS effective_status
FROM public.orders o;

GRANT SELECT ON public.v_orders_effective TO authenticated;
GRANT SELECT ON public.v_orders_effective TO service_role;