-- 1) طلبات الغد
CREATE TABLE public.tomorrow_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  for_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  note text,
  created_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tomorrow_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tomorrow_order_id uuid NOT NULL REFERENCES public.tomorrow_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  qty numeric NOT NULL CHECK (qty > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tomorrow_order_id, product_id)
);

CREATE UNIQUE INDEX tomorrow_orders_branch_date_active
  ON public.tomorrow_orders (branch_id, for_date)
  WHERE status <> 'rejected';

CREATE INDEX tomorrow_order_items_order_idx ON public.tomorrow_order_items (tomorrow_order_id);

CREATE TRIGGER tomorrow_orders_updated_at
  BEFORE UPDATE ON public.tomorrow_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.tomorrow_orders TO authenticated;
GRANT SELECT ON public.tomorrow_order_items TO authenticated;
GRANT ALL ON public.tomorrow_orders TO service_role;
GRANT ALL ON public.tomorrow_order_items TO service_role;

ALTER TABLE public.tomorrow_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tomorrow_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tomorrow orders read branch" ON public.tomorrow_orders
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "tomorrow order items read branch" ON public.tomorrow_order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.tomorrow_orders t
    WHERE t.id = tomorrow_order_items.tomorrow_order_id
      AND private.is_staff(auth.uid())
      AND private.has_branch_access(auth.uid(), t.branch_id)
  ));

-- 2) تسجيل / تحديث طلب الغد (عملية ذرّية)
CREATE OR REPLACE FUNCTION public.submit_tomorrow_order(
  p_branch_id uuid,
  p_for_date date,
  p_note text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_id uuid;
  v_status text;
  v_count integer;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF NOT private.has_perm(v_actor, 'tomorrow_orders_create') THEN
    RAISE EXCEPTION 'غير مصرح: تسجيل طلبات الغد يتطلب صلاحية';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول لهذا الفرع';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'بنود الطلب غير صحيحة';
  END IF;

  SELECT count(*) INTO v_count
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, qty numeric, note text)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.qty,0) > 0;
  IF v_count = 0 THEN RAISE EXCEPTION 'أضف صنفاً واحداً على الأقل بكمية أكبر من صفر'; END IF;

  SELECT id, status INTO v_id, v_status
  FROM public.tomorrow_orders
  WHERE branch_id = p_branch_id AND for_date = p_for_date AND status <> 'rejected'
  FOR UPDATE;

  IF v_id IS NULL THEN
    INSERT INTO public.tomorrow_orders (branch_id, for_date, status, note, created_by, submitted_at)
    VALUES (p_branch_id, p_for_date, 'submitted', NULLIF(BTRIM(COALESCE(p_note,'')),''), v_actor, now())
    RETURNING id INTO v_id;
  ELSE
    IF v_status = 'approved' THEN
      RAISE EXCEPTION 'طلب الغد معتمد ولا يمكن تعديله';
    END IF;
    UPDATE public.tomorrow_orders
    SET status = 'submitted',
        note = NULLIF(BTRIM(COALESCE(p_note,'')),''),
        submitted_at = now()
    WHERE id = v_id;
    DELETE FROM public.tomorrow_order_items WHERE tomorrow_order_id = v_id;
  END IF;

  INSERT INTO public.tomorrow_order_items (tomorrow_order_id, product_id, qty, note)
  SELECT v_id, x.product_id, x.qty, NULLIF(BTRIM(COALESCE(x.note,'')),'')
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, qty numeric, note text)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.qty,0) > 0;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'create_tomorrow_order', 'tomorrow_orders', v_id, p_branch_id,
          jsonb_build_object('for_date', p_for_date, 'items', v_count));

  RETURN v_id;
END;
$$;

