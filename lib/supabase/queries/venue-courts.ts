import { createClient } from "@/lib/supabase/server";
import type { CourtSummary } from "./courts";
import type {
  CourtRow,
  CourtImageRow,
  VenueRow,
  CourtBlackoutRow
} from "@/lib/api/types";

export type VenueCourtDetail = {
  id: string;
  name: string;
  sport: string;
  surface: string | null;
  pricePerHour: number;
  capacity: number | null;
  amenities: string[];
  description: string | null;
  isActive: boolean;
  venueId: string;
  venueName: string;
  primaryImageUrl: string | null;
  images: CourtImage[];
  blackouts: CourtBlackout[];
  bookingsToday: number;
  monthlyRevenue: number;
  averageRating: number;
  reviewCount: number;
};

export type CourtImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
  isPrimary: boolean;
  displayOrder: number;
};

export type CourtBlackout = {
  id: string;
  title: string;
  notes: string | null;
  scope: "time_range" | "full_day";
  frequency: "once" | "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  repeatDayOfWeek: number | null;
};

export type VenueCourtMetrics = {
  totalCourts: number;
  activeCourts: number;
  totalCapacity: number;
  averagePricePerHour: number;
  todayBookings: number;
  todayRevenue: number;
  monthlyRevenue: number;
  mostPopularSport: string;
  occupancyRate: number;
};

export async function getVenueCourts(
  venueId: string,
  includeStats: boolean = true
): Promise<VenueCourtDetail[]> {
  const supabase = await createClient();

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select(`
      id,
      name,
      sport,
      surface,
      price_per_hour,
      capacity,
      amenities,
      description,
      is_active,
      venue_id
    `)
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (courtsError || !courts) {
    console.error("Failed to fetch venue courts:", courtsError?.message);
    return [];
  }

  const courtIds = courts.map((court) => court.id);

  // Fetch related data for all courts
  const [
    imagesResult,
    blackoutsResult,
    summariesResult,
    bookingsResult
  ] = await Promise.all([
    // Court images
    courtIds.length > 0
      ? supabase
          .from("court_images")
          .select("id, court_id, image_url, caption, is_primary, display_order")
          .in("court_id", courtIds)
          .order("display_order", { ascending: true })
      : { data: [], error: null },

    // Court blackouts
    courtIds.length > 0
      ? supabase
          .from("court_blackouts")
          .select(`
            id,
            court_id,
            title,
            notes,
            scope,
            frequency,
            start_date,
            end_date,
            start_time,
            end_time,
            repeat_day_of_week
          `)
          .in("court_id", courtIds)
          .gte("end_date", new Date().toISOString().split('T')[0])
          .order("start_date", { ascending: true })
      : { data: [], error: null },

    // Court summaries for ratings and primary images
    courtIds.length > 0
      ? supabase
          .from("court_summaries")
          .select("id, primary_image_url, average_rating, review_count")
          .in("id", courtIds)
      : { data: [], error: null },

    // Today's bookings for stats
    includeStats && courtIds.length > 0
      ? supabase
          .from("bookings")
          .select("court_id, start_time, end_time, price_total, status")
          .in("court_id", courtIds)
          .gte("start_time", new Date().toISOString().split('T')[0])
          .lt("start_time", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .eq("status", "confirmed")
      : { data: [], error: null },
  ]);

  // Map images by court ID
  const imagesByCourt = new Map<string, CourtImage[]>();
  (imagesResult.data ?? []).forEach((image: any) => {
    const current = imagesByCourt.get(image.court_id) ?? [];
    current.push({
      id: image.id,
      imageUrl: image.image_url,
      caption: image.caption,
      isPrimary: image.is_primary,
      displayOrder: image.display_order,
    });
    imagesByCourt.set(image.court_id, current);
  });

  // Map blackouts by court ID
  const blackoutsByCourt = new Map<string, CourtBlackout[]>();
  (blackoutsResult.data ?? []).forEach((blackout: any) => {
    const current = blackoutsByCourt.get(blackout.court_id) ?? [];
    current.push({
      id: blackout.id,
      title: blackout.title,
      notes: blackout.notes,
      scope: blackout.scope,
      frequency: blackout.frequency,
      startDate: blackout.start_date,
      endDate: blackout.end_date,
      startTime: blackout.start_time,
      endTime: blackout.end_time,
      repeatDayOfWeek: blackout.repeat_day_of_week,
    });
    blackoutsByCourt.set(blackout.court_id, current);
  });

  // Map summaries by court ID
  const summariesByCourt = new Map<string, any>();
  (summariesResult.data ?? []).forEach((summary: any) => {
    summariesByCourt.set(summary.id, summary);
  });

  // Calculate today's bookings by court
  const todayBookingsByCourt = new Map<string, number>();
  const todayRevenueByCourt = new Map<string, number>();
  if (includeStats && bookingsResult.data) {
    (bookingsResult.data).forEach((booking: any) => {
      const current = todayBookingsByCourt.get(booking.court_id) ?? 0;
      todayBookingsByCourt.set(booking.court_id, current + 1);

      const currentRevenue = todayRevenueByCourt.get(booking.court_id) ?? 0;
      todayRevenueByCourt.set(booking.court_id, currentRevenue + Number(booking.price_total ?? 0));
    });
  }

  // Get venue name
  const { data: venue } = await supabase
    .from("venues")
    .select("name")
    .eq("id", venueId)
    .single();

  return courts.map((court: any) => {
    const summary = summariesByCourt.get(court.id);
    const images = imagesByCourt.get(court.id) ?? [];
    const blackouts = blackoutsByCourt.get(court.id) ?? [];

    return {
      id: court.id,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour) || 0,
      capacity: court.capacity,
      amenities: Array.isArray(court.amenities) ? court.amenities : [],
      description: court.description,
      isActive: court.is_active ?? true,
      venueId: court.venue_id,
      venueName: venue?.name || "Unknown Venue",
      primaryImageUrl: summary?.primary_image_url || null,
      images: images,
      blackouts: blackouts,
      bookingsToday: todayBookingsByCourt.get(court.id) || 0,
      monthlyRevenue: 0, // TODO: Calculate from bookings data
      averageRating: Number(summary?.average_rating ?? 0),
      reviewCount: Number(summary?.review_count ?? 0),
    };
  });
}

