DO $$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.open_count_session(uuid, text, date, text)',
    'public.refresh_count_session(uuid)',
    'public.save_count_lines(uuid, jsonb)',
    'public.submit_count_session(uuid, text)',
    'public.review_count_session(uuid, boolean, text)',
    'public.approve_count_session(uuid)',
    'public.edit_approved_count_line(uuid, numeric, text)',
    'public.cancel_count_session(uuid, text)',
    'public.compute_count_line_fields()',
    'public.sync_count_lines_from_ledger()'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', f);
  END LOOP;
  FOREACH f IN ARRAY ARRAY[
    'public.open_count_session(uuid, text, date, text)',
    'public.refresh_count_session(uuid)',
    'public.save_count_lines(uuid, jsonb)',
    'public.submit_count_session(uuid, text)',
    'public.review_count_session(uuid, boolean, text)',
    'public.approve_count_session(uuid)',
    'public.edit_approved_count_line(uuid, numeric, text)',
    'public.cancel_count_session(uuid, text)'
  ] LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', f);
  END LOOP;
END $$;