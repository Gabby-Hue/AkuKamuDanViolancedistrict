-- Production Database Migration for Payment Status Fix
-- Run this in PRODUCTION Supabase database

-- 1. Add payment_completed_at column if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_completed_at timestamp with time zone NULL;

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS bookings_payment_completed_at_idx
ON public.bookings (payment_completed_at)
TABLESPACE pg_default;

-- 3. Add comment for documentation
COMMENT ON COLUMN public.bookings.payment_completed_at IS 'Timestamp when payment was completed via Midtrans webhook (NULL for non-Midtrans payments)';

-- 4. Update existing stuck bookings with Midtrans payment references
-- This will fix any bookings that are stuck in 'pending' status but were actually paid
UPDATE public.bookings
SET
  payment_status = 'paid',
  status = 'confirmed',
  payment_completed_at = updated_at,
  updated_at = NOW()
WHERE
  payment_reference IS NOT NULL
  AND payment_status = 'pending'
  AND status = 'pending'
  AND created_at < NOW() - INTERVAL '30 minutes';

-- 5. Verify the updates
SELECT
  id,
  payment_reference,
  payment_status,
  status,
  payment_completed_at,
  created_at,
  updated_at
FROM public.bookings
WHERE
  payment_reference IS NOT NULL
  AND (
    payment_status = 'paid'
    OR payment_status = 'confirmed'
  )
ORDER BY updated_at DESC
LIMIT 10;