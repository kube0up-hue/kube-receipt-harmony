
-- receipt-photos: authenticated can upload/read, admin manages
CREATE POLICY "receipt-photos read authed" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipt-photos');
CREATE POLICY "receipt-photos insert authed" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipt-photos' AND owner = auth.uid());
CREATE POLICY "receipt-photos admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'receipt-photos' AND public.has_role(auth.uid(),'admin'));

-- invoice-files: accountant/admin only
CREATE POLICY "invoice-files read acc" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'invoice-files' AND (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "invoice-files insert acc" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'invoice-files' AND (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin')) AND owner = auth.uid());
CREATE POLICY "invoice-files admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'invoice-files' AND public.has_role(auth.uid(),'admin'));

-- payment-proofs: admin only
CREATE POLICY "payment-proofs read acc" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "payment-proofs insert admin" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(),'admin') AND owner = auth.uid());
