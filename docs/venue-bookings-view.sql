-- Create a comprehensive view for venue bookings with essential data
-- This includes customer profile information for venue partner dashboard
CREATE OR REPLACE VIEW public.venue_bookings_with_details AS
SELECT
    b.id,
    b.court_id,
    b.profile_id,
    b.start_time,
    b.end_time,
    b.status,
    b.payment_status,
    b.price_total,
    b.notes,
    b.checked_in_at,
    b.completed_at,
    b.payment_completed_at,
    b.payment_reference,
    -- Court information
    c.name AS court_name,
    c.slug AS court_slug,
    c.sport,
    c.surface,
    c.price_per_hour,
    -- Venue information
    v.name AS venue_name,
    v.city AS venue_city,
    v.owner_profile_id,
    -- Customer profile information
    p.full_name AS customer_full_name,
    p.email AS customer_email
FROM bookings b
JOIN courts c ON c.id = b.court_id
JOIN venues v ON v.id = c.venue_id
JOIN profiles p ON p.id = b.profile_id;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_venue_bookings_with_details_venue_id ON public.venue_bookings_with_details(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_with_details_court_id ON public.venue_bookings_with_details(court_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_with_details_profile_id ON public.venue_bookings_with_details(profile_id);
CREATE INDEX IF NOT EXISTS idx_venue_bookings_with_details_start_time ON public.venue_bookings_with_details(start_time);