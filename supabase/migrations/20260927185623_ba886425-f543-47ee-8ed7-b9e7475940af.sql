CREATE OR REPLACE FUNCTION public.submit_new_order(p_supplier_id uuid, p_expected_delivery_date date, p_note text, p_items jsonb)
 RETURNS TABLE(id uuid, order_number text)
 LANGUAGE plpgsql SECURITY DEFINER
 SET search_path TO 'public','private'
AS $function$
DECLARE
  current_user_id uuid; current_employee_id uuid; current_branch uuid;
  new_order_id uuid; new_order_number text; item_count integer;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN RAISE EXCEPTION 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً'; END IF;
  IF p_supplier_id IS NULL THEN RAISE EXCEPTION 'اختر المورد'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN RAISE EXCEPTION 'بنود الطلب غير صحيحة'; END IF;

  SELECT e.id, e.branch_id INTO current_employee_id, current_branch
  FROM public.employees e WHERE e.user_id = current_user_id AND e.is_active = true LIMIT 1;
  IF current_employee_id IS NULL THEN RAISE EXCEPTION 'الموظف غير موجود أو غير نشط'; END IF;

  IF NOT (private.has_perm(current_user_id, 'orders_create')
          OR private.has_role(current_user_id, 'admin') OR private.has_role(current_user_id, 'owner')) THEN
    RAISE EXCEPTION 'غير مصرح: تسجيل الطلبات يتطلب صلاحية';
  END IF;

  SELECT count(*) INTO item_count FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.ordered_qty,0) > 0;
  IF item_count = 0 THEN RAISE EXCEPTION 'أضف منتجاً واحداً على الأقل بكمية أكبر من صفر'; END IF;

  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
    LEFT JOIN public.products p ON p.id = x.product_id
    WHERE x.product_id IS NOT NULL AND COALESCE(x.ordered_qty,0) > 0
      AND (p.id IS NULL OR p.supplier_id <> p_supplier_id)) THEN
    RAISE EXCEPTION 'أحد المنتجات لا يخص المورد المحدد';
  END IF;

  INSERT INTO public.orders (supplier_id, employee_id, created_by_user, expected_delivery_date, note, branch_id)
  VALUES (p_supplier_id, current_employee_id, current_user_id, p_expected_delivery_date,
          NULLIF(BTRIM(COALESCE(p_note,'')),''), current_branch)
  RETURNING orders.id, orders.order_number INTO new_order_id, new_order_number;

  INSERT INTO public.order_items (order_id, product_id, ordered_qty)
  SELECT new_order_id, x.product_id, x.ordered_qty FROM jsonb_to_recordset(p_items) AS x(product_id uuid, ordered_qty numeric)
  WHERE x.product_id IS NOT NULL AND COALESCE(x.ordered_qty,0) > 0;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (current_user_id, 'create_order', 'orders', new_order_id, current_branch,
          jsonb_build_object('order_number', new_order_number));

  RETURN QUERY SELECT new_order_id, new_order_number;
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.submit_new_order(uuid,date,text,jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.submit_new_order(uuid,date,text,jsonb) TO authenticated;

DROP POLICY IF EXISTS "receipt-photos read scoped" ON storage.objects;
CREATE POLICY "receipt-photos read scoped" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'receipt-photos' AND (
  private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'owner') OR private.has_role(auth.uid(),'accountant')
  OR private.has_perm(auth.uid(),'receipt_photos_view')
  OR EXISTS (SELECT 1 FROM public.receipt_photos rp LEFT JOIN public.receipts r ON r.id = rp.receipt_id
    LEFT JOIN public.employees e ON e.id = r.employee_id
    WHERE rp.storage_path = objects.name AND (rp.uploaded_by = auth.uid() OR r.received_by_user = auth.uid() OR e.user_id = auth.uid()))));