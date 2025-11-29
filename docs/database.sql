-- Enums
CREATE TYPE public.app_role AS ENUM (
  'user',
  'venue_partner',
  'admin'
);

CREATE TYPE public.partner_application_status AS ENUM (
  'pending',
  'accepted',
  'rejected'
);

CREATE TYPE public.booking_status AS ENUM (
  'pending',
  'confirmed',
  'checked_in',
  'completed',
  'cancelled'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'processing',
  'paid',
  'expired',
  'cancelled'
);

CREATE TYPE public.blackout_scope AS ENUM (
  'time_range',
  'full_day'
);

CREATE TYPE public.blackout_frequency AS ENUM (
  'once',
  'daily',
  'weekly',
  'monthly'
);

-- bookings
create table public.bookings (
  id uuid not null default gen_random_uuid (),
  court_id uuid not null,
  profile_id uuid not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status public.booking_status not null default 'pending'::booking_status,
  payment_status public.payment_status not null default 'pending'::payment_status,
  payment_reference text null,
  payment_token text null,
  payment_redirect_url text null,
  payment_expired_at timestamp with time zone null,
  price_total integer not null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  checked_in_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  constraint bookings_pkey primary key (id),
  constraint bookings_payment_reference_key unique (payment_reference),
  constraint bookings_court_id_fkey foreign KEY (court_id) references courts (id) on delete CASCADE,
  constraint bookings_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE,
  constraint bookings_time_range check ((end_time > start_time))
) TABLESPACE pg_default;

create index IF not exists bookings_profile_id_idx on public.bookings using btree (profile_id) TABLESPACE pg_default;

create index IF not exists bookings_court_id_idx on public.bookings using btree (court_id) TABLESPACE pg_default;

create index IF not exists bookings_start_time_idx on public.bookings using btree (start_time desc) TABLESPACE pg_default;

create trigger set_bookings_updated_at BEFORE
update on bookings for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- court_blackouts
create table public.court_blackouts (
  id uuid not null default gen_random_uuid (),
  court_id uuid not null,
  title text not null,
  notes text null,
  scope public.blackout_scope not null default 'time_range'::blackout_scope,
  frequency public.blackout_frequency not null default 'once'::blackout_frequency,
  start_date date not null,
  end_date date not null,
  start_time time without time zone null,
  end_time time without time zone null,
  repeat_day_of_week smallint null,
  created_by uuid null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint court_blackouts_pkey primary key (id),
  constraint court_blackouts_court_id_fkey foreign KEY (court_id) references courts (id) on delete CASCADE,
  constraint court_blackouts_created_by_fkey foreign KEY (created_by) references profiles (id) on delete set null,
  constraint blackout_date_range check ((end_date >= start_date)),
  constraint blackout_dow_range check (
    (
      (repeat_day_of_week is null)
      or (
        (repeat_day_of_week >= 0)
        and (repeat_day_of_week <= 6)
      )
    )
  ),
  constraint blackout_time_range check (
    (
      (start_time is null)
      or (end_time is null)
      or (end_time > start_time)
    )
  )
) TABLESPACE pg_default;

create index IF not exists court_blackouts_court_id_idx on public.court_blackouts using btree (court_id) TABLESPACE pg_default;

create index IF not exists court_blackouts_date_idx on public.court_blackouts using btree (start_date, end_date) TABLESPACE pg_default;

create trigger set_court_blackouts_updated_at BEFORE
update on court_blackouts for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- court_booking_slots
create view public.court_booking_slots as
select
  id,
  court_id,
  start_time,
  end_time,
  status,
  payment_status
from
  bookings b
where
  status <> 'cancelled'::booking_status
  and payment_status <> 'cancelled'::payment_status;

-- court_review_summary
create view public.court_review_summary as
select
  c.id as court_id,
  COALESCE(avg(r.rating), 0::numeric)::numeric(3, 2) as average_rating,
  count(r.*)::integer as review_count
from
  courts c
  left join court_reviews r on r.court_id = c.id
group by
  c.id;

