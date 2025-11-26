import { createClient } from "@/lib/supabase/server";
import type {
  BookingRow,
  CourtRow,
  ProfileRow,
  VenueRow
} from "@/lib/api/types";

export type VenueBooking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  courtName: string;
  courtType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "refunded";
  paymentStatus: "pending" | "processing" | "completed" | "failed" | "cancelled" | "refunded" | "paid" | "unpaid";
  bookingDate: string;
  notes: string | null;
  checkedInAt: string | null;
  completedAt: string | null;
};

export type VenueBookingMetrics = {
  totalBookings: number;
  todayBookings: number;
  upcomingBookings: number;
  pendingBookings: number;
  todayRevenue: number;
  occupancyRate: number;
  availableHours: number;
  totalHours: number;
};

export async function getVenueBookings(
  venueId: string,
  filters?: {
    status?: string[];
    dateFrom?: string;
    dateTo?: string;
    courtId?: string;
  }
): Promise<VenueBooking[]> {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      price_total,
      notes,
      created_at,
      checked_in_at,
      completed_at,
      profile:profiles(full_name, email),
      court:courts(name, sport)
    `)
    .eq("court.venue_id", venueId)
    .order("start_time", { ascending: false });

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte("start_time", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("start_time", filters.dateTo);
  }

  if (filters?.courtId) {
    query = query.eq("court_id", filters.courtId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch venue bookings:", error);
    return [];
  }

  return (data ?? []).map((booking: any) => ({
    id: booking.id,
    customerName: booking.profile?.full_name || "Unknown",
    customerEmail: booking.profile?.email || "unknown@example.com",
    customerPhone: null, // Phone not in profiles table, would need extension
    courtName: booking.court?.name || "Unknown Court",
    courtType: booking.court?.sport || "Unknown",
    date: new Date(booking.start_time).toISOString().split('T')[0],
    startTime: new Date(booking.start_time).toTimeString().slice(0, 5),
    endTime: new Date(booking.end_time).toTimeString().slice(0, 5),
    duration: Math.round(
      (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60)
    ),
    totalPrice: Number(booking.price_total) || 0,
    status: normalizeBookingStatus(booking.status),
    paymentStatus: normalizePaymentStatus(booking.payment_status),
    bookingDate: new Date(booking.created_at).toISOString().split('T')[0],
    notes: booking.notes,
    checkedInAt: booking.checked_in_at,
    completedAt: booking.completed_at,
  }));
}

export async function getVenueBookingMetrics(
  venueId: string
): Promise<VenueBookingMetrics> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [
    totalResult,
    todayResult,
    upcomingResult,
    pendingResult,
    courtsResult
  ] = await Promise.all([
    // Total bookings
    supabase
      .from("bookings")
      .select("id")
      .eq("court.venue_id", venueId)
      .neq("status", "cancelled"),

    // Today's bookings
    supabase
      .from("bookings")
      .select("id, start_time, end_time, status, price_total")
      .eq("court.venue_id", venueId)
      .gte("start_time", today)
      .lt("start_time", tomorrowStr)
      .neq("status", "cancelled"),

    // Upcoming bookings
    supabase
      .from("bookings")
      .select("id")
      .eq("court.venue_id", venueId)
      .gte("start_time", today)
      .eq("status", "confirmed"),

    // Pending bookings
    supabase
      .from("bookings")
      .select("id")
      .eq("court.venue_id", venueId)
      .eq("status", "pending"),

    // Venue courts for operating hours calculation
    supabase
      .from("courts")
      .select("id")
      .eq("venue_id", venueId)
      .eq("is_active", true)
  ]);

  const totalBookings = (totalResult.data ?? []).length;
  const todayBookingsData = todayResult.data ?? [];
  const upcomingBookings = (upcomingResult.data ?? []).length;
  const pendingBookings = (pendingResult.data ?? []).length;
  const activeCourts = (courtsResult.data ?? []).length;

  // Calculate today's revenue (only from confirmed/completed bookings)
  const todayRevenue = todayBookingsData
    .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
    .reduce((sum, booking) => sum + Number(booking.price_total || 0), 0);

  // Calculate occupancy rate (assuming 16 operating hours per day per court)
  const totalOperatingHours = activeCourts * 16; // 16 hours per court
  const bookedHours = todayBookingsData
    .filter(booking => booking.status !== 'cancelled')
    .reduce((sum, booking) => {
      const duration = (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

  const occupancyRate = totalOperatingHours > 0 ? Math.round((bookedHours / totalOperatingHours) * 100) : 0;
  const availableHours = Math.max(0, totalOperatingHours - bookedHours);

  return {
    totalBookings,
    todayBookings: todayBookingsData.length,
    upcomingBookings,
    pendingBookings,
    todayRevenue,
    occupancyRate,
    availableHours: Math.round(availableHours),
    totalHours: totalOperatingHours,
  };
}

export async function getVenueCourts(venueId: string): Promise<Array<{
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  isActive: boolean;
}>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("id, name, sport, price_per_hour, is_active")
    .eq("venue_id", venueId)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch venue courts:", error);
    return [];
  }

  return (data ?? []).map((court: any) => ({
    id: court.id,
    name: court.name,
    sport: court.sport,
    pricePerHour: Number(court.price_per_hour) || 0,
    isActive: court.is_active ?? true,
  }));
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled",
  decisionNote?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (decisionNote) {
    updateData.notes = decisionNote;
  }

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    console.error("Failed to update booking status:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

function normalizeBookingStatus(status: string): VenueBooking['status'] {
  switch (status) {
    case "pending":
    case "confirmed":
    case "checked_in":
    case "completed":
    case "cancelled":
    case "refunded":
      return status as VenueBooking['status'];
    default:
      return "pending";
  }
}

function normalizePaymentStatus(status: string): VenueBooking['paymentStatus'] {
  switch (status) {
    case "pending":
    case "processing":
    case "completed":
    case "failed":
    case "cancelled":
    case "refunded":
      return status as VenueBooking['paymentStatus'];
    default:
      return "pending";
  }
}