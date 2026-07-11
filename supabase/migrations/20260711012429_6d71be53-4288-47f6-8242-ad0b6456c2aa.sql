
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.compute_receipt_item_fields() SET search_path = public;
ALTER FUNCTION public.recompute_receipt_totals() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