-- court_reviews
create table public.court_reviews (
  id uuid not null default gen_random_uuid (),
  court_id uuid not null,
  profile_id uuid not null,
  rating numeric(2, 1) not null,
  comment text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  booking_id uuid null,
  forum_thread_id uuid null,
  constraint court_reviews_pkey primary key (id),
  constraint court_reviews_forum_thread_id_key unique (forum_thread_id),
  constraint court_reviews_booking_id_key unique (booking_id),
  constraint court_reviews_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE,
  constraint court_reviews_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE,
  constraint court_reviews_court_id_fkey foreign KEY (court_id) references courts (id) on delete CASCADE,
  constraint court_reviews_forum_thread_id_fkey foreign KEY (forum_thread_id) references forum_threads (id) on delete set null,
  constraint court_reviews_rating_check check (
    (
      (rating >= (1)::numeric)
      and (rating <= (5)::numeric)
    )
  )
) TABLESPACE pg_default;

create index IF not exists court_reviews_court_id_idx on public.court_reviews using btree (court_id) TABLESPACE pg_default;

create index IF not exists court_reviews_profile_id_idx on public.court_reviews using btree (profile_id) TABLESPACE pg_default;

create index IF not exists court_reviews_booking_id_idx on public.court_reviews using btree (booking_id) TABLESPACE pg_default;

create index IF not exists court_reviews_forum_thread_id_idx on public.court_reviews using btree (forum_thread_id) TABLESPACE pg_default;

-- court_summaries
create view public.court_summaries as
select
  c.id,
  c.slug,
  c.name,
  c.sport,
  c.surface,
  c.price_per_hour,
  c.capacity,
  c.amenities,
  c.description,
  c.venue_id,
  v.name as venue_name,
  v.city as venue_city,
  v.district as venue_district,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  COALESCE(r.average_rating, 0::numeric) as average_rating,
  COALESCE(r.review_count, 0) as review_count,
  (
    select
      ci.image_url
    from
      court_images ci
    where
      ci.court_id = c.id
      and ci.is_primary = true
    order by
      ci.display_order
    limit
      1
  ) as primary_image_url
from
  courts c
  join venues v on v.id = c.venue_id
  left join court_review_summary r on r.court_id = c.id
where
  c.is_active = true;

-- court
create table public.courts (
  id uuid not null default gen_random_uuid (),
  venue_id uuid not null,
  name text not null,
  slug text GENERATED ALWAYS as (
    (
      (
        lower(replace(name, ' '::text, '-'::text)) || '-'::text
      ) || substr((id)::text, 1, 6)
    )
  ) STORED null,
  sport text not null,
  surface text null,
  price_per_hour integer not null,
  capacity integer null,
  amenities text[] null default array[]::text[],
  description text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint courts_pkey primary key (id),
  constraint courts_venue_id_fkey foreign KEY (venue_id) references venues (id) on delete CASCADE,
  constraint courts_capacity_nonneg check (
    (
      (capacity is null)
      or (capacity >= 0)
    )
  ),
  constraint courts_price_per_hour_nonneg check ((price_per_hour >= 0))
) TABLESPACE pg_default;

create unique INDEX IF not exists courts_slug_key on public.courts using btree (slug) TABLESPACE pg_default;

create index IF not exists courts_venue_id_idx on public.courts using btree (venue_id) TABLESPACE pg_default;

create index IF not exists courts_sport_idx on public.courts using btree (sport) TABLESPACE pg_default;

create trigger set_courts_updated_at BEFORE
update on courts for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- forum_categories
create table public.forum_categories (
  id uuid not null default gen_random_uuid (),
  slug text not null,
  name text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint forum_categories_pkey primary key (id),
  constraint forum_categories_slug_key unique (slug)
) TABLESPACE pg_default;

