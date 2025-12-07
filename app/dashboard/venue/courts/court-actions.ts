"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/roles";
import { VenueQueries } from "@/lib/queries/venue";
import type { Court } from "@/lib/queries/types";

/**
 * Server Action to fetch court details by ID
 * Replaces GET /api/dashboard/venue/courts/[id]
 */
export async function getCourtDetailsAction(courtId: string): Promise<Court | null> {
  const profile = await requireRole("venue_partner");
  return await VenueQueries.getCourtForEdit(courtId, profile.id);
}

/**
 * Server Action to fetch all venue courts with stats
 * Replaces multiple API calls with single direct query
 */
export async function getVenueCourtsAction(venueId: string): Promise<Court[]> {
  const profile = await requireRole("venue_partner");
  return await VenueQueries.getVenueCourts(profile.id, venueId);
}

/**
 * Server Action to create new court
 * Replaces POST /api/dashboard/venue/courts/create
 */
export async function createCourtAction(courtData: {
  venue_id: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  facilities: string[];
  description: string | null;
}) {
  const profile = await requireRole("venue_partner");
  const supabase = await createClient();

  // Verify venue ownership
  const { data: venueCheck, error: venueError } = await supabase
    .from("venues")
    .select("id")
    .eq("id", courtData.venue_id)
    .eq("owner_profile_id", profile.id)
    .single();

  if (venueError || !venueCheck) {
    return {
      success: false,
      error: "Akses ditolak: Venue tidak ditemukan atau bukan milik Anda"
    };
  }

  // Create the court
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Gagal membuat lapangan"
    };
  }

  return {
    success: true,
    data
  };
}

/**
 * Server Action to update existing court
 * Replaces PUT /api/dashboard/venue/courts/[id]
 */
export async function updateCourtAction(
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
  }
) {
  const profile = await requireRole("venue_partner");
  const supabase = await createClient();

  // First verify that the court belongs to the venue partner's venue
  const { data: courtData, error: courtError } = await supabase
    .from("courts")
    .select("id, venue_id")
    .eq("id", courtId)
    .single();

  if (courtError || !courtData) {
    return {
      success: false,
      error: "Lapangan tidak ditemukan"
    };
  }

  // Verify venue ownership
  const { data: venueCheck, error: venueError } = await supabase
    .from("venues")
    .select("id")
    .eq("id", courtData.venue_id)
    .eq("owner_profile_id", profile.id)
    .single();

  if (venueError || !venueCheck) {
    return {
      success: false,
      error: "Akses ditolak: Lapangan tidak termasuk dalam venue Anda"
    };
  }

  // Update the court
  const { data, error } = await supabase
    .from("courts")
    .update({
      ...updateData,
      updated_at: new Date().toISOString()
    })
    .eq("id", courtId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Gagal memperbarui lapangan"
    };
  }

  return {
    success: true,
    data
  };
}

/**
 * Server Action to delete court (hard delete)
 * Used: dashboard/venue/courts/client-wrapper.tsx (DeleteCourtDialog)
 */
export async function deleteCourtAction(courtId: string) {
  const profile = await requireRole("venue_partner");
  const supabase = await createClient();

  // First verify that the court belongs to the venue partner's venue
  const { data: courtData, error: courtError } = await supabase
    .from("courts")
    .select("id, venue_id, name")
    .eq("id", courtId)
    .single();

  if (courtError || !courtData) {
    return {
      success: false,
      error: "Lapangan tidak ditemukan"
    };
  }

  // Verify venue ownership
  const { data: venueCheck, error: venueError } = await supabase
    .from("venues")
    .select("id")
    .eq("id", courtData.venue_id)
    .eq("owner_profile_id", profile.id)
    .single();

  if (venueError || !venueCheck) {
    return {
      success: false,
      error: "Akses ditolak: Lapangan tidak termasuk dalam venue Anda"
    };
  }

  // Check for existing bookings
  const { data: existingBookings, error: bookingCheckError } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", courtId)
    .in("status", ["confirmed", "checked_in"])
    .limit(1);

  if (bookingCheckError) {
    return {
      success: false,
      error: "Gagal memeriksa booking yang ada"
    };
  }

  if (existingBookings && existingBookings.length > 0) {
    return {
      success: false,
      error: "Tidak dapat menghapus lapangan yang memiliki booking aktif. Batalkan semua booking terlebih dahulu atau ubah status lapangan menjadi Maintenance."
    };
  }

  // Delete related records first (due to foreign key constraints)
  // Delete court reviews first
  const { error: reviewsDeleteError } = await supabase
    .from("court_reviews")
    .delete()
    .eq("court_id", courtId);

  if (reviewsDeleteError) {
    console.error("Error deleting court reviews:", reviewsDeleteError);
    // Continue anyway as this might not be critical
  }

  // Delete other related bookings (cancelled, completed, etc.)
  const { error: bookingsDeleteError } = await supabase
    .from("bookings")
    .delete()
    .eq("court_id", courtId);

  if (bookingsDeleteError) {
    console.error("Error deleting bookings:", bookingsDeleteError);
    // Continue anyway as this might not be critical
  }

  // Delete court images if they exist
  const { error: imagesDeleteError } = await supabase
    .from("court_images")
    .delete()
    .eq("court_id", courtId);

  if (imagesDeleteError) {
    console.error("Error deleting court images:", imagesDeleteError);
    // Continue anyway as this might not be critical
  }

  // Finally delete the court
  const { data, error } = await supabase
    .from("courts")
    .delete()
    .eq("id", courtId)
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: `Gagal menghapus lapangan: ${error.message}`
    };
  }

  return {
    success: true,
    data: {
      id: courtId,
      name: courtData.name,
      message: "Lapangan berhasil dihapus secara permanen"
    }
  };
}