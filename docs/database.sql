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
sport_types	futsal, basketball, soccer, volleyball, badminton, tennis, padel
surface_types	vinyl, rubber, parquet, wood, synthetic, cement, turf, grass, hard_court, clay

-- VIEW active_courts
create view public.active_courts as
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
  v.address as venue_address,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  c.primary_image_url,
  count(distinct b.id) filter (
    where
      b.status <> all (
        array[
          'pending'::booking_status,
          'cancelled'::booking_status
        ]
      )
  ) as total_bookings,
  count(distinct b.id) filter (
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
        b.status <> all (
          array[
            'pending'::booking_status,
            'cancelled'::booking_status
          ]
        )
    ),
    0::bigint
  ) as total_revenue,
  COALESCE(avg(distinct cr.rating), 0::numeric) as average_rating,
  count(distinct cr.id) as review_count,
  c.is_active
from
  courts c
  left join venues v on v.id = c.venue_id
  left join bookings b on b.court_id = c.id
  left join court_reviews cr on cr.court_id = c.id
group by
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
  v.name,
  v.city,
  v.address,
  v.latitude,
  v.longitude,
  c.primary_image_url,
  c.is_active;

-- VIEW all_courts_with_stats
create view public.all_courts_with_stats as
with
  booking_stats as (
    select
      bookings.court_id,
      count(bookings.id) filter (
        where
          bookings.status <> all (
            array[
              'pending'::booking_status,
              'cancelled'::booking_status
            ]
          )
      ) as total_bookings,
      count(bookings.id) filter (
        where
          (
            bookings.status <> all (
              array[
                'pending'::booking_status,
                'cancelled'::booking_status
              ]
            )
          )
          and date (bookings.start_time) = CURRENT_DATE
      ) as today_bookings,
      COALESCE(
        sum(bookings.price_total) filter (
          where
            bookings.status <> all (
              array[
                'pending'::booking_status,
                'cancelled'::booking_status
              ]
            )
        ),
        0::bigint
      ) as total_revenue,
      COALESCE(
        sum(bookings.price_total) filter (
          where
            (
              bookings.status <> all (
                array[
                  'pending'::booking_status,
                  'cancelled'::booking_status
                ]
              )
            )
            and date (bookings.start_time) = CURRENT_DATE
        ),
        0::bigint
      ) as today_revenue
    from
      bookings
    group by
      bookings.court_id
  ),
  review_stats as (
    select
      court_reviews.court_id,
      COALESCE(avg(court_reviews.rating), 0::numeric) as average_rating,
      count(court_reviews.id) as review_count
    from
      court_reviews
    group by
      court_reviews.court_id
  )
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
  c.is_active,
  c.primary_image_url,
  c.created_at,
  c.updated_at,
  v.name as venue_name,
  v.city as venue_city,
  v.district as venue_district,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  v.contact_phone as venue_contact_phone,
  v.contact_email as venue_contact_email,
  v.address as venue_address,
  case
    when c.is_active = true then COALESCE(rs.average_rating, 0::numeric)
    else 0::numeric
  end as average_rating,
  case
    when c.is_active = true then COALESCE(rs.review_count, 0::bigint)
    else 0::bigint
  end as review_count,
  case
    when c.is_active = true then COALESCE(bs.total_bookings, 0::bigint)
    else 0::bigint
  end as total_bookings,
  case
    when c.is_active = true then COALESCE(bs.today_bookings, 0::bigint)
    else 0::bigint
  end as today_bookings,
  case
    when c.is_active = true then COALESCE(bs.total_revenue, 0::bigint)
    else 0::bigint
  end as total_revenue,
  case
    when c.is_active = true then COALESCE(bs.today_revenue, 0::bigint)
    else 0::bigint
  end as today_revenue
from
  courts c
  left join venues v on v.id = c.venue_id
  left join booking_stats bs on bs.court_id = c.id
  left join review_stats rs on rs.court_id = c.id;

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

-- VIEW bookings_with_courts
create view public.bookings_with_courts as
select
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
  c.name as court_name,
  c.slug as court_slug,
  c.sport,
  c.surface,
  c.price_per_hour,
  c.capacity,
  c.facilities,
  c.description,
  c.primary_image_url,
  v.name as venue_name,
  v.city as venue_city,
  v.district as venue_district,
  v.address as venue_address,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude
from
  bookings b
  join courts c on c.id = b.court_id
  join venues v on v.id = c.venue_id;

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

-- VIEW court_reviews_with_authors
create view public.court_reviews_with_authors as
select
  cr.id,
  cr.court_id,
  cr.profile_id,
  cr.rating,
  cr.comment,
  cr.created_at,
  cr.booking_id,
  cr.forum_thread_id,
  COALESCE(p.full_name, 'Member CourtEase'::text) as author_name
from
  court_reviews cr
  left join profiles p on cr.profile_id = p.id;

