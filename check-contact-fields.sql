-- Test query to check if contact_phone and contact_email exist and have data
-- Run this in Supabase SQL Editor to verify

SELECT
    id,
    name,
    contact_phone,
    contact_email,
    city,
    venue_status
FROM venues
WHERE owner_profile_id = 'YOUR_USER_ID_HERE' -- Replace with actual user ID
LIMIT 5;

-- Check if venues have contact data at all
SELECT
    COUNT(*) as total_venues,
    COUNT(contact_phone) as venues_with_phone,
    COUNT(contact_email) as venues_with_email
FROM venues
WHERE venue_status = 'active';

-- Check a specific venue if you know the ID
-- SELECT * FROM venues WHERE id = 'YOUR_VENUE_ID_HERE';