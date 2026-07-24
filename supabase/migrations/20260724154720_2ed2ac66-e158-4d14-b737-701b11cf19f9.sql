CREATE OR REPLACE FUNCTION public.submit_new_order(
  p_supplier_id uuid,
  p_expected_delivery_date date,
  p_note text,
  p_items jsonb
) RETURNS TABLE(id uuid, order_number text)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
  current_employee_id uuid;
  new_order_id uuid;
  new_order_number text;
  item_count integer;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً';
  END IF;

  IF p_supplier_id IS NULL THEN
    RAISE EXCEPTION 'اختر المورد';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'بنود الطلب غير صحيحة';
  END IF;

  SELECT e.id INTO current_employee_id
  FROM public.employees e
  WHERE e.user_id = current_user_id AND e.is_active = true
  LIMIT 1;

  IF current_employee_id IS NULL THEN
    RAISE EXCEPTION 'الموظف غير موجود أو غير نشط';
  END IF;

  SELECT count(*) INTO item_count
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.ordered_qty, 0) > 0;

  IF item_count = 0 THEN
    RAISE EXCEPTION 'أضف منتجاً واحداً على الأقل بكمية أكبر من صفر';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
    LEFT JOIN public.products p ON p.id = x.product_id
    WHERE x.product_id IS NOT NULL
      AND COALESCE(x.ordered_qty, 0) > 0
      AND (p.id IS NULL OR p.supplier_id <> p_supplier_id)
  ) THEN
    RAISE EXCEPTION 'أحد المنتجات لا يخص المورد المحدد';
  END IF;

  INSERT INTO public.orders (supplier_id, employee_id, created_by_user, expected_delivery_date, note)
  VALUES (
    p_supplier_id,
    current_employee_id,
    current_user_id,
    p_expected_delivery_date,
    NULLIF(BTRIM(COALESCE(p_note, '')), '')
  )
  RETURNING orders.id, orders.order_number INTO new_order_id, new_order_number;

  INSERT INTO public.order_items (order_id, product_id, ordered_qty)
  SELECT new_order_id, x.product_id, x.ordered_qty
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.ordered_qty, 0) > 0;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details)
  VALUES (current_user_id, 'create_order', 'orders', new_order_id,
          jsonb_build_object('order_number', new_order_number));

  RETURN QUERY SELECT new_order_id, new_order_number;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_new_order(uuid, date, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_new_order(uuid, date, text, jsonb) TO authenticated;