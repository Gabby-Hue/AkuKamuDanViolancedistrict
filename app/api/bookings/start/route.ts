import { NextResponse } from "next/server";
import { createMidtransTransaction } from "@/lib/payments/midtrans";
import { createClient } from "@/lib/supabase/server";

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Silakan login untuk melakukan booking." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    courtId?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    notes?: unknown;
  };

  const courtId = typeof body.courtId === "string" ? body.courtId : null;

  if (!courtId) {
    return NextResponse.json(
      { error: "ID lapangan tidak ditemukan." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("id, slug, name, price_per_hour, venue:venues(name, city)")
    .eq("id", courtId)
    .maybeSingle();

  if (courtError || !court) {
    return NextResponse.json(
      { error: "Lapangan tidak ditemukan." },
      { status: 404 },
    );
  }

  const startDate = parseIsoDate(body.startTime);
  const endDate = parseIsoDate(body.endTime);

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Jadwal booking tidak valid." },
      { status: 400 },
    );
  }

  const now = new Date();
  const maxBookingDate = new Date(now);
  maxBookingDate.setMonth(maxBookingDate.getMonth() + 3);
  const maxBookingDeadline = new Date(maxBookingDate);
  maxBookingDeadline.setHours(23, 59, 59, 999);

  if (startDate.getTime() < now.getTime()) {
    return NextResponse.json(
      { error: "Tanggal booking sudah lewat. Pilih jadwal lain." },
      { status: 400 },
    );
  }

  if (startDate.getTime() > maxBookingDeadline.getTime()) {
    return NextResponse.json(
      { error: "Booking hanya dapat dijadwalkan maksimal 3 bulan ke depan." },
      { status: 400 },
    );
  }

  if (endDate.getTime() <= startDate.getTime()) {
    return NextResponse.json(
      { error: "Waktu selesai harus setelah waktu mulai." },
      { status: 400 },
    );
  }

  if (endDate.getTime() > maxBookingDeadline.getTime()) {
    return NextResponse.json(
      { error: "Durasi booking melebihi batas jadwal yang diizinkan." },
      { status: 400 },
    );
  }

  const durationHours = Math.max(
    1,
    (endDate.getTime() - startDate.getTime()) / 3_600_000,
  );
  const pricePerHour = Number(court.price_per_hour ?? 0);
  const totalPrice = Math.ceil(pricePerHour * durationHours);

  if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
    return NextResponse.json(
      { error: "Harga lapangan belum dikonfigurasi." },
      { status: 400 },
    );
  }

  const notes =
    typeof body.notes === "string" && body.notes.trim()
      ? body.notes.trim()
      : null;
  const paymentReference = `BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      court_id: court.id,
      profile_id: user.id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: "pending",
      payment_status: "pending",
      payment_reference: paymentReference,
      price_total: totalPrice,
      notes,
    })
    .select("id")
    .maybeSingle();

  if (bookingError || !booking) {
    console.error("Failed to create booking", bookingError?.message);
    return NextResponse.json(
      { error: "Tidak dapat membuat data booking." },
      { status: 500 },
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const successRedirectUrl = `${origin}/dashboard/user/bookings/${booking.id}`;

  try {
    const paymentResult = await createMidtransTransaction({
      orderId: paymentReference,
      amount: totalPrice,
      courtName: court.name,
      successRedirectUrl,
      customer: {
        firstName:
          profile?.full_name ?? user.email?.split("@")[0] ?? "CourtEase User",
        email: user.email ?? null,
      },
    });

    const paymentData = {
      token: paymentResult.token,
      redirect_url: paymentResult.redirect_url ?? undefined,
    } as const;

    const paymentExpiresAt = new Date(
      Date.now() + 3 * 60 * 60 * 1000,
    ).toISOString();

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        payment_token: paymentData.token,
        payment_redirect_url: paymentData.redirect_url ?? null,
        payment_expired_at: paymentExpiresAt,
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Failed to store payment metadata", updateError.message);
    }

    return NextResponse.json(
      {
        data: {
          bookingId: booking.id,
          payment: {
            token: paymentData.token,
            redirectUrl: paymentData.redirect_url ?? null,
            expiresAt: paymentExpiresAt,
          },
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to start payment", error);

    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: "cancelled",
      })
      .eq("id", booking.id);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Tidak dapat menginisiasi pembayaran Midtrans.",
      },
      { status: 502 },
    );
  }
}
