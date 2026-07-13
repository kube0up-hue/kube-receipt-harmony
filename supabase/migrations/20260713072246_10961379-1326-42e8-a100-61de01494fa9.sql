
CREATE OR REPLACE VIEW public.v_orders_effective
WITH (security_invoker = on) AS
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
    WHEN o.status = 'cancelled' THEN 'cancelled'::order_status
    WHEN EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.order_id = o.id
        AND r.status IN ('submitted','approved')
    ) THEN 'received'::order_status
    ELSE 'pending_receipt'::order_status
  END AS effective_status
FROM public.orders o;

GRANT SELECT ON public.v_orders_effective TO authenticated;
GRANT SELECT ON public.v_orders_effective TO service_role;