-- forum_replies
create table public.forum_replies (
  id uuid not null default gen_random_uuid (),
  thread_id uuid not null,
  author_profile_id uuid not null,
  body text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint forum_replies_pkey primary key (id),
  constraint forum_replies_author_profile_id_fkey foreign KEY (author_profile_id) references profiles (id) on delete CASCADE,
  constraint forum_replies_thread_id_fkey foreign KEY (thread_id) references forum_threads (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists forum_replies_thread_idx on public.forum_replies using btree (thread_id) TABLESPACE pg_default;

-- forum_thread_latest_activity
create view public.forum_thread_latest_activity as
select distinct
  on (thread_id) thread_id,
  body as latest_reply_body,
  created_at as latest_reply_created_at
from
  forum_replies r
order by
  thread_id,
  created_at desc;

-- forum_threads
create table public.forum_threads (
  id uuid not null default gen_random_uuid (),
  slug text not null,
  title text not null,
  body text null,
  excerpt text null,
  category_id uuid null,
  author_profile_id uuid not null,
  reply_count integer not null default 0,
  tags text[] null default array[]::text[],
  status text not null default 'published'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint forum_threads_pkey primary key (id),
  constraint forum_threads_slug_key unique (slug),
  constraint forum_threads_author_profile_id_fkey foreign KEY (author_profile_id) references profiles (id) on delete CASCADE,
  constraint forum_threads_category_id_fkey foreign KEY (category_id) references forum_categories (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists forum_threads_category_idx on public.forum_threads using btree (category_id) TABLESPACE pg_default;

create trigger set_forum_threads_updated_at BEFORE
update on forum_threads for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- profiles
create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  phone text unique null,
  role public.app_role not null default 'user'::app_role,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger set_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- venue_partner_applications
create table public.venue_partner_applications (
  id uuid not null default gen_random_uuid (),
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text null,
  city text null,
  facility_types text[] null default array[]::text[],
  facility_count integer null,
  existing_system text null,
  notes text null,
  status public.partner_application_status not null default 'pending'::partner_application_status,
  handled_by uuid null,
  decision_note text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  reviewed_at timestamp with time zone null,
  constraint venue_partner_applications_pkey primary key (id),
  constraint venue_partner_applications_handled_by_fkey foreign KEY (handled_by) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists venue_partner_applications_status_idx on public.venue_partner_applications using btree (status, created_at desc) TABLESPACE pg_default;

-- venue_partner_credentials
create table public.venue_partner_credentials (
  id uuid not null default gen_random_uuid (),
  application_id uuid null,
  partner_profile_id uuid null,
  temporary_password text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint venue_partner_credentials_pkey primary key (id),
  constraint venue_partner_credentials_application_id_fkey foreign KEY (application_id) references venue_partner_applications (id) on delete set null,
  constraint venue_partner_credentials_partner_profile_id_fkey foreign KEY (partner_profile_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists venue_partner_credentials_profile_idx on public.venue_partner_credentials using btree (partner_profile_id) TABLESPACE pg_default;


-- venues
create table public.venues (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text GENERATED ALWAYS as (
    (
      (
        lower(replace(name, ' '::text, '-'::text)) || '-'::text
      ) || substr((id)::text, 1, 6)
    )
  ) STORED null,
  city text null,
  district text null,
  address text null,
  latitude double precision null,
  longitude double precision null,
  description text null,
  owner_profile_id uuid null,
  contact_phone text null,
  contact_email text null,
  facility_types text[] null default array[]::text[],
  facility_count integer null,
  existing_system text null,
  website text null,
  business_license_url text null,
  venue_status text not null default 'inactive', -- 'inactive', 'active', 'suspended'
  verified_at timestamp with time zone null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint venues_pkey primary key (id),
  constraint venues_owner_profile_id_fkey foreign KEY (owner_profile_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create unique INDEX IF not exists venues_slug_key on public.venues using btree (slug) TABLESPACE pg_default;

create trigger set_venues_updated_at BEFORE
update on venues for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- RLS Policies for venue_partner_applications
-- Enable RLS on venue_partner_applications table
ALTER TABLE public.venue_partner_applications ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert venue partner applications
CREATE POLICY "Users can submit venue partner applications"
ON public.venue_partner_applications
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Policy to allow authenticated admins to view venue partner applications
CREATE POLICY "Admins can view venue partner applications"
ON public.venue_partner_applications
FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  )
);

-- Policy to allow authenticated admins to update venue partner applications
CREATE POLICY "Admins can update venue partner applications"
ON public.venue_partner_applications
FOR UPDATE
USING (
  auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  )
);

-- Policy to allow authenticated admins to delete venue partner applications
CREATE POLICY "Admins can delete venue partner applications"
ON public.venue_partner_applications
FOR DELETE
USING (
  auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  )
);

-- RLS Policies for venues (updated for venue partner integration)
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view public venues
CREATE POLICY "Anyone can view active venues"
ON public.venues
FOR SELECT
USING (venue_status = 'active');

-- Policy to allow venue partners to manage their own venues
CREATE POLICY "Venue partners can manage own venues"
ON public.venues
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND auth.uid() = owner_profile_id
  AND exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'venue_partner'
  )
);

-- Policy to allow admins to manage all venues
CREATE POLICY "Admins can manage all venues"
ON public.venues
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'role' = 'admin'
    OR exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  )
);