export async function getVenueCourtMetrics(
  venueId: string
): Promise<VenueCourtMetrics> {
  const supabase = await createClient();

  const [
    courtsResult,
    todayBookingsResult,
    monthlyBookingsResult
  ] = await Promise.all([
    // Total courts
    supabase
      .from("courts")
      .select("id, sport, price_per_hour, capacity, is_active")
      .eq("venue_id", venueId),

    // Today's bookings
    supabase
      .from("bookings")
      .select("court_id, price_total, status, start_time, end_time")
      .eq("court.venue_id", venueId)
      .gte("start_time", new Date().toISOString().split('T')[0])
      .lt("start_time", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .eq("status", "confirmed"),

    // Monthly bookings (last 30 days)
    supabase
      .from("bookings")
      .select("court_id, price_total, status")
      .eq("court.venue_id", venueId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .eq("status", "completed"),
  ]);

  const courts = courtsResult.data ?? [];
  const todayBookings = todayBookingsResult.data ?? [];
  const monthlyBookings = monthlyBookingsResult.data ?? [];

  const totalCourts = courts.length;
  const activeCourts = courts.filter((c: any) => c.is_active).length;
  const totalCapacity = courts.reduce((sum: number, c: any) => sum + (c.capacity || 0), 0);
  const averagePricePerHour = courts.length > 0
    ? courts.reduce((sum: number, c: any) => sum + Number(c.price_per_hour || 0), 0) / courts.length
    : 0;

  const todayBookingsCount = todayBookings.length;
  const todayRevenue = todayBookings.reduce((sum: number, b: any) => sum + Number(b.price_total || 0), 0);
  const monthlyRevenue = monthlyBookings.reduce((sum: number, b: any) => sum + Number(b.price_total || 0), 0);

  // Calculate most popular sport
  const sportCounts = new Map<string, number>();
  courts.forEach((court: any) => {
    const current = sportCounts.get(court.sport) ?? 0;
    sportCounts.set(court.sport, current + 1);
  });
  const mostPopularSport = Array.from(sportCounts.entries())
    .sort(([, a], [, b]) => b - a)[0]?.[0] || "Unknown";

  // Calculate occupancy rate (simplified - based on today's bookings)
  const totalOperatingHours = activeCourts * 16; // 16 hours per day
  const bookedHoursToday = todayBookings.reduce((sum: number, b: any) => {
    const duration = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);
  const occupancyRate = totalOperatingHours > 0 ? Math.round((bookedHoursToday / totalOperatingHours) * 100) : 0;

  return {
    totalCourts,
    activeCourts,
    totalCapacity,
    averagePricePerHour,
    todayBookings: todayBookingsCount,
    todayRevenue,
    monthlyRevenue,
    mostPopularSport,
    occupancyRate,
  };
}

export async function createCourt(
  venueId: string,
  courtData: {
    name: string;
    sport: string;
    surface?: string;
    pricePerHour: number;
    capacity?: number;
    amenities?: string[];
    description?: string;
  }
): Promise<{ success: boolean; courtId?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .insert({
      venue_id: venueId,
      name: courtData.name,
      sport: courtData.sport,
      surface: courtData.surface || null,
      price_per_hour: courtData.pricePerHour,
      capacity: courtData.capacity || null,
      amenities: courtData.amenities || [],
      description: courtData.description || null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create court:", error);
    return { success: false, error: error.message };
  }

  return { success: true, courtId: data.id };
}

export async function updateCourt(
  courtId: string,
  courtData: {
    name?: string;
    sport?: string;
    surface?: string;
    pricePerHour?: number;
    capacity?: number;
    amenities?: string[];
    description?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (courtData.name !== undefined) updateData.name = courtData.name;
  if (courtData.sport !== undefined) updateData.sport = courtData.sport;
  if (courtData.surface !== undefined) updateData.surface = courtData.surface;
  if (courtData.pricePerHour !== undefined) updateData.price_per_hour = courtData.pricePerHour;
  if (courtData.capacity !== undefined) updateData.capacity = courtData.capacity;
  if (courtData.amenities !== undefined) updateData.amenities = courtData.amenities;
  if (courtData.description !== undefined) updateData.description = courtData.description;
  if (courtData.isActive !== undefined) updateData.is_active = courtData.isActive;

  const { error } = await supabase
    .from("courts")
    .update(updateData)
    .eq("id", courtId);

  if (error) {
    console.error("Failed to update court:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCourt(
  courtId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courts")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courtId);

  if (error) {
    console.error("Failed to delete court:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}