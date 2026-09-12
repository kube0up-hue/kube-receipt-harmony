-- ===== 1) توسيع المنتجات =====
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS min_qty numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS storage_location text,
  ADD COLUMN IF NOT EXISTS is_counted boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS foodics_stock numeric;

-- ===== 2) أنواع =====
DO $$ BEGIN
  CREATE TYPE public.stock_reason AS ENUM (
    'purchase','receipt','transfer_out','transfer_in','count_adjust','waste','manual_adjust','return','correction'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.transfer_status AS ENUM ('draft','sent','received','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== 3) مستويات المخزون =====
CREATE TABLE IF NOT EXISTS public.stock_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  qty numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (branch_id, product_id)
);
GRANT SELECT ON public.stock_levels TO authenticated;
GRANT ALL ON public.stock_levels TO service_role;
ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_levels read branch" ON public.stock_levels FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

CREATE TRIGGER stock_levels_updated_at BEFORE UPDATE ON public.stock_levels
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== 4) سجل الحركة =====
CREATE TABLE IF NOT EXISTS public.stock_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  product_id uuid NOT NULL REFERENCES public.products(id),
  qty_delta numeric NOT NULL,
  balance_after numeric NOT NULL,
  reason public.stock_reason NOT NULL,
  ref_table text,
  ref_id uuid,
  note text,
  actor_user uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_ledger_branch_product_idx ON public.stock_ledger (branch_id, product_id, created_at DESC);
GRANT SELECT ON public.stock_ledger TO authenticated;
GRANT ALL ON public.stock_ledger TO service_role;
ALTER TABLE public.stock_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_ledger read branch" ON public.stock_ledger FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

-- ===== 5) التحويلات =====
CREATE TABLE IF NOT EXISTS public.stock_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number text,
  from_branch_id uuid NOT NULL REFERENCES public.branches(id),
  to_branch_id uuid NOT NULL REFERENCES public.branches(id),
  status public.transfer_status NOT NULL DEFAULT 'sent',
  note text,
  sent_by uuid REFERENCES auth.users(id),
  sent_at timestamptz,
  received_by uuid REFERENCES auth.users(id),
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stock_transfers_different_branches CHECK (from_branch_id <> to_branch_id)
);
GRANT SELECT ON public.stock_transfers TO authenticated;
GRANT ALL ON public.stock_transfers TO service_role;
ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_transfers read branch" ON public.stock_transfers FOR SELECT TO authenticated
USING (private.is_staff(auth.uid()) AND (
  private.has_branch_access(auth.uid(), from_branch_id) OR private.has_branch_access(auth.uid(), to_branch_id)
));
CREATE TRIGGER stock_transfers_updated_at BEFORE UPDATE ON public.stock_transfers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.stock_transfer_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid NOT NULL REFERENCES public.stock_transfers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  qty_sent numeric NOT NULL,
  qty_received numeric,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_transfer_items_transfer_idx ON public.stock_transfer_items (transfer_id);
GRANT SELECT ON public.stock_transfer_items TO authenticated;
GRANT ALL ON public.stock_transfer_items TO service_role;
ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_transfer_items read branch" ON public.stock_transfer_items FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.stock_transfers t
  WHERE t.id = transfer_id AND private.is_staff(auth.uid())
    AND (private.has_branch_access(auth.uid(), t.from_branch_id) OR private.has_branch_access(auth.uid(), t.to_branch_id))
));

