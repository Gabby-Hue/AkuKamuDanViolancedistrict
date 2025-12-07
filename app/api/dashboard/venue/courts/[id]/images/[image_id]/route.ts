import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateAuth, ApiError, createSuccessResponse, handleApiError } from "@/lib/api/utils";

// DELETE /api/dashboard/venue/courts/[id]/images/[image_id] - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; image_id: string }> }
) {
  let courtId: string = "unknown";
  let imageId: string = "unknown";
  try {
    const { id: courtIdParam, image_id: imageIdParam } = await params;
    courtId = courtIdParam;
    imageId = imageIdParam;
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
      throw new ApiError(403, "Akses ditolak. Hanya venue partner yang diizinkan.", "FORBIDDEN");
    }

    // Verify court ownership
    const { data: court, error: courtError } = await supabase
      .from("courts")
      .select(`
        venue_id,
        venues!inner(owner_profile_id)
      `)
      .eq("id", courtId)
      .eq("venues.owner_profile_id", user.id)
      .single();

    if (courtError || !court) {
      throw new ApiError(404, "Lapangan tidak ditemukan", "COURT_NOT_FOUND");
    }

    // Decode imageId to get file path (assuming imageId contains the full path or filename)
    let filePath: string;

    // If imageId contains the full path (from storage list)
    if (imageId.includes('/')) {
      filePath = imageId;
    } else {
      // If imageId is just the filename, construct full path
      filePath = `${court.venue_id}/${courtId}/${imageId}`;
    }

    // Get current court data to check if this is primary image
    const { data: courtData } = await supabase
      .from("courts")
      .select("primary_image_url")
      .eq("id", courtId)
      .single();

    // Get public URL before deletion for comparison
    const { data: urlData } = supabase.storage
      .from("court-images")
      .getPublicUrl(filePath);

    const isPrimaryImage = courtData?.primary_image_url === urlData.publicUrl;

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("court-images")
      .remove([filePath]);

    if (deleteError) {
      console.error("Storage delete error:", deleteError);
      throw new ApiError(500, "Gagal menghapus gambar dari storage", "STORAGE_DELETE_FAILED");
    }

    // Update court table if this was primary image
    if (isPrimaryImage) {
      // Try to get remaining images and set first one as primary, or null if no images left
      const { data: remainingFiles } = await supabase.storage
        .from("court-images")
        .list(`${court.venue_id}/${courtId}`, {
          limit: 1,
          offset: 0
        });

      let newPrimaryUrl = null;
      if (remainingFiles && remainingFiles.length > 0) {
        const { data: newPrimaryUrlData } = supabase.storage
          .from("court-images")
          .getPublicUrl(`${court.venue_id}/${courtId}/${remainingFiles[0].name}`);
        newPrimaryUrl = newPrimaryUrlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("courts")
        .update({ primary_image_url: newPrimaryUrl })
        .eq("id", courtId);

      if (updateError) {
        console.error("Update court error:", updateError);
        throw new ApiError(500, "Gagal memperbarui gambar utama lapangan", "UPDATE_PRIMARY_FAILED");
      }
    }

    return createSuccessResponse({
      message: "Gambar berhasil dihapus" + (isPrimaryImage ? " (gambar utama diperbarui)" : ""),
      wasPrimary: isPrimaryImage,
      newPrimaryUrl: isPrimaryImage ? null : courtData?.primary_image_url
    });

  } catch (error) {
    return handleApiError(error, `courts/${courtId}/images/${imageId}`);
  }
}

// PATCH /api/dashboard/venue/courts/[id]/images/[image_id] - Set as primary image
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; image_id: string }> }
) {
  let courtId: string = "unknown";
  let imageId: string = "unknown";
  try {
    const { id: courtIdParam, image_id: imageIdParam } = await params;
    courtId = courtIdParam;
    imageId = imageIdParam;
    const body = await request.json();
    const { isPrimary } = body;

    if (typeof isPrimary !== "boolean") {
      throw new ApiError(400, "isPrimary harus berupa boolean", "INVALID_PRIMARY_STATUS");
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
      throw new ApiError(403, "Akses ditolak. Hanya venue partner yang diizinkan.", "FORBIDDEN");
    }

    // Verify court ownership
    const { data: court, error: courtError } = await supabase
      .from("courts")
      .select(`
        venue_id,
        venues!inner(owner_profile_id)
      `)
      .eq("id", courtId)
      .eq("venues.owner_profile_id", user.id)
      .single();

    if (courtError || !court) {
      throw new ApiError(404, "Lapangan tidak ditemukan", "COURT_NOT_FOUND");
    }

    if (!isPrimary) {
      throw new ApiError(400, "Hanya bisa mengatur gambar sebagai primary (true)", "INVALID_OPERATION");
    }

    // Construct file path
    let filePath: string;
    if (imageId.includes('/')) {
      filePath = imageId;
    } else {
      filePath = `${court.venue_id}/${courtId}/${imageId}`;
    }

    // Get public URL for the image
    const { data: urlData } = supabase.storage
      .from("court-images")
      .getPublicUrl(filePath);

    // Update court with new primary image
    const { error: updateError } = await supabase
      .from("courts")
      .update({ primary_image_url: urlData.publicUrl })
      .eq("id", courtId);

    if (updateError) {
      console.error("Update primary image error:", updateError);
      throw new ApiError(500, "Gagal mengatur gambar sebagai utama", "UPDATE_PRIMARY_FAILED");
    }

    return createSuccessResponse({
      message: "Gambar berhasil diatur sebagai gambar utama",
      primaryImageUrl: urlData.publicUrl
    });

  } catch (error) {
    return handleApiError(error, `courts/${courtId}/images/${imageId}`);
  }
}