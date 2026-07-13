CREATE OR REPLACE FUNCTION public.prevent_duplicate_active_receipts()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  order_current_status public.order_status;
BEGIN
  IF NEW.status IN ('submitted'::receipt_status, 'approved'::receipt_status) THEN
    SELECT status INTO order_current_status
    FROM public.orders
    WHERE id = NEW.order_id;

    IF order_current_status = 'cancelled'::order_status THEN
      RAISE EXCEPTION 'لا يمكن تسجيل استلام لطلب ملغى';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.receipts r
      WHERE r.order_id = NEW.order_id
        AND r.id <> NEW.id
        AND r.status IN ('submitted'::receipt_status, 'approved'::receipt_status)
    ) THEN
      RAISE EXCEPTION 'هذا الطلب لديه استلام مسجل مسبقاً ولا يمكن استلامه مرة أخرى';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_duplicate_active_receipts ON public.receipts;
CREATE TRIGGER trg_prevent_duplicate_active_receipts
BEFORE INSERT OR UPDATE OF order_id, status ON public.receipts
FOR EACH ROW
EXECUTE FUNCTION public.prevent_duplicate_active_receipts();

CREATE UNIQUE INDEX IF NOT EXISTS receipts_one_active_receipt_per_order_idx
ON public.receipts (order_id)
WHERE status IN ('submitted'::receipt_status, 'approved'::receipt_status);