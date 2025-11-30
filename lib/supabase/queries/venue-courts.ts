import { createClient } from "@/lib/supabase/client";
import type { CourtSummary } from "./courts";
import type {
  CourtRow,
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
  facilities: string[];
  description: string | null;
  isActive: boolean;
  venueId: string;
  venueName: string;
  primaryImageUrl: string | null;
  images: [];
  blackouts: CourtBlackout[];
  bookingsToday: number;
  monthlyRevenue: number;
  averageRating: number;
  reviewCount: number;
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
  includeStats: boolean = true,
  includeInactive: boolean = false
): Promise<VenueCourtDetail[]> {
  const supabase = createClient();

  let query = supabase
    .from("courts")
    .select(`
      id,
      name,
      sport,
      surface,
      price_per_hour,
      capacity,
      facilities,
      description,
      is_active,
      venue_id
    `)
    .eq("venue_id", venueId)
    .order("name", { ascending: true });

  // Only filter out inactive courts if explicitly requested
  // This allows us to show all courts in the main interface
  // and use is_active for blackout/maintenance functionality
  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data: courts, error: courtsError } = await query;

  if (courtsError || !courts) {
    console.error("Failed to fetch venue courts:", courtsError?.message);
    return [];
  }

  const courtIds = courts.map((court) => court.id);

  // Fetch related data for all courts
  const [
    blackoutsResult,
    summariesResult,
    bookingsResult
  ] = await Promise.all([

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
    const blackouts = blackoutsByCourt.get(court.id) ?? [];

    return {
      id: court.id,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour) || 0,
      capacity: court.capacity,
      facilities: Array.isArray(court.facilities) ? court.facilities : [],
      description: court.description,
      isActive: court.is_active ?? true,
      venueId: court.venue_id,
      venueName: venue?.name || "Unknown Venue",
      primaryImageUrl: summary?.primary_image_url || null,
      images: [],
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
  const supabase = createClient();

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
    facilities?: string[];
    description?: string;
  }
): Promise<{ success: boolean; courtId?: string; error?: string }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("courts")
    .insert({
      venue_id: venueId,
      name: courtData.name,
      sport: courtData.sport,
      surface: courtData.surface || null,
      price_per_hour: courtData.pricePerHour,
      capacity: courtData.capacity || null,
      facilities: courtData.facilities || [],
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
    facilities?: string[];
    description?: string;
    isActive?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (courtData.name !== undefined) updateData.name = courtData.name;
  if (courtData.sport !== undefined) updateData.sport = courtData.sport;
  if (courtData.surface !== undefined) updateData.surface = courtData.surface;
  if (courtData.pricePerHour !== undefined) updateData.price_per_hour = courtData.pricePerHour;
  if (courtData.capacity !== undefined) updateData.capacity = courtData.capacity;
  if (courtData.facilities !== undefined) updateData.facilities = courtData.facilities;
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

export async function toggleCourtAvailability(
  courtId: string,
  isActive: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("courts")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", courtId);

  if (error) {
    console.error("Failed to toggle court availability:", error);
    return { success: false, error: error.message };
  }

  // If deactivating, could also create a blackout entry for maintenance
  if (!isActive && reason) {
    const { error: blackoutError } = await supabase
      .from("court_blackouts")
      .insert({
        court_id: courtId,
        title: "Maintenance",
        notes: reason,
        scope: "full_day",
        frequency: "once",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        start_time: null,
        end_time: null,
        repeat_day_of_week: null,
      });

    if (blackoutError) {
      console.warn("Failed to create maintenance blackout:", blackoutError);
      // Don't fail the main operation if blackout creation fails
    }
  }

  return { success: true };
}

export async function deleteCourt(
  courtId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // First, check if there are any active bookings for this court
  const { data: activeBookings, error: bookingCheckError } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", courtId)
    .in("status", ["pending", "confirmed"])
    .gte("start_time", new Date().toISOString());

  if (bookingCheckError) {
    console.error("Failed to check bookings:", bookingCheckError);
    return { success: false, error: "Gagal memeriksa booking aktif" };
  }

  if (activeBookings && activeBookings.length > 0) {
    return {
      success: false,
      error: `Tidak dapat menghapus lapangan. Masih ada ${activeBookings.length} booking aktif.`
    };
  }

  // Delete related data in proper order to avoid foreign key constraints
  const deleteOperations = [
    // Delete court blackouts
    supabase.from("court_blackouts").delete().eq("court_id", courtId),
    // Delete court summaries
    // supabase.from("court_summaries").delete().eq("id", courtId),
    // Delete old completed bookings (keep historical data for the venue)
    // If you want to keep booking history, you might want to only set court_id to null
    // For now, let's keep the bookings but remove the reference
    supabase.from("bookings").update({ court_id: null }).eq("court_id", courtId),
    // Finally delete the court
    supabase.from("courts").delete().eq("id", courtId)
  ];

  try {
    const results = await Promise.allSettled(deleteOperations);

    // Check if any operation failed
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        console.error(`Delete operation ${i} failed:`, result.reason);
        return { success: false, error: "Gagal menghapus data terkait lapangan" };
      }

      if (result.status === 'fulfilled' && result.value.error) {
        console.error(`Delete operation ${i} failed:`, result.value.error);
        return { success: false, error: "Gagal menghapus data terkait lapangan" };
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete court:", error);
    return { success: false, error: "Terjadi kesalahan saat menghapus lapangan" };
  }
}
