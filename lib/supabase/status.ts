// @/lib/supabase/status.ts

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

export function normalizeBookingStatus(status: string): BookingStatus {
  switch (status) {
    case "pending":
    case "confirmed":
    case "checked_in":
    case "completed":
    case "cancelled":
    case "refunded":
      return status as BookingStatus;
    default:
      return "pending";
  }
}

export function normalizePaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "pending":
    case "processing":
    case "completed":
    case "failed":
    case "cancelled":
    case "refunded":
      return status as PaymentStatus;
    default:
      return "pending";
  }
}
