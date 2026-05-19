-- Track every individual QR-code redemption (one row per user per code).
-- UNIQUE(code_id, user_id) ensures a user can only redeem the same code once.
CREATE TABLE IF NOT EXISTS public.premium_qr_redemptions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id     uuid        NOT NULL REFERENCES public.premium_qr_codes(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code_id, user_id)
);

ALTER TABLE public.premium_qr_redemptions ENABLE ROW LEVEL SECURITY;
-- All access goes through the service-role API; no user-facing RLS policies needed.
