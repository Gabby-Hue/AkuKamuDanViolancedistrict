import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import type { PaymentStatus, BookingStatus } from "@/lib/supabase/status";
import {
  getMidtransTransactionStatus,
  mapMidtransStatusToBooking,
} from "@/lib/payments/midtrans";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const bookingId = (await params).id;
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 },
      );
    }

    const supabase = await createClient();

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        payment_reference,
        payment_status,
        status,
        payment_token,
        payment_completed_at,
        created_at,
        updated_at
      `,
      )
      .eq("id", bookingId)
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or access denied" },
        { status: 404 },
      );
    }

    // Check Midtrans status if we have a payment reference
    if (booking.payment_reference) {
      try {
        const midtransStatus = await getMidtransTransactionStatus(
          booking.payment_reference,
        );

        if (midtransStatus) {
          console.log("Midtrans status retrieved:");

          // Map Midtrans status to application status
          const transactionStatus = (
            midtransStatus.transaction_status || ""
          ).toLowerCase();
          const fraudStatus = (midtransStatus.fraud_status || "").toLowerCase();

          let statusMapping = null;
          switch (transactionStatus) {
            case "settlement":
              statusMapping = {
                payment_status: "paid" as PaymentStatus,
                booking_status: "pending" as BookingStatus,
              };
              break;
            case "capture":
              if (fraudStatus === "challenge") {
                statusMapping = {
                  payment_status: "waiting_confirmation" as PaymentStatus,
                  booking_status: "pending" as BookingStatus,
                };
              } else {
                statusMapping = {
                  payment_status: "paid" as PaymentStatus,
                  booking_status: "pending" as BookingStatus,
                };
              }
              break;
            case "authorize":
              statusMapping = {
                payment_status: "waiting_confirmation" as PaymentStatus,
                booking_status: "pending" as BookingStatus,
              };
              break;
            case "pending":
              statusMapping = {
                payment_status: "pending" as PaymentStatus,
                booking_status: "pending" as BookingStatus,
              };
              break;
            case "expire":
            case "expired":
              statusMapping = {
                payment_status: "cancelled" as PaymentStatus,
                booking_status: "cancelled" as BookingStatus,
              };
              break;
            case "deny":
            case "cancel":
            case "failure":
              statusMapping = {
                payment_status: "cancelled" as PaymentStatus,
                booking_status: "cancelled" as BookingStatus,
              };
              break;
            case "refund":
            case "partial_refund":
            case "chargeback":
            case "partial_chargeback":
              statusMapping = {
                payment_status: "expired" as PaymentStatus,
                booking_status: "cancelled" as BookingStatus,
              };
              break;
            default:
              statusMapping = null;
          }

          if (statusMapping) {
            // Check if status needs to be updated
            const needsUpdate =
              statusMapping.payment_status !== booking.payment_status ||
              statusMapping.booking_status !== booking.status;

            if (needsUpdate) {
              console.log("Status update needed:", {
                old_payment_status: booking.payment_status,
                old_booking_status: booking.status,
              });

              const updateData: any = {
                payment_status: statusMapping.payment_status,
                status: statusMapping.booking_status,
                updated_at: new Date().toISOString(),
              };

              // Add payment completion timestamp if payment is successful
              if (
                statusMapping.payment_status === "paid" &&
                !booking.payment_completed_at
              ) {
                updateData.payment_completed_at = new Date().toISOString();
              }

              // Update the booking
              const { error: updateError } = await supabase
                .from("bookings")
                .update(updateData)
                .eq("id", bookingId);

              if (updateError) {
                console.error("Failed to update booking status:", updateError);
                return NextResponse.json(
                  {
                    error: "Failed to update booking status",
                    midtrans_status: midtransStatus,
                    current_booking: booking,
                  },
                  { status: 500 },
                );
              }

              console.log("Booking status updated successfully:", updateData);

              // Return updated booking data
              const { data: updatedBooking } = await supabase
                .from("bookings")
                .select(
                  `
                  id,
                  payment_reference,
                  payment_status,
                  status,
                  payment_completed_at,
                  updated_at
                `,
                )
                .eq("id", bookingId)
                .single();

              return NextResponse.json({
                success: true,
                message: "Payment status retrieved and booking updated",
                midtrans_status: midtransStatus,
                status_mapping: statusMapping,
                booking: updatedBooking,
                status_updated: true,
              });
            }
          }

          return NextResponse.json({
            success: true,
            message: "Payment status retrieved",
            midtrans_status: midtransStatus,
            status_mapping: statusMapping,
            booking: booking,
            status_updated: false, // No update needed
          });
        } else {
          console.warn(
            "Could not retrieve Midtrans status for:",
            booking.payment_reference,
          );

          return NextResponse.json({
            success: false,
            message: "Could not retrieve payment status from Midtrans",
            booking: booking,
            midtrans_status: null,
          });
        }
      } catch (error) {
        console.error("Error checking Midtrans status:", error);

        return NextResponse.json({
          success: false,
          error: "Failed to check payment status",
          message: error instanceof Error ? error.message : "Unknown error",
          booking: booking,
        });
      }
    } else {
      // No payment reference - might be a manual booking or cash payment
      return NextResponse.json({
        success: true,
        message: "No payment reference found - might be manual booking",
        booking: booking,
        midtrans_status: null,
      });
    }
  } catch (error) {
    console.error("Error in payment status check:", error);
    return NextResponse.json(
      {
        error: "Failed to check payment status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
