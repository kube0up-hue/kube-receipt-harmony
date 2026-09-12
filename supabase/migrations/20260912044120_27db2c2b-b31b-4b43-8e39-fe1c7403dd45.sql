-- ===== enums =====
DO $$ BEGIN
  CREATE TYPE public.count_kind AS ENUM ('cycle_1','cycle_15','extra');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.count_session_status AS ENUM ('open','in_progress','submitted','reviewed','approved','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.count_match_status AS ENUM ('matched','minor_diff','mismatch');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ===== tables =====
CREATE TABLE public.count_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES public.branches(id),
  count_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Riyadh')::date,
  kind public.count_kind NOT NULL,
  status public.count_session_status NOT NULL DEFAULT 'open',
  note text,
  prev_session_id uuid REFERENCES public.count_sessions(id),
  baseline_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  cancel_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.count_sessions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  unit_price numeric NOT NULL DEFAULT 0,
  prev_count_qty numeric NOT NULL DEFAULT 0,
  purchases_qty numeric NOT NULL DEFAULT 0,
  transfer_in_qty numeric NOT NULL DEFAULT 0,
  transfer_out_qty numeric NOT NULL DEFAULT 0,
  waste_qty numeric NOT NULL DEFAULT 0,
  adjust_qty numeric NOT NULL DEFAULT 0,
  expected_qty numeric NOT NULL DEFAULT 0,
  counted_qty numeric,
  foodics_qty numeric,
  variance_qty numeric NOT NULL DEFAULT 0,
  variance_value numeric NOT NULL DEFAULT 0,
  foodics_diff numeric,
  match_status public.count_match_status,
  note text,
  counted_by uuid REFERENCES auth.users(id),
  counted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, product_id)
);

CREATE INDEX idx_count_sessions_branch ON public.count_sessions (branch_id, count_date DESC);
CREATE INDEX idx_count_lines_session ON public.count_lines (session_id);
CREATE UNIQUE INDEX uq_count_session_active ON public.count_sessions (branch_id, count_date, kind)
  WHERE status <> 'cancelled';

GRANT SELECT ON public.count_sessions TO authenticated;
GRANT SELECT ON public.count_lines TO authenticated;
GRANT ALL ON public.count_sessions TO service_role;
GRANT ALL ON public.count_lines TO service_role;

ALTER TABLE public.count_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.count_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "count sessions readable by branch staff" ON public.count_sessions
  FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) AND private.has_branch_access(auth.uid(), branch_id));

CREATE POLICY "count lines readable by branch staff" ON public.count_lines
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.count_sessions s
    WHERE s.id = count_lines.session_id
      AND private.is_staff(auth.uid())
      AND private.has_branch_access(auth.uid(), s.branch_id)
  ));

CREATE TRIGGER trg_count_sessions_updated BEFORE UPDATE ON public.count_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_count_lines_updated BEFORE UPDATE ON public.count_lines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ===== automatic variance computation on every line write =====
CREATE OR REPLACE FUNCTION public.compute_count_line_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE v_tol numeric;
BEGIN
  IF NEW.counted_qty IS NULL THEN
    NEW.variance_qty := 0;
    NEW.variance_value := 0;
    NEW.foodics_diff := NULL;
    NEW.match_status := NULL;
  ELSE
    NEW.variance_qty := round(NEW.counted_qty - NEW.expected_qty, 3);
    NEW.variance_value := round(NEW.variance_qty * COALESCE(NEW.unit_price, 0), 2);
    NEW.foodics_diff := CASE WHEN NEW.foodics_qty IS NULL THEN NULL
                             ELSE round(NEW.counted_qty - NEW.foodics_qty, 3) END;
    v_tol := GREATEST(abs(NEW.expected_qty) * 0.02, 0.5);
    NEW.match_status := CASE
      WHEN abs(NEW.variance_qty) = 0 THEN 'matched'::public.count_match_status
      WHEN abs(NEW.variance_qty) <= v_tol THEN 'minor_diff'::public.count_match_status
      ELSE 'mismatch'::public.count_match_status END;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_count_lines_compute BEFORE INSERT OR UPDATE ON public.count_lines
  FOR EACH ROW EXECUTE FUNCTION public.compute_count_line_fields();

