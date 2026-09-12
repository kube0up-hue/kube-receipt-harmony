REVOKE ALL ON FUNCTION public.stock_adjust(uuid, uuid, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.stock_transfer_send(uuid, uuid, text, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.stock_transfer_receive(uuid, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.stock_adjust(uuid, uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.stock_transfer_send(uuid, uuid, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.stock_transfer_receive(uuid, jsonb, text) TO authenticated;