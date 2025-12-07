-- Functions
-- get_court_images
BEGIN
 RETURN QUERY
 -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
 SELECT
   'https://dvpbypfecdccvwqkavgj.supabase.co/storage/v1/object/public/' || s.bucket_id || '/' || s.name as image_url,
   c.primary_image_url = 'https://dvpbypfecdccvwqkavgj.supabase.co/storage/v1/object/public/' || s.bucket_id || '/' || s.name as is_primary
 FROM storage.objects s
 -- Fixed: Cast text to UUID for comparison
 JOIN courts c ON (split_part(s.name, '/', 2))::uuid = c.id
 WHERE s.bucket_id = 'court-images'
 AND (split_part(s.name, '/', 2))::uuid = court_uuid
 ORDER BY s.created_at ASC;
END;

-- set_current_timestamp_updated_at
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;

-- update_court_primary_image
BEGIN
 -- When a new file is uploaded, if there's no primary image, set this as primary
 IF TG_OP = 'INSERT' THEN
   -- Check if court has no primary image
   -- Fixed: Cast text to UUID for comparison
   PERFORM 1 FROM courts WHERE id = (split_part(NEW.name, '/', 2))::uuid AND primary_image_url IS NULL;
   IF FOUND THEN
     -- Set this image as primary
     -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
     UPDATE courts
     SET primary_image_url = 'https://dvpbypfecdccvwqkavgj.supabase.co/storage/v1/object/public/' || NEW.bucket_id || '/' || NEW.name
     WHERE id = (split_part(NEW.name, '/', 2))::uuid;
   END IF;
   RETURN NEW;
 END IF;

 -- When a file is deleted and it was the primary image, try to set another one as primary
 IF TG_OP = 'DELETE' THEN
   -- Check if this was the primary image
   -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
   PERFORM 1 FROM courts WHERE primary_image_url = 'https://dvpbypfecdccvwqkavgj.supabase.co/storage/v1/object/public/' || OLD.bucket_id || '/' || OLD.name;
   IF FOUND THEN
     -- Try to set another image as primary, or null if no more images
     DECLARE
       new_primary_url TEXT;
       -- Fixed: Cast text to UUID
       court_id UUID := (split_part(OLD.name, '/', 2))::uuid;
       venue_id UUID := (split_part(OLD.name, '/', 1))::uuid;
     BEGIN
       -- Try to get the first remaining image
       -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
       SELECT 'https://dvpbypfecdccvwqkavgj.supabase.co/storage/v1/object/public/' || bucket_id || '/' || name
       INTO new_primary_url
       FROM storage.objects
       WHERE bucket_id = 'court-images'
       AND name LIKE venue_id::text || '/' || court_id::text || '/%'
       ORDER BY created_at ASC
       LIMIT 1;

       -- Update court with new primary or null
       UPDATE courts
       SET primary_image_url = new_primary_url
       WHERE id = court_id;
     END;
   END IF;
   RETURN OLD;
 END IF;

 RETURN NULL;
END;

-- is_admin
select exists (
  select 1
  from public.profiles
  where id = uid and role = 'admin'
);


-- ENUMS
app_role	user, venue_partner, admin
booking_status	pending, confirmed, checked_in, completed, cancelled
payment_status	pending, waiting_confirmation, paid, expired, cancelled
partner_application_status	pending, accepted, rejected
blackout_scope	time_range, full_day
blackout_frequency	once, weekly, monthly, yearly
sport_types	futsal, basket, basketball, soccer, volleyball, badminton, tennis, padel
surface_types	vinyl, rubber, parquet, wood, synthetic, cement, turf, grass, hard_court, clay


-- TABLE bookings
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
  payment_completed_at timestamp with time zone null,
  review_submitted_at timestamp with time zone null,
  constraint bookings_pkey primary key (id),
  constraint bookings_payment_reference_key unique (payment_reference),
  constraint bookings_court_id_fkey foreign KEY (court_id) references courts (id) on delete CASCADE,
  constraint bookings_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete CASCADE,
  constraint bookings_time_range check ((end_time > start_time))
) TABLESPACE pg_default;

create index IF not exists bookings_payment_completed_at_idx on public.bookings using btree (payment_completed_at) TABLESPACE pg_default;

create index IF not exists bookings_review_submitted_at_idx on public.bookings using btree (review_submitted_at) TABLESPACE pg_default
where
  (review_submitted_at is not null);

create index IF not exists bookings_profile_id_idx on public.bookings using btree (profile_id) TABLESPACE pg_default;

create index IF not exists bookings_court_id_idx on public.bookings using btree (court_id) TABLESPACE pg_default;

create index IF not exists bookings_start_time_idx on public.bookings using btree (start_time desc) TABLESPACE pg_default;

create index IF not exists idx_bookings_court_id_start_time on public.bookings using btree (court_id, start_time) TABLESPACE pg_default;

create index IF not exists idx_bookings_status on public.bookings using btree (status) TABLESPACE pg_default;

create index IF not exists idx_bookings_court_id_status on public.bookings using btree (court_id, status) TABLESPACE pg_default;

create trigger set_bookings_updated_at BEFORE
update on bookings for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- TABLE court_blackout
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

-- VIEW court_booking_slots
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

