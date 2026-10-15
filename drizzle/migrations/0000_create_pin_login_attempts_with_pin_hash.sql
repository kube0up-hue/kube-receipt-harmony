CREATE TABLE public.pin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL DEFAULT 'unknown',
  pin_hash text,
  success boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.pin_login_attempts TO service_role;
ALTER TABLE public.pin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX pin_login_attempts_pin_hash_idx ON public.pin_login_attempts (pin_hash, created_at) WHERE success = false;
CREATE INDEX pin_login_attempts_created_idx ON public.pin_login_attempts (created_at) WHERE success = false;