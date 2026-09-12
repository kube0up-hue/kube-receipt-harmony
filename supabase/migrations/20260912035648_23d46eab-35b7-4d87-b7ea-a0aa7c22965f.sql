-- ============ 1) الأدوار والصلاحيات الجديدة ============
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'branch_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'operations';

ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches_manage';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'branches_view_all';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'inventory_view';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'inventory_transfer';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'inventory_receive_transfer';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'inventory_adjust';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'count_perform';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'count_review';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'count_approve';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'count_edit_approved';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'waste_record';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'waste_view';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quality_record';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'quality_view';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'sales_record';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'sales_review';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'sales_edit_approved';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'recipes_manage';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'schedules_manage';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'employees_manage';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'orders_create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'orders_approve';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'orders_receive';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'tomorrow_orders_create';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'tomorrow_orders_approve';
ALTER TYPE public.app_permission ADD VALUE IF NOT EXISTS 'alerts_view';

-- ============ 2) جدول الفروع ============
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'branch' CHECK (kind IN ('branch','warehouse')),
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.branches (name, code, kind, sort_order) VALUES
  ('فرع نخلة', 'nakhla', 'branch', 1),
  ('فرع سلطانة', 'sultana', 'branch', 2),
  ('المستودع', 'warehouse', 'warehouse', 3);

-- ============ 3) وصول المستخدمين للفروع ============
CREATE TABLE public.user_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, branch_id)
);
CREATE INDEX idx_user_branches_user ON public.user_branches(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_branches TO authenticated;
GRANT ALL ON public.user_branches TO service_role;
ALTER TABLE public.user_branches ENABLE ROW LEVEL SECURITY;

-- ============ 4) ربط الجداول القائمة بالفرع ============
ALTER TABLE public.employees ADD COLUMN branch_id uuid REFERENCES public.branches(id);
ALTER TABLE public.orders    ADD COLUMN branch_id uuid REFERENCES public.branches(id);
ALTER TABLE public.receipts  ADD COLUMN branch_id uuid REFERENCES public.branches(id);

UPDATE public.employees e SET branch_id = b.id
FROM public.branches b
WHERE e.branch_id IS NULL
  AND b.name = CASE
    WHEN e.branch IS NULL OR btrim(e.branch) = '' THEN 'فرع نخلة'
    WHEN e.branch ILIKE '%سلطان%' THEN 'فرع سلطانة'
    WHEN e.branch ILIKE '%مستودع%' THEN 'المستودع'
    ELSE 'فرع نخلة'
  END;

UPDATE public.orders o SET branch_id = COALESCE(
  (SELECT e.branch_id FROM public.employees e WHERE e.id = o.employee_id),
  (SELECT id FROM public.branches WHERE code = 'nakhla')
) WHERE o.branch_id IS NULL;

UPDATE public.receipts r SET branch_id = COALESCE(
  (SELECT o.branch_id FROM public.orders o WHERE o.id = r.order_id),
  (SELECT e.branch_id FROM public.employees e WHERE e.id = r.employee_id),
  (SELECT id FROM public.branches WHERE code = 'nakhla')
) WHERE r.branch_id IS NULL;

ALTER TABLE public.employees ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE public.orders    ALTER COLUMN branch_id SET NOT NULL;
ALTER TABLE public.receipts  ALTER COLUMN branch_id SET NOT NULL;

CREATE INDEX idx_orders_branch ON public.orders(branch_id);
CREATE INDEX idx_receipts_branch ON public.receipts(branch_id);
CREATE INDEX idx_employees_branch ON public.employees(branch_id);

-- ============ 5) سجل التدقيق: الفرع والقيم ============
ALTER TABLE public.activity_log ADD COLUMN branch_id uuid REFERENCES public.branches(id);
ALTER TABLE public.activity_log ADD COLUMN old_value jsonb;
ALTER TABLE public.activity_log ADD COLUMN new_value jsonb;

-- ============ 6) دوال الحوكمة ============
CREATE OR REPLACE FUNCTION private.is_owner_or_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role::text IN ('admin','owner')
  );
$$;

CREATE OR REPLACE FUNCTION private.has_perm(_user_id uuid, _perm text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (
    private.is_owner_or_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_permissions up
      WHERE up.user_id = _user_id AND up.permission::text = _perm
    )
  );
$$;

CREATE OR REPLACE FUNCTION private.has_branch_access(_user_id uuid, _branch_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _user_id IS NOT NULL AND (
    _branch_id IS NULL
    OR private.is_owner_or_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_permissions up
      WHERE up.user_id = _user_id AND up.permission::text = 'branches_view_all'
    )
    OR EXISTS (
      SELECT 1 FROM public.user_branches ub
      WHERE ub.user_id = _user_id AND ub.branch_id = _branch_id
    )
    OR EXISTS (
      SELECT 1 FROM public.employees e
      WHERE e.user_id = _user_id AND e.is_active AND e.branch_id = _branch_id
    )
  );
$$;

-- ============ 7) سياسات الفروع ووصول المستخدمين ============
CREATE POLICY "branches read accessible" ON public.branches
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), id));

CREATE POLICY "branches manage" ON public.branches
FOR ALL TO authenticated
USING (private.has_perm(auth.uid(), 'branches_manage'))
WITH CHECK (private.has_perm(auth.uid(), 'branches_manage'));

CREATE POLICY "user_branches read own or admin" ON public.user_branches
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_owner_or_admin(auth.uid()));

CREATE POLICY "user_branches manage" ON public.user_branches
FOR ALL TO authenticated
USING (private.has_perm(auth.uid(), 'branches_manage'))
WITH CHECK (private.has_perm(auth.uid(), 'branches_manage'));

-- ============ 8) تقييد الجداول القائمة بالفرع ============
DROP POLICY IF EXISTS "orders read staff" ON public.orders;
CREATE POLICY "orders read staff in branch" ON public.orders
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

DROP POLICY IF EXISTS "receipts read staff" ON public.receipts;
CREATE POLICY "receipts read staff in branch" ON public.receipts
FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

DROP POLICY IF EXISTS "order_items read staff" ON public.order_items;
CREATE POLICY "order_items read staff in branch" ON public.order_items
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = order_items.order_id
    AND private.is_staff(auth.uid())
    AND private.has_branch_access(auth.uid(), o.branch_id)
));

DROP POLICY IF EXISTS "receipt_items read staff" ON public.receipt_items;
CREATE POLICY "receipt_items read staff in branch" ON public.receipt_items
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.receipts r
  WHERE r.id = receipt_items.receipt_id
    AND private.is_staff(auth.uid())
    AND private.has_branch_access(auth.uid(), r.branch_id)
));

DROP POLICY IF EXISTS "employees read own or admin" ON public.employees;
CREATE POLICY "employees read own or branch" ON public.employees
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR private.is_owner_or_admin(auth.uid())
  OR (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id))
);