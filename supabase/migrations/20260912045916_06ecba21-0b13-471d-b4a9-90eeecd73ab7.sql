CREATE POLICY "ops-photos insert staff" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ops-photos' AND owner = auth.uid() AND private.is_staff(auth.uid()));

CREATE POLICY "ops-photos read staff" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ops-photos' AND private.is_staff(auth.uid()));

CREATE POLICY "ops-photos admin delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'ops-photos' AND private.is_owner_or_admin(auth.uid()));