-- ===== 6) دالة داخلية: ترحيل حركة =====
CREATE OR REPLACE FUNCTION private.post_stock(
  p_branch_id uuid,
  p_product_id uuid,
  p_delta numeric,
  p_reason public.stock_reason,
  p_ref_table text,
  p_ref_id uuid,
  p_note text,
  p_actor uuid
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE v_qty numeric;
BEGIN
  IF p_delta = 0 THEN
    SELECT qty INTO v_qty FROM public.stock_levels WHERE branch_id = p_branch_id AND product_id = p_product_id;
    RETURN COALESCE(v_qty, 0);
  END IF;

  INSERT INTO public.stock_levels (branch_id, product_id, qty)
  VALUES (p_branch_id, p_product_id, p_delta)
  ON CONFLICT (branch_id, product_id)
  DO UPDATE SET qty = public.stock_levels.qty + p_delta, updated_at = now()
  RETURNING qty INTO v_qty;

  INSERT INTO public.stock_ledger (branch_id, product_id, qty_delta, balance_after, reason, ref_table, ref_id, note, actor_user)
  VALUES (p_branch_id, p_product_id, p_delta, v_qty, p_reason, p_ref_table, p_ref_id, p_note, p_actor);

  RETURN v_qty;
END;
$$;
REVOKE ALL ON FUNCTION private.post_stock(uuid, uuid, numeric, public.stock_reason, text, uuid, text, uuid) FROM PUBLIC;

-- ===== 7) تعديل يدوي / إرجاع =====
CREATE OR REPLACE FUNCTION public.stock_adjust(
  p_branch_id uuid,
  p_product_id uuid,
  p_delta numeric,
  p_reason text,
  p_note text
) RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_reason public.stock_reason;
  v_balance numeric;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF NOT private.has_perm(v_actor, 'inventory_adjust') THEN
    RAISE EXCEPTION 'غير مصرح: تعديل المخزون يتطلب صلاحية';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول لهذا الفرع';
  END IF;
  IF p_delta = 0 THEN RAISE EXCEPTION 'الكمية يجب أن تكون غير صفرية'; END IF;
  IF COALESCE(p_note, '') = '' THEN RAISE EXCEPTION 'السبب مطلوب'; END IF;

  v_reason := CASE WHEN p_reason IN ('manual_adjust','return','correction') THEN p_reason::public.stock_reason
                   ELSE 'manual_adjust'::public.stock_reason END;

  v_balance := private.post_stock(p_branch_id, p_product_id, p_delta, v_reason, 'manual', NULL, p_note, v_actor);

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details, new_value)
  VALUES (v_actor,
          CASE WHEN v_reason = 'return' THEN 'stock_return' ELSE 'stock_adjust' END,
          'stock_ledger', p_product_id, p_branch_id,
          jsonb_build_object('delta', p_delta, 'note', p_note, 'reason', v_reason),
          jsonb_build_object('balance', v_balance));

  RETURN v_balance;
END;
$$;
GRANT EXECUTE ON FUNCTION public.stock_adjust(uuid, uuid, numeric, text, text) TO authenticated;

-- ===== 8) إنشاء تحويل (خصم من المُرسل) =====
CREATE OR REPLACE FUNCTION public.stock_transfer_send(
  p_from_branch_id uuid,
  p_to_branch_id uuid,
  p_note text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_transfer_id uuid;
  v_item jsonb;
  v_qty numeric;
  v_product uuid;
  v_count int := 0;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  IF NOT private.has_perm(v_actor, 'inventory_transfer') THEN
    RAISE EXCEPTION 'غير مصرح: التحويل يتطلب صلاحية';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_from_branch_id) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول للفرع المُرسل';
  END IF;
  IF p_from_branch_id = p_to_branch_id THEN RAISE EXCEPTION 'الفرع المُرسل والمستلم متطابقان'; END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN RAISE EXCEPTION 'لا أصناف في التحويل'; END IF;

  INSERT INTO public.stock_transfers (from_branch_id, to_branch_id, status, note, sent_by, sent_at)
  VALUES (p_from_branch_id, p_to_branch_id, 'sent', p_note, v_actor, now())
  RETURNING id INTO v_transfer_id;

  UPDATE public.stock_transfers
  SET transfer_number = 'TR-' || to_char(now(), 'YYMMDD') || '-' || substr(v_transfer_id::text, 1, 4)
  WHERE id = v_transfer_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product := (v_item->>'product_id')::uuid;
    v_qty := COALESCE((v_item->>'qty')::numeric, 0);
    IF v_qty <= 0 THEN CONTINUE; END IF;

    INSERT INTO public.stock_transfer_items (transfer_id, product_id, qty_sent, note)
    VALUES (v_transfer_id, v_product, v_qty, v_item->>'note');

    PERFORM private.post_stock(p_from_branch_id, v_product, -v_qty, 'transfer_out',
                               'stock_transfers', v_transfer_id, p_note, v_actor);
    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN RAISE EXCEPTION 'لا أصناف بكميات صحيحة'; END IF;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'stock_transfer', 'stock_transfers', v_transfer_id, p_from_branch_id,
          jsonb_build_object('to_branch_id', p_to_branch_id, 'items', v_count, 'note', p_note));

  RETURN v_transfer_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.stock_transfer_send(uuid, uuid, text, jsonb) TO authenticated;

