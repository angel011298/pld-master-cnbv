-- Add multi-use support to premium QR codes.
-- max_uses NULL = unlimited; use_count tracks total redemptions.
ALTER TABLE public.premium_qr_codes
  ADD COLUMN IF NOT EXISTS max_uses  integer,          -- NULL = unlimited
  ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;
