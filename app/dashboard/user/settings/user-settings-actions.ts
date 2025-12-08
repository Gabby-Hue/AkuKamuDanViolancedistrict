"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/supabase/roles";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch user profile data
 */
export async function getUserSettingsData(): Promise<{
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
    // Allow both user and venue_partner roles to access user settings
    const profile = await requireRole(["user", "venue_partner"]);
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
    console.error("Error in getUserSettingsData:", error);
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
 * Server action to update user profile
 */
export async function updateUserProfile(data: {
  fullName?: string;
  phone?: string | null;
}): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Allow both user and venue_partner roles
    const profile = await requireRole(["user", "venue_partner"]);
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

    revalidatePath("/dashboard/user/settings");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal memperbarui profil",
    };
  }
}