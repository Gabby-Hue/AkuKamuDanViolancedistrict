import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getMidtransTransactionStatus,
  mapMidtransStatusToBooking,
} from "@/lib/payments/midtrans";
import { createClient } from "@/lib/supabase/server";
import type { ProfileWithRole } from "./roles";
import {
  normalizeBookingStatus,
  normalizePaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "./status";

export type CourtSummary = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  pricePerHour: number;
  capacity: number | null;
  amenities: string[];
  description: string | null;
  venueName: string;
  venueCity: string | null;
  venueDistrict: string | null;
  venueLatitude: number | null;
  venueLongitude: number | null;
  primaryImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
};

export type VenueSummary = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  courts: CourtSummary[];
};

export type CourtDetail = CourtSummary & {
  venueAddress: string | null;
  venueContactPhone: string | null;
  venueContactEmail: string | null;
  images: {
    image_url: string;
    caption: string | null;
    is_primary: boolean;
    display_order: number;
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    author: string | null;
  }[];
};

export type ForumCategory = {
  id: string;
  slug: string;
  name: string;
};

export type ForumThreadSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reply_count: number;
  created_at: string;
  tags: string[];
  category: ForumCategory | null;
  author_name: string | null;
  latestReplyBody: string | null;
  latestReplyAt: string | null;
  reviewCourt: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

export type ForumReply = {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
  author_avatar_url: string | null;
};

export type ForumThreadDetail = ForumThreadSummary & {
  body: string | null;
  author_avatar_url: string | null;
  replies: ForumReply[];
};

export type AdminMetrics = {
  totalRevenue: number;
  totalBookings: number;
  totalVenues: number;
  totalThreads: number;
};

export type PartnerApplication = {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  facility_types: string[];
  facility_count: number | null;
  existing_system: string | null;
  notes: string | null;
  status: string;
  handled_by: string | null;
  decision_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type BookingDetail = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_token: string | null;
  payment_expires_at: string | null;
  price_total: number;
  notes: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    forum_thread_id: string | null;
  } | null;
  court: {
    id: string;
    slug: string;
    name: string;
    sport: string;
    price_per_hour: number;
    venue_name: string | null;
    venue_city: string | null;
    venue_address: string | null;
  };
};

export type UserDashboardData = {
  bookings: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    payment_status: PaymentStatus;
    payment_reference: string | null;
    payment_redirect_url: string | null;
    payment_expires_at: string | null;
    price_total: number;
    court_name: string;
    court_slug: string;
    sport: string;
    venue_name: string;
    venue_city: string | null;
  }>;
  recommendedCourts: CourtSummary[];
};

export type VenueDashboardData = {
  ownedCourts: CourtSummary[];
  upcomingBookings: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    checked_in_at: string | null;
    completed_at: string | null;
    price_total: number;
    court_name: string;
    sport: string;
  }>;
  revenueTotal: number;
  venues: Array<{
    id: string;
    name: string;
    city: string | null;
    district: string | null;
    address: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    courts: Array<{
      id: string;
      name: string;
      sport: string;
      surface: string | null;
      price_per_hour: number;
      capacity: number | null;
      amenities: string[];
      description: string | null;
      is_active: boolean;
      primary_image_url: string | null;
      blackouts: CourtBlackout[];
    }>;
  }>;
};

export type CourtBlackout = {
  id: string;
  title: string;
  notes: string | null;
  scope: "time_range" | "full_day";
  frequency: "once" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_day_of_week: number | null;
};

export type AdminDashboardData = {
  metrics: AdminMetrics & {
    totalCourts: number;
    pendingApplications: number;
  };
  revenueTrend: Array<{
    label: string;
    month: string;
    revenue: number;
    bookings: number;
  }>;
  sportBreakdown: Array<{
    sport: string;
    bookings: number;
    revenue: number;
  }>;
  venueLeaders: Array<{
    venueId: string;
    venueName: string;
    city: string | null;
    revenue: number;
    bookings: number;
  }>;
  partnerApplications: {
    pending: PartnerApplication[];
    accepted: PartnerApplicationWithCredential[];
    rejected: PartnerApplication[];
  };
};

export type PartnerApplicationWithCredential = PartnerApplication & {
  partner_profile_id: string | null;
  temporary_password: string | null;
};

type CourtSummaryRow = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number | null;
  capacity: number | null;
  amenities: string[] | null;
  description: string | null;
  venue_id: string;
  venue_name: string;
  venue_city: string | null;
  venue_district: string | null;
  venue_latitude?: number | null;
  venue_longitude?: number | null;
  primary_image_url: string | null;
  average_rating: number | null;
  review_count: number | null;
};

