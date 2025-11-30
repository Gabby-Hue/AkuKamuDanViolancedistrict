import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMidtransTransactionStatus } from "@/lib/payments/midtrans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const bookingId = (await params).id;
    const supabase = await createClient();

    console.log("Debug: Checking booking:", bookingId);

    // Get booking details (no authentication check for debugging)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles!bookings_profile_id_fkey (
          email,
          full_name
        ),
        courts!bookings_court_id_fkey (
          name,
          venues!courts_venue_id_fkey (
            name
          )
        )
      `)
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingError) {
      console.error("Database error:", bookingError);
      return NextResponse.json(
        { error: "Database error", details: bookingError },
        { status: 500 }
      );
    }

    if (!booking) {
      console.log("Booking not found:", bookingId);
      return NextResponse.json(
        { error: "Booking not found", bookingId },
        { status: 404 }
      );
    }

    console.log("Booking found:", {
      id: booking.id,
      payment_reference: booking.payment_reference,
      payment_status: booking.payment_status,
      booking_status: booking.status,
    });

    const result: any = {
      success: true,
      booking: {
        id: booking.id,
        payment_reference: booking.payment_reference,
        payment_status: booking.payment_status,
        booking_status: booking.status,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        completed_at: booking.completed_at,
        checked_in_at: booking.checked_in_at,
        price_total: booking.price_total,
        court: booking.courts?.name,
        venue: booking.courts?.venues?.name,
        user: booking.profiles?.full_name || booking.profiles?.email,
      },
    };

    // Check Midtrans status if we have a payment reference
    if (booking.payment_reference) {
      try {
        console.log("Checking Midtrans status for:", booking.payment_reference);
        const midtransStatus = await getMidtransTransactionStatus(
          booking.payment_reference
        );

        if (midtransStatus) {
          console.log("Midtrans status:", midtransStatus);
          result.midtrans_status = midtransStatus;

          // Map Midtrans status to application status (manual mapping for debug)
          const transactionStatus = (midtransStatus.transaction_status || "").toLowerCase();
          const fraudStatus = (midtransStatus.fraud_status || "").toLowerCase();

          let statusMapping = null;
          switch (transactionStatus) {
            case "settlement":
              statusMapping = { payment_status: "paid", booking_status: "confirmed" };
              break;
            case "capture":
              if (fraudStatus === "challenge") {
                statusMapping = { payment_status: "waiting_confirmation", booking_status: "pending" };
              } else {
                statusMapping = { payment_status: "paid", booking_status: "confirmed" };
              }
              break;
            case "authorize":
              statusMapping = { payment_status: "waiting_confirmation", booking_status: "pending" };
              break;
            case "pending":
              statusMapping = { payment_status: "pending", booking_status: "pending" };
              break;
            case "expire":
            case "expired":
              statusMapping = { payment_status: "cancelled", booking_status: "cancelled" };
              break;
            case "deny":
            case "cancel":
            case "failure":
              statusMapping = { payment_status: "cancelled", booking_status: "cancelled" };
              break;
            case "refund":
            case "partial_refund":
            case "chargeback":
            case "partial_chargeback":
              statusMapping = { payment_status: "refunded", booking_status: "cancelled" };
              break;
            default:
              statusMapping = null;
          }

          result.status_mapping = statusMapping;

          if (statusMapping) {
            // Check if status needs to be updated
            const needsUpdate =
              statusMapping.payment_status !== booking.payment_status ||
              statusMapping.booking_status !== booking.status;

            result.needs_update = needsUpdate;
            result.current_status = {
              payment_status: booking.payment_status,
              booking_status: booking.status,
            };
            result.new_status = statusMapping;

            // If update needed, perform it
            if (needsUpdate) {
              console.log("Updating booking status:", statusMapping);
              const updateData: any = {
                payment_status: statusMapping.payment_status,
                status: statusMapping.booking_status,
                updated_at: new Date().toISOString(),
              };

              // Add payment completion timestamp if payment is successful
              // Note: payment_completed_at column will be added to schema
              if (
                statusMapping.payment_status === "paid"
              ) {
                updateData.payment_completed_at = new Date().toISOString();
              }

              const { error: updateError } = await supabase
                .from("bookings")
                .update(updateData)
                .eq("id", bookingId);

              if (updateError) {
                console.error("Failed to update booking:", updateError);
                result.update_error = updateError;
              } else {
                console.log("Booking updated successfully");
                result.update_success = true;

                // Get updated booking
                const { data: updatedBooking, error: fetchError } = await supabase
                  .from("bookings")
                  .select("payment_status, status, updated_at, payment_completed_at")
                  .eq("id", bookingId)
                  .single();

                result.updated_booking = updatedBooking;
                if (fetchError) {
                  console.error("Error fetching updated booking:", fetchError);
                  result.fetch_error = fetchError;
                }
              }
            }
          }
        } else {
          console.log("Could not retrieve Midtrans status");
          result.midtrans_status = null;
          result.error = "Could not retrieve Midtrans status";
        }
      } catch (error) {
        console.error("Error checking Midtrans status:", error);
        result.midtrans_error = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.log("No payment reference found");
      result.no_payment_reference = true;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}