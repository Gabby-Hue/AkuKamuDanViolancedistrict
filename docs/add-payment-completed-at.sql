-- Add payment_completed_at column to bookings table
-- This column will track when payment was completed via Midtrans webhook

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_completed_at timestamp with time zone NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS bookings_payment_completed_at_idx
ON public.bookings (payment_completed_at)
TABLESPACE pg_default;

-- Add comment for documentation
COMMENT ON COLUMN public.bookings.payment_completed_at IS 'Timestamp when payment was completed via Midtrans webhook (NULL for non-Midtrans payments)';