-- ===== live link: any stock movement updates open count sessions =====
CREATE OR REPLACE FUNCTION public.sync_count_lines_from_ledger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.count_lines cl
  SET expected_qty = round(cl.expected_qty + NEW.qty_delta, 3),
      purchases_qty = cl.purchases_qty + CASE WHEN NEW.reason IN ('purchase','receipt') THEN NEW.qty_delta ELSE 0 END,
      transfer_in_qty = cl.transfer_in_qty + CASE WHEN NEW.reason = 'transfer_in' THEN NEW.qty_delta ELSE 0 END,
      transfer_out_qty = cl.transfer_out_qty + CASE WHEN NEW.reason = 'transfer_out' THEN NEW.qty_delta ELSE 0 END,
      waste_qty = cl.waste_qty + CASE WHEN NEW.reason = 'waste' THEN NEW.qty_delta ELSE 0 END,
      adjust_qty = cl.adjust_qty + CASE WHEN NEW.reason IN ('manual_adjust','correction','return','count_adjust') THEN NEW.qty_delta ELSE 0 END
  FROM public.count_sessions s
  WHERE s.id = cl.session_id
    AND s.branch_id = NEW.branch_id
    AND s.status IN ('open','in_progress','submitted','reviewed')
    AND cl.product_id = NEW.product_id
    AND NEW.reason <> 'count_adjust';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_ledger_sync_counts AFTER INSERT ON public.stock_ledger
  FOR EACH ROW EXECUTE FUNCTION public.sync_count_lines_from_ledger();

