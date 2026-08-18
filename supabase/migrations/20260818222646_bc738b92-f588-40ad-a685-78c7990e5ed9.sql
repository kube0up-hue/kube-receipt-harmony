ALTER TABLE public.orders ALTER COLUMN order_date SET DEFAULT ((now() AT TIME ZONE 'Asia/Riyadh')::date);

UPDATE public.orders
SET order_date = (created_at AT TIME ZONE 'Asia/Riyadh')::date
WHERE order_date <> (created_at AT TIME ZONE 'Asia/Riyadh')::date;

ALTER TABLE public.receipts REPLICA IDENTITY FULL;
ALTER TABLE public.orders REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.receipts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;