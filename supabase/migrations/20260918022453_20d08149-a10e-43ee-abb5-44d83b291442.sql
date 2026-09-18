ALTER TABLE public.quality_metrics ADD COLUMN IF NOT EXISTS requires_photo boolean NOT NULL DEFAULT false;

UPDATE public.quality_metrics SET label = 'جودة الماء (TDS)', unit = 'ppm', requires_photo = true, sort_order = 1, is_active = true WHERE code = 'water_tds';
UPDATE public.quality_metrics SET label = 'درجة حرارة الثلاجة 1', unit = '°م', sort_order = 2, is_active = true WHERE code = 'fridge_temp';
UPDATE public.quality_metrics SET is_active = false WHERE code IN ('water_ph','water_hardness','freezer_temp');

INSERT INTO public.quality_metrics (code, label, unit, min_ok, max_ok, is_active, sort_order)
SELECT 'fridge_temp_2', 'درجة حرارة الثلاجة 2', '°م', 1, 5, true, 3
WHERE NOT EXISTS (SELECT 1 FROM public.quality_metrics WHERE code = 'fridge_temp_2');

CREATE OR REPLACE FUNCTION public.compute_quality_reading_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE v_min numeric; v_max numeric;
BEGIN
  SELECT min_ok, max_ok INTO v_min, v_max FROM public.quality_metrics WHERE id = NEW.metric_id;
  NEW.status := 'ok';
  IF (v_min IS NOT NULL AND NEW.value < v_min) OR (v_max IS NOT NULL AND NEW.value > v_max) THEN
    NEW.status := 'out_of_range';
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.record_quality_reading(p_branch_id uuid, p_metric_id uuid, p_value numeric, p_note text DEFAULT NULL::text, p_photo_paths text[] DEFAULT '{}'::text[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  v_actor uuid := auth.uid();
  v_id uuid;
  v_status public.quality_status;
  v_min numeric; v_max numeric; v_requires_photo boolean; v_label text;
  v_note text := NULLIF(btrim(COALESCE(p_note,'')), '');
  v_photos text[] := COALESCE(p_photo_paths, '{}');
BEGIN
  IF NOT private.has_perm(v_actor, 'quality_record') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تسجيل قياسات الجودة';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF p_value IS NULL THEN RAISE EXCEPTION 'القيمة إلزامية'; END IF;

  SELECT min_ok, max_ok, requires_photo, label
    INTO v_min, v_max, v_requires_photo, v_label
  FROM public.quality_metrics WHERE id = p_metric_id AND is_active;
  IF v_label IS NULL THEN RAISE EXCEPTION 'القياس غير متاح'; END IF;

  IF v_requires_photo AND array_length(v_photos, 1) IS NULL THEN
    RAISE EXCEPTION 'صورة القياس إلزامية لهذا القياس';
  END IF;

  IF ((v_min IS NOT NULL AND p_value < v_min) OR (v_max IS NOT NULL AND p_value > v_max))
     AND v_note IS NULL THEN
    RAISE EXCEPTION 'القراءة خارج النطاق — الملاحظة إلزامية';
  END IF;

  INSERT INTO public.quality_readings (branch_id, metric_id, value, note, photo_paths, recorded_by)
  VALUES (p_branch_id, p_metric_id, p_value, v_note, v_photos, v_actor)
  RETURNING id, status INTO v_id, v_status;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'record_quality', 'quality_readings', v_id, p_branch_id,
    jsonb_build_object('value', p_value, 'status', v_status, 'metric', v_label));

  RETURN v_id;
END $function$;

CREATE OR REPLACE FUNCTION public.update_quality_metric_limits(p_metric_id uuid, p_min numeric, p_max numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE v_actor uuid := auth.uid(); v_label text; v_old jsonb;
BEGIN
  IF NOT (private.has_role(v_actor, 'admin') OR private.has_role(v_actor, 'owner')) THEN
    RAISE EXCEPTION 'المالك أو المدير فقط يستطيع تعديل الحدود';
  END IF;
  IF p_min IS NOT NULL AND p_max IS NOT NULL AND p_min > p_max THEN
    RAISE EXCEPTION 'الحد الأدنى أكبر من الحد الأعلى';
  END IF;

  SELECT label, jsonb_build_object('min_ok', min_ok, 'max_ok', max_ok)
    INTO v_label, v_old
  FROM public.quality_metrics WHERE id = p_metric_id;
  IF v_label IS NULL THEN RAISE EXCEPTION 'القياس غير موجود'; END IF;

  UPDATE public.quality_metrics
     SET min_ok = p_min, max_ok = p_max, updated_at = now()
   WHERE id = p_metric_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details, old_value, new_value)
  VALUES (v_actor, 'update_quality_metric', 'quality_metrics', p_metric_id,
    jsonb_build_object('metric', v_label), v_old,
    jsonb_build_object('min_ok', p_min, 'max_ok', p_max));
END $function$;

REVOKE ALL ON FUNCTION public.update_quality_metric_limits(uuid, numeric, numeric) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_quality_metric_limits(uuid, numeric, numeric) TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_activity_log_entry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  allowed_actions text[] := ARRAY[
    'receive_order','create_order','update_order','cancel_order','approve_order',
    'create_invoice','update_invoice','approve_invoice','delete_invoice',
    'create_payment','update_payment','delete_payment',
    'match_invoice','unmatch_invoice',
    'create_supplier','update_supplier','delete_supplier',
    'create_product','update_product','delete_product',
    'create_employee','update_employee','delete_employee',
    'telegram_notify','update_permissions','no_delivery',
    'create_branch','update_branch','update_branch_access',
    'stock_transfer','stock_transfer_receive','stock_adjust','stock_return',
    'count_open','count_submit','count_review','count_approve','count_edit_approved',
    'record_waste','record_quality','update_quality_metric',
    'record_sales','review_sales','approve_sales','edit_approved_sales',
    'create_recipe','update_recipe','update_schedule',
    'create_tomorrow_order','approve_tomorrow_order',
    'update_ai_kubeup_brand_instruction'
  ];
  allowed_entities text[] := ARRAY[
    'orders','receipts','invoices','payments','invoice_matches',
    'suppliers','products','employees','user_permissions',
    'branches','user_branches','stock_ledger','stock_transfers',
    'count_sessions','waste_entries','quality_readings','quality_metrics','daily_sales',
    'recipes','staff_shifts','tomorrow_orders','ai_kubeup_studio_settings'
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
$function$;