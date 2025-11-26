-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text null;

-- Create a unique index on email for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email) WHERE email IS NOT NULL;

-- Update existing profiles with email from auth.users
UPDATE public.profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
AND profiles.email IS NULL;