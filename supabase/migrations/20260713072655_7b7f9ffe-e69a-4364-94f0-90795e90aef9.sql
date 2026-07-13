REVOKE ALL ON FUNCTION public.recompute_receipt_totals() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recompute_receipt_totals() FROM anon;
REVOKE ALL ON FUNCTION public.recompute_receipt_totals() FROM authenticated;

REVOKE ALL ON FUNCTION public.sync_order_status_from_receipts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_order_status_from_receipts() FROM anon;
REVOKE ALL ON FUNCTION public.sync_order_status_from_receipts() FROM authenticated;