DROP VIEW public.v_orders_effective;
CREATE VIEW public.v_orders_effective
WITH (security_invoker = true) AS
SELECT id,
  order_number,
  order_date,
  expected_delivery_date,
  note,
  supplier_id,
  employee_id,
  created_by_user,
  created_at,
  branch_id,
  status AS stored_status,
  CASE
    WHEN status = 'cancelled'::order_status THEN 'cancelled'::order_status
    WHEN status = 'received'::order_status THEN 'received'::order_status
    WHEN (EXISTS ( SELECT 1
       FROM receipts r
      WHERE r.order_id = o.id AND (r.status = ANY (ARRAY['submitted'::receipt_status, 'approved'::receipt_status])))) THEN 'received'::order_status
    ELSE 'pending_receipt'::order_status
  END AS effective_status
FROM orders o;
GRANT SELECT ON public.v_orders_effective TO authenticated;