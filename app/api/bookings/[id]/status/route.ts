import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { getBookingDetail, updateBookingStatus } from "@/lib/services/booking.service";
import * as bookingService from "@/lib/services/booking.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    const profile = await getAuthenticatedProfile();
    const body = await request.json();
    const { status } = body;

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    // Validate status
    const allowedStatuses = ["confirmed", "checked_in"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status",
          allowed_statuses: allowedStatuses,
        },
        { status: 400 }
      );
    }

    // Get booking detail to validate status transitions
    const bookingDetail = await getBookingDetail(bookingId, profile.id);

    if (!bookingDetail) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    // Validate status transitions
    const now = new Date();
    const startTime = new Date(bookingDetail.start_time);
    const endTime = new Date(bookingDetail.end_time);

    if (status === "confirmed") {
      // Can only confirm pending bookings that are paid
      if (bookingDetail.status !== "pending") {
        return NextResponse.json(
          {
            error: "Cannot confirm booking",
            message: "Only pending bookings can be confirmed",
          },
          { status: 400 }
        );
      }

      if (bookingDetail.payment_status !== "paid") {
        return NextResponse.json(
          {
            error: "Cannot confirm booking",
            message: "Booking must be paid before confirmation",
          },
          { status: 400 }
        );
      }
    }

    if (status === "checked_in") {
      // Can only check in confirmed bookings
      if (bookingDetail.status !== "confirmed") {
        return NextResponse.json(
          {
            error: "Cannot check in",
            message: "Only confirmed bookings can be checked in",
          },
          { status: 400 }
        );
      }

      // Can only check in within 1 hour of start time and before end time
      const timeDiff = Math.abs(startTime.getTime() - now.getTime());
      const hoursUntilStart = timeDiff / (1000 * 60 * 60);

      if (now < startTime && hoursUntilStart > 1) {
        return NextResponse.json(
          {
            error: "Cannot check in yet",
            message: "You can only check in within 1 hour of the start time",
          },
          { status: 400 }
        );
      }

      if (now > endTime) {
        return NextResponse.json(
          {
            error: "Cannot check in",
            message: "Cannot check in after the booking end time",
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      status,
    };

    if (status === "checked_in") {
      updateData.checked_in_at = new Date().toISOString();
    }

    // Update booking status using service
    const result = await bookingService.updateBookingStatus(bookingId, profile.id, updateData);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Failed to update booking status",
          message: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: {
        booking_id: bookingId,
        status,
        checked_in_at: status === "checked_in" ? updateData.checked_in_at : null,
      },
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      {
        error: "Failed to update booking status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}