-- VIEW court_summaries_with_stats
create view public.court_summaries_with_stats as
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
  c.primary_image_url,
  c.is_active,
  v.name as venue_name,
  v.city as venue_city,
  v.address as venue_address,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  v.owner_profile_id,
  COALESCE(avg(cr.rating), 0::numeric) as average_rating,
  count(distinct cr.id) as review_count,
  count(distinct b.id) as total_bookings,
  count(distinct b.id) filter (
    where
      date (b.start_time) = CURRENT_DATE
  ) as today_bookings,
  COALESCE(
    sum(b.price_total) filter (
      where
        date (b.start_time) = CURRENT_DATE
    ),
    0::bigint
  ) as today_revenue,
  COALESCE(sum(b.price_total), 0::bigint) as total_revenue,
  count(distinct b.id) filter (
    where
      b.status = 'confirmed'::booking_status
  ) as confirmed_bookings,
  count(distinct b.id) filter (
    where
      b.status = 'pending'::booking_status
  ) as pending_bookings,
  count(distinct b.id) filter (
    where
      b.status = 'cancelled'::booking_status
  ) as cancelled_bookings
from
  courts c
  left join venues v on v.id = c.venue_id
  left join bookings b on b.court_id = c.id
  left join court_reviews cr on cr.court_id = c.id
group by
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
  c.primary_image_url,
  c.is_active,
  v.id,
  v.name,
  v.city,
  v.address,
  v.latitude,
  v.longitude,
  v.owner_profile_id;

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

create trigger trigger_update_reply_count
after INSERT
or DELETE
or
update on forum_replies for EACH row
execute FUNCTION update_forum_thread_reply_count ();

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

-- VIEW forum_threads_with_authors
create view public.forum_threads_with_authors as
select
  ft.id,
  ft.slug,
  ft.title,
  ft.body,
  ft.excerpt,
  ft.category_id,
  ft.author_profile_id,
  COALESCE(p.full_name, 'Anonymous'::text) as author_name,
  ft.reply_count,
  ft.tags,
  ft.status,
  ft.created_at,
  ft.updated_at,
  fc.name as category_name,
  fc.slug as category_slug
from
  forum_threads ft
  left join profiles p on p.id = ft.author_profile_id
  left join forum_categories fc on fc.id = ft.category_id
where
  ft.status = 'published'::text;

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

-- VIEW venue_bookings_with_details
create view public.venue_bookings_with_details as
select
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
  c.name as court_name,
  c.slug as court_slug,
  c.sport,
  c.surface,
  c.price_per_hour,
  c.capacity,
  c.facilities,
  c.description,
  c.primary_image_url,
  v.id as venue_id,
  v.name as venue_name,
  v.city as venue_city,
  v.address as venue_address,
  v.latitude as venue_latitude,
  v.longitude as venue_longitude,
  v.owner_profile_id,
  p.full_name as customer_full_name,
  p.email as customer_email,
  p.phone as customer_phone
from
  bookings b
  join courts c on c.id = b.court_id
  join venues v on v.id = c.venue_id
  join profiles p on p.id = b.profile_id;

-- TABLE venue_partner_applications
create table public.venue_partner_applications (
  id uuid not null default gen_random_uuid (),
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text null,
  city text null,
  existing_system text null,
  notes text null,
  status public.partner_application_status not null default 'pending'::partner_application_status,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  reviewed_at timestamp with time zone null,
  handled_by text null,
  constraint venue_partner_applications_pkey primary key (id),
  constraint venue_partner_applications_handled_by_fkey foreign KEY (handled_by) references profiles (email) on update CASCADE on delete set null
) TABLESPACE pg_default;

create index IF not exists venue_partner_applications_status_idx on public.venue_partner_applications using btree (status, created_at desc) TABLESPACE pg_default;

-- VIEW venue_stats
create view public.venue_stats as
with
  booking_data as (
    select
      c.venue_id,
      count(distinct c.id) as total_courts,
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
            b.status <> all (
              array[
                'pending'::booking_status,
                'cancelled'::booking_status
              ]
            )
        ),
        0::bigint
      ) as total_revenue,
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
      ) as today_revenue
    from
      courts c
      left join bookings b on b.court_id = c.id
    where
      c.is_active = true
    group by
      c.venue_id
  ),
  rating_data as (
    select
      c.venue_id,
      COALESCE(avg(cr.rating), 0::numeric) as average_rating
    from
      courts c
      left join court_reviews cr on cr.court_id = c.id
    where
      c.is_active = true
    group by
      c.venue_id
  )
select
  v.id as venue_id,
  v.slug,
  v.name as venue_name,
  v.city as venue_city,
  v.district as venue_district,
  v.owner_profile_id,
  COALESCE(bd.total_courts, 0::bigint) as total_courts,
  COALESCE(bd.total_bookings, 0::bigint) as total_bookings,
  COALESCE(bd.today_bookings, 0::bigint) as today_bookings,
  COALESCE(bd.total_revenue, 0::bigint) as total_revenue,
  COALESCE(bd.today_revenue, 0::bigint) as today_revenue,
  COALESCE(rd.average_rating, 0::numeric) as average_rating,
  v.venue_status
from
  venues v
  left join booking_data bd on v.id = bd.venue_id
  left join rating_data rd on v.id = rd.venue_id;

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
  district text null,
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