type CourtBlackoutRow = {
  id: string;
  court_id: string;
  title: string;
  notes: string | null;
  scope: "time_range" | "full_day";
  frequency: "once" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_day_of_week: number | null;
};

type CourtImageRow = {
  image_url: string;
  caption: string | null;
  is_primary: boolean;
  display_order: number | null;
};

type CourtReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  profile: {
    full_name: string | null;
  } | null;
};

type CourtDetailRow = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number | null;
  capacity: number | null;
  amenities: string[] | null;
  description: string | null;
  venue: {
    id?: string | null;
    name: string | null;
    city: string | null;
    district: string | null;
    address: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  images: CourtImageRow[] | null;
  reviews: CourtReviewRow[] | null;
};

type ForumThreadRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reply_count: number | null;
  created_at: string;
  tags: string[] | null;
  body?: string | null;
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
  author: {
    full_name: string | null;
    avatar_url?: string | null;
  } | null;
};

type ForumReplyDetailRow = {
  id: string;
  body: string;
  created_at: string;
  author: { full_name: string | null; avatar_url?: string | null } | null;
};

type LatestThreadReplyRow = {
  thread_id: string;
  latest_reply_body: string | null;
  latest_reply_created_at: string | null;
};

async function attachLatestReplyMetadata(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threads: ForumThreadSummary[]
): Promise<ForumThreadSummary[]> {
  const threadIds = threads.map((thread) => thread.id);
  if (!threadIds.length) {
    return threads;
  }

  const { data, error } = await supabase
    .from("forum_thread_latest_activity")
    .select("thread_id, latest_reply_body, latest_reply_created_at")
    .in("thread_id", threadIds);

  if (error) {
    console.error("Failed to fetch latest forum replies", error.message);
    return threads;
  }

  const latestMap = new Map<string, LatestThreadReplyRow>();
  ((data ?? []) as LatestThreadReplyRow[]).forEach((row) => {
    latestMap.set(row.thread_id, row);
  });

  return threads.map((thread) => {
    const latest = latestMap.get(thread.id);
    return {
      ...thread,
      latestReplyBody: latest?.latest_reply_body ?? null,
      latestReplyAt: latest?.latest_reply_created_at ?? null,
    };
  });
}

type BookingRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  checked_in_at?: string | null;
  completed_at?: string | null;
  payment_status: string;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_expired_at: string | null;
  price_total: number | null;
  court: {
    slug?: string;
    name?: string;
    sport?: string;
    venue?: {
      id?: string | null;
      name?: string | null;
      city?: string | null;
    } | null;
  } | null;
};

type BookingPriceRow = { price_total: number | null };

type BookingDetailRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_token: string | null;
  payment_expired_at: string | null;
  price_total: number | null;
  notes: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  court: {
    id: string;
    slug: string;
    name: string;
    sport: string;
    price_per_hour: number | null;
    venue: {
      name: string | null;
      city: string | null;
      address: string | null;
    } | null;
  } | null;
};

type BookingReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  forum_thread_id: string | null;
};

type ReviewThreadLinkRow = {
  forum_thread_id: string;
  court:
    | { id: string; slug: string; name: string }
    | Array<{ id: string; slug: string; name: string }>
    | null;
};

type VenueWithCourtsRow = {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  description: string | null;
  courts: Array<{
    id: string;
    name: string;
    sport: string;
    surface: string | null;
    price_per_hour: number | null;
    capacity: number | null;
    amenities: string[] | null;
    description: string | null;
    is_active: boolean | null;
  }> | null;
};

