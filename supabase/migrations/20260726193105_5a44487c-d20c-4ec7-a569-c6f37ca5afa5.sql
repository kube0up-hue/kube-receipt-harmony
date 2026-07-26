CREATE POLICY "payment-proofs admin delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-proofs' AND private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "payment-proofs admin update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'payment-proofs' AND private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'payment-proofs' AND private.has_role(auth.uid(), 'admin'::app_role) AND owner = auth.uid());

CREATE POLICY "invoice-files admin update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'invoice-files' AND private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'invoice-files' AND private.has_role(auth.uid(), 'admin'::app_role) AND owner = auth.uid());