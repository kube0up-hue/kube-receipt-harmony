CREATE TABLE public.ai_kubeup_studio_settings (
  setting_key text PRIMARY KEY,
  brand_instruction text NOT NULL CHECK (char_length(brand_instruction) BETWEEN 20 AND 8000),
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ai_kubeup_studio_settings TO authenticated;
GRANT ALL ON public.ai_kubeup_studio_settings TO service_role;

ALTER TABLE public.ai_kubeup_studio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Studio users can read brand settings"
ON public.ai_kubeup_studio_settings
FOR SELECT TO authenticated
USING (
  private.has_perm(auth.uid(), 'ai_studio_use')
  OR private.has_role(auth.uid(), 'admin'::public.app_role)
  OR private.has_role(auth.uid(), 'owner'::public.app_role)
);

INSERT INTO public.ai_kubeup_studio_settings (setting_key, brand_instruction)
VALUES (
  'brand_identity',
  E'Create a premium original KUBEUP campaign image.\nKeep the result polished, modern, commercially refined, and visually premium.\nVisual direction: luxury minimal, cinematic, youthful premium coffee brand.\nUse a white and black base palette with subtle red accents only.\nMaintain clean composition, elegant lighting, premium product presentation, and a high-end commercial feel.\nIf reference images are provided, preserve the mood, lighting direction, and composition style while naturally integrating KUBEUP identity and product presentation.\nDo not make the result look pasted. Make it feel like an original KUBEUP creative campaign.'
);

CREATE OR REPLACE FUNCTION public.update_ai_kubeup_brand_instruction(p_instruction text)
RETURNS public.ai_kubeup_studio_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_old text;
  v_row public.ai_kubeup_studio_settings;
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'يجب تسجيل الدخول';
  END IF;

  IF NOT (
    private.has_role(v_actor, 'admin'::public.app_role)
    OR private.has_role(v_actor, 'owner'::public.app_role)
  ) THEN
    RAISE EXCEPTION 'لا تملك صلاحية تعديل هوية KUBEUP';
  END IF;

  p_instruction := btrim(p_instruction);
  IF char_length(p_instruction) < 20 OR char_length(p_instruction) > 8000 THEN
    RAISE EXCEPTION 'تعليمات الهوية يجب أن تكون بين 20 و8000 حرف';
  END IF;

  SELECT brand_instruction INTO v_old
  FROM public.ai_kubeup_studio_settings
  WHERE setting_key = 'brand_identity'
  FOR UPDATE;

  INSERT INTO public.ai_kubeup_studio_settings (setting_key, brand_instruction, updated_by, updated_at)
  VALUES ('brand_identity', p_instruction, v_actor, now())
  ON CONFLICT (setting_key) DO UPDATE SET
    brand_instruction = EXCLUDED.brand_instruction,
    updated_by = EXCLUDED.updated_by,
    updated_at = EXCLUDED.updated_at
  RETURNING * INTO v_row;

  INSERT INTO public.activity_log (
    actor_user, action, entity, details, old_value, new_value
  ) VALUES (
    v_actor,
    'update_ai_kubeup_brand_instruction',
    'ai_kubeup_studio_settings',
    jsonb_build_object('setting_key', 'brand_identity'),
    jsonb_build_object('brand_instruction', v_old),
    jsonb_build_object('brand_instruction', p_instruction)
  );

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.update_ai_kubeup_brand_instruction(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_ai_kubeup_brand_instruction(text) TO authenticated, service_role;