"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type PartnerApplicationState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function approveApplication(
  applicationId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const adminSupabase = await createAdminClient();

    // Get current admin user
    const {
      data: { user: adminUser },
    } = await adminSupabase.auth.getUser();

    // Get application details
    const { data: application, error: appError } = await adminSupabase
      .from("venue_partner_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Find user profile by email address
    let finalUserProfile = await adminSupabase
      .from("profiles")
      .select("id, email, role")
      .ilike("email", application.contact_email)
      .single()
      .then(({ data, error }) => {
        if (!error && data) return data;
        return null;
      });

    if (!finalUserProfile) {
      // Find from auth.users and create profile if needed
      const { data: authUsers } = await adminSupabase.auth.admin.listUsers();
      const authUser = authUsers.users.find(
        (user) =>
          user.email?.toLowerCase() ===
          application.contact_email?.toLowerCase(),
      );

      if (authUser) {
        // Create or update profile
        const { data: newProfile, error: upsertError } = await adminSupabase
          .from("profiles")
          .upsert(
            {
              id: authUser.id,
              email: authUser.email!,
              full_name: application.contact_name,
              role: "user",
            },
            {
              onConflict: "id",
            },
          )
          .select("id, email, role")
          .single();

        if (upsertError || !newProfile) {
          throw new Error("User profile not found for this application");
        }
        finalUserProfile = newProfile;
      } else {
        throw new Error("User profile not found for this application");
      }
    }

    // Check if user is already a venue partner
    if (finalUserProfile.role === "venue_partner") {
      // Just update the application status
      const { error: updateError } = await adminSupabase
        .from("venue_partner_applications")
        .update({
          status: "accepted",
          handled_by: adminUser?.email || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) {
        throw updateError;
      }

      revalidatePath("/dashboard/admin/applications");
      return {
        success: true,
        message:
          "Application accepted successfully (user is already a venue partner)",
      };
    }

    // Perform all operations in sequence
    try {
      // 1. Update application status
      const { error: updateError } = await adminSupabase
        .from("venue_partner_applications")
        .update({
          status: "accepted",
          handled_by: adminUser?.email || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) {
        throw new Error(`Failed to update application: ${updateError.message}`);
      }

      // 2. Update user role to venue_partner
      const { error: roleError } = await adminSupabase
        .from("profiles")
        .update({ role: "venue_partner" })
        .eq("id", finalUserProfile.id);

      if (roleError) {
        throw new Error(`Failed to update user role: ${roleError.message}`);
      }

      // 3. Create venue record in venues table
      const { error: venueError } = await adminSupabase.from("venues").insert({
        name: application.organization_name,
        description: application.notes,
        owner_profile_id: finalUserProfile.id,
        contact_phone: application.contact_phone,
        contact_email: application.contact_email,
        city: application.city,
        website: null, // bisa diisi nanti
        business_license_url: null, // bisa diisi nanti
        venue_status: "active",
        verified_at: new Date().toISOString(),
      });

      if (venueError) {
        throw new Error(`Failed to create venue record: ${venueError.message}`);
      }

      revalidatePath("/dashboard/admin/applications");
      return {
        success: true,
        message:
          "Application accepted and user upgraded to venue partner successfully",
      };
    } catch (operationError) {
      // If any operation fails, we might want to rollback, but for now just log the error
      console.error("Operation failed during approval:", operationError);
      throw operationError;
    }
  } catch (error) {
    console.error("Failed to approve application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to accept application",
    };
  }
}

export async function rejectApplication(
  applicationId: string,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const adminSupabase = await createAdminClient();

    // Get current admin user
    const {
      data: { user },
    } = await adminSupabase.auth.getUser();

    const { error } = await adminSupabase
      .from("venue_partner_applications")
      .update({
        status: "rejected",
        handled_by: user?.email || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard/admin/applications");
    return {
      success: true,
      message: "Application rejected successfully",
    };
  } catch (error) {
    console.error("Failed to reject application:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to reject application",
    };
  }
}

export async function submitPartnerApplication(
  prevState: PartnerApplicationState,
  formData: FormData,
): Promise<PartnerApplicationState> {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Store the current page URL to redirect back after login
    const currentUrl = new URL(
      "/venue-partner",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    );
    redirect(`/auth/login?redirect=${encodeURIComponent(currentUrl.pathname)}`);
  }

  const organizationName = (formData.get("organizationName") ?? "")
    .toString()
    .trim();
  const contactName = (formData.get("contactName") ?? "").toString().trim();
  const contactEmail = (formData.get("contactEmail") ?? "")
    .toString()
    .trim()
    .toLowerCase();
  const contactPhone = (formData.get("contactPhone") ?? "").toString().trim();
  const city = (formData.get("city") ?? "").toString().trim();
  const existingSystem = (formData.get("existingSystem") ?? "")
    .toString()
    .trim();
  const notes = (formData.get("notes") ?? "").toString().trim();

  if (!organizationName) {
    return { status: "error", message: "Nama brand venue harus diisi." };
  }

  if (!contactName) {
    return { status: "error", message: "Nama penanggung jawab wajib diisi." };
  }

  if (!contactEmail || !contactEmail.includes("@")) {
    return { status: "error", message: "Masukkan email yang valid." };
  }

  try {
    const adminSupabase = await createAdminClient();

    // Ensure user profile exists
    await adminSupabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: contactName,
        role: "user",
      },
      {
        onConflict: "id",
      },
    );

    const { error } = await adminSupabase
      .from("venue_partner_applications")
      .insert({
        organization_name: organizationName,
        contact_name: contactName,
        contact_email: user.email, // Use authenticated user's email
        contact_phone: contactPhone || null,
        city: city || null,
        existing_system: existingSystem || null,
        notes: notes || null,
        status: "pending",
      });

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard/admin");
    return {
      status: "success",
      message:
        "Aplikasi kamu sudah kami terima. Tim CourtEase akan menghubungi dalam 1x24 jam kerja.",
    };
  } catch (error) {
    console.error("Failed to submit partner application", error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengirim aplikasi. Coba lagi nanti.",
    };
  }
}
