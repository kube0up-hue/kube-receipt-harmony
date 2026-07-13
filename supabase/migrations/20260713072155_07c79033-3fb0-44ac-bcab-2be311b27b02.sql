
CREATE OR REPLACE FUNCTION public.prevent_order_status_regression()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'received' AND NEW.status = 'pending_receipt' THEN
    RAISE EXCEPTION 'لا يمكن إعادة طلب مستلم إلى حالة بانتظار الاستلام';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_order_status_regression ON public.orders;
CREATE TRIGGER trg_prevent_order_status_regression
BEFORE UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_order_status_regression();
