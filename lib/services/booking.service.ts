import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeBookingStatus,
  normalizePaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/supabase/status";

// Types yang sesuai dengan database.sql
export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'user' | 'venue_partner' | 'admin';
};

export type Court = {
  id: string;
  slug: string;
  name: string;
  sport: 'futsal' | 'basket' | 'basketball' | 'soccer' | 'volleyball' | 'badminton' | 'tennis' | 'padel';
  surface: 'vinyl' | 'rubber' | 'parquet' | 'wood' | 'synthetic' | 'cement' | 'turf' | 'grass' | 'hard_court' | 'clay' | null;
  price_per_hour: number;
  capacity: number | null;
  facilities: string[];
  description: string | null;
  venue_id: string;
  is_active: boolean;
};

export type Venue = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  facility_types: string[];
  facility_count: number | null;
  venue_status: 'inactive' | 'active' | 'suspended';
  verified_at: string | null;
};

export type Booking = {
  id: string;
  court_id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'waiting_confirmation' | 'paid' | 'expired' | 'cancelled';
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_token: string | null;
  payment_expired_at: string | null;
  price_total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  checked_in_at: string | null;
  completed_at: string | null;
};

export type BookingDetail = Booking & {
  court: Court & {
    venue: Venue;
  };
  profile: Profile | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    forum_thread_id: string | null;
  } | null;
};

export type CreateBookingData = {
  court_id: string;
  profile_id: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
};

export type UpdateBookingStatusData = {
  status: Booking['status'];
  payment_status?: Booking['payment_status'];
  notes?: string | null;
  checked_in_at?: string | null;
  completed_at?: string | null;
};

