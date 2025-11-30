import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

// Midtrans webhook types
type MidtransWebhookPayload = {
  transaction_time?: string;
  transaction_status?: string;
  transaction_id?: string;
  status_message?: string;
  status_code?: string;
  signature_key?: string;
  payment_type?: string;
  order_id?: string;
  merchant_id?: string;
  gross_amount?: string;
  fraud_status?: string;
  approval_code?: string;
  payment_code?: string;
  store?: string;
  settlement_time?: string;
  maskked_card?: string;
  bank?: string;
  card_type?: string;
  eci?: string;
  channel?: string;
  point_of_initiation?: string;
  bca_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  permata_va_number?: string;
  va_number?: string;
  pdf_url?: string;
  finish_redirect_url?: string;
  continue_redirect_url?: string;
};

function verifyWebhookSignature(
  payload: MidtransWebhookPayload,
  signature: string | null,
  serverKey: string
): boolean {
  if (!signature || !payload.order_id || !payload.status_code || !payload.gross_amount) {
    console.error("Missing required fields for signature verification");
    return false;
  }

  // Create the expected signature
  const expectedSignature = crypto
    .createHash("sha512")
    .update(
      `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`
    )
    .digest("hex");

  const isValid = signature === expectedSignature;

  if (!isValid) {
    console.error("Webhook signature verification failed", {
      received: signature,
      expected: expectedSignature,
      orderId: payload.order_id,
    });
  }

  return isValid;
}

function mapMidtransStatusToBooking(
  transactionStatus: string,
  fraudStatus?: string
): { payment_status: string; booking_status: string } | null {
  const status = transactionStatus.toLowerCase();

  switch (status) {
    case "settlement":
      return { payment_status: "paid", booking_status: "confirmed" };

    case "capture":
      if (fraudStatus === "challenge") {
        return { payment_status: "waiting_confirmation", booking_status: "pending" };
      }
      return { payment_status: "paid", booking_status: "confirmed" };

    case "authorize":
      return { payment_status: "waiting_confirmation", booking_status: "pending" };

    case "pending":
      return { payment_status: "pending", booking_status: "pending" };

    case "expire":
    case "expired":
      return { payment_status: "cancelled", booking_status: "cancelled" };

    case "deny":
    case "cancel":
    case "failure":
      return { payment_status: "cancelled", booking_status: "cancelled" };

    case "refund":
    case "partial_refund":
    case "chargeback":
    case "partial_chargeback":
      return { payment_status: "refunded", booking_status: "cancelled" };

    default:
      console.warn("Unknown Midtrans transaction status:", status);
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the raw body for signature verification
    const rawBody = await request.text();
    let payload: MidtransWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error("Invalid JSON payload:", error);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Get environment variables
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("MIDTRANS_SERVER_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const signature = request.headers.get("x-callback-signature");
    if (!verifyWebhookSignature(payload, signature, serverKey)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Extract required fields
    const { order_id, transaction_status, fraud_status, payment_type, transaction_time } = payload;

    if (!order_id) {
      return NextResponse.json(
        { error: "Missing order_id" },
        { status: 400 }
      );
    }

    console.log("Processing Midtrans webhook:", {
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
    });

    // Map Midtrans status to application status
    const statusMapping = mapMidtransStatusToBooking(
      transaction_status || "",
      fraud_status
    );

    if (!statusMapping) {
      console.warn("Unable to map Midtrans status:", transaction_status);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ status: "ok" });
    }

    // Find booking by payment_reference (order_id)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_reference", order_id)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error("Booking not found for order_id:", order_id);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ status: "ok" });
    }

    // Update booking status
    const updateData: any = {
      payment_status: statusMapping.payment_status,
      status: statusMapping.booking_status,
      updated_at: new Date().toISOString(),
    };

    // Add payment completed timestamp if payment is successful
    if (statusMapping.payment_status === "paid") {
      updateData.payment_completed_at = transaction_time
        ? new Date(transaction_time).toISOString()
        : new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      // Don't expose internal error but log it
      return NextResponse.json({ status: "ok" });
    }

    console.log("Booking updated successfully:", {
      bookingId: booking.id,
      payment_reference: order_id,
      old_status: booking.status,
      old_payment_status: booking.payment_status,
      new_booking_status: statusMapping.booking_status,
      new_payment_status: statusMapping.payment_status,
    });

    return NextResponse.json({
      status: "ok",
      message: "Booking updated successfully"
    });

  } catch (error) {
    console.error("Unexpected error in Midtrans webhook:", error);

    // Always return 200 to prevent Midtrans from retrying
    // which could cause duplicate processing
    return NextResponse.json({ status: "ok" });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}