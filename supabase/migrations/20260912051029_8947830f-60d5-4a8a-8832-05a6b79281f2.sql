ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS hire_date date,
  ADD COLUMN IF NOT EXISTS note text;

CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  shift_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts_read" ON public.shifts FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));
CREATE POLICY "shifts_write" ON public.shifts FOR ALL TO authenticated
  USING (private.has_perm(auth.uid(), 'schedules_manage') AND private.has_branch_access(auth.uid(), branch_id))
  WITH CHECK (private.has_perm(auth.uid(), 'schedules_manage') AND private.has_branch_access(auth.uid(), branch_id));
CREATE TRIGGER shifts_updated_at BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX shifts_branch_date_idx ON public.shifts (branch_id, shift_date);

CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text,
  yield_qty numeric NOT NULL DEFAULT 1,
  yield_unit text NOT NULL DEFAULT 'حبة',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_read" ON public.recipes FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "recipes_write" ON public.recipes FOR ALL TO authenticated
  USING (private.has_perm(auth.uid(), 'recipes_manage'))
  WITH CHECK (private.has_perm(auth.uid(), 'recipes_manage'));
CREATE TRIGGER recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.recipe_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  version integer NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recipe_id, version)
);
GRANT SELECT, INSERT ON public.recipe_versions TO authenticated;
GRANT ALL ON public.recipe_versions TO service_role;
ALTER TABLE public.recipe_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_versions_read" ON public.recipe_versions FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
CREATE POLICY "recipe_versions_write" ON public.recipe_versions FOR INSERT TO authenticated
  WITH CHECK (private.has_perm(auth.uid(), 'recipes_manage'));