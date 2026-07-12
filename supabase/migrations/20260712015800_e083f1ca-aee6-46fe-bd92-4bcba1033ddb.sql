
DROP POLICY IF EXISTS "orders update own pending or admin" ON public.orders;
CREATE POLICY "orders update pending by employee or admin"
ON public.orders FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (status = 'pending_receipt'::order_status AND (
    has_role(auth.uid(), 'branch_employee'::app_role)
    OR created_by_user = auth.uid()
  ))
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'branch_employee'::app_role)
  OR created_by_user = auth.uid()
);
