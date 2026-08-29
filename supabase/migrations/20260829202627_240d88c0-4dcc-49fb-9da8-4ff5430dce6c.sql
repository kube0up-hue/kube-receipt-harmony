-- Helper: is the caller an actual platform user (admin, accountant, or active branch employee)?
CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = _user_id)
    OR EXISTS (SELECT 1 FROM public.employees e WHERE e.user_id = _user_id AND e.is_active)
  )
$$;

REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO service_role;

-- orders / order_items
DROP POLICY IF EXISTS "orders read authed" ON public.orders;
CREATE POLICY "orders read staff" ON public.orders
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "order_items read authed" ON public.order_items;
CREATE POLICY "order_items read staff" ON public.order_items
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

-- receipts / receipt_items
DROP POLICY IF EXISTS "receipts read authed" ON public.receipts;
CREATE POLICY "receipts read staff" ON public.receipts
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "receipt_items read authed" ON public.receipt_items;
CREATE POLICY "receipt_items read staff" ON public.receipt_items
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

-- products (incl. unit_price)
DROP POLICY IF EXISTS "products read all authed" ON public.products;
CREATE POLICY "products read staff" ON public.products
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

-- suppliers (incl. contact_phone)
DROP POLICY IF EXISTS "suppliers read all authed" ON public.suppliers;
CREATE POLICY "suppliers read staff" ON public.suppliers
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()));

-- receipt_photos: allow scoped updates
DROP POLICY IF EXISTS "photos update scoped" ON public.receipt_photos;
CREATE POLICY "photos update scoped" ON public.receipt_photos
FOR UPDATE TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::app_role)
  OR (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_photos.receipt_id
        AND r.status IN ('draft'::receipt_status, 'returned_for_review'::receipt_status)
    )
  )
)
WITH CHECK (
  private.has_role(auth.uid(), 'admin'::app_role)
  OR (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.receipts r
      WHERE r.id = receipt_photos.receipt_id
        AND r.status IN ('draft'::receipt_status, 'returned_for_review'::receipt_status)
    )
  )
);