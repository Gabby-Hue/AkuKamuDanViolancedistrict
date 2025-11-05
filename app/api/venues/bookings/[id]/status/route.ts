import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeBookingStatus } from "@/lib/supabase/status";

type Params = { params: Promise<{ id: string }> };

type RequestBody = {
  action?: unknown;
};

export async function PATCH(request: Request, { params }: Params) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Silakan login sebagai venue partner untuk mengelola booking." },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["venue_partner", "admin"].includes(profile.role)) {
    return NextResponse.json(
      { error: "Hanya venue partner yang dapat memperbarui status booking." },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "ID booking tidak valid." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const action = typeof body.action === "string" ? body.action : "";

  if (!["check_in", "complete"].includes(action)) {
    return NextResponse.json(
      { error: "Aksi tidak dikenali. Gunakan check_in atau complete." },
      { status: 400 },
    );
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `id, status, payment_status, checked_in_at, completed_at,
       court:courts(id, venue:venues(owner_profile_id))`,
    )
    .eq("id", id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Booking tidak ditemukan." },
      { status: 404 },
    );
  }

  const courtRecord = Array.isArray(booking.court)
    ? booking.court[0]
    : (booking.court ?? null);
  const venueSource = courtRecord?.venue;
  const venueRecord = Array.isArray(venueSource)
    ? venueSource[0]
    : (venueSource ?? null);

  if (profile.role !== "admin") {
    const ownerId = venueRecord?.owner_profile_id;
    if (!ownerId || ownerId !== profile.id) {
      return NextResponse.json(
        { error: "Kamu tidak memiliki akses ke booking ini." },
        { status: 403 },
      );
    }
  }

  const currentStatus = normalizeBookingStatus(booking.status);
  const now = new Date().toISOString();

  if (action === "check_in") {
    if (booking.completed_at) {
      return NextResponse.json(
        { error: "Booking sudah ditandai selesai." },
        { status: 400 },
      );
    }

    if (booking.checked_in_at) {
      return NextResponse.json({ data: { status: currentStatus } });
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        checked_in_at: now,
        status: currentStatus === "pending" ? "confirmed" : booking.status,
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Failed to update booking check-in", updateError.message);
      return NextResponse.json(
        { error: "Gagal menyimpan status kedatangan." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      data: { status: "confirmed", checked_in_at: now },
    });
  }

  if (!booking.checked_in_at) {
    return NextResponse.json(
      {
        error: "Validasi kedatangan terlebih dahulu sebelum menandai selesai.",
      },
      { status: 400 },
    );
  }

  if (booking.completed_at) {
    return NextResponse.json({ data: { status: "completed" } });
  }

  const { error: completeError } = await supabase
    .from("bookings")
    .update({ completed_at: now, status: "completed" })
    .eq("id", booking.id);

  if (completeError) {
    console.error("Failed to complete booking", completeError.message);
    return NextResponse.json(
      { error: "Gagal menandai booking selesai." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: { status: "completed", completed_at: now },
  });
}
