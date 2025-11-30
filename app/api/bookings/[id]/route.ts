import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { getBookingDetail } from "@/lib/services/booking.service";

export async function GET(
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

    const bookingDetail = await getBookingDetail(bookingId, profile.id);

    if (!bookingDetail) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bookingDetail,
    });
  } catch (error) {
    console.error("Error fetching booking detail:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch booking detail",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}