type PartnerApplicationRow = {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  facility_types: string[] | null;
  facility_count: number | null;
  existing_system: string | null;
  notes: string | null;
  status: string;
  handled_by: string | null;
  decision_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type PartnerApplicationWithCredentialRow = PartnerApplicationRow & {
  credential: {
    temporary_password: string | null;
    partner_profile_id: string | null;
  } | null;
};

type BookingStatusSource = {
  id: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  completed_at?: string | null;
};

function shouldCheckMidtrans(paymentStatus: PaymentStatus) {
  return (
    paymentStatus === "pending" || paymentStatus === "waiting_confirmation"
  );
}

async function syncBookingPaymentStatusWithMidtrans(
  supabase: SupabaseClient,
  booking: BookingStatusSource
): Promise<{ paymentStatus: PaymentStatus; bookingStatus: BookingStatus }> {
  const normalizedPaymentStatus = normalizePaymentStatus(
    booking.payment_status
  );
  const normalizedBookingStatus = normalizeBookingStatus(booking.status);
  const completedAt =
    "completed_at" in booking ? booking.completed_at ?? null : null;
  const isCompleted =
    normalizedBookingStatus === "completed" || Boolean(completedAt);

  if (
    !booking.payment_reference ||
    !shouldCheckMidtrans(normalizedPaymentStatus)
  ) {
    return {
      paymentStatus: normalizedPaymentStatus,
      bookingStatus: normalizedBookingStatus,
    };
  }

  try {
    const midtransStatus = await getMidtransTransactionStatus(
      booking.payment_reference
    );
    const mapped = mapMidtransStatusToBooking(midtransStatus);

    if (!mapped) {
      return {
        paymentStatus: normalizedPaymentStatus,
        bookingStatus: normalizedBookingStatus,
      };
    }

    const nextPaymentStatus = mapped.paymentStatus;
    const nextBookingStatus = isCompleted ? "completed" : mapped.bookingStatus;

    if (
      nextPaymentStatus === normalizedPaymentStatus &&
      nextBookingStatus === normalizedBookingStatus
    ) {
      return {
        paymentStatus: nextPaymentStatus,
        bookingStatus: nextBookingStatus,
      };
    }

    const updateData: Record<string, unknown> = {
      payment_status: nextPaymentStatus,
    };

    if (!isCompleted) {
      updateData.status = nextBookingStatus;
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    if (error) {
      console.error(
        "Failed to update booking status from Midtrans",
        error.message
      );
    }

    return {
      paymentStatus: nextPaymentStatus,
      bookingStatus: nextBookingStatus,
    };
  } catch (error) {
    console.error("Failed to sync Midtrans payment status", error);
    return {
      paymentStatus: normalizedPaymentStatus,
      bookingStatus: normalizedBookingStatus,
    };
  }
}

function mapCourtSummary(row: CourtSummaryRow): CourtSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sport: row.sport,
    surface: row.surface,
    pricePerHour: Number(row.price_per_hour ?? 0),
    capacity: row.capacity ?? null,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description ?? null,
    venueName: row.venue_name,
    venueCity: row.venue_city ?? null,
    venueDistrict: row.venue_district ?? null,
    venueLatitude:
      typeof row.venue_latitude === "number" ? row.venue_latitude : null,
    venueLongitude:
      typeof row.venue_longitude === "number" ? row.venue_longitude : null,
    primaryImageUrl: row.primary_image_url ?? null,
    averageRating: Number(row.average_rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
  };
}

export async function fetchCourtSummaries(): Promise<CourtSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("court_summaries")
    .select("*")
    .order("average_rating", { ascending: false });

  if (error) {
    console.error("Failed to fetch court summaries", error.message);
    return [];
  }

  return ((data ?? []) as CourtSummaryRow[]).map(mapCourtSummary);
}

type VenueSummaryRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
};

export async function fetchVenueSummaries(): Promise<VenueSummary[]> {
  const supabase = await createClient();
  const { data: venuesData, error: venuesError } = await supabase
    .from("venues")
    .select(
      "id, slug, name, city, district, address, latitude, longitude, description, contact_phone, contact_email"
    )
    .order("name", { ascending: true });

  if (venuesError) {
    console.error("Failed to fetch venue summaries", venuesError.message);
    return [];
  }

  const venues = ((venuesData ?? []) as VenueSummaryRow[]).map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    district: venue.district,
    address: venue.address,
    latitude: typeof venue.latitude === "number" ? venue.latitude : null,
    longitude: typeof venue.longitude === "number" ? venue.longitude : null,
    description: venue.description,
    contactPhone: venue.contact_phone,
    contactEmail: venue.contact_email,
  }));

  if (!venues.length) {
    return [];
  }

  const venueIds = venues.map((venue) => venue.id);
  const { data: courtsData, error: courtsError } = await supabase
    .from("court_summaries")
    .select("*")
    .in("venue_id", venueIds);

  if (courtsError) {
    console.error("Failed to fetch courts for venues", courtsError.message);
  }

  const courtsByVenue = new Map<string, CourtSummary[]>();
  ((courtsData ?? []) as CourtSummaryRow[]).forEach((row) => {
    const existing = courtsByVenue.get(row.venue_id) ?? [];
    existing.push(mapCourtSummary(row));
    courtsByVenue.set(row.venue_id, existing);
  });

  return venues.map((venue) => ({
    ...venue,
    courts: (courtsByVenue.get(venue.id) ?? []).sort(
      (a, b) => b.averageRating - a.averageRating
    ),
  }));
}

