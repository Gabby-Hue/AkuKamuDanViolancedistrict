// @/lib/supabase/status.ts

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "waiting_confirmation"
  | "paid"
  | "expired"
  | "cancelled";

export function normalizeBookingStatus(status: string): BookingStatus {
  switch (status) {
    case "pending":
    case "confirmed":
    case "checked_in":
    case "completed":
    case "cancelled":
      return status as BookingStatus;
    default:
      return "pending";
  }
}

export function normalizePaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "pending":
    case "waiting_confirmation":
    case "paid":
    case "expired":
    case "cancelled":
      return status as PaymentStatus;
    default:
      return "pending";
  }
}
