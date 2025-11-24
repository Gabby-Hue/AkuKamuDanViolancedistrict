import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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

export async function getCourtBySlug(slug: string): Promise<CourtDetail | null> {
  const supabase = await createClient();

  const { data: court, error } = await supabase
    .from("court_summaries")
    .select(`
      *,
      venue:venues(
        address,
        contact_phone,
        contact_email
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !court) {
    console.error("Failed to fetch court:", error?.message);
    return null;
  }

  const { data: images } = await supabase
    .from("court_images")
    .select("*")
    .eq("court_id", court.id)
    .order("display_order", { ascending: true });

  const { data: reviews } = await supabase
    .from("court_reviews")
    .select(`
      id,
      rating,
      comment,
      created_at,
      profile:profiles(full_name)
    `)
    .eq("court_id", court.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface ?? null,
    pricePerHour: court.price_per_hour,
    capacity: court.capacity ?? null,
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    description: court.description ?? null,
    venueName: court.venue_name,
    venueCity: court.venue_city ?? null,
    venueDistrict: court.venue_district ?? null,
    venueLatitude: court.venue_latitude ?? null,
    venueLongitude: court.venue_longitude ?? null,
    primaryImageUrl: court.primary_image_url ?? null,
    averageRating: court.average_rating ?? 0,
    reviewCount: court.review_count ?? 0,
    venueAddress: court.venue?.address ?? null,
    venueContactPhone: court.venue?.contact_phone ?? null,
    venueContactEmail: court.venue?.contact_email ?? null,
    images: (images ?? []).map((img) => ({
      image_url: img.image_url,
      caption: img.caption ?? null,
      is_primary: img.is_primary,
      display_order: img.display_order,
    })),
    reviews: (reviews ?? []).map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment ?? null,
      created_at: review.created_at,
      author: (review.profile as any)?.full_name ?? null,
    })),
  };
}

export async function getVenueBySlug(slug: string): Promise<VenueSummary | null> {
  const supabase = await createClient();

  const { data: venue, error } = await supabase
    .from("venues")
    .select(`
      id,
      slug,
      name,
      city,
      district,
      address,
      latitude,
      longitude,
      description,
      contact_phone,
      contact_email,
      courts (
        id,
        slug,
        name,
        sport,
        surface,
        price_per_hour,
        capacity,
        amenities,
        description
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !venue) {
    console.error("Failed to fetch venue:", error?.message);
    return null;
  }

  const courtIds = venue.courts?.map((court) => court.id) ?? [];

  let primaryImageMap = new Map<string, string | null>();
  if (courtIds.length > 0) {
    const { data: courtSummaries } = await supabase
      .from("court_summaries")
      .select("id, primary_image_url")
      .in("id", courtIds);

    primaryImageMap = new Map(
      (courtSummaries ?? []).map((court) => [
        court.id,
        court.primary_image_url ?? null,
      ])
    );
  }

  return {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city ?? null,
    district: venue.district ?? null,
    address: venue.address ?? null,
    latitude: venue.latitude ?? null,
    longitude: venue.longitude ?? null,
    description: venue.description ?? null,
    contactPhone: venue.contact_phone ?? null,
    contactEmail: venue.contact_email ?? null,
    courts: (venue.courts ?? []).map((court) => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface ?? null,
      pricePerHour: Number(court.price_per_hour ?? 0),
      capacity: court.capacity ?? null,
      amenities: Array.isArray(court.amenities) ? court.amenities : [],
      description: court.description ?? null,
      venueName: venue.name,
      venueCity: venue.city ?? null,
      venueDistrict: venue.district ?? null,
      venueLatitude: venue.latitude ?? null,
      venueLongitude: venue.longitude ?? null,
      primaryImageUrl: primaryImageMap.get(court.id) ?? null,
      averageRating: 0,
      reviewCount: 0,
    })),
  };
}

export async function searchCourts(query: string, filters?: {
  sport?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<CourtSummary[]> {
  const supabase = await createClient();

  let dbQuery = supabase
    .from("court_summaries")
    .select("*")
    .eq("is_active", true);

  if (query.trim()) {
    dbQuery = dbQuery.or(
      `name.ilike.%${query.trim()}%,venue_name.ilike.%${query.trim()}%,sport.ilike.%${query.trim()}%`
    );
  }

  if (filters?.sport) {
    dbQuery = dbQuery.eq("sport", filters.sport);
  }

  if (filters?.city) {
    dbQuery = dbQuery.eq("venue_city", filters.city);
  }

  if (filters?.minPrice !== undefined) {
    dbQuery = dbQuery.gte("price_per_hour", filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    dbQuery = dbQuery.lte("price_per_hour", filters.maxPrice);
  }

  const { data, error } = await dbQuery
    .order("average_rating", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to search courts:", error?.message);
    return [];
  }

  return (data ?? []).map((court) => ({
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface ?? null,
    pricePerHour: court.price_per_hour,
    capacity: court.capacity ?? null,
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    description: court.description ?? null,
    venueName: court.venue_name,
    venueCity: court.venue_city ?? null,
    venueDistrict: court.venue_district ?? null,
    venueLatitude: court.venue_latitude ?? null,
    venueLongitude: court.venue_longitude ?? null,
    primaryImageUrl: court.primary_image_url ?? null,
    averageRating: court.average_rating ?? 0,
    reviewCount: court.review_count ?? 0,
  }));
}