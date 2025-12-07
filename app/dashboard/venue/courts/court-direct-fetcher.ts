"use server";

import { createClient } from "@/lib/supabase/server";

export type CourtDetails = {
  id: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  facilities: string[];
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_district: string;
  average_rating: number;
  review_count: number;
  total_bookings: number;
  today_bookings: number;
  today_revenue: number;
  total_revenue: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  primary_image_url?: string;
};

export type CourtList = {
  id: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  facilities: string[];
  is_active: boolean;
  average_rating: number;
  review_count: number;
  total_bookings: number;
  today_bookings: number;
  today_revenue: number;
  total_revenue: number;
  confirmed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  primary_image_url?: string;
};

/**
 * Fetch court details by ID using direct query
 * Replaces GET /api/dashboard/venue/courts/[id]
 */
export async function getCourtById(
  courtId: string,
): Promise<CourtDetails | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("courts")
      .select(
        `id, slug, name, sport, surface, price_per_hour, capacity, facilities, description,
         venue:venues(id, name, city, district, address, latitude, longitude, contact_phone, contact_email),
         reviews:court_reviews(id, rating, comment, created_at, profile:profiles(full_name))`,
      )
      .eq("id", courtId)
      .single();

    if (error) {
      console.error("Failed to fetch court details:", error.message);
      throw new Error("Failed to fetch court details");
    }

    return data as unknown as CourtDetails;
  } catch (error) {
    console.error("Error fetching court by ID:", error);
    return null;
  }
}

/**
 * Fetch all courts for a venue using venue-stats for real data
 * Returns ALL courts (active and inactive) with actual booking stats and ratings
 */
export async function getVenueCourtsWithStats(
  venueId: string,
): Promise<CourtList[]> {
  try {
    // Use the updated venue-stats function that gets ALL courts with real stats
    const { fetchVenueStatsByVenueId } = await import("@/lib/supabase/queries/venue-stats");
    const venueData = await fetchVenueStatsByVenueId(venueId);

    // Transform the data to match CourtList interface
    const transformedData = venueData.courts.map((court: any) => ({
      id: court.id,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      price_per_hour: court.pricePerHour,
      capacity: court.capacity,
      facilities: court.facilities || [],
      is_active: court.isActive, // Direct mapping from venue-stats
      average_rating: court.averageRating,
      review_count: court.reviewCount,
      total_bookings: court.totalBookings,
      today_bookings: court.todayBookings,
      today_revenue: court.todayRevenue,
      total_revenue: court.totalRevenue,
      confirmed_bookings: court.confirmedBookings,
      pending_bookings: court.pendingBookings,
      cancelled_bookings: court.cancelledBookings,
      primary_image_url: court.primaryImageUrl,
    }));

    return transformedData as CourtList[];
  } catch (error) {
    console.error("Error fetching venue courts:", error);
    return [];
  }
}

/**
 * Create new court using direct query
 * Replaces POST /api/dashboard/venue/courts/create
 */
export async function createCourt(courtData: {
  venue_id: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  facilities: string[];
  description: string | null;
}): Promise<{ success: boolean; data?: CourtDetails; error?: string }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("courts")
      .insert({
        venue_id: courtData.venue_id,
        name: courtData.name,
        sport: courtData.sport,
        surface: courtData.surface,
        price_per_hour: courtData.price_per_hour,
        capacity: courtData.capacity,
        facilities: courtData.facilities,
        description: courtData.description,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create court:", error.message);
      return { success: false, error: error.message };
    }

    // Fetch the newly created court with stats
    const courtWithStats = await getCourtById(data.id);

    return {
      success: true,
      data: courtWithStats || undefined,
    };
  } catch (error) {
    console.error("Error creating court:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Update court using direct query
 * Replaces PUT /api/dashboard/venue/courts/[id]
 */
export async function updateCourt(
  courtId: string,
  updateData: {
    name?: string;
    sport?: string;
    surface?: string | null;
    price_per_hour?: number;
    capacity?: number | null;
    facilities?: string[];
    description?: string | null;
    is_active?: boolean;
  },
): Promise<{ success: boolean; data?: CourtDetails; error?: string }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("courts")
      .update(updateData)
      .eq("id", courtId)
      .select()
      .single();

    if (error) {
      console.error("Failed to update court:", error.message);
      return { success: false, error: error.message };
    }

    // Fetch the updated court with stats
    const courtWithStats = await getCourtById(courtId);

    return {
      success: true,
      data: courtWithStats || undefined,
    };
  } catch (error) {
    console.error("Error updating court:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete court using direct query
 * (Optional - not currently used in the UI)
 */
export async function deleteCourt(
  courtId: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("courts").delete().eq("id", courtId);

    if (error) {
      console.error("Failed to delete court:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting court:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