-- ===== rebuild all line numbers from live stock + ledger =====
CREATE OR REPLACE FUNCTION private.count_rebuild_lines(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions;
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;

  INSERT INTO public.count_lines (session_id, product_id, unit_price)
  SELECT s.id, p.id, COALESCE(p.unit_price, 0)
  FROM public.products p
  WHERE p.is_hidden = false AND p.is_counted = true
    AND NOT EXISTS (SELECT 1 FROM public.count_lines cl WHERE cl.session_id = s.id AND cl.product_id = p.id);

  UPDATE public.count_lines cl SET
    unit_price = COALESCE(p.unit_price, 0),
    expected_qty = round(COALESCE(sl.qty, 0), 3),
    prev_count_qty = round(COALESCE(pl.counted_qty, 0), 3),
    purchases_qty = round(COALESCE(m.purchases, 0), 3),
    transfer_in_qty = round(COALESCE(m.t_in, 0), 3),
    transfer_out_qty = round(COALESCE(m.t_out, 0), 3),
    waste_qty = round(COALESCE(m.waste, 0), 3),
    adjust_qty = round(COALESCE(m.adj, 0), 3)
  FROM public.products p
  LEFT JOIN public.stock_levels sl ON sl.product_id = p.id AND sl.branch_id = s.branch_id
  LEFT JOIN public.count_lines pl ON pl.session_id = s.prev_session_id AND pl.product_id = p.id
  LEFT JOIN (
    SELECT l.product_id,
      SUM(CASE WHEN l.reason IN ('purchase','receipt') THEN l.qty_delta ELSE 0 END) AS purchases,
      SUM(CASE WHEN l.reason = 'transfer_in' THEN l.qty_delta ELSE 0 END) AS t_in,
      SUM(CASE WHEN l.reason = 'transfer_out' THEN l.qty_delta ELSE 0 END) AS t_out,
      SUM(CASE WHEN l.reason = 'waste' THEN l.qty_delta ELSE 0 END) AS waste,
      SUM(CASE WHEN l.reason IN ('manual_adjust','correction','return') THEN l.qty_delta ELSE 0 END) AS adj
    FROM public.stock_ledger l
    WHERE l.branch_id = s.branch_id AND l.created_at > s.baseline_at
    GROUP BY l.product_id
  ) m ON m.product_id = p.id
  WHERE cl.session_id = s.id AND cl.product_id = p.id;
END;
$$;

-- ===== open a session =====
CREATE OR REPLACE FUNCTION public.open_count_session(
  p_branch_id uuid, p_kind text, p_count_date date, p_note text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE v_actor uuid := auth.uid();
        v_id uuid;
        v_prev uuid;
        v_baseline timestamptz;
        v_date date := COALESCE(p_count_date, (now() AT TIME ZONE 'Asia/Riyadh')::date);
BEGIN
  IF NOT private.has_perm(v_actor, 'count_perform') THEN
    RAISE EXCEPTION 'لا تملك صلاحية تنفيذ الجرد';
  END IF;
  IF NOT private.has_branch_access(v_actor, p_branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF p_kind NOT IN ('cycle_1','cycle_15','extra') THEN
    RAISE EXCEPTION 'نوع جرد غير صحيح';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.count_sessions
    WHERE branch_id = p_branch_id AND status IN ('open','in_progress','submitted','reviewed')
  ) THEN
    RAISE EXCEPTION 'يوجد جرد غير مكتمل لهذا الفرع — أكمله أو ألغه أولاً';
  END IF;

  SELECT id, approved_at INTO v_prev, v_baseline
  FROM public.count_sessions
  WHERE branch_id = p_branch_id AND status = 'approved'
  ORDER BY approved_at DESC NULLS LAST LIMIT 1;

  INSERT INTO public.count_sessions (branch_id, count_date, kind, note, created_by, prev_session_id, baseline_at)
  VALUES (p_branch_id, v_date, p_kind::public.count_kind, NULLIF(p_note,''), v_actor, v_prev,
          COALESCE(v_baseline, now() - interval '100 years'))
  RETURNING id INTO v_id;

  PERFORM private.count_rebuild_lines(v_id);

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'count_open', 'count_sessions', v_id, p_branch_id,
          jsonb_build_object('kind', p_kind, 'count_date', v_date));
  RETURN v_id;
END;
$$;

-- ===== refresh system numbers =====
CREATE OR REPLACE FUNCTION public.refresh_count_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid();
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT (private.has_perm(v_actor,'count_perform') OR private.has_perm(v_actor,'count_review')) THEN
    RAISE EXCEPTION 'لا تملك صلاحية الجرد';
  END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN
    RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع';
  END IF;
  IF s.status = 'approved' THEN RAISE EXCEPTION 'الجرد معتمد ولا يمكن تحديثه'; END IF;
  PERFORM private.count_rebuild_lines(p_session_id);
END;
$$;

-- ===== save counted quantities =====
CREATE OR REPLACE FUNCTION public.save_count_lines(p_session_id uuid, p_lines jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid(); it jsonb;
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT private.has_perm(v_actor,'count_perform') THEN RAISE EXCEPTION 'لا تملك صلاحية تنفيذ الجرد'; END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status NOT IN ('open','in_progress') THEN RAISE EXCEPTION 'لا يمكن إدخال الكميات في هذه الحالة'; END IF;

  FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(p_lines,'[]'::jsonb)) LOOP
    UPDATE public.count_lines SET
      counted_qty = CASE WHEN it->>'counted_qty' IS NULL THEN NULL ELSE (it->>'counted_qty')::numeric END,
      foodics_qty = CASE WHEN it->>'foodics_qty' IS NULL THEN NULL ELSE (it->>'foodics_qty')::numeric END,
      note = NULLIF(it->>'note',''),
      counted_by = v_actor,
      counted_at = now()
    WHERE session_id = p_session_id AND product_id = (it->>'product_id')::uuid;
  END LOOP;

  UPDATE public.count_sessions SET status = 'in_progress' WHERE id = p_session_id AND status = 'open';
END;
$$;

-- ===== submit =====
CREATE OR REPLACE FUNCTION public.submit_count_session(p_session_id uuid, p_note text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid(); v_missing int;
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT private.has_perm(v_actor,'count_perform') THEN RAISE EXCEPTION 'لا تملك صلاحية تنفيذ الجرد'; END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status NOT IN ('open','in_progress') THEN RAISE EXCEPTION 'الجرد مُرسل مسبقاً'; END IF;

  SELECT count(*) INTO v_missing FROM public.count_lines WHERE session_id = p_session_id AND counted_qty IS NULL;
  IF v_missing > 0 THEN RAISE EXCEPTION 'بقي % صنف بدون كمية فعلية', v_missing; END IF;

  UPDATE public.count_sessions
  SET status = 'submitted', submitted_by = v_actor, submitted_at = now(), note = COALESCE(NULLIF(p_note,''), note)
  WHERE id = p_session_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'count_submit', 'count_sessions', p_session_id, s.branch_id,
          jsonb_build_object('note', p_note));
END;
$$;

-- ===== review (accept for approval or return) =====
CREATE OR REPLACE FUNCTION public.review_count_session(p_session_id uuid, p_accept boolean, p_note text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid();
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT private.has_perm(v_actor,'count_review') THEN RAISE EXCEPTION 'لا تملك صلاحية مراجعة الجرد'; END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status <> 'submitted' THEN RAISE EXCEPTION 'لا يمكن مراجعة الجرد في هذه الحالة'; END IF;
  IF NOT p_accept AND COALESCE(NULLIF(p_note,''), '') = '' THEN RAISE EXCEPTION 'سبب الإرجاع إلزامي'; END IF;

  UPDATE public.count_sessions SET
    status = CASE WHEN p_accept THEN 'reviewed'::public.count_session_status ELSE 'in_progress'::public.count_session_status END,
    reviewed_by = v_actor, reviewed_at = now(), review_note = NULLIF(p_note,'')
  WHERE id = p_session_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'count_review', 'count_sessions', p_session_id, s.branch_id,
          jsonb_build_object('accepted', p_accept, 'note', p_note));
END;
$$;

-- ===== approve: settle stock to counted quantities =====
CREATE OR REPLACE FUNCTION public.approve_count_session(p_session_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid(); r record; v_total numeric := 0;
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id FOR UPDATE;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT private.has_perm(v_actor,'count_approve') THEN RAISE EXCEPTION 'لا تملك صلاحية اعتماد الجرد'; END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status NOT IN ('submitted','reviewed') THEN RAISE EXCEPTION 'لا يمكن اعتماد الجرد في هذه الحالة'; END IF;

  PERFORM private.count_rebuild_lines(p_session_id);

  FOR r IN SELECT cl.id, cl.product_id, cl.counted_qty, cl.expected_qty, cl.variance_qty, cl.variance_value
           FROM public.count_lines cl WHERE cl.session_id = p_session_id AND cl.counted_qty IS NOT NULL LOOP
    IF r.counted_qty - r.expected_qty <> 0 THEN
      PERFORM private.post_stock(s.branch_id, r.product_id, r.counted_qty - r.expected_qty,
        'count_adjust'::public.stock_reason, 'count_sessions', p_session_id, 'تسوية جرد', v_actor);
    END IF;
    v_total := v_total + COALESCE(r.variance_value, 0);
  END LOOP;

  UPDATE public.count_sessions SET status = 'approved', approved_by = v_actor, approved_at = now()
  WHERE id = p_session_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'count_approve', 'count_sessions', p_session_id, s.branch_id,
          jsonb_build_object('variance_value', round(v_total,2)));
END;
$$;

-- ===== edit one line after approval (special permission) =====
CREATE OR REPLACE FUNCTION public.edit_approved_count_line(p_line_id uuid, p_counted_qty numeric, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; cl public.count_lines; v_actor uuid := auth.uid(); v_delta numeric;
BEGIN
  SELECT * INTO cl FROM public.count_lines WHERE id = p_line_id;
  IF cl.id IS NULL THEN RAISE EXCEPTION 'البند غير موجود'; END IF;
  SELECT * INTO s FROM public.count_sessions WHERE id = cl.session_id;
  IF NOT private.has_perm(v_actor,'count_edit_approved') THEN RAISE EXCEPTION 'لا تملك صلاحية تعديل جرد معتمد'; END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status <> 'approved' THEN RAISE EXCEPTION 'هذا البند ليس في جرد معتمد'; END IF;
  IF COALESCE(NULLIF(p_reason,''),'') = '' THEN RAISE EXCEPTION 'سبب التعديل إلزامي'; END IF;
  IF p_counted_qty IS NULL OR p_counted_qty < 0 THEN RAISE EXCEPTION 'كمية غير صحيحة'; END IF;

  v_delta := p_counted_qty - COALESCE(cl.counted_qty, 0);

  UPDATE public.count_lines SET counted_qty = p_counted_qty, expected_qty = p_counted_qty,
    note = COALESCE(note,'') || CASE WHEN COALESCE(note,'') = '' THEN '' ELSE ' | ' END || 'تعديل بعد الاعتماد: ' || p_reason,
    counted_by = v_actor, counted_at = now()
  WHERE id = p_line_id;

  IF v_delta <> 0 THEN
    PERFORM private.post_stock(s.branch_id, cl.product_id, v_delta,
      'correction'::public.stock_reason, 'count_sessions', s.id, 'تصحيح جرد معتمد: ' || p_reason, v_actor);
  END IF;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details, old_value, new_value)
  VALUES (v_actor, 'count_edit_approved', 'count_sessions', s.id, s.branch_id,
          jsonb_build_object('reason', p_reason, 'product_id', cl.product_id),
          jsonb_build_object('counted_qty', cl.counted_qty),
          jsonb_build_object('counted_qty', p_counted_qty));
END;
$$;

-- ===== cancel an unfinished session =====
CREATE OR REPLACE FUNCTION public.cancel_count_session(p_session_id uuid, p_reason text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE s public.count_sessions; v_actor uuid := auth.uid();
BEGIN
  SELECT * INTO s FROM public.count_sessions WHERE id = p_session_id;
  IF s.id IS NULL THEN RAISE EXCEPTION 'الجرد غير موجود'; END IF;
  IF NOT (private.has_perm(v_actor,'count_review') OR private.has_perm(v_actor,'count_approve')) THEN
    RAISE EXCEPTION 'لا تملك صلاحية إلغاء الجرد';
  END IF;
  IF NOT private.has_branch_access(v_actor, s.branch_id) THEN RAISE EXCEPTION 'لا تملك وصولاً لهذا الفرع'; END IF;
  IF s.status = 'approved' THEN RAISE EXCEPTION 'الجرد معتمد ولا يمكن إلغاؤه'; END IF;
  IF COALESCE(NULLIF(p_reason,''),'') = '' THEN RAISE EXCEPTION 'سبب الإلغاء إلزامي'; END IF;

  UPDATE public.count_sessions SET status = 'cancelled', cancel_reason = p_reason WHERE id = p_session_id;

  INSERT INTO public.activity_log (actor_user, action, entity, entity_id, branch_id, details)
  VALUES (v_actor, 'count_review', 'count_sessions', p_session_id, s.branch_id,
          jsonb_build_object('cancelled', true, 'reason', p_reason));
END;
$$;

REVOKE ALL ON FUNCTION private.count_rebuild_lines(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_count_session(uuid, text, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_count_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_count_lines(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_count_session(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_count_session(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_count_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.edit_approved_count_line(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_count_session(uuid, text) TO authenticated;