export async function fetchCourtDetail(
  slug: string
): Promise<CourtDetail | null> {
  const supabase = await createClient();

  const { data: court, error } = await supabase
    .from("courts")
    .select(
      `id, slug, name, sport, surface, price_per_hour, capacity, amenities, description,
       venue:venues(id, name, city, district, address, latitude, longitude, contact_phone, contact_email),
       images:court_images(image_url, caption, is_primary, display_order),
       reviews:court_reviews(id, rating, comment, created_at, profile:profiles(full_name))`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch court detail", error.message);
    return null;
  }

  const courtRow = (court ?? null) as CourtDetailRow | null;

  if (!courtRow) {
    return null;
  }

  const reviewSummaryResponse = await supabase
    .from("court_review_summary")
    .select("average_rating, review_count")
    .eq("court_id", courtRow.id)
    .maybeSingle();

  const reviewSummaryRow = reviewSummaryResponse.data as {
    average_rating: number | null;
    review_count: number | null;
  } | null;
  const summary = reviewSummaryRow
    ? {
        average_rating: reviewSummaryRow.average_rating,
        review_count: reviewSummaryRow.review_count,
      }
    : { average_rating: 0, review_count: 0 };

  const images = (courtRow.images ?? []) as CourtImageRow[];
  const baseRow: CourtSummaryRow = {
    id: courtRow.id,
    slug: courtRow.slug,
    name: courtRow.name,
    sport: courtRow.sport,
    surface: courtRow.surface,
    price_per_hour: courtRow.price_per_hour,
    capacity: courtRow.capacity,
    amenities: courtRow.amenities ?? [],
    description: courtRow.description,
    venue_id: courtRow.venue?.id ?? "",
    venue_name: courtRow.venue?.name ?? "",
    venue_city: courtRow.venue?.city ?? null,
    venue_district: courtRow.venue?.district ?? null,
    venue_latitude:
      typeof courtRow.venue?.latitude === "number"
        ? courtRow.venue.latitude
        : null,
    venue_longitude:
      typeof courtRow.venue?.longitude === "number"
        ? courtRow.venue.longitude
        : null,
    primary_image_url:
      images.find((img) => img.is_primary)?.image_url ??
      images[0]?.image_url ??
      null,
    average_rating: summary.average_rating,
    review_count: summary.review_count,
  };

  const base = mapCourtSummary(baseRow);

  return {
    ...base,
    venueAddress: courtRow.venue?.address ?? null,
    venueContactPhone: courtRow.venue?.contact_phone ?? null,
    venueContactEmail: courtRow.venue?.contact_email ?? null,
    images: [...images]
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      .map((image) => ({
        image_url: image.image_url,
        caption: image.caption ?? null,
        is_primary: Boolean(image.is_primary),
        display_order: image.display_order ?? 0,
      })),
    reviews: ((courtRow.reviews ?? []) as CourtReviewRow[]).map((review) => ({
      id: review.id,
      rating: Number(review.rating ?? 0),
      comment: review.comment ?? null,
      created_at: review.created_at,
      author: review.profile?.full_name ?? null,
    })),
  };
}

type FetchExploreDataOptions = {
  disableCookieAccess?: boolean;
};