-- VIEW court_booking_stats
create view public.court_booking_stats as
select
  c.id as court_id,
  c.name as court_name,
  c.venue_id,
  count(b.id) filter (
    where
      b.status <> all (
        array[
          'pending'::booking_status,
          'cancelled'::booking_status
        ]
      )
  ) as total_bookings,
  count(b.id) filter (
    where
      (
        b.status <> all (
          array[
            'pending'::booking_status,
            'cancelled'::booking_status
          ]
        )
      )
      and date (b.start_time) = CURRENT_DATE
  ) as today_bookings,
  COALESCE(
    sum(b.price_total) filter (
      where
        (
          b.status <> all (
            array[
              'pending'::booking_status,
              'cancelled'::booking_status
            ]
          )
        )
        and date (b.start_time) = CURRENT_DATE
    ),
    0::bigint
  ) as today_revenue,
  COALESCE(
    sum(b.price_total) filter (
      where
        b.status <> all (
          array[
            'pending'::booking_status,
            'cancelled'::booking_status
          ]
        )
    ),
    0::bigint
  ) as total_revenue,
  count(b.id) filter (
    where
      b.status = 'confirmed'::booking_status
  ) as confirmed_bookings,
  count(b.id) filter (
    where
      b.status = 'pending'::booking_status
  ) as pending_bookings,
  count(b.id) filter (
    where
      b.status = 'cancelled'::booking_status
  ) as cancelled_bookings
from
  courts c
  left join bookings b on c.id = b.court_id
group by
  c.id,
  c.name,
  c.venue_id;

-- VIEW court_review_summary
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

-- TABLE court_reviews
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

-- VIEW court_summaries
create view public.court_summaries as
select
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
  v.name as venue_name,
  v.city as venue_city,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  COALESCE(r.average_rating, 0::numeric) as average_rating,
  COALESCE(r.review_count, 0) as review_count,
  (
    select
      jsonb_build_object(
        'bucket',
        o.bucket_id,
        'path',
        o.name,
        'metadata',
        o.metadata,
        'updated_at',
        o.updated_at
      ) as jsonb_build_object
    from
      storage.objects o
    where
      o.bucket_id = 'court_images'::text
      and (
        (o.metadata ->> 'court_id'::text) = c.id::text
        or o.name ~~* concat('%', c.id::text, '%')
      )
    order by
      (
        case
          when ((o.metadata ->> 'is_primary'::text)::boolean) is true then 0
          else 1
        end
      ),
      o.updated_at desc
    limit
      1
  ) as primary_image_info
from
  courts c
  join venues v on v.id = c.venue_id
  left join court_review_summary r on r.court_id = c.id
where
  c.is_active = true;

-- VIEW court_summaries_with_stats
create view public.court_summaries_with_stats as
select
  cs.id,
  cs.slug,
  cs.name,
  cs.sport,
  cs.surface,
  cs.price_per_hour,
  cs.capacity,
  cs.facilities,
  cs.description,
  cs.venue_id,
  cs.venue_name,
  cs.venue_city,
  cs.venue_latitude,
  cs.venue_longitude,
  cs.average_rating,
  cs.review_count,
  cs.primary_image_info,
  cbs.total_bookings,
  cbs.today_bookings,
  cbs.today_revenue,
  cbs.total_revenue,
  cbs.confirmed_bookings,
  cbs.pending_bookings,
  cbs.cancelled_bookings
from
  court_summaries cs
  left join court_booking_stats cbs on cs.id = cbs.court_id;

-- TABLE courts
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
  sport public.sport_types not null,
  surface public.surface_types null,
  price_per_hour integer not null,
  capacity integer null,
  facilities text[] null default array[]::text[],
  description text null,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  primary_image_url text null,
  court_images_url_array text[] null default '{}'::text[],
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

create index IF not exists courts_sport_idx on public.courts using btree (sport) TABLESPACE pg_default;

create unique INDEX IF not exists courts_slug_key on public.courts using btree (slug) TABLESPACE pg_default;

create index IF not exists courts_venue_id_idx on public.courts using btree (venue_id) TABLESPACE pg_default;

create trigger set_courts_updated_at BEFORE
update on courts for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- TABLE forum_categories
create table public.forum_categories (
  id uuid not null default gen_random_uuid (),
  slug text not null,
  name text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint forum_categories_pkey primary key (id),
  constraint forum_categories_slug_key unique (slug)
) TABLESPACE pg_default;

-- TABLE forum_replies
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

-- VIEW forum_thread_latest_activity
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

-- TABLE forum_threads
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

-- TABLE profiles
create table public.profiles (
  id uuid not null,
  full_name text null,
  avatar_url text null,
  role public.app_role not null default 'user'::app_role,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  email character varying null,
  phone text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_phone_key unique (phone),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create unique INDEX IF not exists profiles_email_idx on public.profiles using btree (email) TABLESPACE pg_default
where
  (email is not null);

create trigger set_profiles_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION set_current_timestamp_updated_at ();

-- TABLE venue_partner_application
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

-- TABLE venues
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
  address text null,
  latitude double precision null,
  longitude double precision null,
  description text null,
  owner_profile_id uuid null,
  contact_phone text null,
  contact_email text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  facility_types text[] null default array[]::text[],
  facility_count integer null,
  existing_system text null,
  website text null,
  business_license_url text null,
  venue_status text not null default 'inactive'::text,
  verified_at timestamp with time zone null,
  constraint venues_pkey primary key (id),
  constraint venues_owner_profile_id_fkey foreign KEY (owner_profile_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create unique INDEX IF not exists venues_slug_key on public.venues using btree (slug) TABLESPACE pg_default;

create trigger set_venues_updated_at BEFORE
update on venues for EACH row
execute FUNCTION set_current_timestamp_updated_at ();
