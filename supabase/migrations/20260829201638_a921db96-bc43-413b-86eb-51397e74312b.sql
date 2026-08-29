-- 1) Permission enum
CREATE TYPE public.app_permission AS ENUM (
  'products_view','products_write','products_delete','products_price_edit',
  'suppliers_view','suppliers_write','suppliers_delete',
  'invoices_view','invoices_create_match','invoices_update','invoices_delete','invoices_approve',
  'payments_view','payments_create','payments_manage',
  'orders_view','receipt_photos_view',
  'reports_dues','reports_export','reports_integrity'
);

-- 2) Table
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission public.app_permission NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

GRANT SELECT ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions read own"
  ON public.user_permissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role));

-- 3) has_permission helper (admins always true)
CREATE OR REPLACE FUNCTION private.has_permission(_user_id uuid, _permission public.app_permission)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id IS NOT NULL AND (
    private.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_permissions up
      WHERE up.user_id = _user_id AND up.permission = _permission
    )
  )
$$;

REVOKE ALL ON FUNCTION private.has_permission(uuid, public.app_permission) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_permission(uuid, public.app_permission) TO authenticated, service_role;

-- 4) Atomic setter (admin only)
CREATE OR REPLACE FUNCTION public.set_user_permissions(p_user_id uuid, p_permissions text[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid;
  new_count integer;
BEGIN
  caller := auth.uid();
  IF caller IS NULL THEN
    RAISE EXCEPTION 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً';
  END IF;
  IF NOT private.has_role(caller, 'admin'::app_role) THEN
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
  SELECT p_user_id, x::public.app_permission, caller
  FROM unnest(COALESCE(p_permissions, ARRAY[]::text[])) AS x
  ON CONFLICT (user_id, permission) DO NOTHING;

  SELECT count(*) INTO new_count FROM public.user_permissions WHERE user_id = p_user_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details)
  VALUES (caller, 'update_permissions', 'user_permissions', p_user_id,
          jsonb_build_object('permissions', COALESCE(p_permissions, ARRAY[]::text[])));

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_permissions(uuid, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_permissions(uuid, text[]) TO authenticated;

-- 5) Allow the new activity action/entity
CREATE OR REPLACE FUNCTION public.validate_activity_log_entry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed_actions text[] := ARRAY[
    'receive_order','create_order','update_order','cancel_order',
    'create_invoice','update_invoice','approve_invoice','delete_invoice',
    'create_payment','update_payment','delete_payment',
    'match_invoice','unmatch_invoice',
    'create_supplier','update_supplier','delete_supplier',
    'create_product','update_product','delete_product',
    'create_employee','update_employee','delete_employee',
    'telegram_notify','update_permissions'
  ];
  allowed_entities text[] := ARRAY[
    'orders','receipts','invoices','payments','invoice_matches',
    'suppliers','products','employees','user_permissions'
  ];
BEGIN
  IF NEW.action IS NULL OR NOT (NEW.action = ANY(allowed_actions)) THEN
    RAISE EXCEPTION 'invalid activity action: %', NEW.action;
  END IF;
  IF NEW.entity IS NOT NULL AND NOT (NEW.entity = ANY(allowed_entities)) THEN
    RAISE EXCEPTION 'invalid activity entity: %', NEW.entity;
  END IF;
  RETURN NEW;
END;
$$;

-- 6) Realtime
ALTER TABLE public.user_permissions REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_permissions;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 7) Permission-aware write policies
CREATE POLICY "products write by permission"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(auth.uid(), 'products_write'::app_permission));

CREATE POLICY "products update by permission"
  ON public.products FOR UPDATE TO authenticated
  USING (private.has_permission(auth.uid(), 'products_write'::app_permission))
  WITH CHECK (private.has_permission(auth.uid(), 'products_write'::app_permission));

CREATE POLICY "products delete by permission"
  ON public.products FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'products_delete'::app_permission));

CREATE POLICY "suppliers write by permission"
  ON public.suppliers FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(auth.uid(), 'suppliers_write'::app_permission));

CREATE POLICY "suppliers update by permission"
  ON public.suppliers FOR UPDATE TO authenticated
  USING (private.has_permission(auth.uid(), 'suppliers_write'::app_permission))
  WITH CHECK (private.has_permission(auth.uid(), 'suppliers_write'::app_permission));

CREATE POLICY "suppliers delete by permission"
  ON public.suppliers FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'suppliers_delete'::app_permission));

CREATE POLICY "payments insert by permission"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (private.has_permission(auth.uid(), 'payments_create'::app_permission));

CREATE POLICY "payments update by permission"
  ON public.payments FOR UPDATE TO authenticated
  USING (private.has_permission(auth.uid(), 'payments_manage'::app_permission))
  WITH CHECK (private.has_permission(auth.uid(), 'payments_manage'::app_permission));

CREATE POLICY "payments delete by permission"
  ON public.payments FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'payments_manage'::app_permission));

CREATE POLICY "invoices delete by permission"
  ON public.invoices FOR DELETE TO authenticated
  USING (private.has_permission(auth.uid(), 'invoices_delete'::app_permission));