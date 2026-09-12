INSERT INTO public.user_permissions (user_id, permission)
SELECT e.user_id, p.perm::public.app_permission
FROM public.employees e
CROSS JOIN (VALUES
  ('waste_record'), ('waste_view'),
  ('quality_record'), ('quality_view'),
  ('sales_record'),
  ('inventory_view'), ('orders_view'),
  ('count_review'), ('alerts_view')
) AS p(perm)
WHERE e.full_name = 'سلطان' AND e.user_id IS NOT NULL
ON CONFLICT (user_id, permission) DO NOTHING;