// Service method untuk get booking detail - COMPLEX business logic
export async function getBookingDetail(bookingId: string, profileId: string): Promise<BookingDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      court_id,
      profile_id,
      start_time,
      end_time,
      status,
      payment_status,
      payment_reference,
      payment_redirect_url,
      payment_token,
      payment_expired_at,
      price_total,
      notes,
      created_at,
      updated_at,
      checked_in_at,
      completed_at,
      court:courts(
        id, slug, name, sport, surface, price_per_hour, capacity,
        facilities, description, venue_id, is_active,
        venue:venues(
          id, slug, name, city, district, address, latitude, longitude,
          description, contact_phone, contact_email, facility_types,
          facility_count, venue_status, verified_at
        )
      ),
      profile:profiles(id, full_name, email, phone, role)
    `)
    .eq("id", bookingId)
    .eq("profile_id", profileId)
    .single();

  if (error) {
    console.error("Failed to fetch booking detail", error.message);
    return null;
  }

  const booking = data as any;
  if (!booking || !booking.court) {
    return null;
  }

  return {
    id: booking.id,
    court_id: booking.court_id,
    profile_id: booking.profile_id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: normalizeBookingStatus(booking.status),
    payment_status: normalizePaymentStatus(booking.payment_status),
    payment_reference: booking.payment_reference,
    payment_redirect_url: booking.payment_redirect_url,
    payment_token: booking.payment_token,
    payment_expired_at: booking.payment_expired_at,
    price_total: Number(booking.price_total),
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    checked_in_at: booking.checked_in_at,
    completed_at: booking.completed_at,
    court: {
      id: booking.court.id,
      slug: booking.court.slug,
      name: booking.court.name,
      sport: booking.court.sport,
      surface: booking.court.surface,
      price_per_hour: Number(booking.court.price_per_hour),
      capacity: booking.court.capacity,
      facilities: Array.isArray(booking.court.facilities) ? booking.court.facilities : [],
      description: booking.court.description,
      venue_id: booking.court.venue_id,
      is_active: booking.court.is_active,
      venue: booking.court.venue || null,
    },
    profile: booking.profile,
    review: null, // Can be fetched separately
  };
}

// Service method untuk get user bookings - COMPLEX aggregation
export async function getUserBookings(profileId: string, filters: {
  status?: string[];
  limit?: number;
  offset?: number;
  upcoming?: boolean;
  courtId?: string;
} = {}): Promise<{ bookings: BookingDetail[]; total: number }> {
  const supabase = await createClient();
  const { status, limit = 10, offset = 0, upcoming, courtId } = filters;

  let query = supabase
    .from("bookings")
    .select(`
      id,
      court_id,
      profile_id,
      start_time,
      end_time,
      status,
      payment_status,
      payment_reference,
      payment_redirect_url,
      payment_expired_at,
      price_total,
      notes,
      created_at,
      updated_at,
      checked_in_at,
      completed_at,
      court:courts(
        id, slug, name, sport, surface, price_per_hour, capacity,
        facilities, description, venue_id, is_active,
        venue:venues(
          id, slug, name, city, district, address, latitude, longitude,
          description, contact_phone, contact_email, facility_types,
          facility_count, venue_status, verified_at
        )
      )
    `, { count: "exact" })
    .eq("profile_id", profileId)
    .order("start_time", { ascending: !!upcoming });

  // Apply filters
  if (status && status.length > 0) {
    query = query.in("status", status);
  }
  if (courtId) {
    query = query.eq("court_id", courtId);
  }
  if (upcoming) {
    const now = new Date().toISOString();
    query = query.gte("start_time", now);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Failed to fetch user bookings", error.message);
    return { bookings: [], total: 0 };
  }

  const bookings = (data || []) as any[];

  // Process bookings with proper status normalization
  const processedBookings = bookings.map((booking) => ({
    id: booking.id,
    court_id: booking.court_id,
    profile_id: booking.profile_id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: normalizeBookingStatus(booking.status),
    payment_status: normalizePaymentStatus(booking.payment_status),
    payment_reference: booking.payment_reference,
    payment_redirect_url: booking.payment_redirect_url,
    payment_token: booking.payment_token,
    payment_expired_at: booking.payment_expired_at,
    price_total: Number(booking.price_total),
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    checked_in_at: booking.checked_in_at,
    completed_at: booking.completed_at,
    court: {
      id: booking.court.id,
      slug: booking.court.slug,
      name: booking.court.name,
      sport: booking.court.sport,
      surface: booking.court.surface,
      price_per_hour: Number(booking.court.price_per_hour),
      capacity: booking.court.capacity,
      facilities: Array.isArray(booking.court.facilities) ? booking.court.facilities : [],
      description: booking.court.description,
      venue_id: booking.court.venue_id,
      is_active: booking.court.is_active,
      venue: booking.court.venue || null,
    },
    profile: null, // Not fetched in this query
    review: null, // Not fetched in this query
  }));

  return {
    bookings: processedBookings,
    total: count || 0,
  };
}

// Service method untuk create booking - MEDIUM complexity (includes validation)
export async function createBooking(data: CreateBookingData): Promise<{ success: boolean; booking?: BookingDetail; error?: string }> {
  const supabase = await createClient();

  // Validation
  const startTime = new Date(data.start_time);
  const endTime = new Date(data.end_time);
  const now = new Date();

  if (startTime <= now) {
    return { success: false, error: "Start time must be in future" };
  }

  if (endTime <= startTime) {
    return { success: false, error: "End time must be after start time" };
  }

  // Check court exists and active
  const { data: court, error: courtError } = await supabase
    .from("courts")
    .select("price_per_hour, is_active")
    .eq("id", data.court_id)
    .single();

  if (courtError || !court) {
    return { success: false, error: "Court not found" };
  }

  if (!court.is_active) {
    return { success: false, error: "Court is not available for booking" };
  }

  // Check for time conflicts
  const { data: existingBookings, error: checkError } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", data.court_id)
    .in("status", ["pending", "confirmed", "checked_in"])
    .or(`and(start_time.lt.${data.end_time},end_time.gt.${data.start_time})`);

  if (checkError) {
    return { success: false, error: "Failed to check court availability" };
  }

  if (existingBookings && existingBookings.length > 0) {
    return { success: false, error: "Court is already booked for this time slot" };
  }

  // Calculate duration and price
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
  const price_total = duration * Number(court.price_per_hour);

  // Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      court_id: data.court_id,
      profile_id: data.profile_id,
      start_time: data.start_time,
      end_time: data.end_time,
      price_total,
      notes: data.notes || null,
      status: "pending",
      payment_status: "pending",
    })
    .select(`
      id, court_id, profile_id, start_time, end_time, status,
      payment_status, price_total, notes, created_at, updated_at,
      checked_in_at, completed_at,
      court:courts(
        id, slug, name, sport, surface, price_per_hour, capacity,
        facilities, description, venue_id, is_active,
        venue:venues(
          id, slug, name, city, district, address, latitude, longitude,
          description, contact_phone, contact_email, facility_types,
          facility_count, venue_status, verified_at
        )
      )
    `)
    .single();

  if (bookingError || !booking) {
    return { success: false, error: bookingError?.message || "Failed to create booking" };
  }

  const bookingDetail = {
    id: booking.id,
    court_id: booking.court_id,
    profile_id: booking.profile_id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: "pending" as Booking['status'],
    payment_status: "pending" as Booking['payment_status'],
    payment_reference: null,
    payment_redirect_url: null,
    payment_token: null,
    payment_expired_at: null,
    price_total: Number(booking.price_total),
    notes: booking.notes,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
    checked_in_at: booking.checked_in_at,
    completed_at: booking.completed_at,
    court: {
      id: booking.court.id,
      slug: booking.court.slug,
      name: booking.court.name,
      sport: booking.court.sport,
      surface: booking.court.surface,
      price_per_hour: Number(booking.court.price_per_hour),
      capacity: booking.court.capacity,
      facilities: Array.isArray(booking.court.facilities) ? booking.court.facilities : [],
      description: booking.court.description,
      venue_id: booking.court.venue_id,
      is_active: booking.court.is_active,
      venue: booking.court.venue || null,
    },
    profile: null,
    review: null,
  };

  return { success: true, booking: bookingDetail };
}

// Service method untuk update booking status - SIMPLE business logic
export async function updateBookingStatus(bookingId: string, profileId: string, data: UpdateBookingStatusData): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update(data)
    .eq("id", bookingId)
    .eq("profile_id", profileId);

  if (error) {
    console.error("Failed to update booking status", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Service method untuk check booking availability - SIMPLE logic
export async function checkBookingAvailability(courtId: string, startTime: string, endTime: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", courtId)
    .in("status", ["pending", "confirmed", "checked_in"])
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

  if (error) {
    console.error("Failed to check availability", error.message);
    return false;
  }

  return !data || data.length === 0;
}

// Create service object for API compatibility
export const bookingService = {
  getBookingDetail,
  getUserBookings,
  createBooking,
  updateBookingStatus,
  checkBookingAvailability,
};

// Export types
export type { CreateBookingData, UpdateBookingStatusData };