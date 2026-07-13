
ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS telegram_notification_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS telegram_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS telegram_message_id bigint,
  ADD COLUMN IF NOT EXISTS telegram_error text;

ALTER TABLE public.receipts
  DROP CONSTRAINT IF EXISTS receipts_telegram_notification_status_check;
ALTER TABLE public.receipts
  ADD CONSTRAINT receipts_telegram_notification_status_check
  CHECK (telegram_notification_status IN ('pending','sent','failed'));

-- Security-definer helper so any authenticated caller (via the server fn) can
-- update only these tracking columns without widening receipts UPDATE policies.
CREATE OR REPLACE FUNCTION public.mark_receipt_telegram(
  p_receipt_id uuid,
  p_status text,
  p_message_id bigint DEFAULT NULL,
  p_error text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('pending','sent','failed') THEN
    RAISE EXCEPTION 'invalid telegram status: %', p_status;
  END IF;
  UPDATE public.receipts SET
    telegram_notification_status = p_status,
    telegram_sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE telegram_sent_at END,
    telegram_message_id = CASE WHEN p_status = 'sent' THEN p_message_id ELSE telegram_message_id END,
    telegram_error = CASE WHEN p_status = 'sent' THEN NULL ELSE p_error END
  WHERE id = p_receipt_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_receipt_telegram(uuid, text, bigint, text) TO authenticated;
