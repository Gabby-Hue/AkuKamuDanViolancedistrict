"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch admin profile data
 */
export async function getAdminSettingsData(): Promise<{
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
  };
  error?: string;
}> {
  try {
    const profile = await requireRole("admin");
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
        error: "Profile not found",
      };
    }

    return {
      success: true,
      data: {
        profile: profileData,
      },
    };
  } catch (error) {
    console.error("Error in getAdminSettingsData:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengaturan",
    };
  }
}

/**
 * Server action to update admin profile
 */
export async function updateAdminProfile(data: {
  fullName?: string;
  phone?: string | null;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const profile = await requireRole("admin");
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.fullName,
        phone: data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      return {
        success: false,
        error: "Gagal memperbarui profil",
      };
    }

    revalidatePath("/dashboard/admin/settings");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("Error in updateAdminProfile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal memperbarui profil",
    };
  }
}

/**
 * Server action to get admin statistics for dashboard
 */
export async function getAdminStats(): Promise<{
  success: boolean;
  data?: {
    totalUsers: number;
    totalVenues: number;
    totalBookings: number;
    totalRevenue: number;
    pendingApplications: number;
  };
  error?: string;
}> {
  try {
    await requireRole("admin");
    const supabase = await createClient();

    // Get basic counts
    const [
      { count: totalUsers },
      { count: totalVenues },
      { count: totalBookings },
      { count: pendingApplications },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase
        .from("venue_partner_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    // Get total revenue (sum of paid bookings)
    const { data: revenueData } = await supabase
      .from("bookings")
      .select("price_total")
      .eq("payment_status", "paid");

    const totalRevenue = revenueData?.reduce(
      (sum, booking) => sum + Number(booking.price_total || 0),
      0
    );

    return {
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalVenues: totalVenues || 0,
        totalBookings: totalBookings || 0,
        totalRevenue,
        pendingApplications: pendingApplications || 0,
      },
    };
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal mengambil data statistik",
    };
  }
}