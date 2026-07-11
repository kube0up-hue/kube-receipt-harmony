
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin','accountant','branch_employee');
CREATE TYPE public.unit_type AS ENUM ('حبة','لتر','كيلو','كرتون','صينية','عبوة');
CREATE TYPE public.order_status AS ENUM ('pending_receipt','received','cancelled');
CREATE TYPE public.receipt_status AS ENUM ('draft','submitted','approved','returned_for_review','no_delivery');
CREATE TYPE public.receipt_item_status AS ENUM ('matched','short','over','not_delivered','has_damage');
CREATE TYPE public.billing_cycle AS ENUM ('weekly','biweekly','monthly','custom');
CREATE TYPE public.invoice_status AS ENUM ('pending_match','matched_ready','unmatched','approved_for_payment','paid');
CREATE TYPE public.invoice_match_status AS ENUM ('matched','invoice_higher','invoice_lower','in_invoice_not_received','received_not_in_invoice','has_damage_in_invoice','needs_review');
CREATE TYPE public.payment_method AS ENUM ('bank_transfer','cash','cheque','other');

-- =========================================
-- profiles
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =========================================
-- user_roles + has_role
-- =========================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles admin insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "roles self read" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- =========================================
-- employees (PIN-based branch employees)
-- =========================================
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  pin_code TEXT NOT NULL UNIQUE,
  branch TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees read own or admin" ON public.employees FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "employees admin manage" ON public.employees FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================
-- suppliers
-- =========================================
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  product_type TEXT,
  contact_phone TEXT,
  billing_cycle public.billing_cycle NOT NULL DEFAULT 'weekly',
  billing_period_start_day SMALLINT DEFAULT 5, -- 5 = Friday (ISO: 1=Mon..7=Sun)
  billing_period_end_day SMALLINT DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers read all authed" ON public.suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "suppliers admin manage" ON public.suppliers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================
