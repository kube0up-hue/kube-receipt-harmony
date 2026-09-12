-- ============ الأنواع ============
DO $$ BEGIN
  CREATE TYPE public.waste_reason AS ENUM ('expired','damaged','spillage','prep_error','quality','customer_return','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.quality_status AS ENUM ('ok','warn','out_of_range');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sales_status AS ENUM ('draft','submitted','approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ الهدر ============
CREATE TABLE public.waste_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  waste_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Riyadh')::date,
  qty numeric NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL DEFAULT 0,
  waste_value numeric NOT NULL DEFAULT 0,
  reason_code public.waste_reason NOT NULL,
  reason text NOT NULL,
  note text,
  photo_paths text[] NOT NULL DEFAULT '{}',
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_waste_branch_date ON public.waste_entries (branch_id, waste_date DESC);
GRANT SELECT ON public.waste_entries TO authenticated;
GRANT ALL ON public.waste_entries TO service_role;
ALTER TABLE public.waste_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waste readable by branch staff" ON public.waste_entries
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

-- ============ مقاييس الجودة ============
CREATE TABLE public.quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  unit text NOT NULL DEFAULT '',
  min_ok numeric,
  max_ok numeric,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quality_metrics TO authenticated;
GRANT ALL ON public.quality_metrics TO service_role;
ALTER TABLE public.quality_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics readable by staff" ON public.quality_metrics
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE TRIGGER trg_quality_metrics_updated BEFORE UPDATE ON public.quality_metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.quality_metrics (code, label, unit, min_ok, max_ok, sort_order) VALUES
  ('water_tds','ملوحة الماء (TDS)','ppm', 30, 90, 1),
  ('water_ph','درجة الحموضة (pH)','', 6.5, 8.5, 2),
  ('water_hardness','صلابة الماء','GH', 3, 8, 3),
  ('fridge_temp','حرارة الثلاجة','°م', 1, 5, 4),
  ('freezer_temp','حرارة الفريزر','°م', -22, -16, 5);

-- ============ قياسات الجودة ============
CREATE TABLE public.quality_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  metric_id uuid NOT NULL REFERENCES public.quality_metrics(id),
  value numeric NOT NULL,
  status public.quality_status NOT NULL DEFAULT 'ok',
  note text,
  photo_paths text[] NOT NULL DEFAULT '{}',
  reading_at timestamptz NOT NULL DEFAULT now(),
  recorded_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quality_branch_time ON public.quality_readings (branch_id, reading_at DESC);
GRANT SELECT ON public.quality_readings TO authenticated;
GRANT ALL ON public.quality_readings TO service_role;
ALTER TABLE public.quality_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quality readable by branch staff" ON public.quality_readings
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

CREATE OR REPLACE FUNCTION public.compute_quality_reading_status()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_min numeric; v_max numeric; v_margin numeric;
BEGIN
  SELECT min_ok, max_ok INTO v_min, v_max FROM public.quality_metrics WHERE id = NEW.metric_id;
  NEW.status := 'ok';
  v_margin := GREATEST(ABS(COALESCE(v_max, v_min, 1)) * 0.1, 0.2);
  IF v_min IS NOT NULL AND NEW.value < v_min THEN
    NEW.status := CASE WHEN NEW.value >= v_min - v_margin THEN 'warn' ELSE 'out_of_range' END;
  ELSIF v_max IS NOT NULL AND NEW.value > v_max THEN
    NEW.status := CASE WHEN NEW.value <= v_max + v_margin THEN 'warn' ELSE 'out_of_range' END;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_quality_status BEFORE INSERT OR UPDATE ON public.quality_readings
  FOR EACH ROW EXECUTE FUNCTION public.compute_quality_reading_status();

-- ============ المبيعات اليومية ============
CREATE TABLE public.daily_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  sales_date date NOT NULL,
  total_sales numeric NOT NULL DEFAULT 0 CHECK (total_sales >= 0),
  cash_amount numeric NOT NULL DEFAULT 0 CHECK (cash_amount >= 0),
  card_amount numeric NOT NULL DEFAULT 0 CHECK (card_amount >= 0),
  other_amount numeric NOT NULL DEFAULT 0 CHECK (other_amount >= 0),
  orders_count integer NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
  note text,
  status public.sales_status NOT NULL DEFAULT 'draft',
  recorded_by uuid REFERENCES auth.users(id),
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, sales_date)
);
GRANT SELECT ON public.daily_sales TO authenticated;
GRANT ALL ON public.daily_sales TO service_role;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales readable by branch staff" ON public.daily_sales
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));
CREATE TRIGGER trg_daily_sales_updated BEFORE UPDATE ON public.daily_sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ العمليات ============
CREATE OR REPLACE FUNCTION public.record_waste(
  p_branch_id uuid,
  p_product_id uuid,
  p_qty numeric,
  p_reason_code text,
  p_reason text,
  p_note text DEFAULT NULL,
  p_photo_paths text[] DEFAULT '{}',
  p_waste_date date DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_id uuid; v_price numeric; v_date date;
BEGIN
  IF NOT private.has_perm(v_actor, 'waste_record') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تسجيل الهدر';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF COALESCE(p_qty, 0) <= 0 THEN RAISE EXCEPTION 'الكمية يجب أن تكون أكبر من صفر'; END IF;
  IF length(COALESCE(btrim(p_reason), '')) < 3 THEN RAISE EXCEPTION 'شرح سبب الهدر إلزامي'; END IF;
  IF p_photo_paths IS NULL OR array_length(p_photo_paths, 1) IS NULL THEN
    RAISE EXCEPTION 'صورة الإثبات إلزامية';
  END IF;

  SELECT unit_price INTO v_price FROM public.products WHERE id = p_product_id;
  IF v_price IS NULL THEN RAISE EXCEPTION 'الصنف غير موجود'; END IF;
  v_date := COALESCE(p_waste_date, (now() AT TIME ZONE 'Asia/Riyadh')::date);

  INSERT INTO public.waste_entries (
    branch_id, product_id, waste_date, qty, unit_price, waste_value,
    reason_code, reason, note, photo_paths, recorded_by)
  VALUES (p_branch_id, p_product_id, v_date, p_qty, v_price, p_qty * v_price,
    p_reason_code::public.waste_reason, btrim(p_reason), NULLIF(btrim(COALESCE(p_note,'')), ''), p_photo_paths, v_actor)
  RETURNING id INTO v_id;

  PERFORM private.post_stock(p_branch_id, p_product_id, -p_qty, 'waste', 'waste_entries', v_id,
    btrim(p_reason), v_actor);

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'record_waste', 'waste_entries', v_id, p_branch_id,
    jsonb_build_object('qty', p_qty, 'value', p_qty * v_price, 'reason_code', p_reason_code, 'reason', btrim(p_reason)));

  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.record_quality_reading(
  p_branch_id uuid,
  p_metric_id uuid,
  p_value numeric,
  p_note text DEFAULT NULL,
  p_photo_paths text[] DEFAULT '{}'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_id uuid; v_status public.quality_status;
BEGIN
  IF NOT private.has_perm(v_actor, 'quality_record') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تسجيل قياسات الجودة';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF p_value IS NULL THEN RAISE EXCEPTION 'القيمة إلزامية'; END IF;

  INSERT INTO public.quality_readings (branch_id, metric_id, value, note, photo_paths, recorded_by)
  VALUES (p_branch_id, p_metric_id, p_value, NULLIF(btrim(COALESCE(p_note,'')), ''), COALESCE(p_photo_paths,'{}'), v_actor)
  RETURNING id, status INTO v_id, v_status;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'record_quality', 'quality_readings', v_id, p_branch_id,
    jsonb_build_object('value', p_value, 'status', v_status));

  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.save_daily_sales(
  p_branch_id uuid,
  p_sales_date date,
  p_total numeric,
  p_cash numeric DEFAULT 0,
  p_card numeric DEFAULT 0,
  p_other numeric DEFAULT 0,
  p_orders_count integer DEFAULT 0,
  p_note text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_id uuid; v_status public.sales_status;
BEGIN
  IF NOT private.has_perm(v_actor, 'sales_record') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تسجيل المبيعات';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF COALESCE(p_total, 0) < 0 THEN RAISE EXCEPTION 'المبلغ غير صحيح'; END IF;

  SELECT id, status INTO v_id, v_status FROM public.daily_sales
  WHERE branch_id = p_branch_id AND sales_date = p_sales_date;

  IF v_id IS NULL THEN
    INSERT INTO public.daily_sales (branch_id, sales_date, total_sales, cash_amount, card_amount,
      other_amount, orders_count, note, status, recorded_by)
    VALUES (p_branch_id, p_sales_date, p_total, COALESCE(p_cash,0), COALESCE(p_card,0),
      COALESCE(p_other,0), COALESCE(p_orders_count,0), NULLIF(btrim(COALESCE(p_note,'')),''), 'draft', v_actor)
    RETURNING id INTO v_id;
  ELSE
    IF v_status = 'approved' THEN
      RAISE EXCEPTION 'المبيعات معتمدة — التعديل يحتاج صلاحية تعديل مبيعات معتمدة';
    END IF;
    UPDATE public.daily_sales SET
      total_sales = p_total, cash_amount = COALESCE(p_cash,0), card_amount = COALESCE(p_card,0),
      other_amount = COALESCE(p_other,0), orders_count = COALESCE(p_orders_count,0),
      note = NULLIF(btrim(COALESCE(p_note,'')),''), status = 'draft', recorded_by = v_actor,
      submitted_by = NULL, submitted_at = NULL, reviewed_by = NULL, reviewed_at = NULL, review_note = NULL
    WHERE id = v_id;
  END IF;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'record_sales', 'daily_sales', v_id, p_branch_id,
    jsonb_build_object('date', p_sales_date, 'total', p_total));

  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.submit_daily_sales(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_row public.daily_sales;
BEGIN
  SELECT * INTO v_row FROM public.daily_sales WHERE id = p_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'السجل غير موجود'; END IF;
  IF NOT private.has_perm(v_actor, 'sales_record') THEN RAISE EXCEPTION 'لا تملك صلاحية تسجيل المبيعات'; END IF;
  IF NOT private.has_branch_access(v_actor, v_row.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF v_row.status <> 'draft' THEN RAISE EXCEPTION 'لا يمكن الإرسال في هذه الحالة'; END IF;
  IF v_row.total_sales <= 0 THEN RAISE EXCEPTION 'أدخل إجمالي المبيعات قبل الإرسال'; END IF;

  UPDATE public.daily_sales SET status = 'submitted', submitted_by = v_actor, submitted_at = now() WHERE id = p_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'record_sales', 'daily_sales', p_id, v_row.branch_id,
    jsonb_build_object('event', 'submitted', 'total', v_row.total_sales));
END $$;

CREATE OR REPLACE FUNCTION public.review_daily_sales(p_id uuid, p_accept boolean, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_row public.daily_sales;
BEGIN
  SELECT * INTO v_row FROM public.daily_sales WHERE id = p_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'السجل غير موجود'; END IF;
  IF NOT private.has_perm(v_actor, 'sales_review') THEN RAISE EXCEPTION 'لا تملك صلاحية مراجعة المبيعات'; END IF;
  IF NOT private.has_branch_access(v_actor, v_row.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF v_row.status <> 'submitted' THEN RAISE EXCEPTION 'لا يمكن المراجعة في هذه الحالة'; END IF;

  IF p_accept THEN
    UPDATE public.daily_sales SET status = 'approved', reviewed_by = v_actor, reviewed_at = now(),
      review_note = NULLIF(btrim(COALESCE(p_note,'')),'') WHERE id = p_id;
    INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
    VALUES (v_actor, 'approve_sales', 'daily_sales', p_id, v_row.branch_id,
      jsonb_build_object('total', v_row.total_sales));
  ELSE
    IF length(COALESCE(btrim(p_note), '')) < 3 THEN RAISE EXCEPTION 'سبب الإرجاع إلزامي'; END IF;
    UPDATE public.daily_sales SET status = 'draft', reviewed_by = v_actor, reviewed_at = now(),
      review_note = btrim(p_note) WHERE id = p_id;
    INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
    VALUES (v_actor, 'review_sales', 'daily_sales', p_id, v_row.branch_id,
      jsonb_build_object('event', 'returned', 'reason', btrim(p_note)));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.edit_approved_daily_sales(
  p_id uuid, p_total numeric, p_cash numeric, p_card numeric, p_other numeric,
  p_orders_count integer, p_reason text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, private AS $$
DECLARE v_actor uuid := auth.uid(); v_row public.daily_sales;
BEGIN
  SELECT * INTO v_row FROM public.daily_sales WHERE id = p_id;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'السجل غير موجود'; END IF;
  IF NOT private.has_perm(v_actor, 'sales_edit_approved') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تعديل مبيعات معتمدة';
  END IF;
  IF NOT private.has_branch_access(v_actor, v_row.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF length(COALESCE(btrim(p_reason), '')) < 3 THEN RAISE EXCEPTION 'سبب التعديل إلزامي'; END IF;

  UPDATE public.daily_sales SET
    total_sales = p_total, cash_amount = COALESCE(p_cash,0), card_amount = COALESCE(p_card,0),
    other_amount = COALESCE(p_other,0), orders_count = COALESCE(p_orders_count,0)
  WHERE id = p_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details, old_value, new_value)
  VALUES (v_actor, 'edit_approved_sales', 'daily_sales', p_id, v_row.branch_id,
    jsonb_build_object('reason', btrim(p_reason)),
    jsonb_build_object('total', v_row.total_sales, 'cash', v_row.cash_amount, 'card', v_row.card_amount,
      'other', v_row.other_amount, 'orders', v_row.orders_count),
    jsonb_build_object('total', p_total, 'cash', p_cash, 'card', p_card, 'other', p_other, 'orders', p_orders_count));
END $$;

-- الصلاحيات على الدوال
REVOKE EXECUTE ON FUNCTION public.record_waste(uuid, uuid, numeric, text, text, text, text[], date) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_quality_reading(uuid, uuid, numeric, text, text[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.save_daily_sales(uuid, date, numeric, numeric, numeric, numeric, integer, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_daily_sales(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.review_daily_sales(uuid, boolean, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.edit_approved_daily_sales(uuid, numeric, numeric, numeric, numeric, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_waste(uuid, uuid, numeric, text, text, text, text[], date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_quality_reading(uuid, uuid, numeric, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_daily_sales(uuid, date, numeric, numeric, numeric, numeric, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_daily_sales(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_daily_sales(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.edit_approved_daily_sales(uuid, numeric, numeric, numeric, numeric, integer, text) TO authenticated;