-- 3) اعتماد / رفض طلب الغد
CREATE OR REPLACE FUNCTION public.review_tomorrow_order(
  p_id uuid,
  p_approve boolean,
  p_note text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_branch uuid;
  v_status text;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF NOT private.has_perm(v_actor, 'tomorrow_orders_approve') THEN
    RAISE EXCEPTION 'غير مصرح: اعتماد طلبات الغد يتطلب صلاحية';
  END IF;

  SELECT branch_id, status INTO v_branch, v_status
  FROM public.tomorrow_orders WHERE id = p_id FOR UPDATE;
  IF v_branch IS NULL THEN RAISE EXCEPTION 'الطلب غير موجود'; END IF;
  IF NOT private.has_branch_access(v_actor, v_branch) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول لهذا الفرع';
  END IF;
  IF v_status <> 'submitted' THEN
    RAISE EXCEPTION 'يمكن مراجعة الطلبات المُرسلة فقط';
  END IF;
  IF NOT p_approve AND COALESCE(BTRIM(p_note),'') = '' THEN
    RAISE EXCEPTION 'سبب الرفض مطلوب';
  END IF;

  UPDATE public.tomorrow_orders
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      reviewed_by = v_actor,
      reviewed_at = now(),
      review_note = NULLIF(BTRIM(COALESCE(p_note,'')),'')
  WHERE id = p_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'approve_tomorrow_order', 'tomorrow_orders', p_id, v_branch,
          jsonb_build_object('decision', CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
                             'note', NULLIF(BTRIM(COALESCE(p_note,'')),'')));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_tomorrow_order(uuid, date, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.review_tomorrow_order(uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_tomorrow_order(uuid, date, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_tomorrow_order(uuid, boolean, text) TO authenticated;

-- 4) مطابقة الفواتير: صلاحية بدل ملكية الفاتورة فقط
CREATE POLICY "matches manage by permission" ON public.invoice_matches
  FOR ALL TO authenticated
  USING (private.has_perm(auth.uid(), 'invoices_create_match') OR private.has_perm(auth.uid(), 'invoices_update'))
  WITH CHECK (private.has_perm(auth.uid(), 'invoices_create_match') OR private.has_perm(auth.uid(), 'invoices_update'));

-- 5) منح صلاحية الاستلام وطلبات الغد للموظفين الحاليين حتى لا يتوقف العمل
INSERT INTO public.user_permissions (user_id, permission)
SELECT DISTINCT e.user_id, p.perm
FROM public.employees e
CROSS JOIN (VALUES ('orders_receive'::app_permission), ('orders_create'::app_permission),
                   ('tomorrow_orders_create'::app_permission)) AS p(perm)
WHERE e.user_id IS NOT NULL AND e.is_active
ON CONFLICT (user_id, permission) DO NOTHING;

-- 6) الاستلام يحدّث المخزون ويتطلب صلاحية
CREATE OR REPLACE FUNCTION public.submit_order_receipt(p_receipt_id uuid, p_order_id uuid, p_note text, p_items jsonb, p_photos jsonb DEFAULT '[]'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public','private'
AS $function$
DECLARE
  current_user_id uuid;
  current_employee_id uuid;
  current_supplier_id uuid;
  current_order_number text;
  current_order_status public.order_status;
  current_branch_id uuid;
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

  SELECT supplier_id, order_number, status, branch_id
    INTO current_supplier_id, current_order_number, current_order_status, current_branch_id
  FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF current_supplier_id IS NULL THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;
  IF current_order_status = 'cancelled'::order_status THEN
    RAISE EXCEPTION 'لا يمكن استلام طلب ملغى';
  END IF;

  IF NOT private.has_perm(current_user_id, 'orders_receive') THEN
    RAISE EXCEPTION 'غير مصرح: استلام الطلبات يتطلب صلاحية';
  END IF;
  IF NOT private.has_branch_access(current_user_id, current_branch_id) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول لفرع هذا الطلب';
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

  -- تحديث المخزون بالكميات المقبولة، بحركة مسجّلة لكل صنف
  PERFORM private.post_stock(
            current_branch_id, ri.product_id, ri.accepted_qty,
            'receipt'::public.stock_reason, 'receipts', p_receipt_id,
            'استلام ' || COALESCE(current_order_number,''), current_user_id)
  FROM public.receipt_items ri
  WHERE ri.receipt_id = p_receipt_id AND ri.accepted_qty > 0;

  UPDATE public.orders
  SET status = 'received'::order_status, updated_at = now()
  WHERE id = p_order_id AND status <> 'cancelled'::order_status;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (current_user_id, 'receive_order', 'receipts', p_receipt_id, current_branch_id,
    jsonb_build_object('order_id', p_order_id, 'order_number', current_order_number));

  RETURN p_receipt_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_order_receipt(uuid, uuid, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_order_receipt(uuid, uuid, text, jsonb, jsonb) TO authenticated;