import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import {
  normalizeBookingStatus,
  normalizePaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "../status";

export type CourtSummary = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  pricePerHour: number;
  capacity: number | null;
  facilities: string[];
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

type CourtSummaryRow = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number | null;
  capacity: number | null;
  facilities: string[] | null;
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
  facilities: string[] | null;
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

function mapCourtSummary(row: CourtSummaryRow): CourtSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sport: row.sport,
    surface: row.surface,
    pricePerHour: Number(row.price_per_hour ?? 0),
    capacity: row.capacity ?? null,
    facilities: Array.isArray(row.facilities) ? row.facilities : [],
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

export async function fetchVenueSummaries(): Promise<VenueSummary[]> {
  const supabase = await createClient();
  const { data: venuesData, error: venuesError } = await supabase
    .from("venues")
    .select(
      "id, slug, name, city, district, address, latitude, longitude, description, contact_phone, contact_email",
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
      (a, b) => b.averageRating - a.averageRating,
    ),
  }));
}

export async function fetchCourtDetail(
  slug: string,
): Promise<CourtDetail | null> {
  const supabase = await createClient();

  const { data: court, error } = await supabase
    .from("courts")
    .select(
      `id, slug, name, sport, surface, price_per_hour, capacity, facilities, description,
       venue:venues(id, name, city, district, address, latitude, longitude, contact_phone, contact_email),
       images:court_images(image_url, caption, is_primary, display_order),
       reviews:court_reviews(id, rating, comment, created_at, profile:profiles(full_name))`,
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
    facilities: courtRow.facilities ?? [],
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

export async function fetchExploreData(): Promise<{
  courts: CourtSummary[];
  threads: any[];
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
         author:profiles(full_name)`,
      )
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const courts = ((courtsRes.data ?? []) as CourtSummaryRow[]).map(
    mapCourtSummary,
  );

  const threadRows = (threadsRes.data ?? []) as unknown as any[];
  const threads = threadRows.map((thread) => ({
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

  const totalReplies = threads.reduce(
    (acc, thread) => acc + thread.reply_count,
    0,
  );

  return { courts, threads, totalReplies };
}
