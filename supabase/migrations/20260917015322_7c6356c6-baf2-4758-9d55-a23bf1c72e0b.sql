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
    'record_waste','record_quality',
    'record_sales','review_sales','approve_sales','edit_approved_sales',
    'create_recipe','update_recipe','update_schedule',
    'create_tomorrow_order','approve_tomorrow_order',
    'update_ai_kubeup_brand_instruction'
  ];
  allowed_entities text[] := ARRAY[
    'orders','receipts','invoices','payments','invoice_matches',
    'suppliers','products','employees','user_permissions',
    'branches','user_branches','stock_ledger','stock_transfers',
    'count_sessions','waste_entries','quality_readings','daily_sales',
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