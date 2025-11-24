import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { CourtSummary } from "./courts";
import type {
  CourtSummaryRow,
  CourtBlackoutRow,
  BookingRow,
  ProfileRow
} from "@/lib/api/types";

export type CourtBlackout = {
  id: string;
  title: string;
  notes: string | null;
  scope: "once" | "recurring";
  frequency: "daily" | "weekly" | "monthly";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_day_of_week: number | null;
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
    slug: string;
    name: string;
    description: string | null;
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

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "refunded";

export async function getVenueDashboardData(
  profileId: string
): Promise<VenueDashboardData> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", profileId)
    .single();

  if (profile?.role !== "venue_partner") {
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: [],
    };
  }

  const { data: venues, error: venuesError } = await supabase
    .from("venues")
    .select(
      `
      id,
      slug,
      name,
      description,
      courts (
        id,
        name,
        sport,
        surface,
        price_per_hour,
        capacity,
        amenities,
        description,
        is_active
      )
    `
    )
    .eq("partner_profile_id", profileId);

  if (venuesError || !venues) {
    console.error("Failed to fetch venues:", venuesError?.message);
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: [],
    };
  }

  const managedVenues = venues.map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
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
      title: row.title ?? "Blackout",
      notes: row.notes ?? null,
      scope: row.scope as "once" | "recurring" ?? "once",
      frequency: row.frequency as "daily" | "weekly" | "monthly" ?? "daily",
      start_date: row.start_date ?? "",
      end_date: row.end_date ?? "",
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
    price_total: Number(booking.total_price ?? 0),
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

function mapCourtSummary(row: CourtSummaryRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sport: row.sport,
    surface: row.surface ?? null,
    pricePerHour: row.price_per_hour,
    capacity: row.capacity ?? null,
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    description: row.description ?? null,
    venueName: row.venue_name,
    venueCity: row.venue_city ?? null,
    venueDistrict: row.venue_district ?? null,
    venueLatitude: row.venue_latitude ?? null,
    venueLongitude: row.venue_longitude ?? null,
    primaryImageUrl: row.primary_image_url ?? null,
    averageRating: row.average_rating ?? 0,
    reviewCount: row.review_count ?? 0,
  };
}

function normalizeBookingStatus(status: string): BookingStatus {
  switch (status) {
    case "pending":
    case "confirmed":
    case "checked_in":
    case "completed":
    case "cancelled":
    case "refunded":
      return status as BookingStatus;
    default:
      return "pending";
  }
}