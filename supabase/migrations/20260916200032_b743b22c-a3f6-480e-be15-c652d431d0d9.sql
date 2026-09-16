CREATE TABLE public.ai_kubeup_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  prompt text NOT NULL,
  final_prompt text NOT NULL,
  brand_mode boolean NOT NULL DEFAULT true,
  aspect_ratio text NOT NULL DEFAULT '1:1',
  resolution text NOT NULL DEFAULT '4K',
  model_name text NOT NULL DEFAULT 'gemini-3-pro-image',
  reference_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_image_url text,
  generated_image_path text,
  error_message text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_kubeup_generations_status_chk CHECK (status IN ('pending','processing','completed','failed')),
  CONSTRAINT ai_kubeup_generations_ratio_chk CHECK (aspect_ratio IN ('1:1','4:5','9:16','16:9','3:2'))
);

GRANT SELECT, INSERT, UPDATE ON public.ai_kubeup_generations TO authenticated;
GRANT ALL ON public.ai_kubeup_generations TO service_role;

ALTER TABLE public.ai_kubeup_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai studio read own or admin"
ON public.ai_kubeup_generations FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
  OR private.has_role(auth.uid(), 'owner'::public.app_role)
);

CREATE POLICY "ai studio insert by permission"
ON public.ai_kubeup_generations FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND private.has_perm(auth.uid(), 'ai_studio_use')
);

CREATE POLICY "ai studio update own by permission"
ON public.ai_kubeup_generations FOR UPDATE TO authenticated
USING (created_by = auth.uid() AND private.has_perm(auth.uid(), 'ai_studio_use'))
WITH CHECK (created_by = auth.uid());

CREATE TRIGGER ai_kubeup_generations_updated_at
BEFORE UPDATE ON public.ai_kubeup_generations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX ai_kubeup_generations_created_idx
ON public.ai_kubeup_generations (created_at DESC);

-- ملفات الاستوديو في المخزنين الخاصين
CREATE POLICY "ai studio files read"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id IN ('ai-kubeup-reference-images','ai-kubeup-generated-images')
  AND (
    private.has_perm(auth.uid(), 'ai_studio_use')
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.has_role(auth.uid(), 'owner'::public.app_role)
  )
);

CREATE POLICY "ai studio files insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('ai-kubeup-reference-images','ai-kubeup-generated-images')
  AND private.has_perm(auth.uid(), 'ai_studio_use')
);

CREATE POLICY "ai studio files delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id IN ('ai-kubeup-reference-images','ai-kubeup-generated-images')
  AND (
    owner = auth.uid()
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
    OR private.has_role(auth.uid(), 'owner'::public.app_role)
  )
);