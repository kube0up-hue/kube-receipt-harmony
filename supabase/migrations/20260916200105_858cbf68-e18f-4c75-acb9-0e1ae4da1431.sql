DROP POLICY "ai studio insert by permission" ON public.ai_kubeup_generations;
CREATE POLICY "ai studio insert by permission"
ON public.ai_kubeup_generations FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    private.has_perm(auth.uid(), 'ai_studio_use')
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.has_role(auth.uid(), 'owner'::public.app_role)
  )
);

DROP POLICY "ai studio update own by permission" ON public.ai_kubeup_generations;
CREATE POLICY "ai studio update own by permission"
ON public.ai_kubeup_generations FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

DROP POLICY "ai studio files insert" ON storage.objects;
CREATE POLICY "ai studio files insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('ai-kubeup-reference-images','ai-kubeup-generated-images')
  AND (
    private.has_perm(auth.uid(), 'ai_studio_use')
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.has_role(auth.uid(), 'owner'::public.app_role)
  )
);