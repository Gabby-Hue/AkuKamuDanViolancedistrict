import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  validateAuth,
  ApiError,
  createSuccessResponse,
  handleApiError,
} from "@/lib/api/utils";

// POST /api/dashboard/venue/courts/[id]/images/upload - Upload image to storage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Pindahkan deklarasi courtId ke dalam blok try
    const { id: courtId } = await params;

    // Validasi awal untuk memastikan courtId ada
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

    // Verify court ownership
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("image") as File;
    const isPrimary = formData.get("isPrimary") === "true";

    if (!file) {
      throw new ApiError(400, "File gambar wajib diupload", "NO_FILE");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new ApiError(
        400,
        "Tipe file tidak diizinkan. Gunakan JPG, PNG, atau WebP",
        "INVALID_FILE_TYPE",
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApiError(
        400,
        "Ukuran file terlalu besar. Maksimal 5MB",
        "FILE_TOO_LARGE",
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${timestamp}_${randomId}.${fileExtension}`;

    // Upload to Supabase Storage
    const filePath = `${court.venue_id}/${courtId}/${fileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("court-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new ApiError(500, "Gagal mengupload gambar", "UPLOAD_FAILED");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("court-images")
      .getPublicUrl(filePath);

    // Update court table with image info
    if (isPrimary) {
      // Set as primary image
      const { error: updateError } = await supabase
        .from("courts")
        .update({ primary_image_url: urlData.publicUrl })
        .eq("id", courtId);

      if (updateError) {
        console.error("Update primary image error:", updateError);
        // Don't throw error, just log it since upload was successful
      }
    }

    return createSuccessResponse({
      message: isPrimary
        ? "Gambar berhasil diupload sebagai gambar utama"
        : "Gambar berhasil diupload",
      image: {
        id: uploadData.path,
        name: fileName,
        url: urlData.publicUrl,
        size: file.size,
        contentType: file.type,
        isPrimary,
        createdAt: new Date().toISOString(),
      },
      isPrimary,
    });
  } catch (error) {
    // Perbaikan: Ganti penggunaan variabel courtId dengan string literal yang aman.
    return handleApiError(error, `courts/[id]/images/upload`);
  }
}
