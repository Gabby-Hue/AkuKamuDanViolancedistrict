import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateAuth,
  ApiError,
  createSuccessResponse,
  handleApiError,
} from "@/lib/api/utils";

// GET /api/dashboard/venue/courts/[id]/images - Get court images from storage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Langsung resolve dan destrukturkan params di dalam blok try.
    // Jika ini gagal, blok catch akan menanganinya.
    const { id: courtId } = await params;

    // --- Validasi Awal ---
    if (!courtId) {
      throw new ApiError(400, "ID lapangan tidak valid", "INVALID_COURT_ID");
    }

    const supabase = await createClient();
    const user = await validateAuth(supabase);

    // Get user profile and check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new ApiError(404, "Profil tidak ditemukan", "PROFILE_NOT_FOUND");
    }

    if (profile.role !== "venue_partner") {
      throw new ApiError(
        403,
        "Akses ditolak. Hanya venue partner yang diizinkan.",
        "FORBIDDEN",
      );
    }

    // Verify court ownership and get venue info
    const { data: court, error: courtError } = await supabase
      .from("courts")
      .select(
        `
        venue_id,
        venues!inner(owner_profile_id)
      `,
      )
      .eq("id", courtId)
      .eq("venues.owner_profile_id", user.id)
      .single();

    if (courtError || !court) {
      throw new ApiError(404, "Lapangan tidak ditemukan", "COURT_NOT_FOUND");
    }

    // List files from Supabase Storage
    const { data: files, error: listError } = await supabase.storage
      .from("court-images")
      .list(`${court.venue_id}/${courtId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: "created_at", order: "asc" },
      });

    if (listError) {
      console.error("Storage list error:", listError);
      // If bucket doesn't exist or folder empty, return empty array
      return createSuccessResponse({
        courtId,
        venueId: court.venue_id,
        images: [],
        primaryImage: null,
      });
    }

    // Get public URLs for all images
    const images = await Promise.all(
      files.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from("court-images")
          .getPublicUrl(`${court.venue_id}/${courtId}/${file.name}`);

        return {
          id: file.id,
          name: file.name,
          url: urlData.publicUrl,
          size: file.metadata?.size || 0,
          contentType: file.metadata?.mimetype || "image/jpeg",
          createdAt: file.created_at,
          isPrimary: false, // Will be updated from court.primary_image_url
        };
      }),
    );

    // Get court's primary image to mark primary
    const { data: courtData } = await supabase
      .from("courts")
      .select("primary_image_url")
      .eq("id", courtId)
      .single();

    // Mark primary image
    if (courtData?.primary_image_url) {
      const primaryImage = images.find(
        (img) => img.url === courtData.primary_image_url,
      );
      if (primaryImage) {
        primaryImage.isPrimary = true;
      }
    }

    return createSuccessResponse({
      courtId,
      venueId: court.venue_id,
      images,
      primaryImage: courtData?.primary_image_url || null,
    });
  } catch (error) {
    // Karena `courtId` tidak lagi dijangkau di sini, kita berikan pesan error yang lebih umum.
    // Ini lebih aman dan tidak akan menyebabkan error runtime.
    return handleApiError(error, "courts/[id]/images");
  }
}
