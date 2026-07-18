
ALTER TABLE public.receipt_photos
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS receipt_photos_receipt_product_idx
  ON public.receipt_photos(receipt_id, product_id);

DROP FUNCTION IF EXISTS public.submit_order_receipt(uuid,uuid,text,jsonb,jsonb);

CREATE OR REPLACE FUNCTION public.submit_order_receipt(
  p_receipt_id uuid,
  p_order_id uuid,
  p_note text,
  p_items jsonb,
  p_photos jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  current_employee_id uuid;
  current_supplier_id uuid;
  current_order_number text;
  current_order_status public.order_status;
  expected_count integer;
  supplied_count integer;
  matched_count integer;
  has_issue boolean;
  missing_issue_notes boolean;
  missing_product_photos boolean;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'جلسة منتهية، يرجى تسجيل الدخول مجدداً';
  END IF;

  IF p_receipt_id IS NULL OR p_order_id IS NULL THEN
    RAISE EXCEPTION 'بيانات الاستلام غير مكتملة';
  END IF;

  SELECT id INTO current_employee_id
  FROM public.employees
  WHERE user_id = current_user_id AND is_active = true LIMIT 1;

  IF current_employee_id IS NULL THEN
    RAISE EXCEPTION 'الموظف غير موجود أو غير نشط';
  END IF;

  SELECT supplier_id, order_number, status
    INTO current_supplier_id, current_order_number, current_order_status
  FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF current_supplier_id IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;
  IF current_order_status = 'cancelled'::order_status THEN
    RAISE EXCEPTION 'لا يمكن استلام طلب ملغى';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.receipts r
    WHERE r.order_id = p_order_id
      AND r.status IN ('submitted'::receipt_status, 'approved'::receipt_status)
  ) THEN
    RAISE EXCEPTION 'هذا الطلب مستلم مسبقاً ولن يعود إلى بانتظار الاستلام';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'بنود الاستلام غير صحيحة';
  END IF;
  IF p_photos IS NULL OR jsonb_typeof(p_photos) <> 'array' THEN
    RAISE EXCEPTION 'صور الاستلام غير صحيحة';
  END IF;

  SELECT COUNT(*) INTO expected_count FROM public.order_items WHERE order_id = p_order_id;

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  )
  SELECT COUNT(*), COUNT(DISTINCT product_id) INTO supplied_count, matched_count FROM submitted_items;

  IF supplied_count <> matched_count THEN
    RAISE EXCEPTION 'يوجد تكرار في منتجات الاستلام';
  END IF;

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  )
  SELECT COUNT(*) INTO matched_count
  FROM public.order_items oi
  JOIN submitted_items si ON si.product_id = oi.product_id
  WHERE oi.order_id = p_order_id;

  IF expected_count = 0 OR supplied_count <> expected_count OR matched_count <> expected_count THEN
    RAISE EXCEPTION 'بنود الاستلام لا تطابق بنود الطلب';
  END IF;

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  )
  SELECT EXISTS (
    SELECT 1 FROM submitted_items
    WHERE COALESCE(received_qty,0) < 0
       OR COALESCE(damaged_qty,0) < 0
       OR COALESCE(damaged_qty,0) > COALESCE(received_qty,0)
  ) INTO has_issue;

  IF has_issue THEN
    RAISE EXCEPTION 'كميات الاستلام غير صحيحة';
  END IF;

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  ), checked_items AS (
    SELECT
      oi.ordered_qty,
      COALESCE(si.received_qty,0) AS received_qty,
      COALESCE(si.damaged_qty,0) AS damaged_qty,
      NULLIF(BTRIM(COALESCE(si.note,'')),'') AS note
    FROM public.order_items oi
    JOIN submitted_items si ON si.product_id = oi.product_id
    WHERE oi.order_id = p_order_id
  )
  SELECT
    EXISTS (SELECT 1 FROM checked_items
      WHERE damaged_qty > 0 OR GREATEST(received_qty - damaged_qty, 0) <> ordered_qty),
    EXISTS (SELECT 1 FROM checked_items
      WHERE (damaged_qty > 0 OR GREATEST(received_qty - damaged_qty, 0) <> ordered_qty)
        AND note IS NULL)
  INTO has_issue, missing_issue_notes;

  IF missing_issue_notes THEN
    RAISE EXCEPTION 'أدخل ملاحظة لكل منتج به فرق أو تالف';
  END IF;

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  ), photos AS (
    SELECT * FROM jsonb_to_recordset(p_photos) AS x(product_id uuid, storage_path text)
  )
  SELECT EXISTS (
    SELECT 1 FROM submitted_items si
    WHERE NOT EXISTS (
      SELECT 1 FROM photos p
      WHERE p.product_id = si.product_id
        AND p.storage_path IS NOT NULL AND BTRIM(p.storage_path) <> ''
    )
  ) INTO missing_product_photos;

  IF missing_product_photos THEN
    RAISE EXCEPTION 'يجب تصوير كل صنف على حدة قبل تأكيد الاستلام';
  END IF;

  INSERT INTO public.receipts (
    id, order_id, supplier_id, employee_id, received_by_user, status, note
  ) VALUES (
    p_receipt_id, p_order_id, current_supplier_id, current_employee_id, current_user_id,
    'submitted'::receipt_status, NULLIF(BTRIM(COALESCE(p_note,'')),'')
  );

  WITH submitted_items AS (
    SELECT * FROM jsonb_to_recordset(p_items) AS x(
      product_id uuid, received_qty numeric, damaged_qty numeric, note text
    )
  )
  INSERT INTO public.receipt_items (
    receipt_id, product_id, ordered_qty, received_qty, damaged_qty, note
  )
  SELECT p_receipt_id, oi.product_id, oi.ordered_qty,
         COALESCE(si.received_qty,0), COALESCE(si.damaged_qty,0),
         NULLIF(BTRIM(COALESCE(si.note,'')),'')
  FROM public.order_items oi
  JOIN submitted_items si ON si.product_id = oi.product_id
  WHERE oi.order_id = p_order_id;

  INSERT INTO public.receipt_photos (receipt_id, storage_path, uploaded_by, product_id)
  SELECT p_receipt_id, ph.storage_path, current_user_id, ph.product_id
  FROM jsonb_to_recordset(p_photos) AS ph(product_id uuid, storage_path text)
  WHERE ph.storage_path IS NOT NULL AND BTRIM(ph.storage_path) <> '';

  UPDATE public.orders
  SET status = 'received'::order_status, updated_at = now()
  WHERE id = p_order_id AND status <> 'cancelled'::order_status;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details)
  VALUES (current_user_id, 'receive_order', 'receipts', p_receipt_id,
    jsonb_build_object('order_id', p_order_id, 'order_number', current_order_number));

  RETURN p_receipt_id;
END;
$function$;
