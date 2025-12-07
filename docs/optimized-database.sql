-- Optimized Database Schema for CourtEase
-- Generated: 2025-12-05
-- Focus: Performance, Simplicity, Maintainability

-- =====================================
-- ENUMS (No Changes - Already Optimized)
-- =====================================

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('user', 'venue_partner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.payment_status AS ENUM ('pending', 'waiting_confirmation', 'paid', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.sport_types AS ENUM ('futsal', 'basket', 'volley', 'badminton', 'tennis', 'padel');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE IF NOT EXISTS public.surface_types AS ENUM ('vinyl', 'rubber', 'parquet', 'wood', 'synthetic', 'cement', 'turf', 'grass', 'hard_court', 'clay');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =====================================
-- CORE TABLES (Keep Existing, Minor Optimizations)
-- =====================================

-- Profiles table (existing, optimized)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY,
    full_name text,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    email character varying UNIQUE,
    phone text UNIQUE,
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Venues table (optimized indexes)
CREATE TABLE IF NOT EXISTS public.venues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text GENERATED ALWAYS AS (
        (lower(replace(name, ' ', '-')) || '-' || substr((id)::text, 1, 6))
    ) STORED,
    city text,
    district text,
    address text,
    latitude double precision,
    longitude double precision,
    description text,
    owner_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
    contact_phone text,
    contact_email text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    venue_status text NOT NULL DEFAULT 'inactive'
);

-- Courts table (optimized)
CREATE TABLE IF NOT EXISTS public.courts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id uuid NOT NULL REFERENCES public.venues (id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text GENERATED ALWAYS AS (
        (lower(replace(name, ' ', '-')) || '-' || substr((id)::text, 1, 6))
    ) STORED UNIQUE,
    sport public.sport_types NOT NULL,
    surface public.surface_types,
    price_per_hour integer NOT NULL CHECK (price_per_hour >= 0),
    capacity integer CHECK (capacity >= 0),
    facilities text[] DEFAULT '{}',
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    primary_image_url text
);

-- Bookings table (optimized indexes)
CREATE TABLE IF NOT EXISTS public.bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id uuid NOT NULL REFERENCES public.courts (id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL CHECK (end_time > start_time),
    status public.booking_status NOT NULL DEFAULT 'pending',
    payment_status public.payment_status NOT NULL DEFAULT 'pending',
    payment_reference text UNIQUE,
    payment_token text,
    payment_redirect_url text,
    payment_expired_at timestamptz,
    price_total integer NOT NULL,
    notes text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    checked_in_at timestamptz,
    completed_at timestamptz,
    payment_completed_at timestamptz
);

-- Court Reviews table
CREATE TABLE IF NOT EXISTS public.court_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    court_id uuid NOT NULL REFERENCES public.courts (id) ON DELETE CASCADE,
    profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    rating numeric(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    booking_id uuid REFERENCES public.bookings (id) ON DELETE CASCADE,
    forum_thread_id uuid REFERENCES public.forum_threads (id) ON DELETE SET NULL
);

-- Forum Tables
CREATE TABLE IF NOT EXISTS public.forum_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.forum_threads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    body text,
    excerpt text,
    category_id uuid REFERENCES public.forum_categories (id) ON DELETE SET NULL,
    author_profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    reply_count integer NOT NULL DEFAULT 0,
    tags text[] DEFAULT '{}',
    status text NOT NULL DEFAULT 'published',
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id uuid NOT NULL REFERENCES public.forum_threads (id) ON DELETE CASCADE,
    author_profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    body text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Venue Partner Applications
CREATE TABLE IF NOT EXISTS public.venue_partner_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name text NOT NULL,
    contact_name text NOT NULL,
    contact_email text NOT NULL,
    contact_phone text,
    city text,
    facility_types text[] DEFAULT '{}',
    facility_count integer,
    existing_system text,
    notes text,
    status text NOT NULL DEFAULT 'pending',
    handled_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
    decision_note text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    reviewed_at timestamptz
);

