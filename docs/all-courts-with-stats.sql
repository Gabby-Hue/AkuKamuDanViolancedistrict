-- Create a view that includes ALL courts (active and inactive) with their statistics
-- This replaces active_courts view for venue partner dashboard
CREATE OR REPLACE VIEW public.all_courts_with_stats AS
SELECT
    c.id,
    c.slug,
    c.name,
    c.sport,
    c.surface,
    c.price_per_hour,
    c.capacity,
    c.facilities,
    c.description,
    c.venue_id,
    c.is_active,
    c.primary_image_url,
    c.created_at,
    c.updated_at,
    -- Venue information
    v.name AS venue_name,
    v.city AS venue_city,
    v.latitude AS venue_latitude,
    v.longitude AS venue_longitude,
    v.contact_phone AS venue_contact_phone,
    v.contact_email AS venue_contact_email,
    v.address AS venue_address,
    -- Statistics (only for active courts, null/0 for inactive)
    CASE
        WHEN c.is_active = true THEN COALESCE(AVG(cr.rating), 0)
        ELSE 0
    END AS average_rating,
    CASE
        WHEN c.is_active = true THEN COUNT(cr.id)::integer
        ELSE 0
    END AS review_count,
    CASE
        WHEN c.is_active = true THEN COUNT(b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled'))
        ELSE 0
    END AS total_bookings,
    CASE
        WHEN c.is_active = true THEN COUNT(b.id) FILTER (
            WHERE b.status NOT IN ('pending', 'cancelled')
            AND DATE(b.start_time) = CURRENT_DATE
        )
        ELSE 0
    END AS today_bookings,
    CASE
        WHEN c.is_active = true THEN COALESCE(SUM(b.price_total) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')), 0)
        ELSE 0
    END AS total_revenue,
    CASE
        WHEN c.is_active = true THEN COALESCE(
            SUM(b.price_total) FILTER (
                WHERE b.status NOT IN ('pending', 'cancelled')
                AND DATE(b.start_time) = CURRENT_DATE
            ), 0
        )
        ELSE 0
    END AS today_revenue
FROM courts c
LEFT JOIN venues v ON v.id = c.venue_id
LEFT JOIN court_reviews cr ON cr.court_id = c.id
LEFT JOIN bookings b ON b.court_id = c.id
GROUP BY
    c.id, c.slug, c.name, c.sport, c.surface, c.price_per_hour,
    c.capacity, c.facilities, c.description, c.venue_id, c.is_active,
    c.primary_image_url, c.created_at, c.updated_at,
    v.name, v.city, v.latitude, v.longitude,
    v.contact_phone, v.contact_email, v.address;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_all_courts_with_stats_venue_id ON public.all_courts_with_stats(venue_id);
CREATE INDEX IF NOT EXISTS idx_all_courts_with_stats_is_active ON public.all_courts_with_stats(is_active);
