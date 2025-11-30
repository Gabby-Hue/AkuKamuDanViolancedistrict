import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMidtransTransactionStatus } from "@/lib/payments/midtrans";

// Background job to cancel expired bookings
// This can be called by cron job every 30 minutes
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    console.log("Starting expired bookings cleanup job");

    // Get all pending bookings with payment tokens that are expired
    const expiredTime = new Date();
    expiredTime.setMinutes(expiredTime.getMinutes() - 30); // 30 minutes ago

    const { data: pendingBookings, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        id,
        payment_reference,
        payment_status,
        status,
        payment_expired_at,
        created_at
      `)
      .eq("status", "pending")
      .eq("payment_status", "pending")
      .lt("created_at", expiredTime.toISOString())
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Failed to fetch expired bookings:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch expired bookings" },
        { status: 500 }
      );
    }

    if (!pendingBookings || pendingBookings.length === 0) {
      console.log("No expired bookings found to process");
      return NextResponse.json({
        success: true,
        message: "No expired bookings found",
        processed: 0,
        updated: 0,
      });
    }

    console.log(`Found ${pendingBookings.length} expired bookings to process`);

    let updatedCount = 0;
    let processedCount = 0;

    // Process each expired booking
    for (const booking of pendingBookings) {
      processedCount++;

      try {
        console.log(`Processing expired booking: ${booking.id}, payment_ref: ${booking.payment_reference}`);

        // Check if payment was actually completed via Midtrans
        let actualPaymentStatus = "expired"; // Default to expired

        if (booking.payment_reference) {
          try {
            const midtransStatus = await getMidtransTransactionStatus(booking.payment_reference);

            if (midtransStatus) {
              const transactionStatus = (midtransStatus.transaction_status || "").toLowerCase();
              const fraudStatus = (midtransStatus.fraud_status || "").toLowerCase();

              console.log(`Midtrans status for booking ${booking.id}: ${transactionStatus}, fraud: ${fraudStatus}`);

              // Map to actual status
              switch (transactionStatus) {
                case "settlement":
                case "capture":
                  if (fraudStatus === "challenge") {
                    actualPaymentStatus = "waiting_confirmation";
                  } else {
                    actualPaymentStatus = "paid";
                  }
                  break;
                case "pending":
                  actualPaymentStatus = "pending";
                  break;
                case "authorize":
                  actualPaymentStatus = "waiting_confirmation";
                  break;
                default:
                  actualPaymentStatus = "expired"; // cancel, deny, failure, etc.
              }
            } else {
              console.log(`Could not check Midtrans status for booking ${booking.id}`);
            }
          } catch (midtransError) {
            console.error(`Error checking Midtrans status for booking ${booking.id}:`, midtransError);
          }
        }

        // Update booking status
        const updateData: any = {
          updated_at: new Date().toISOString(),
        };

        if (actualPaymentStatus === "paid") {
          // Payment was actually completed!
          updateData.payment_status = actualPaymentStatus;
          updateData.status = "confirmed";
          updateData.payment_completed_at = new Date().toISOString();

          console.log(`✅ Booking ${booking.id} was actually paid - updating to confirmed/paid`);
        } else {
          // Cancel the expired booking
          updateData.payment_status = "cancelled";
          updateData.status = "cancelled";

          console.log(`❌ Booking ${booking.id} expired - updating to cancelled/cancelled`);
        }

        const { error: updateError } = await supabase
          .from("bookings")
          .update(updateData)
          .eq("id", booking.id);

        if (updateError) {
          console.error(`Failed to update booking ${booking.id}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Successfully updated booking ${booking.id} to ${actualPaymentStatus}/${updateData.status}`);
        }

      } catch (bookingError) {
        console.error(`Error processing booking ${booking.id}:`, bookingError);
      }
    }

    console.log(`Expired bookings cleanup completed. Processed: ${processedCount}, Updated: ${updatedCount}`);

    return NextResponse.json({
      success: true,
      message: "Expired bookings cleanup completed",
      processed: processedCount,
      updated: updatedCount,
      run_time: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error in expired bookings cleanup job:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Also allow GET for manual testing
export async function GET() {
  return POST(new Request("http://localhost", { method: "POST" }));
}