-- =====================================
-- OPTIMIZED INDEXES
-- =====================================

-- Core performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_venues_owner_city ON public.venues(owner_profile_id, city);
CREATE INDEX IF NOT EXISTS idx_venues_status ON public.venues(venue_status);
CREATE INDEX IF NOT EXISTS idx_courts_venue_sport_active ON public.courts(venue_id, sport, is_active);
CREATE INDEX IF NOT EXISTS idx_courts_slug ON public.courts(slug);
CREATE INDEX IF NOT EXISTS idx_bookings_court_status_time ON public.bookings(court_id, status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_profile_status ON public.bookings(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_court_rating ON public.court_reviews(court_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_threads_status_created ON public.forum_threads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_thread_created ON public.forum_replies(thread_id, created_at);

-- Composite indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_bookings_venue_stats ON public.bookings(court_id, status, payment_status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status_created ON public.venue_partner_applications(status, created_at DESC);

-- =====================================
-- OPTIMIZED VIEWS (Simplified & Performance Focused)
-- =====================================

-- View: Active Courts (replaces multiple views)
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
    v.contact_phone AS venue_contact_phone,
    v.contact_email AS venue_contact_email,
    v.address AS venue_address,
    c.primary_image_url,
    COALESCE(AVG(cr.rating), 0) AS average_rating,
    COUNT(cr.id)::integer AS review_count,
    COUNT(b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')) AS total_bookings,
    COUNT(b.id) FILTER (
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
    ) AS today_revenue
FROM courts c
JOIN venues v ON v.id = c.venue_id
LEFT JOIN court_reviews cr ON cr.court_id = c.id
LEFT JOIN bookings b ON b.court_id = c.id
WHERE c.is_active = true
GROUP BY c.id, v.name, v.city, v.district, v.latitude, v.longitude,
         v.contact_phone, v.contact_email, v.address;

-- View: Venue Stats (simplified)
CREATE OR REPLACE VIEW public.venue_stats AS
WITH booking_data AS (
  -- Langkah 1: Hitung semua statistik yang berhubungan dengan booking
  SELECT
    c.venue_id,
    COUNT(DISTINCT c.id) as total_courts,
    COUNT(b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')) AS total_bookings,
    COUNT(b.id) FILTER (WHERE b.status NOT IN ('pending', 'cancelled') AND DATE(b.start_time) = CURRENT_DATE) AS today_bookings,
    COALESCE(SUM(b.price_total) FILTER (WHERE b.status NOT IN ('pending', 'cancelled')), 0) AS total_revenue,
    COALESCE(SUM(b.price_total) FILTER (WHERE b.status NOT IN ('pending', 'cancelled') AND DATE(b.start_time) = CURRENT_DATE), 0) AS today_revenue
  FROM courts c
  LEFT JOIN bookings b ON b.court_id = c.id
  WHERE c.is_active = true
  GROUP BY c.venue_id
),
rating_data AS (
  -- Langkah 2: Hitung rating rata-rata secara terpisah
  SELECT
    c.venue_id,
    COALESCE(AVG(cr.rating), 0) AS average_rating
  FROM courts c
  LEFT JOIN court_reviews cr ON cr.court_id = c.id
  WHERE c.is_active = true
  GROUP BY c.venue_id
)
-- Langkah 3: Gabungkan hasilnya ke tabel utama venues
SELECT
  v.id AS venue_id,
  v.slug,
  v.name AS venue_name,
  v.city AS venue_city,
  v.district AS venue_district,
  v.owner_profile_id,
  COALESCE(bd.total_courts, 0) AS total_courts,
  COALESCE(bd.total_bookings, 0) AS total_bookings,
  COALESCE(bd.today_bookings, 0) AS today_bookings,
  COALESCE(bd.total_revenue, 0) AS total_revenue,
  COALESCE(bd.today_revenue, 0) AS today_revenue,
  COALESCE(rd.average_rating, 0) AS average_rating,
  v.venue_status
FROM
  venues v
LEFT JOIN booking_data bd ON v.id = bd.venue_id
LEFT JOIN rating_data rd ON v.id = rd.venue_id;

-- View: Forum Threads with Authors (optimized)
CREATE OR REPLACE VIEW public.forum_threads_with_authors AS
SELECT
    ft.id,
    ft.slug,
    ft.title,
    ft.body,
    ft.excerpt,
    ft.category_id,
    ft.author_profile_id,
    COALESCE(p.full_name, 'Anonymous') AS author_name,
    ft.reply_count,
    ft.tags,
    ft.status,
    ft.created_at,
    ft.updated_at,
    fc.name AS category_name,
    fc.slug AS category_slug
FROM forum_threads ft
LEFT JOIN profiles p ON p.id = ft.author_profile_id
LEFT JOIN forum_categories fc ON fc.id = ft.category_id
WHERE ft.status = 'published';

-- View: Bookings with Courts (for user dashboards)
CREATE OR REPLACE VIEW public.bookings_with_courts AS
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
    b.created_at,
    b.checked_in_at,
    b.completed_at,
    b.payment_completed_at,
    b.payment_reference,
    b.payment_token,
    b.payment_redirect_url,
    b.payment_expired_at,
    b.review_submitted_at,
    c.name AS court_name,
    c.slug AS court_slug,
    c.sport,
    c.surface,
    c.price_per_hour,
    c.capacity,
    c.facilities,
    c.description,
    c.primary_image_url,
    v.name AS venue_name,
    v.city AS venue_city,
    v.district AS venue_district,
    v.address AS venue_address,
    v.latitude AS venue_latitude,
    v.longitude AS venue_longitude
FROM bookings b
JOIN courts c ON c.id = b.court_id
JOIN venues v ON v.id = c.venue_id;

-- =====================================
-- OPTIMIZED FUNCTIONS (Simplified)
-- =====================================

-- Function: Update timestamp trigger
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_venues_updated_at
    BEFORE UPDATE ON public.venues
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_courts_updated_at
    BEFORE UPDATE ON public.courts
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_forum_threads_updated_at
    BEFORE UPDATE ON public.forum_threads
    FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Function: Check admin role (optimized)
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = uid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get monthly revenue for admin dashboard
CREATE OR REPLACE FUNCTION public.get_monthly_revenue()
RETURNS TABLE(month text, revenue bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(DATE_TRUNC('month', start_time), 'Mon') AS month,
        COALESCE(SUM(price_total), 0)::bigint AS revenue
    FROM bookings
    WHERE status = 'completed'
      AND start_time >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
    GROUP BY DATE_TRUNC('month', start_time)
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Function: Get venue growth for admin dashboard
CREATE OR REPLACE FUNCTION public.get_venue_growth()
RETURNS TABLE(month text, total_venues integer) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(created_month, 'Mon') AS month,
        SUM(total_count) OVER (ORDER BY created_month) AS total_venues
    FROM (
        SELECT
            DATE_TRUNC('month', created_at) AS created_month,
            COUNT(*) AS total_count
        FROM venues
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
    ) monthly_data
    ORDER BY created_month;
END;
$$ LANGUAGE plpgsql;

-- Function: Get booking trends for admin dashboard
CREATE OR REPLACE FUNCTION public.get_booking_trends()
RETURNS TABLE(date text, bookings integer) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(day_date, 'Dy') AS date,
        COALESCE(booking_count, 0) AS bookings
    FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
    ) day_date(day_date)
    LEFT JOIN (
        SELECT
            DATE(start_time) AS booking_date,
            COUNT(*) AS booking_count
        FROM bookings
        WHERE status = 'completed'
          AND start_time >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(start_time)
    ) booking_data ON day_date = booking_data.booking_date
    ORDER BY day_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- RLS (Row Level Security) - Simplified
-- =====================================

-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.venue_partner_applications ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public read access to venues" ON public.venues
    FOR SELECT USING (venue_status = 'active');

CREATE POLICY "Public read access to courts" ON public.courts
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public read access to reviews" ON public.court_reviews
    FOR SELECT USING (true);

CREATE POLICY "Public read access to forum threads" ON public.forum_threads
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public read access to forum replies" ON public.forum_replies
    FOR SELECT USING (true);

-- Profile-based policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Booking policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Venue partners can view bookings for their courts" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM courts c
            JOIN venues v ON v.id = c.venue_id
            WHERE c.id = court_id AND v.owner_profile_id = auth.uid()
        )
    );

-- Review policies
CREATE POLICY "Users can create reviews for booked courts" ON public.court_reviews
    FOR INSERT WITH CHECK (
        auth.uid() = profile_id AND
        EXISTS (
            SELECT 1 FROM bookings
            WHERE id = booking_id AND profile_id = auth.uid() AND status = 'completed'
        )
    );

CREATE POLICY "Users can view all reviews" ON public.court_reviews
    FOR SELECT USING (true);

-- Forum policies
CREATE POLICY "Users can create forum threads" ON public.forum_threads
    FOR INSERT WITH CHECK (auth.uid() = author_profile_id);

CREATE POLICY "Users can update own forum threads" ON public.forum_threads
    FOR UPDATE USING (auth.uid() = author_profile_id);

CREATE POLICY "Users can create forum replies" ON public.forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_profile_id);

-- Admin policies
CREATE POLICY "Admins have full access" ON public.profiles
    FOR ALL USING (EXISTS (SELECT 1 FROM public.is_admin(auth.uid())));

CREATE POLICY "Admins have full access to venues" ON public.venues
    FOR ALL USING (EXISTS (SELECT 1 FROM public.is_admin(auth.uid())));

CREATE POLICY "Admins have full access to courts" ON public.courts
    FOR ALL USING (EXISTS (SELECT 1 FROM public.is_admin(auth.uid())));

CREATE POLICY "Admins have full access to bookings" ON public.bookings
    FOR ALL USING (EXISTS (SELECT 1 FROM public.is_admin(auth.uid())));

CREATE POLICY "Admins have full access to applications" ON public.venue_partner_applications
    FOR ALL USING (EXISTS (SELECT 1 FROM public.is_admin(auth.uid())));

-- =====================================
-- PERFORMANCE SETTINGS
-- =====================================

-- Set statement timeout for dashboard queries
SET statement_timeout = '30s';

-- Optimize for parallel queries
SET max_parallel_workers_per_gather = 4;

-- Enable sequential scan optimization
SET enable_seqscan = off;

-- =====================================
-- FINAL VERIFICATION
-- =====================================

-- Verify views are created correctly
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'active_courts') THEN
        RAISE EXCEPTION 'active_courts view was not created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'venue_stats') THEN
        RAISE EXCEPTION 'venue_stats view was not created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'forum_threads_with_authors') THEN
        RAISE EXCEPTION 'forum_threads_with_authors view was not created';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'bookings_with_courts') THEN
        RAISE EXCEPTION 'bookings_with_courts view was not created';
    END IF;

    RAISE NOTICE '✅ All optimized database objects created successfully!';
END $$;

-- Performance test queries
DO $$
BEGIN
    -- Test optimized court queries
    PERFORM 1 FROM public.active_courts LIMIT 1;

    -- Test venue stats query
    PERFORM 1 FROM public.venue_stats LIMIT 1;

    -- Test forum query
    PERFORM 1 FROM public.forum_threads_with_authors LIMIT 1;

    RAISE NOTICE '✅ Performance test queries passed!';
END $$;

COMMIT;
