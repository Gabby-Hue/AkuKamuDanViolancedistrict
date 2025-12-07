"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/roles";
import { VenueQueries } from "@/lib/queries/venue";
import type { Venue } from "@/lib/queries/types";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch venue settings data
 */
export async function getVenueSettingsData(): Promise<{
  success: boolean;
  data?: {
    profile: {
      id: string;
      full_name: string | null;
      email: string | null;
      phone: string | null;
      role: string;
      created_at: string;
      updated_at: string;
    } | null;
    venue: any | null;
  };
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");
    const supabase = await createClient();

    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at, updated_at")
      .eq("id", profile.id)
      .single();

    if (profileError || !profileData) {
      return {
        success: false,
        error: "Profile not found"
      };
    }

    // Get venue dashboard data using the new query system
    const venueDashboardData = await VenueQueries.getVenueDashboardData(profile.id);

    return {
      success: true,
      data: {
        profile: profileData,
        venue: venueDashboardData.venue
      }
    };
  } catch (error) {
    console.error("Error in getVenueSettingsData:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mengambil data pengaturan"
    };
  }
}

/**
 * Server action to update venue partner profile
 */
export async function updateProfile(data: {
  fullName?: string;
  phone?: string | null;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone,
        updated_at: new Date().toISOString()
      })
      .eq("id", profile.id);

    if (error) {
      return {
        success: false,
        error: "Gagal memperbarui profil"
      };
    }

    revalidatePath("/dashboard/venue/settings");

    return {
      success: true,
      data: { success: true }
    };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui profil"
    };
  }
}

/**
 * Server action to update venue information
 */
export async function updateVenue(data: {
  name?: string;
  city?: string | null;
  district?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  facilityTypes?: string[];
  facilityCount?: number | null;
  website?: string | null;
  businessLicenseUrl?: string | null;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const profile = await requireRole("venue_partner");

    // First get the venue data to find the venue ID
    const venueDashboardData = await VenueQueries.getVenueDashboardData(profile.id);

    if (!venueDashboardData.venue.id) {
      return {
        success: false,
        error: "Venue tidak ditemukan"
      };
    }

      const result = await VenueQueries.updateVenueSettings(
      profile.id,
      venueDashboardData.venue.id,
      {
        name: data.name,
        city: data.city,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail
      }
    );

    if (result.success) {
      revalidatePath("/dashboard/venue/settings");
      revalidatePath("/dashboard/venue");
    }

    return result;
  } catch (error) {
    console.error("Error in updateVenue:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui venue"
    };
  }
}