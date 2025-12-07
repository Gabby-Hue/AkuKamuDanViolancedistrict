-- Migration to add contact_phone and contact_email fields if they don't exist
-- This ensures the contact fields are available in the venues table

DO $$
BEGIN
    -- Add contact_phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues'
        AND column_name = 'contact_phone'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venues ADD COLUMN contact_phone text null;
        RAISE NOTICE 'Added contact_phone column to venues table';
    END IF;

    -- Add contact_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues'
        AND column_name = 'contact_email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.venues ADD COLUMN contact_email text null;
        RAISE NOTICE 'Added contact_email column to venues table';
    END IF;
END $$;

-- Create a simple test query to verify the columns exist
-- This can be run to confirm the migration worked
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'venues'
    AND column_name IN ('contact_phone', 'contact_email')
    AND table_schema = 'public'
ORDER BY column_name;