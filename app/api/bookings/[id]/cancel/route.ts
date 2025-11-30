import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { getBookingDetail } from "@/lib/services/booking.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // Get booking detail to check if can be cancelled
    const bookingDetail = await getBookingDetail(bookingId, profile.id);

    if (!bookingDetail) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    // Check if booking can be cancelled
    const now = new Date();
    const startTime = new Date(bookingDetail.start_time);
    const timeDiff = startTime.getTime() - now.getTime();
    const hoursUntilBooking = timeDiff / (1000 * 60 * 60);

    // Cannot cancel if booking is in less than 2 hours or already started
    if (hoursUntilBooking < 2) {
      return NextResponse.json(
        {
          error: "Cannot cancel booking",
          message: "Bookings can only be cancelled at least 2 hours before the start time",
        },
        { status: 400 }
      );
    }

    // Cannot cancel if already checked in, completed, or cancelled
    if (["checked_in", "completed", "cancelled"].includes(bookingDetail.status)) {
      return NextResponse.json(
        {
          error: "Cannot cancel booking",
          message: `Cannot cancel booking with status: ${bookingDetail.status}`,
        },
        { status: 400 }
      );
    }

    // Update booking status to cancelled
    const result = await updateBookingStatus(bookingId, profile.id, {
      status: "cancelled",
      payment_status: "cancelled",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to cancel booking",
          message: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking_id: bookingId,
        status: "cancelled",
        payment_status: "cancelled",
        refund_info: "Refund policy applies according to payment provider terms",
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}