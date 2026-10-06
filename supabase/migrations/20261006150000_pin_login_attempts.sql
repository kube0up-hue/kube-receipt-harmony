-- حماية دخول PIN من التخمين: سجل محاولات الدخول (يُستخدم من الخادم فقط عبر service_role)
CREATE TABLE IF NOT EXISTS public.pin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pin_login_attempts_created_idx ON public.pin_login_attempts (created_at);
CREATE INDEX IF NOT EXISTS pin_login_attempts_ip_created_idx ON public.pin_login_attempts (ip, created_at);

ALTER TABLE public.pin_login_attempts ENABLE ROW LEVEL SECURITY;
-- بدون سياسات: لا وصول للمستخدمين، فقط service_role
REVOKE ALL ON public.pin_login_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.pin_login_attempts TO service_role;