export async function fetchExploreData(
  options: FetchExploreDataOptions = {}
): Promise<{
  courts: CourtSummary[];
  threads: ForumThreadSummary[];
  totalReplies: number;
}> {
  const supabase = await createClient();

  const [courtsRes, threadsRes] = await Promise.all([
    supabase
      .from("court_summaries")
      .select("*")
      .order("average_rating", { ascending: false })
      .limit(12),
    supabase
      .from("forum_threads")
      .select(
        `id, slug, title, excerpt, reply_count, created_at, tags,
         category:forum_categories(id, slug, name),
         author:profiles(full_name)`
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const courts = ((courtsRes.data ?? []) as CourtSummaryRow[]).map(
    mapCourtSummary
  );

  const threadRows = (threadsRes.data ?? []) as unknown as ForumThreadRow[];
  const threadSummaries = threadRows.map((thread) => ({
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt ?? null,
    reply_count: Number(thread.reply_count ?? 0),
    created_at: thread.created_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    category: thread.category
      ? {
          id: thread.category.id,
          slug: thread.category.slug,
          name: thread.category.name,
        }
      : null,
    author_name: thread.author?.full_name ?? null,
    latestReplyBody: null,
    latestReplyAt: null,
    reviewCourt: null,
  }));

  const threads = await attachLatestReplyMetadata(supabase, threadSummaries);

  const totalReplies = threads.reduce(
    (acc, thread) => acc + thread.reply_count,
    0
  );

  return { courts, threads, totalReplies };
}

export async function fetchForumCategories(): Promise<ForumCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, slug, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch forum categories", error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchForumThreads(): Promise<ForumThreadSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .select(
      `id, slug, title, excerpt, reply_count, created_at, tags,
       category:forum_categories(id, slug, name),
       author:profiles(full_name)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch forum threads", error.message);
    return [];
  }

  const threadRows = (data ?? []) as unknown as ForumThreadRow[];
  const threadIds = threadRows.map((thread) => thread.id);
  const reviewMap = new Map<
    string,
    { id: string; slug: string; name: string }
  >();

  if (threadIds.length) {
    const { data: reviewRefs, error: reviewError } = await supabase
      .from("court_reviews")
      .select("forum_thread_id, court:courts(id, slug, name)")
      .in("forum_thread_id", threadIds);

    if (reviewError) {
      console.error("Failed to fetch review thread links", reviewError.message);
    } else {
      ((reviewRefs ?? []) as ReviewThreadLinkRow[]).forEach((row) => {
        const courtRecord = Array.isArray(row.court) ? row.court[0] : row.court;
        if (courtRecord) {
          reviewMap.set(row.forum_thread_id, {
            id: courtRecord.id,
            slug: courtRecord.slug,
            name: courtRecord.name,
          });
        }
      });
    }
  }

  const threadSummaries = threadRows.map((thread) => ({
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt ?? null,
    reply_count: Number(thread.reply_count ?? 0),
    created_at: thread.created_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    category: thread.category
      ? {
          id: thread.category.id,
          slug: thread.category.slug,
          name: thread.category.name,
        }
      : null,
    author_name: thread.author?.full_name ?? null,
    latestReplyBody: null,
    latestReplyAt: null,
    reviewCourt: reviewMap.get(thread.id) ?? null,
  }));

  return attachLatestReplyMetadata(supabase, threadSummaries);
}

export async function fetchForumThreadDetail(
  slug: string
): Promise<ForumThreadDetail | null> {
  const supabase = await createClient();

  const { data: threadRowData, error } = await supabase
    .from("forum_threads")
    .select(
      `id, slug, title, body, excerpt, reply_count, created_at, tags,
       category:forum_categories(id, slug, name),
       author:profiles(full_name, avatar_url)`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch forum thread detail", error.message);
    return null;
  }

  const threadRow = (threadRowData ?? null) as ForumThreadRow | null;

  if (!threadRow) {
    return null;
  }

  let reviewCourt: { id: string; slug: string; name: string } | null = null;
  const { data: reviewDetail, error: reviewDetailError } = await supabase
    .from("court_reviews")
    .select("court:courts(id, slug, name)")
    .eq("forum_thread_id", threadRow.id)
    .maybeSingle();

  if (reviewDetailError) {
    console.error("Failed to fetch review context", reviewDetailError.message);
  } else if (reviewDetail) {
    const row = reviewDetail as ReviewThreadLinkRow;
    const courtRecord = Array.isArray(row.court) ? row.court[0] : row.court;
    if (courtRecord) {
      reviewCourt = {
        id: courtRecord.id,
        slug: courtRecord.slug,
        name: courtRecord.name,
      };
    }
  }

  const { data: repliesData, error: repliesError } = await supabase
    .from("forum_replies")
    .select(`id, body, created_at, author:profiles(full_name, avatar_url)`)
    .eq("thread_id", threadRow.id)
    .order("created_at", { ascending: true });

  if (repliesError) {
    console.error("Failed to fetch replies", repliesError.message);
  }

  const replyRows = (repliesData ?? []) as unknown as ForumReplyDetailRow[];
  const replies = replyRows.map((reply) => ({
    id: reply.id,
    body: reply.body,
    created_at: reply.created_at,
    author_name: reply.author?.full_name ?? null,
    author_avatar_url: reply.author?.avatar_url ?? null,
  }));

  const latestReply = replies.length ? replies[replies.length - 1] : null;

  return {
    id: threadRow.id,
    slug: threadRow.slug,
    title: threadRow.title,
    body: threadRow.body ?? null,
    excerpt: threadRow.excerpt ?? null,
    reply_count: Number(threadRow.reply_count ?? 0),
    created_at: threadRow.created_at,
    tags: Array.isArray(threadRow.tags) ? threadRow.tags : [],
    category: threadRow.category
      ? {
          id: threadRow.category.id,
          slug: threadRow.category.slug,
          name: threadRow.category.name,
        }
      : null,
    author_name: threadRow.author?.full_name ?? null,
    author_avatar_url: threadRow.author?.avatar_url ?? null,
    latestReplyBody: latestReply?.body ?? null,
    latestReplyAt: latestReply?.created_at ?? null,
    replies,
    reviewCourt,
  };
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const supabase = await createClient();

  const [bookingsRes, venuesRes, threadsRes] = await Promise.all([
    supabase.from("bookings").select("price_total", { count: "exact" }),
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue = ((bookingsRes.data ?? []) as BookingPriceRow[]).reduce(
    (acc, item) => acc + Number(item.price_total ?? 0),
    0
  );

  return {
    totalRevenue,
    totalBookings: bookingsRes.count ?? 0,
    totalVenues: venuesRes.count ?? 0,
    totalThreads: threadsRes.count ?? 0,
  };
}

function mapPartnerApplicationRow(
  row: PartnerApplicationRow
): PartnerApplication {
  return {
    id: row.id,
    organization_name: row.organization_name,
    contact_name: row.contact_name,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone ?? null,
    city: row.city ?? null,
    facility_types: Array.isArray(row.facility_types) ? row.facility_types : [],
    facility_count: row.facility_count ?? null,
    existing_system: row.existing_system ?? null,
    notes: row.notes ?? null,
    status: row.status,
    handled_by: row.handled_by ?? null,
    decision_note: row.decision_note ?? null,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at ?? null,
  };
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const now = new Date();
  const rangeStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
  );
  const rangeStartIso = rangeStart.toISOString();

  const [
    bookingsTotalsRes,
    venuesCountRes,
    courtsCountRes,
    threadsCountRes,
    applicationsRes,
    bookingsRangeRes,
  ] = await Promise.all([
    supabase.from("bookings").select("price_total", { count: "exact" }),
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("courts").select("id", { count: "exact", head: true }),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }),
    supabase
      .from("venue_partner_applications")
      .select(
        "*, credential:venue_partner_credentials(temporary_password, partner_profile_id)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select(
        "id, start_time, price_total, court:courts(id, name, sport, venue:venues(id, name, city))"
      )
      .gte("start_time", rangeStartIso),
  ]);

  const totalRevenue = (
    (bookingsTotalsRes.data ?? []) as BookingPriceRow[]
  ).reduce((acc, item) => acc + Number(item.price_total ?? 0), 0);

  const applications =
    ((applicationsRes.data ?? []) as PartnerApplicationWithCredentialRow[]) ??
    [];

  const metrics: AdminDashboardData["metrics"] = {
    totalRevenue,
    totalBookings: bookingsTotalsRes.count ?? 0,
    totalVenues: venuesCountRes.count ?? 0,
    totalThreads: threadsCountRes.count ?? 0,
    totalCourts: courtsCountRes.count ?? 0,
    pendingApplications: applications.filter((app) => app.status === "pending")
      .length,
  };

  const monthBuckets = new Map<
    string,
    {
      label: string;
      revenue: number;
      bookings: number;
    }
  >();
  for (let offset = 0; offset < 6; offset += 1) {
    const bucketDate = new Date(rangeStart);
    bucketDate.setUTCMonth(rangeStart.getUTCMonth() + offset);
    const key = `${bucketDate.getUTCFullYear()}-${String(
      bucketDate.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    monthBuckets.set(key, {
      label: bucketDate.toLocaleDateString("id-ID", { month: "short" }),
      revenue: 0,
      bookings: 0,
    });
  }

  const sportMap = new Map<string, { bookings: number; revenue: number }>();
  const venueMap = new Map<
    string,
    {
      venueName: string;
      city: string | null;
      revenue: number;
      bookings: number;
    }
  >();

  const bookingRangeRows = (bookingsRangeRes.data ??
    []) as unknown as BookingRow[];
  bookingRangeRows.forEach((booking) => {
    const bookingDate = new Date(booking.start_time);
    const monthKey = `${bookingDate.getUTCFullYear()}-${String(
      bookingDate.getUTCMonth() + 1
    ).padStart(2, "0")}`;
    const bucket = monthBuckets.get(monthKey);
    if (bucket) {
      bucket.revenue += Number(booking.price_total ?? 0);
      bucket.bookings += 1;
    }

    const sport = booking.court?.sport ?? "Lainnya";
    const sportEntry = sportMap.get(sport) ?? { bookings: 0, revenue: 0 };
    sportEntry.bookings += 1;
    sportEntry.revenue += Number(booking.price_total ?? 0);
    sportMap.set(sport, sportEntry);

    const venueId =
      booking.court?.venue?.id ?? booking.court?.venue?.name ?? "unknown";
    const venueEntry = venueMap.get(venueId) ?? {
      venueName: booking.court?.venue?.name ?? "Venue",
      city: booking.court?.venue?.city ?? null,
      revenue: 0,
      bookings: 0,
    };
    venueEntry.revenue += Number(booking.price_total ?? 0);
    venueEntry.bookings += 1;
    venueMap.set(venueId, venueEntry);
  });

  const revenueTrend = Array.from(monthBuckets.entries()).map(
    ([month, value]) => ({
      month,
      label: value.label,
      revenue: value.revenue,
      bookings: value.bookings,
    })
  );

  const sportBreakdown = Array.from(sportMap.entries())
    .map(([sport, value]) => ({
      sport,
      bookings: value.bookings,
      revenue: value.revenue,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  const venueLeaders = Array.from(venueMap.entries())
    .map(([venueId, value]) => ({
      venueId,
      venueName: value.venueName,
      city: value.city,
      revenue: value.revenue,
      bookings: value.bookings,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const pending = applications
    .filter((row) => row.status === "pending")
    .map((row) => mapPartnerApplicationRow(row));
  const accepted = applications
    .filter((row) => row.status === "accepted")
    .map((row) => ({
      ...mapPartnerApplicationRow(row),
      partner_profile_id: row.credential?.partner_profile_id ?? null,
      temporary_password: row.credential?.temporary_password ?? null,
    }));
  const rejected = applications
    .filter((row) => row.status === "rejected")
    .map((row) => mapPartnerApplicationRow(row));

  return {
    metrics,
    revenueTrend,
    sportBreakdown,
    venueLeaders,
    partnerApplications: {
      pending,
      accepted,
      rejected,
    },
  };
}

export async function fetchPartnerApplications(
  limit = 10
): Promise<PartnerApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venue_partner_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch partner applications", error.message);
    return [];
  }

  return ((data ?? []) as PartnerApplicationRow[]).map(
    mapPartnerApplicationRow
  );
}

export async function fetchUserDashboardData(
  profile: ProfileWithRole
): Promise<UserDashboardData> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [bookingsRes, recommendedCourtsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        `id, start_time, end_time, status, payment_status, payment_reference,
         payment_redirect_url, payment_expired_at, price_total, completed_at,
         court:courts(slug, name, sport, venue:venues(name, city))`
      )
      .eq("profile_id", profile.id)
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(5),
    supabase
      .from("court_summaries")
      .select("*")
      .order("average_rating", { ascending: false })
      .limit(3),
  ]);

  const bookingRows = (bookingsRes.data ?? []) as unknown as BookingRow[];

  const bookings = await Promise.all(
    bookingRows.map(async (booking) => {
      const synced = await syncBookingPaymentStatusWithMidtrans(supabase, {
        id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status,
        payment_reference: booking.payment_reference,
        completed_at: booking.completed_at ?? null,
      });

      return {
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: synced.bookingStatus,
        payment_status: synced.paymentStatus,
        payment_reference: booking.payment_reference ?? null,
        payment_redirect_url: booking.payment_redirect_url ?? null,
        payment_expires_at: booking.payment_expired_at ?? null,
        price_total: Number(booking.price_total ?? 0),
        court_name: booking.court?.name ?? "",
        court_slug: booking.court?.slug ?? "",
        sport: booking.court?.sport ?? "",
        venue_name: booking.court?.venue?.name ?? "",
        venue_city: booking.court?.venue?.city ?? null,
      };
    })
  );

  const recommendedCourts = (
    (recommendedCourtsRes.data ?? []) as CourtSummaryRow[]
  ).map(mapCourtSummary);

  return {
    bookings,
    recommendedCourts,
  };
}

export async function fetchUserBookingDetail(
  bookingId: string,
  profile: ProfileWithRole
): Promise<BookingDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, start_time, end_time, status, payment_status, payment_reference,
       payment_redirect_url, payment_token, payment_expired_at, price_total, notes,
       checked_in_at, completed_at,
       court:courts(id, slug, name, sport, price_per_hour,
         venue:venues(name, city, address))`
    )
    .eq("id", bookingId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch booking detail", error.message);
    return null;
  }

  const bookingRow = (data ?? null) as BookingDetailRow | null;

  if (!bookingRow || !bookingRow.court) {
    return null;
  }

  const synced = await syncBookingPaymentStatusWithMidtrans(supabase, {
    id: bookingRow.id,
    status: bookingRow.status,
    payment_status: bookingRow.payment_status,
    payment_reference: bookingRow.payment_reference,
    completed_at: bookingRow.completed_at ?? null,
  });

  const { data: reviewRowData } = await supabase
    .from("court_reviews")
    .select("id, rating, comment, forum_thread_id")
    .eq("booking_id", bookingRow.id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  const reviewRow = (reviewRowData ?? null) as BookingReviewRow | null;

  return {
    id: bookingRow.id,
    start_time: bookingRow.start_time,
    end_time: bookingRow.end_time,
    status: synced.bookingStatus,
    payment_status: synced.paymentStatus,
    payment_reference: bookingRow.payment_reference ?? null,
    payment_redirect_url: bookingRow.payment_redirect_url ?? null,
    payment_token: bookingRow.payment_token ?? null,
    payment_expires_at: bookingRow.payment_expired_at ?? null,
    price_total: Number(bookingRow.price_total ?? 0),
    notes: bookingRow.notes ?? null,
    checked_in_at: bookingRow.checked_in_at ?? null,
    completed_at: bookingRow.completed_at ?? null,
    review: reviewRow
      ? {
          id: reviewRow.id,
          rating: Number(reviewRow.rating ?? 0),
          comment: reviewRow.comment ?? null,
          forum_thread_id: reviewRow.forum_thread_id ?? null,
        }
      : null,
    court: {
      id: bookingRow.court.id,
      slug: bookingRow.court.slug,
      name: bookingRow.court.name,
      sport: bookingRow.court.sport,
      price_per_hour: Number(bookingRow.court.price_per_hour ?? 0),
      venue_name: bookingRow.court.venue?.name ?? null,
      venue_city: bookingRow.court.venue?.city ?? null,
      venue_address: bookingRow.court.venue?.address ?? null,
    },
  };
}

export async function fetchVenueDashboardData(
  profile: ProfileWithRole
): Promise<VenueDashboardData> {
  const supabase = await createClient();

  const venuesRes = await supabase
    .from("venues")
    .select(
      `id, name, city, district, address, latitude, longitude, contact_phone, contact_email, description,
       courts:courts(id, name, sport, surface, price_per_hour, capacity, amenities, description, is_active)`
    )
    .eq("owner_profile_id", profile.id);

  if (venuesRes.error) {
    console.error("Failed to fetch owned venues", venuesRes.error.message);
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: [],
    };
  }

  const venues = (venuesRes.data ?? []) as VenueWithCourtsRow[];
  const managedVenues = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    city: venue.city ?? null,
    district: venue.district ?? null,
    address: venue.address ?? null,
    latitude: typeof venue.latitude === "number" ? venue.latitude : null,
    longitude: typeof venue.longitude === "number" ? venue.longitude : null,
    contact_phone: venue.contact_phone ?? null,
    contact_email: venue.contact_email ?? null,
    description: venue.description ?? null,
    courts: (venue.courts ?? []).map((court) => ({
      id: court.id,
      name: court.name,
      sport: court.sport,
      surface: court.surface ?? null,
      price_per_hour: Number(court.price_per_hour ?? 0),
      capacity: court.capacity ?? null,
      amenities: Array.isArray(court.amenities) ? court.amenities : [],
      description: court.description ?? null,
      is_active: court.is_active ?? true,
      primary_image_url: null,
      blackouts: [],
    })),
  }));

  const courtIds = managedVenues.flatMap((venue) =>
    venue.courts.map((court) => court.id)
  );

  if (courtIds.length === 0) {
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: managedVenues,
    };
  }

  const [courtsRes, bookingsRes, blackoutsRes] = await Promise.all([
    supabase.from("court_summaries").select("*").in("id", courtIds),
    supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, checked_in_at, completed_at, price_total, court:courts(name, sport)"
      )
      .in("court_id", courtIds)
      .order("start_time", { ascending: true })
      .limit(20),
    supabase
      .from("court_blackouts")
      .select("*")
      .in("court_id", courtIds)
      .order("start_date", { ascending: true }),
  ]);

  const ownedCourts = ((courtsRes.data ?? []) as CourtSummaryRow[]).map(
    mapCourtSummary
  );

  const blackoutsByCourt = new Map<string, CourtBlackout[]>();
  ((blackoutsRes.data ?? []) as CourtBlackoutRow[]).forEach((row) => {
    const current = blackoutsByCourt.get(row.court_id) ?? [];
    current.push({
      id: row.id,
      title: row.title,
      notes: row.notes ?? null,
      scope: row.scope,
      frequency: row.frequency,
      start_date: row.start_date,
      end_date: row.end_date,
      start_time: row.start_time ?? null,
      end_time: row.end_time ?? null,
      repeat_day_of_week: row.repeat_day_of_week ?? null,
    });
    blackoutsByCourt.set(row.court_id, current);
  });

  const upcomingBookingRows = (bookingsRes.data ??
    []) as unknown as BookingRow[];
  const upcomingBookings = upcomingBookingRows.map((booking) => ({
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: normalizeBookingStatus(booking.status),
    checked_in_at: booking.checked_in_at ?? null,
    completed_at: booking.completed_at ?? null,
    price_total: Number(booking.price_total ?? 0),
    court_name: booking.court?.name ?? "",
    sport: booking.court?.sport ?? "",
  }));

  const revenueTotal = upcomingBookings.reduce(
    (acc, booking) => acc + booking.price_total,
    0
  );

  const primaryImageMap = new Map(
    ownedCourts.map((court) => [court.id, court.primaryImageUrl ?? null])
  );

  const venuesWithImages = managedVenues.map((venue) => ({
    ...venue,
    courts: venue.courts.map((court) => ({
      ...court,
      primary_image_url:
        primaryImageMap.get(court.id) ?? court.primary_image_url ?? null,
      blackouts: blackoutsByCourt.get(court.id) ?? [],
    })),
  }));

  return {
    ownedCourts,
    upcomingBookings,
    revenueTotal,
    venues: venuesWithImages,
  };
}
