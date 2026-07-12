
-- 1) invoices: allow admin to delete
CREATE POLICY "invoices admin delete" ON public.invoices
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 2) payments: allow admin update + delete
CREATE POLICY "payments admin update" ON public.payments
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "payments admin delete" ON public.payments
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- 3) invoice_matches: scope by ownership of parent invoice for accountant; admin has full access
DROP POLICY IF EXISTS "matches accountant admin all" ON public.invoice_matches;

CREATE POLICY "matches admin all" ON public.invoice_matches
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "matches accountant own" ON public.invoice_matches
  FOR ALL TO authenticated
  USING (
    private.has_role(auth.uid(), 'accountant'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_matches.invoice_id
        AND i.created_by = auth.uid()
    )
  )
  WITH CHECK (
    private.has_role(auth.uid(), 'accountant'::app_role)
    AND EXISTS (
      SELECT 1 FROM public.invoices i
      WHERE i.id = invoice_matches.invoice_id
        AND i.created_by = auth.uid()
    )
  );
