
REVOKE EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) TO service_role;