-- ===== 9) استلام تحويل (إضافة للمستلم) =====
CREATE OR REPLACE FUNCTION public.stock_transfer_receive(
  p_transfer_id uuid,
  p_items jsonb,
  p_note text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_transfer public.stock_transfers;
  v_item jsonb;
  v_line public.stock_transfer_items;
  v_qty numeric;
BEGIN
  IF v_actor IS NULL THEN RAISE EXCEPTION 'غير مصرح'; END IF;
  SELECT * INTO v_transfer FROM public.stock_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF v_transfer.id IS NULL THEN RAISE EXCEPTION 'التحويل غير موجود'; END IF;
  IF v_transfer.status <> 'sent' THEN RAISE EXCEPTION 'التحويل غير قابل للاستلام'; END IF;
  IF NOT private.has_perm(v_actor, 'inventory_receive_transfer') THEN
    RAISE EXCEPTION 'غير مصرح: استلام التحويل يتطلب صلاحية';
  END IF;
  IF NOT private.has_branch_access(v_actor, v_transfer.to_branch_id) THEN
    RAISE EXCEPTION 'غير مصرح: لا وصول للفرع المستلم';
  END IF;

  FOR v_line IN SELECT * FROM public.stock_transfer_items WHERE transfer_id = p_transfer_id LOOP
    v_qty := NULL;
    IF p_items IS NOT NULL THEN
      SELECT (x->>'qty_received')::numeric INTO v_qty
      FROM jsonb_array_elements(p_items) x
      WHERE (x->>'product_id')::uuid = v_line.product_id
      LIMIT 1;
    END IF;
    v_qty := COALESCE(v_qty, v_line.qty_sent);
    IF v_qty < 0 THEN v_qty := 0; END IF;

    UPDATE public.stock_transfer_items SET qty_received = v_qty WHERE id = v_line.id;

    IF v_qty > 0 THEN
      PERFORM private.post_stock(v_transfer.to_branch_id, v_line.product_id, v_qty, 'transfer_in',
                                 'stock_transfers', p_transfer_id, p_note, v_actor);
    END IF;

    -- فرق: ما لم يُستلم يعود لرصيد الفرع المُرسل كتصحيح
    IF v_qty < v_line.qty_sent THEN
      PERFORM private.post_stock(v_transfer.from_branch_id, v_line.product_id, v_line.qty_sent - v_qty,
                                 'correction', 'stock_transfers', p_transfer_id,
                                 'فرق تحويل غير مستلم', v_actor);
    END IF;
  END LOOP;

  UPDATE public.stock_transfers
  SET status = 'received', received_by = v_actor, received_at = now(),
      note = COALESCE(note, '') || CASE WHEN COALESCE(p_note,'') = '' THEN '' ELSE ' | استلام: ' || p_note END
  WHERE id = p_transfer_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'stock_transfer_receive', 'stock_transfers', p_transfer_id, v_transfer.to_branch_id,
          jsonb_build_object('from_branch_id', v_transfer.from_branch_id, 'note', p_note));

  RETURN p_transfer_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.stock_transfer_receive(uuid, jsonb, text) TO authenticated;