-- 1) Atomic invoice + items + matches
CREATE OR REPLACE FUNCTION public.submit_invoice_match(
  p_supplier_id uuid,
  p_invoice_number text,
  p_invoice_date date,
  p_period_start date,
  p_period_end date,
  p_total_amount numeric,
  p_note text,
  p_items jsonb,
  p_matches jsonb
) RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  new_invoice_id uuid;
  new_status public.invoice_status;
  bad_count integer;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً';
  END IF;

  IF NOT (private.has_role(current_user_id, 'admin'::app_role)
          OR private.has_role(current_user_id, 'accountant'::app_role)) THEN
    RAISE EXCEPTION 'غير مصرح: هذه العملية للمدير أو المحاسب فقط';
  END IF;

  IF p_supplier_id IS NULL OR NOT EXISTS (SELECT 1 FROM public.suppliers WHERE id = p_supplier_id) THEN
    RAISE EXCEPTION 'المورد غير موجود';
  END IF;

  IF COALESCE(BTRIM(p_invoice_number), '') = '' THEN
    RAISE EXCEPTION 'أدخل رقم الفاتورة';
  END IF;

  IF p_invoice_date IS NULL OR p_period_start IS NULL OR p_period_end IS NULL THEN
    RAISE EXCEPTION 'أكمل تواريخ الفاتورة والفترة';
  END IF;

  IF p_period_start > p_period_end THEN
    RAISE EXCEPTION 'بداية الفترة يجب أن تكون قبل نهايتها';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR p_matches IS NULL OR jsonb_typeof(p_matches) <> 'array' THEN
    RAISE EXCEPTION 'بنود الفاتورة غير صحيحة';
  END IF;

  -- All products must belong to this supplier
  SELECT count(*) INTO bad_count
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, invoiced_qty numeric, unit_price numeric, line_total numeric)
  LEFT JOIN public.products p ON p.id = x.product_id
  WHERE p.id IS NULL OR p.supplier_id <> p_supplier_id;
  IF bad_count > 0 THEN
    RAISE EXCEPTION 'أحد الأصناف لا يخص المورد المحدد';
  END IF;

  SELECT count(*) INTO bad_count
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, invoiced_qty numeric, unit_price numeric, line_total numeric)
  WHERE COALESCE(x.invoiced_qty, 0) < 0 OR COALESCE(x.unit_price, 0) < 0 OR COALESCE(x.line_total, 0) < 0;
  IF bad_count > 0 THEN
    RAISE EXCEPTION 'الكميات والأسعار لا يمكن أن تكون سالبة';
  END IF;

  SELECT count(*) INTO bad_count
  FROM jsonb_to_recordset(p_matches) AS x(product_id uuid)
  LEFT JOIN public.products p ON p.id = x.product_id
  WHERE p.id IS NULL OR p.supplier_id <> p_supplier_id;
  IF bad_count > 0 THEN
    RAISE EXCEPTION 'أحد أصناف المطابقة لا يخص المورد المحدد';
  END IF;

  -- Status derived server-side from the match rows
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_matches) AS x(invoice_diff numeric)
    WHERE COALESCE(x.invoice_diff, 0) <> 0
  ) THEN 'unmatched'::invoice_status ELSE 'matched_ready'::invoice_status END
  INTO new_status;

  INSERT INTO public.invoices (
    supplier_id, invoice_number, invoice_date, period_start, period_end,
    total_amount, status, accountant_note, created_by
  ) VALUES (
    p_supplier_id, BTRIM(p_invoice_number), p_invoice_date, p_period_start, p_period_end,
    GREATEST(COALESCE(p_total_amount, 0), 0), new_status,
    NULLIF(BTRIM(COALESCE(p_note, '')), ''), current_user_id
  ) RETURNING id INTO new_invoice_id;

  INSERT INTO public.invoice_items (invoice_id, product_id, invoiced_qty, unit_price, line_total)
  SELECT new_invoice_id, x.product_id, COALESCE(x.invoiced_qty,0), COALESCE(x.unit_price,0), COALESCE(x.line_total,0)
  FROM jsonb_to_recordset(p_items) AS x(product_id uuid, invoiced_qty numeric, unit_price numeric, line_total numeric)
  WHERE COALESCE(x.invoiced_qty,0) > 0;

  INSERT INTO public.invoice_matches (
    invoice_id, product_id, total_ordered, total_received, total_damaged,
    total_accepted, total_invoiced, invoice_diff, status
  )
  SELECT new_invoice_id, x.product_id,
         COALESCE(x.total_ordered,0), COALESCE(x.total_received,0), COALESCE(x.total_damaged,0),
         COALESCE(x.total_accepted,0), COALESCE(x.total_invoiced,0), COALESCE(x.invoice_diff,0),
         x.status::invoice_match_status
  FROM jsonb_to_recordset(p_matches) AS x(
    product_id uuid, total_ordered numeric, total_received numeric, total_damaged numeric,
    total_accepted numeric, total_invoiced numeric, invoice_diff numeric, status text
  );

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, details)
  VALUES (current_user_id, 'create_invoice', 'invoices', new_invoice_id,
    jsonb_build_object('invoice_number', BTRIM(p_invoice_number),
                       'period_start', p_period_start, 'period_end', p_period_end));

  RETURN new_invoice_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_invoice_match(uuid, text, date, date, date, numeric, text, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_invoice_match(uuid, text, date, date, date, numeric, text, jsonb, jsonb) TO authenticated;

-- 2) Overlapping invoice periods for the same supplier
CREATE OR REPLACE FUNCTION public.find_overlapping_invoices(
  p_supplier_id uuid, p_period_start date, p_period_end date
) RETURNS TABLE(id uuid, invoice_number text, period_start date, period_end date, total_amount numeric)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT i.id, i.invoice_number, i.period_start, i.period_end, i.total_amount
  FROM public.invoices i
  WHERE i.supplier_id = p_supplier_id
    AND i.period_start IS NOT NULL AND i.period_end IS NOT NULL
    AND i.period_start <= p_period_end
    AND i.period_end >= p_period_start
  ORDER BY i.period_start DESC
$$;

REVOKE ALL ON FUNCTION public.find_overlapping_invoices(uuid, date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_overlapping_invoices(uuid, date, date) TO authenticated;

-- 3) PIN code must never be readable through the Data API
REVOKE SELECT ON TABLE public.employees FROM authenticated;
REVOKE SELECT ON TABLE public.employees FROM anon;
GRANT SELECT (id, user_id, full_name, branch, is_active, created_at, updated_at)
  ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;