DROP FUNCTION IF EXISTS public.set_user_permissions(uuid, text[]);

CREATE OR REPLACE FUNCTION public.set_user_permissions(p_actor uuid, p_user_id uuid, p_permissions text[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_actor IS NULL OR NOT private.has_role(p_actor, 'admin'::app_role) THEN
    RAISE EXCEPTION 'غير مصرح: إدارة الصلاحيات للمدير فقط';
  END IF;
  IF p_user_id IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p_user_id) THEN
    RAISE EXCEPTION 'المستخدم غير موجود';
  END IF;
  IF private.has_role(p_user_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'المدير يملك كل الصلاحيات ولا يمكن تعديلها';
  END IF;

  DELETE FROM public.user_permissions up
  WHERE up.user_id = p_user_id
    AND NOT (up.permission::text = ANY(COALESCE(p_permissions, ARRAY[]::text[])));

  INSERT INTO public.user_permissions (user_id, permission, granted_by)
  SELECT p_user_id, x::public.app_permission, p_actor
  FROM unnest(COALESCE(p_permissions, ARRAY[]::text[])) AS x
  ON CONFLICT (user_id, permission) DO NOTHING;

  SELECT count(*) INTO new_count FROM public.user_permissions WHERE user_id = p_user_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details)
  VALUES (p_actor, 'update_permissions', 'user_permissions', p_user_id,
          jsonb_build_object('permissions', COALESCE(p_permissions, ARRAY[]::text[]), 'actor', p_actor));

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_permissions(uuid, uuid, text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_user_permissions(uuid, uuid, text[]) FROM anon;
REVOKE ALL ON FUNCTION public.set_user_permissions(uuid, uuid, text[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_permissions(uuid, uuid, text[]) TO service_role;