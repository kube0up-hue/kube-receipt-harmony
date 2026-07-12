
-- 1) Move has_role to a private (non-exposed) schema so PostgREST cannot call it
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
-- Ensure execute for RLS evaluation
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Recreate a wrapper in public? NO — we want it out of the exposed schema.
-- Existing policies reference the function by OID, so they keep working after SET SCHEMA.

-- 2) Employees: remove accountant from SELECT policy (protect pin_code)
DROP POLICY IF EXISTS "employees read own or admin" ON public.employees;
CREATE POLICY "employees read own or admin"
ON public.employees
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role));

-- 3) receipt-photos storage: restrict SELECT to uploader, receipt employee, admin, or accountant
DROP POLICY IF EXISTS "receipt-photos read authed" ON storage.objects;
CREATE POLICY "receipt-photos read scoped"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipt-photos'
  AND (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR private.has_role(auth.uid(), 'accountant'::app_role)
    OR EXISTS (
      SELECT 1
      FROM public.receipt_photos rp
      LEFT JOIN public.receipts r ON r.id = rp.receipt_id
      LEFT JOIN public.employees e ON e.id = r.employee_id
      WHERE rp.storage_path = storage.objects.name
        AND (
          rp.uploaded_by = auth.uid()
          OR r.received_by_user = auth.uid()
          OR e.user_id = auth.uid()
        )
    )
  )
);
