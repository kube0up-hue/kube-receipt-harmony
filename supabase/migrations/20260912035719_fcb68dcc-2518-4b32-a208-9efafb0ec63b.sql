CREATE OR REPLACE FUNCTION public.fill_branch_from_employee()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.branch_id IS NULL THEN
    IF TG_TABLE_NAME = 'receipts' AND NEW.order_id IS NOT NULL THEN
      SELECT o.branch_id INTO NEW.branch_id FROM public.orders o WHERE o.id = NEW.order_id;
    END IF;
  END IF;
  IF NEW.branch_id IS NULL AND NEW.employee_id IS NOT NULL THEN
    SELECT e.branch_id INTO NEW.branch_id FROM public.employees e WHERE e.id = NEW.employee_id;
  END IF;
  IF NEW.branch_id IS NULL THEN
    SELECT id INTO NEW.branch_id FROM public.branches WHERE code = 'nakhla';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_orders_fill_branch BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.fill_branch_from_employee();

CREATE TRIGGER trg_receipts_fill_branch BEFORE INSERT ON public.receipts
FOR EACH ROW EXECUTE FUNCTION public.fill_branch_from_employee();

CREATE OR REPLACE FUNCTION public.fill_employee_branch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.branch_id IS NULL THEN
    SELECT id INTO NEW.branch_id FROM public.branches WHERE code = 'nakhla';
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_employees_fill_branch BEFORE INSERT ON public.employees
FOR EACH ROW EXECUTE FUNCTION public.fill_employee_branch();