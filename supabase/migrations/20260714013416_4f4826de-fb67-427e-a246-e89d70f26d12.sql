
-- 1) Revoke public execute on trigger-only SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.set_activity_log_actor_name() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recompute_receipt_totals() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_order_status_from_receipts() FROM PUBLIC, anon, authenticated;

-- mark_receipt_telegram is called via RPC by authenticated server; keep authenticated, revoke anon/public
REVOKE ALL ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) TO authenticated;

-- 2) Activity log: force actor_user = auth.uid() and restrict actions via trigger
DROP POLICY IF EXISTS "activity insert authed" ON public.activity_log;
CREATE POLICY "activity insert self" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_user = auth.uid());

CREATE OR REPLACE FUNCTION public.validate_activity_log_entry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed_actions text[] := ARRAY[
    'receive_order','create_order','update_order','cancel_order',
    'create_invoice','update_invoice','approve_invoice','delete_invoice',
    'create_payment','update_payment','delete_payment',
    'match_invoice','unmatch_invoice',
    'create_supplier','update_supplier','delete_supplier',
    'create_product','update_product','delete_product',
    'create_employee','update_employee','delete_employee',
    'telegram_notify'
  ];
  allowed_entities text[] := ARRAY[
    'orders','receipts','invoices','payments','invoice_matches',
    'suppliers','products','employees'
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
$$;

DROP TRIGGER IF EXISTS trg_validate_activity_log_entry ON public.activity_log;
CREATE TRIGGER trg_validate_activity_log_entry
  BEFORE INSERT ON public.activity_log
  FOR EACH ROW EXECUTE FUNCTION public.validate_activity_log_entry();

-- 3) Orders: scope branch_employee updates to their own orders
DROP POLICY IF EXISTS "orders update pending by employee or admin" ON public.orders;
CREATE POLICY "orders update pending by employee or admin" ON public.orders
  FOR UPDATE TO authenticated
  USING (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR (status = 'pending_receipt'::order_status AND created_by_user = auth.uid())
  )
  WITH CHECK (
    private.has_role(auth.uid(), 'admin'::app_role)
    OR created_by_user = auth.uid()
  );
