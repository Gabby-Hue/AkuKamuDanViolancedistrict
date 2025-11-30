import { createMidtransTransaction } from "@/lib/payments/midtrans";
import { createClient } from "@/lib/supabase/server";
import {
  ApiError,
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
  validateAuth,
  validateRequired,
  parseIsoDate,
  validateDateRange,
} from "@/lib/api/utils";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const user = await validateAuth(supabase);

    const body = (await request.json().catch(() => ({}))) as {
      courtId?: unknown;
      startTime?: unknown;
      endTime?: unknown;
      notes?: unknown;
    };

    const courtId = validateRequired(body.courtId, "ID lapangan");

    const [{ data: profile }, { data: court, error: courtError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("courts")
        .select("id, slug, name, price_per_hour, venue:venues(name, city)")
        .eq("id", courtId)
        .maybeSingle(),
    ]);

    if (courtError || !court) {
      throw new ApiError(404, "Lapangan tidak ditemukan.", "COURT_NOT_FOUND");
    }

    const startDate = parseIsoDate(body.startTime);
    const endDate = parseIsoDate(body.endTime);
    validateDateRange(startDate, endDate);

  const durationHours = Math.max(
      1,
      (endDate.getTime() - startDate.getTime()) / 3_600_000,
    );
    const pricePerHour = Number(court.price_per_hour ?? 0);
    const totalPrice = Math.ceil(pricePerHour * durationHours);

    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      throw new ApiError(
        400,
        "Harga lapangan belum dikonfigurasi.",
        "PRICE_NOT_CONFIGURED"
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
      throw new ApiError(500, "Tidak dapat membuat data booking.", "BOOKING_CREATION_FAILED");
    }

  const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000";

    const successRedirectUrl = `${origin}/dashboard/user/bookings/${booking.id}?check_payment=true`;

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
        Date.now() + 30 * 60 * 1000,
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

      return createSuccessResponse(
        {
          bookingId: booking.id,
          payment: {
            token: paymentData.token,
            redirectUrl: paymentData.redirect_url ?? null,
            expiresAt: paymentExpiresAt,
          },
        },
        201
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

      throw new ApiError(
        502,
        error instanceof Error
          ? error.message
          : "Tidak dapat menginisiasi pembayaran Midtrans.",
        "PAYMENT_INITIATION_FAILED"
      );
    }
  } catch (error) {
    return handleApiError(error, "booking/start");
  }
}
