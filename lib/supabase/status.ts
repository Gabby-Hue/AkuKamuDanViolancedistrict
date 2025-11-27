export const BOOKING_STATUS_VALUES = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUS_VALUES)[number];

export function isBookingStatus(value: unknown): value is BookingStatus {
  return BOOKING_STATUS_VALUES.includes(value as BookingStatus);
}

export function normalizeBookingStatus(value: unknown): BookingStatus {
  return isBookingStatus(value) ? value : "pending";
}

export const PAYMENT_STATUS_VALUES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

export function isPaymentStatus(value: unknown): value is PaymentStatus {
  return PAYMENT_STATUS_VALUES.includes(value as PaymentStatus);
}

export function normalizePaymentStatus(value: unknown): PaymentStatus {
  return isPaymentStatus(value) ? value : "pending";
}
