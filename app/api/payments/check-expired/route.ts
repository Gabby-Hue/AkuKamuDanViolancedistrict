import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  getMidtransTransactionStatus,
  mapMidtransStatusToBooking,
} from "@/lib/payments/midtrans";
import {
  createSuccessResponse,
  createErrorResponse,
  handleApiError,
} from "@/lib/api/utils";

export async function POST() {
  try {
    const supabase = await createClient();

    // Find all pending bookings with expired payment times
    const now = new Date().toISOString();

    const { data: expiredBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, payment_reference, payment_status, status")
      .eq("payment_status", "pending")
      .lt("payment_expired_at", now)
      .is("payment_reference", "not.null");

    if (fetchError) {
      console.error("Error fetching expired bookings:", fetchError);
      throw new Error("Gagal mengambil data booking yang kadaluarsa");
    }

    const updatedBookings = [];

    // Check each expired booking with Midtrans
    for (const booking of expiredBookings || []) {
      if (!booking.payment_reference) continue;

      try {
        // Check actual status with Midtrans
        const midtransStatus = await getMidtransTransactionStatus(
          booking.payment_reference
        );

        if (midtransStatus) {
          // Update based on Midtrans status
          const mappedStatus = mapMidtransStatusToBooking(midtransStatus);

          if (mappedStatus) {
            const { error: updateError } = await supabase
              .from("bookings")
              .update({
                payment_status: mappedStatus.paymentStatus,
                status: mappedStatus.bookingStatus,
                updated_at: new Date().toISOString(),
              })
              .eq("id", booking.id);

            if (!updateError) {
              updatedBookings.push({
                id: booking.id,
                paymentReference: booking.payment_reference,
                previousStatus: booking.payment_status,
                newStatus: mappedStatus.paymentStatus,
                bookingStatus: mappedStatus.bookingStatus,
                source: "midtrans",
              });
            }
          }
        } else {
          // If we can't check with Midtrans, mark as cancelled locally
          const { error: updateError } = await supabase
            .from("bookings")
            .update({
              payment_status: "cancelled",
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", booking.id);

          if (!updateError) {
            updatedBookings.push({
              id: booking.id,
              paymentReference: booking.payment_reference,
              previousStatus: booking.payment_status,
              newStatus: "cancelled",
              bookingStatus: "cancelled",
              source: "local",
            });
          }
        }
      } catch (error) {
        console.error(
          `Error checking booking ${booking.id} with Midtrans:`,
          error
        );
        // Fallback: mark as cancelled if Midtrans check fails
        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            payment_status: "cancelled",
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", booking.id);

        if (!updateError) {
          updatedBookings.push({
            id: booking.id,
            paymentReference: booking.payment_reference,
            previousStatus: booking.payment_status,
            newStatus: "cancelled",
            bookingStatus: "cancelled",
            source: "fallback",
          });
        }
      }
    }

    return createSuccessResponse({
      checked: expiredBookings?.length || 0,
      updated: updatedBookings.length,
      bookings: updatedBookings,
    });
  } catch (error) {
    return handleApiError(error, "payments/check-expired");
  }
}

// Also allow GET for manual checking
export async function GET() {
  return POST();
}