DO $$
DECLARE v_id uuid; v_branch uuid; v_product uuid; v_qty numeric;
BEGIN
  SELECT id, branch_id, product_id, qty INTO v_id, v_branch, v_product, v_qty
  FROM public.waste_entries WHERE reason = 'اختبار تلقائي — سيتم حذفه' LIMIT 1;
  IF v_id IS NULL THEN RETURN; END IF;

  DELETE FROM public.stock_ledger WHERE ref_table = 'waste_entries' AND ref_id = v_id;
  DELETE FROM public.activity_log WHERE entity = 'waste_entries' AND entity_id = v_id;
  DELETE FROM public.waste_entries WHERE id = v_id;
  UPDATE public.stock_levels SET qty = qty + v_qty
  WHERE branch_id = v_branch AND product_id = v_product;
END $$;