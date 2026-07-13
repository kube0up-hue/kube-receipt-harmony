CREATE OR REPLACE FUNCTION public.set_activity_log_actor_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  derived_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    NEW.actor_user := NULL;
    NEW.actor_name := COALESCE(NEW.actor_name, 'system');
    RETURN NEW;
  END IF;
  NEW.actor_user := auth.uid();
  SELECT COALESCE(
    (SELECT p.full_name FROM public.profiles p WHERE p.id = auth.uid() LIMIT 1),
    (SELECT e.full_name FROM public.employees e WHERE e.user_id = auth.uid() LIMIT 1)
  ) INTO derived_name;
  NEW.actor_name := COALESCE(derived_name, 'user');
  RETURN NEW;
END;
$function$;