-- products
-- =========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  unit public.unit_type NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products read all authed" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products admin manage" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================
-- orders + order_items
-- =========================================
CREATE SEQUENCE public.order_number_seq START 1000;
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT ('ORD-' || nextval('public.order_number_seq')::text),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
  created_by_user UUID REFERENCES auth.users(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  note TEXT,
  status public.order_status NOT NULL DEFAULT 'pending_receipt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders read authed" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders employee insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (created_by_user = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders update own pending or admin" ON public.orders FOR UPDATE TO authenticated
  USING ((created_by_user = auth.uid() AND status = 'pending_receipt') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  ordered_qty NUMERIC(12,3) NOT NULL CHECK (ordered_qty >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items read authed" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "order_items manage via order" ON public.order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND ((o.created_by_user = auth.uid() AND o.status='pending_receipt') OR public.has_role(auth.uid(),'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND ((o.created_by_user = auth.uid() AND o.status='pending_receipt') OR public.has_role(auth.uid(),'admin'))));

-- =========================================
-- receipts + receipt_items + receipt_photos
-- =========================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  received_by_user UUID REFERENCES auth.users(id),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.receipt_status NOT NULL DEFAULT 'submitted',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  note TEXT,
  total_ordered NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_received NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_accepted NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_damaged NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_short NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_over NUMERIC(14,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.receipts TO authenticated;
GRANT ALL ON public.receipts TO service_role;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receipts read authed" ON public.receipts FOR SELECT TO authenticated USING (true);
CREATE POLICY "receipts insert own" ON public.receipts FOR INSERT TO authenticated
  WITH CHECK (received_by_user = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "receipts update rules" ON public.receipts FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR (received_by_user = auth.uid() AND status = 'returned_for_review')
  );

CREATE TABLE public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  ordered_qty NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (ordered_qty >= 0),
  received_qty NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (received_qty >= 0),
  damaged_qty NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (damaged_qty >= 0),
  accepted_qty NUMERIC(12,3) NOT NULL DEFAULT 0,
  diff NUMERIC(12,3) NOT NULL DEFAULT 0,
  status public.receipt_item_status NOT NULL DEFAULT 'matched',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.receipt_items TO authenticated;
GRANT ALL ON public.receipt_items TO service_role;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receipt_items read authed" ON public.receipt_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "receipt_items manage via receipt" ON public.receipt_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND (public.has_role(auth.uid(),'admin') OR (r.received_by_user = auth.uid() AND r.status IN ('draft','returned_for_review')))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND (public.has_role(auth.uid(),'admin') OR (r.received_by_user = auth.uid() AND r.status IN ('draft','submitted','returned_for_review')))));

CREATE TABLE public.receipt_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.receipt_photos TO authenticated;
GRANT ALL ON public.receipt_photos TO service_role;
ALTER TABLE public.receipt_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos read authed" ON public.receipt_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "photos insert own" ON public.receipt_photos FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "photos delete admin" ON public.receipt_photos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

-- =========================================
-- invoices + invoice_items + invoice_matches + payments
-- =========================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  file_path TEXT,
  total_amount NUMERIC(14,3) NOT NULL DEFAULT 0,
  status public.invoice_status NOT NULL DEFAULT 'pending_match',
  accountant_note TEXT,
  admin_override_reason TEXT,
  admin_override_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_id, invoice_number)
);
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices accountant admin read" ON public.invoices FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "invoices accountant admin insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "invoices accountant admin update" ON public.invoices FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  invoiced_qty NUMERIC(12,3) NOT NULL CHECK (invoiced_qty >= 0),
  unit_price NUMERIC(12,3) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  line_total NUMERIC(14,3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items accountant admin all" ON public.invoice_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.invoice_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  total_ordered NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_received NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_damaged NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_accepted NUMERIC(14,3) NOT NULL DEFAULT 0,
  total_invoiced NUMERIC(14,3) NOT NULL DEFAULT 0,
  invoice_diff NUMERIC(14,3) NOT NULL DEFAULT 0,
  status public.invoice_match_status NOT NULL DEFAULT 'matched',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_matches TO authenticated;
GRANT ALL ON public.invoice_matches TO service_role;
ALTER TABLE public.invoice_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matches accountant admin all" ON public.invoice_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(14,3) NOT NULL CHECK (amount >= 0),
  method public.payment_method NOT NULL DEFAULT 'bank_transfer',
  reference_number TEXT,
  proof_path TEXT,
  note TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments read acc/admin" ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "payments admin insert" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- =========================================
-- activity_log
-- =========================================
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user UUID REFERENCES auth.users(id),
  actor_name TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity read admin" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "activity insert authed" ON public.activity_log FOR INSERT TO authenticated
  WITH CHECK (actor_user = auth.uid() OR actor_user IS NULL);

-- =========================================
-- Common trigger: updated_at
-- =========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_suppliers_updated BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_receipts_updated BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================
-- Trigger: compute receipt_item derived fields + status
-- =========================================
CREATE OR REPLACE FUNCTION public.compute_receipt_item_fields()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.accepted_qty := GREATEST(NEW.received_qty - NEW.damaged_qty, 0);
  NEW.diff := NEW.accepted_qty - NEW.ordered_qty;
  IF NEW.received_qty = 0 AND NEW.ordered_qty > 0 THEN
    NEW.status := 'not_delivered';
  ELSIF NEW.damaged_qty > 0 AND NEW.diff = 0 THEN
    NEW.status := 'has_damage';
  ELSIF NEW.diff = 0 THEN
    NEW.status := 'matched';
  ELSIF NEW.diff < 0 THEN
    NEW.status := 'short';
  ELSE
    NEW.status := 'over';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_receipt_items_compute BEFORE INSERT OR UPDATE ON public.receipt_items
  FOR EACH ROW EXECUTE FUNCTION public.compute_receipt_item_fields();

-- Trigger to recompute receipt totals
CREATE OR REPLACE FUNCTION public.recompute_receipt_totals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE rid UUID;
BEGIN
  rid := COALESCE(NEW.receipt_id, OLD.receipt_id);
  UPDATE public.receipts SET
    total_ordered = COALESCE((SELECT SUM(ordered_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_received = COALESCE((SELECT SUM(received_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_accepted = COALESCE((SELECT SUM(accepted_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_damaged = COALESCE((SELECT SUM(damaged_qty) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_short = COALESCE((SELECT SUM(CASE WHEN diff<0 THEN -diff ELSE 0 END) FROM public.receipt_items WHERE receipt_id = rid),0),
    total_over = COALESCE((SELECT SUM(CASE WHEN diff>0 THEN diff ELSE 0 END) FROM public.receipt_items WHERE receipt_id = rid),0)
  WHERE id = rid;
  RETURN NULL;
END; $$;
CREATE TRIGGER trg_receipt_items_totals AFTER INSERT OR UPDATE OR DELETE ON public.receipt_items
  FOR EACH ROW EXECUTE FUNCTION public.recompute_receipt_totals();

-- =========================================
-- Seed suppliers + products
-- =========================================
INSERT INTO public.suppliers (id, name, product_type, billing_cycle) VALUES
  ('11111111-1111-1111-1111-111111111111','معمل الحلا','حلويات وكيك','weekly'),
  ('22222222-2222-2222-2222-222222222222','معمل الكركديه','مشروبات','weekly');

INSERT INTO public.products (supplier_id, name, unit, sort_order) VALUES
  ('11111111-1111-1111-1111-111111111111','سلايس كيك بندق','حبة',1),
  ('11111111-1111-1111-1111-111111111111','مدريد كيوب','حبة',2),
  ('11111111-1111-1111-1111-111111111111','كرانشي كيك','حبة',3),
  ('11111111-1111-1111-1111-111111111111','دولتشي كيك','حبة',4),
  ('11111111-1111-1111-1111-111111111111','ماتيلدا كيك','حبة',5),
  ('11111111-1111-1111-1111-111111111111','سكوب كوكيز','حبة',6),
  ('22222222-2222-2222-2222-222222222222','آيس كركديه','لتر',1);
