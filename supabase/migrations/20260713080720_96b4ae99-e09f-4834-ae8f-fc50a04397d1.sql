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
  SELECT COALESCE(p.full_name, e.full_name)
    INTO derived_name
  FROM public.profiles p
  FULL OUTER JOIN public.employees e ON e.user_id = auth.uid()
  WHERE p.id = auth.uid() OR e.user_id = auth.uid()
  LIMIT 1;
  NEW.actor_name := COALESCE(derived_name, 'user');
  RETURN NEW;
END;
$function$;