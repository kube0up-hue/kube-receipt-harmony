DROP FUNCTION IF EXISTS public.submit_tomorrow_order(uuid, date, text, jsonb);
DROP FUNCTION IF EXISTS public.review_tomorrow_order(uuid, boolean, text);
DELETE FROM public.user_permissions WHERE permission::text IN ('tomorrow_orders_create', 'tomorrow_orders_approve');
DROP TABLE IF EXISTS public.tomorrow_order_items;
DROP TABLE IF EXISTS public.tomorrow_orders;