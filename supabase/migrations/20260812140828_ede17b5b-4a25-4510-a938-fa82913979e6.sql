DROP POLICY IF EXISTS "photos read authed" ON public.receipt_photos;

CREATE POLICY "photos read scoped"
ON public.receipt_photos
FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR private.has_role(auth.uid(), 'admin')
  OR private.has_role(auth.uid(), 'accountant')
  OR EXISTS (
    SELECT 1
    FROM public.receipts r
    LEFT JOIN public.employees e ON e.id = r.employee_id
    WHERE r.id = receipt_photos.receipt_id
      AND (r.received_by_user = auth.uid() OR e.user_id = auth.uid())
  )
);