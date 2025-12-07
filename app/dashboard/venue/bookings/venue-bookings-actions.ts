"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/roles";
import { VenueQueries } from "@/lib/queries/venue";
import type { Booking } from "@/lib/queries/types";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch venue bookings data
 */
export async function getVenueBookingsData(options?: {
  venueId?: string;
  status?: string;
  paymentStatus?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data?: {
    bookings: Booking[];
    venues: any[];
  };
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");

    // Get venue dashboard data first to get the venue ID
    const venueDashboardData = await VenueQueries.getVenueDashboardData(profile.id);
    const venueId = options?.venueId || venueDashboardData.venue.id;

    // Get bookings using the new query system
    const bookings = await VenueQueries.getVenueBookings(profile.id, venueId, {
      status: options?.status as any,
      paymentStatus: options?.paymentStatus as any,
      limit: options?.limit,
      offset: options?.offset
    });

    // Transform venues array for compatibility
    const venues = [{
      id: venueDashboardData.venue.id,
      name: venueDashboardData.venue.name,
      city: venueDashboardData.venue.city || "",
      district: venueDashboardData.venue.district
    }];

    return {
      success: true,
      data: { bookings, venues }
    };
  } catch (error) {
    console.error("Error in getVenueBookingsData:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data bookings"
    };
  }
}

/**
 * Server action to update booking status
 */
export async function updateBookingStatus(data: {
  bookingId: string;
  status: string;
  notes?: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");
    const supabase = await createClient();

    // First verify that the booking belongs to the venue partner's venue
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        courts!inner (
          venue_id
        )
      `)
      .eq("id", data.bookingId)
      .single();

    if (bookingError || !bookingData) {
      return {
        success: false,
        error: "Booking tidak ditemukan"
      };
    }

    // Verify venue ownership
    const { data: venueCheck, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("id", bookingData.courts.venue_id)
      .eq("owner_profile_id", profile.id)
      .single();

    if (venueError || !venueCheck) {
      return {
        success: false,
        error: "Akses ditolak: Booking tidak termasuk dalam venue Anda"
      };
    }

    // Update the booking status
    const updateData: any = {
      status: data.status,
      updated_at: new Date().toISOString()
    };

    if (data.notes) {
      updateData.notes = data.notes;
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", data.bookingId);

    if (updateError) {
      return {
        success: false,
        error: "Gagal memperbarui status booking"
      };
    }

    revalidatePath("/dashboard/venue/bookings");

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status booking"
    };
  }
}

/**
 * Server action to cancel booking
 */
export async function cancelBooking(data: {
  bookingId: string;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");
    const supabase = await createClient();

    // First verify that the booking belongs to the venue partner's venue
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        courts!inner (
          venue_id
        )
      `)
      .eq("id", data.bookingId)
      .single();

    if (bookingError || !bookingData) {
      return {
        success: false,
        error: "Booking tidak ditemukan"
      };
    }

    // Verify venue ownership
    const { data: venueCheck, error: venueError } = await supabase
      .from("venues")
      .select("id")
      .eq("id", bookingData.courts.venue_id)
      .eq("owner_profile_id", profile.id)
      .single();

    if (venueError || !venueCheck) {
      return {
        success: false,
        error: "Akses ditolak: Booking tidak termasuk dalam venue Anda"
      };
    }

    // Cancel the booking
    const { error: cancelError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", data.bookingId);

    if (cancelError) {
      return {
        success: false,
        error: "Gagal membatalkan booking"
      };
    }

    revalidatePath("/dashboard/venue/bookings");

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error("Error in cancelBooking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membatalkan booking"
    };
  }
}