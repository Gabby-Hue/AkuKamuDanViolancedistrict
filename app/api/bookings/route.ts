import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { getUserBookings, createBooking } from "@/lib/services/booking.service";

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const upcoming = searchParams.get("upcoming") === "true";
    const courtId = searchParams.get("court_id");

    const filters = {
      limit,
      offset,
      upcoming,
      courtId: courtId || undefined,
      status: status ? [status] : undefined,
    };

    const { bookings, total } = await getUserBookings(profile.id, filters);

    // Transform bookings for API response
    const transformedBookings = bookings.map((booking) => ({
      id: booking.id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      payment_status: booking.payment_status,
      payment_reference: booking.payment_reference,
      payment_redirect_url: booking.payment_redirect_url,
      payment_expires_at: booking.payment_expired_at,
      price_total: booking.price_total,
      notes: booking.notes,
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      checked_in_at: booking.checked_in_at,
      completed_at: booking.completed_at,
      court: booking.court ? {
        id: booking.court.id,
        slug: booking.court.slug,
        name: booking.court.name,
        sport: booking.court.sport,
        price_per_hour: booking.court.price_per_hour,
        venue_name: booking.court.venue_name,
        venue_city: booking.court.venue_city,
        venue_address: booking.court.venue_address,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        bookings: transformedBookings,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST endpoint untuk membuat booking baru
export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { court_id, start_time, end_time, notes } = body;

    // Validation
    if (!court_id || !start_time || !end_time) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["court_id", "start_time", "end_time"],
        },
        { status: 400 }
      );
    }

    // Create booking using service
    const result = await createBooking({
      court_id,
      profile_id: profile.id,
      start_time: new Date(start_time).toISOString(),
      end_time: new Date(end_time).toISOString(),
      notes: notes || null,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Failed to create booking",
        },
        { status: 400 }
      );
    }

    // Transform booking for API response
    const { booking } = result;
    const responseData = booking ? {
      id: booking.id,
      start_time: booking.start_time,
      end_time: booking.end_time,
      status: booking.status,
      payment_status: booking.payment_status,
      price_total: booking.price_total,
      notes: booking.notes,
      court: booking.court ? {
        id: booking.court.id,
        slug: booking.court.slug,
        name: booking.court.name,
        sport: booking.court.sport,
        price_per_hour: booking.court.price_per_hour,
        venue_name: booking.court.venue_name,
        venue_city: booking.court.venue_city,
        venue_address: booking.court.venue_address,
      } : null,
    } : null;

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Booking created successfully. Please proceed with payment.",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        error: "Failed to create booking",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}