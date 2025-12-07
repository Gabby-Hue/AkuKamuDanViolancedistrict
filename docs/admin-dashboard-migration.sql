-- Admin Dashboard Views and Functions Migration
-- Run this in Supabase SQL Editor to enable admin dashboard charts and stats

-- =====================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================

-- View: Active Courts (for admin dashboard)
CREATE OR REPLACE VIEW public.active_courts AS
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
    v.name AS venue_name,
    v.city AS venue_city,
    v.district AS venue_district,
    v.latitude AS venue_latitude,
    v.longitude AS venue_longitude,
    c.primary_image_url,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')) AS total_bookings,
    COUNT(DISTINCT b.id) FILTER (
        WHERE b.status NOT IN ('pending', 'cancelled')
        AND DATE(b.start_time) = CURRENT_DATE
    ) AS today_bookings,
    COALESCE(SUM(b.price_total) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')), 0) AS total_revenue,
    COALESCE(AVG(DISTINCT cr.rating), 0) AS average_rating,
    COUNT(DISTINCT cr.id) AS review_count,
    c.is_active
FROM courts c
LEFT JOIN venues v ON v.id = c.venue_id
LEFT JOIN bookings b ON b.court_id = c.id
LEFT JOIN court_reviews cr ON cr.court_id = c.id
GROUP BY c.id, c.slug, c.name, c.sport, c.surface, c.price_per_hour, c.capacity,
         c.facilities, c.description, c.venue_id, v.name, v.city, v.district,
         v.latitude, v.longitude, c.primary_image_url, c.is_active;

-- View: Venue Stats (for admin dashboard top venues)
CREATE OR REPLACE VIEW public.venue_stats AS
SELECT
    v.id AS venue_id,
    v.slug,
    v.name AS venue_name,
    v.city AS venue_city,
    v.district AS venue_district,
    v.owner_profile_id,
    COUNT(DISTINCT c.id) AS total_courts,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')) AS total_bookings,
    COUNT(DISTINCT b.id) FILTER (
        WHERE b.status NOT IN ('pending', 'cancelled')
        AND DATE(b.start_time) = CURRENT_DATE
    ) AS today_bookings,
    COALESCE(SUM(b.price_total) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')), 0) AS total_revenue,
    COALESCE(
        SUM(b.price_total) FILTER (
            WHERE b.status NOT IN ('pending', 'cancelled')
            AND DATE(b.start_time) = CURRENT_DATE
        ),
        0
    ) AS today_revenue,
    COALESCE(AVG(DISTINCT cr.rating), 0) AS average_rating,
    v.venue_status
FROM venues v
LEFT JOIN courts c ON c.venue_id = v.id AND c.is_active = true
LEFT JOIN bookings b ON b.court_id = c.id
LEFT JOIN court_reviews cr ON cr.court_id = c.id
GROUP BY v.id, v.slug, v.name, v.city, v.district, v.owner_profile_id, v.venue_status;

-- =====================================
-- RPC FUNCTIONS FOR ADMIN DASHBOARD CHARTS
-- =====================================

-- Function: Get monthly revenue for admin dashboard (always returns 6 months)
CREATE OR REPLACE FUNCTION public.get_monthly_revenue()
RETURNS TABLE(month text, revenue bigint) AS $$
WITH months AS (
    -- Generate last 6 months
    SELECT
        TO_CHAR(DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::INTERVAL, 'Mon') AS month,
        DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::INTERVAL AS month_date
    FROM generate_series(0, 5) AS n
),
revenue_data AS (
    -- Get actual revenue for these months
    SELECT
        TO_CHAR(DATE_TRUNC('month', start_time), 'Mon') AS month,
        COALESCE(SUM(price_total), 0)::bigint AS revenue
    FROM bookings
    WHERE status = 'completed'
      AND start_time >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY DATE_TRUNC('month', start_time)
)
-- Return all 6 months with actual revenue or 0
SELECT
    m.month,
    COALESCE(rd.revenue, 0)::bigint AS revenue
FROM months m
LEFT JOIN revenue_data rd ON m.month = rd.month
ORDER BY m.month_date;
$$ LANGUAGE plpgsql;

-- Function: Get venue growth for admin dashboard (always returns 6 months)
CREATE OR REPLACE FUNCTION public.get_venue_growth()
RETURNS TABLE(month text, total_venues integer) AS $$
WITH months AS (
    -- Generate last 6 months
    SELECT
        TO_CHAR(DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::INTERVAL, 'Mon') AS month,
        DATE_TRUNC('month', CURRENT_DATE) - (n || ' months')::INTERVAL AS month_date
    FROM generate_series(0, 5) AS n
),
venue_counts AS (
    -- Get cumulative venue count for each month end
    SELECT
        DATE_TRUNC('month', created_at) AS month_end,
        COUNT(*) OVER (ORDER BY DATE_TRUNC('month', created_at)) AS cumulative_count
    FROM venues
    WHERE created_at <= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY DATE_TRUNC('month', created_at), id
)
-- Return all 6 months with cumulative venue count
SELECT
    m.month,
    COALESCE(
        (SELECT MAX(vc.cumulative_count)
         FROM venue_counts vc
         WHERE vc.month_end <= m.month_date),
        0
    )::integer AS total_venues
FROM months m
ORDER BY m.month_date;
$$ LANGUAGE plpgsql;

-- Function: Get booking trends for admin dashboard (always returns 7 days)
CREATE OR REPLACE FUNCTION public.get_booking_trends()
RETURNS TABLE(date text, bookings integer) AS $$
WITH days AS (
    -- Generate last 7 days consistently
    SELECT
        TO_CHAR(CURRENT_DATE - (n || ' days')::INTERVAL, 'Dy') AS date,
        CURRENT_DATE - (n || ' days')::INTERVAL AS day_date
    FROM generate_series(6, 0) AS n
),
booking_data AS (
    -- Get actual bookings for these days
    SELECT
        DATE(start_time) AS booking_date,
        COUNT(*) AS booking_count
    FROM bookings
    WHERE status = 'completed'
      AND start_time >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY DATE(start_time)
)
-- Return all 7 days with actual bookings or 0
SELECT
    d.date,
    COALESCE(bd.booking_count, 0)::integer AS bookings
FROM days d
LEFT JOIN booking_data bd ON DATE(d.day_date) = bd.booking_date
ORDER BY d.day_date;
$$ LANGUAGE plpgsql;

-- =====================================
-- DROP FIELDS FROM venue_partner_applications
-- =====================================

-- Remove the unwanted fields
ALTER TABLE public.venue_partner_applications
DROP COLUMN IF EXISTS facility_types,
DROP COLUMN IF EXISTS facility_count,
DROP COLUMN IF EXISTS decision_note;

-- =====================================
-- VERIFICATION QUERIES
-- =====================================

-- Test the views
-- SELECT * FROM public.venue_stats LIMIT 5;
-- SELECT * FROM public.active_courts LIMIT 5;

-- Test the functions
-- SELECT * FROM public.get_monthly_revenue();
-- SELECT * FROM public.get_venue_growth();
-- SELECT * FROM public.get_booking_trends();

-- Verify fields removed
-- \d public.venue_partner_applications