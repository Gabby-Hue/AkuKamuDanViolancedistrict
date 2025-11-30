import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    const body = await request.json();

    console.log("Manual update request for booking:", bookingId);
    console.log("Update data:", body);

    const supabase = await createClient();

    // First, check current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching current booking:", fetchError);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch current booking",
        details: fetchError
      }, { status: 500 });
    }

    if (!currentBooking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      }, { status: 404 });
    }

    console.log("Current booking status:", {
      payment_status: currentBooking.payment_status,
      booking_status: currentBooking.status,
      updated_at: currentBooking.updated_at
    });

    // Perform update with explicit data
    const updateData = {
      payment_status: body.payment_status || "paid",
      status: body.status || "confirmed",
      updated_at: new Date().toISOString()
    };

    // Add payment completed timestamp if payment is paid
    if (body.payment_status === "paid" && !currentBooking.payment_completed_at) {
      updateData.payment_completed_at = new Date().toISOString();
    }

    console.log("Executing update with data:", updateData);

    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId)
      .select()
      .single();

    if (updateError) {
      console.error("Update failed:", updateError);
      return NextResponse.json({
        success: false,
        error: "Failed to update booking",
        details: updateError,
        current_booking: currentBooking,
        attempted_update: updateData
      }, { status: 500 });
    }

    console.log("Update successful:", updatedBooking);

    // Verify the update
    const { data: verifyBooking, error: verifyError } = await supabase
      .from("bookings")
      .select("payment_status, status, updated_at, payment_completed_at")
      .eq("id", bookingId)
      .single();

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      current_booking: currentBooking,
      updated_booking: updatedBooking,
      verification: verifyBooking,
      verify_error: verifyError
    });

  } catch (error) {
    console.error("Error in manual update:", error);
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}