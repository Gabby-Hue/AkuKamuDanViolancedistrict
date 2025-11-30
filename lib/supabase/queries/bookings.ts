// @/lib/supabase/queries/bookings.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { CourtSummary } from "./courts";
import type {
  CourtSummaryRow,
  CourtBlackoutRow,
  ProfileRow,
} from "@/lib/api/types";
import {
  normalizeBookingStatus,
  normalizePaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "../status";

export type CourtBlackout = {
  id: string;
  title: string;
  notes: string | null;
  scope: "time_range" | "full_day";
  frequency: "once" | "weekly" | "monthly" | "yearly";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_day_of_week: number | null;
};

export type BookingDetail = {
  id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_token: string | null;
  payment_expires_at: string | null;
  price_total: number;
  notes: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    forum_thread_id: string | null;
  } | null;
  court: {
    id: string;
    slug: string;
    name: string;
    sport: string;
    price_per_hour: number;
    venue_name: string | null;
    venue_city: string | null;
    venue_address: string | null;
  };
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type UserDashboardData = {
  bookings: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    payment_status: PaymentStatus;
    payment_reference: string | null;
    payment_redirect_url: string | null;
    payment_expires_at: string | null;
    price_total: number;
    court_name: string;
    court_slug: string;
    sport: string;
    venue_name: string;
    venue_city: string | null;
  }>;
  recommendedCourts: CourtSummary[];
};

export type VenueDashboardData = {
  ownedCourts: CourtSummary[];
  upcomingBookings: Array<{
    id: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    checked_in_at: string | null;
    completed_at: string | null;
    price_total: number;
    court_name: string;
    sport: string;
  }>;
  revenueTotal: number;
  venues: Array<{
    id: string;
    name: string;
    city: string | null;
    district: string | null;
    address: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    courts: Array<{
      id: string;
      name: string;
      sport: string;
      surface: string | null;
      price_per_hour: number;
      capacity: number | null;
      facilities: string[];
      description: string | null;
      is_active: boolean;
      primary_image_url: string | null;
      blackouts: CourtBlackout[];
    }>;
  }>;
};

export type VenueBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  price_total: number;
  totalPrice: number; // Alias for price_total for compatibility
  notes: string | null;
  created_at: string;
  checked_in_at: string | null;
  completed_at: string | null;
  date: string; // Extracted from start_time for easier filtering
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
  court: {
    name: string;
    sport: string;
  } | null;
};

export type VenueBookingMetrics = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  todayBookings: number;
  todayRevenue: number;
  totalRevenue: number;
  averageRating: number | null;
  availableHours: number;
  totalHours: number;
  occupancyRate: number;
};

// Tipe yang digunakan internal (tanpa diekspor)
type BookingRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  checked_in_at?: string | null;
  completed_at?: string | null;
  payment_status: string;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_expired_at: string | null;
  price_total: number | null;
  court: {
    slug?: string;
    name?: string;
    sport?: string;
    venue?: {
      id?: string | null;
      name?: string | null;
      city?: string | null;
    } | null;
  } | null;
};

type BookingDetailRow = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  payment_redirect_url: string | null;
  payment_token: string | null;
  payment_expired_at: string | null;
  price_total: number | null;
  notes: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  court: {
    id: string;
    slug: string;
    name: string;
    sport: string;
    price_per_hour: number | null;
    venue: {
      name: string | null;
      city: string | null;
      address: string | null;
    } | null;
  } | null;
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

type BookingReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  forum_thread_id: string | null;
};

type BookingStatusSource = {
  id: string;
  status: string;
  payment_status: string;
  payment_reference: string | null;
  completed_at?: string | null;
};

function shouldCheckMidtrans(paymentStatus: PaymentStatus) {
  return paymentStatus === "pending" || paymentStatus === "processing";
}

async function syncBookingPaymentStatusWithMidtrans(
  supabase: SupabaseClient,
  booking: BookingStatusSource,
): Promise<{ paymentStatus: PaymentStatus; bookingStatus: BookingStatus }> {
  const normalizedPaymentStatus = normalizePaymentStatus(
    booking.payment_status,
  );
  const normalizedBookingStatus = normalizeBookingStatus(booking.status);
  const completedAt =
    "completed_at" in booking ? (booking.completed_at ?? null) : null;
  const isCompleted =
    normalizedBookingStatus === "completed" || Boolean(completedAt);

  if (
    !booking.payment_reference ||
    !shouldCheckMidtrans(normalizedPaymentStatus)
  ) {
    return {
      paymentStatus: normalizedPaymentStatus,
      bookingStatus: normalizedBookingStatus,
    };
  }

  try {
    // Import dinamis untuk menghindari circular dependency
    const { getMidtransTransactionStatus, mapMidtransStatusToBooking } =
      await import("@/lib/payments/midtrans");

    const midtransStatus = await getMidtransTransactionStatus(
      booking.payment_reference,
    );
    const mapped = mapMidtransStatusToBooking(midtransStatus);

    if (!mapped) {
      return {
        paymentStatus: normalizedPaymentStatus,
        bookingStatus: normalizedBookingStatus,
      };
    }

    const nextPaymentStatus = mapped.paymentStatus;
    const nextBookingStatus = isCompleted ? "completed" : mapped.bookingStatus;

    if (
      nextPaymentStatus === normalizedPaymentStatus &&
      nextBookingStatus === normalizedBookingStatus
    ) {
      return {
        paymentStatus: nextPaymentStatus,
        bookingStatus: nextBookingStatus,
      };
    }

    const updateData: Record<string, unknown> = {
      payment_status: nextPaymentStatus,
    };

    if (!isCompleted) {
      updateData.status = nextBookingStatus;
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", booking.id);

    if (error) {
      console.error(
        "Failed to update booking status from Midtrans",
        error.message,
      );
    }

    return {
      paymentStatus: nextPaymentStatus,
      bookingStatus: nextBookingStatus,
    };
  } catch (error) {
    console.error("Failed to sync Midtrans payment status", error);
    return {
      paymentStatus: normalizedPaymentStatus,
      bookingStatus: normalizedBookingStatus,
    };
  }
}

export async function fetchUserBookingDetail(
  bookingId: string,
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role?: string;
  },
): Promise<BookingDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, start_time, end_time, status, payment_status, payment_reference,
       payment_redirect_url, payment_token, payment_expired_at, price_total, notes,
       checked_in_at, completed_at,
       court:courts(id, slug, name, sport, price_per_hour,
         venue:venues(name, city, address)),
       profile:profiles(id, full_name, email, phone)`,
    )
    .eq("id", bookingId)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch booking detail", error.message);
    return null;
  }

  const bookingRow = (data ?? null) as BookingDetailRow | null;

  if (!bookingRow || !bookingRow.court) {
    return null;
  }

  const synced = await syncBookingPaymentStatusWithMidtrans(supabase, {
    id: bookingRow.id,
    status: bookingRow.status,
    payment_status: bookingRow.payment_status,
    payment_reference: bookingRow.payment_reference,
    completed_at: bookingRow.completed_at ?? null,
  });

  const { data: reviewRowData } = await supabase
    .from("court_reviews")
    .select("id, rating, comment, forum_thread_id")
    .eq("booking_id", bookingRow.id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  const reviewRow = (reviewRowData ?? null) as BookingReviewRow | null;

  return {
    id: bookingRow.id,
    start_time: bookingRow.start_time,
    end_time: bookingRow.end_time,
    status: synced.bookingStatus,
    payment_status: synced.paymentStatus,
    payment_reference: bookingRow.payment_reference ?? null,
    payment_redirect_url: bookingRow.payment_redirect_url ?? null,
    payment_token: bookingRow.payment_token ?? null,
    payment_expires_at: bookingRow.payment_expired_at ?? null,
    price_total: Number(bookingRow.price_total ?? 0),
    notes: bookingRow.notes ?? null,
    checked_in_at: bookingRow.checked_in_at ?? null,
    completed_at: bookingRow.completed_at ?? null,
    review: reviewRow
      ? {
          id: reviewRow.id,
          rating: Number(reviewRow.rating ?? 0),
          comment: reviewRow.comment ?? null,
          forum_thread_id: reviewRow.forum_thread_id ?? null,
        }
      : null,
    court: {
      id: bookingRow.court.id,
      slug: bookingRow.court.slug,
      name: bookingRow.court.name,
      sport: bookingRow.court.sport,
      price_per_hour: Number(bookingRow.court.price_per_hour ?? 0),
      venue_name: bookingRow.court.venue?.name ?? null,
      venue_city: bookingRow.court.venue?.city ?? null,
      venue_address: bookingRow.court.venue?.address ?? null,
    },
    profile: bookingRow.profile
      ? {
          id: bookingRow.profile.id,
          full_name: bookingRow.profile.full_name,
          email: bookingRow.profile.email,
          phone: bookingRow.profile.phone,
        }
      : null,
  };
}

export async function fetchUserDashboardData(profile: {
  id: string;
  full_name: string | null;
  email: string | null;
  role?: string;
}): Promise<UserDashboardData> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [bookingsRes, recommendedCourtsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        `id, start_time, end_time, status, payment_status, payment_reference,
         payment_redirect_url, payment_expired_at, price_total, completed_at,
         court:courts(slug, name, sport, venue:venues(name, city))`,
      )
      .eq("profile_id", profile.id)
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true })
      .limit(5),
    supabase
      .from("court_summaries")
      .select("*")
      .order("average_rating", { ascending: false })
      .limit(3),
  ]);

  const bookingRows = (bookingsRes.data ?? []) as unknown as BookingRow[];

  const bookings = await Promise.all(
    bookingRows.map(async (booking) => {
      const synced = await syncBookingPaymentStatusWithMidtrans(supabase, {
        id: booking.id,
        status: booking.status,
        payment_status: booking.payment_status,
        payment_reference: booking.payment_reference,
        completed_at: booking.completed_at ?? null,
      });

      return {
        id: booking.id,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: synced.bookingStatus,
        payment_status: synced.paymentStatus,
        payment_reference: booking.payment_reference ?? null,
        payment_redirect_url: booking.payment_redirect_url ?? null,
        payment_expires_at: booking.payment_expired_at ?? null,
        price_total: Number(booking.price_total ?? 0),
        court_name: booking.court?.name ?? "",
        court_slug: booking.court?.slug ?? "",
        sport: booking.court?.sport ?? "",
        venue_name: booking.court?.venue?.name ?? "",
        venue_city: booking.court?.venue?.city ?? null,
      };
    }),
  );

  const recommendedCourts = (
    (recommendedCourtsRes.data ?? []) as CourtSummaryRow[]
  ).map((court) => ({
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface,
    pricePerHour: Number(court.price_per_hour ?? 0),
    capacity: court.capacity ?? null,
    facilities: Array.isArray(court.amenities) ? court.amenities : [],
    description: court.description ?? null,
    venueName: court.venue_name,
    venueCity: court.venue_city ?? null,
    venueDistrict: court.venue_district ?? null,
    venueLatitude:
      typeof court.venue_latitude === "number" ? court.venue_latitude : null,
    venueLongitude:
      typeof court.venue_longitude === "number" ? court.venue_longitude : null,
    primaryImageUrl: court.primary_image_url ?? null,
    averageRating: Number(court.average_rating ?? 0),
    reviewCount: Number(court.review_count ?? 0),
  }));

  return {
    bookings,
    recommendedCourts,
  };
}

export async function fetchVenueDashboardData(profile: {
  id: string;
  full_name: string | null;
  email: string | null;
  role?: string;
}): Promise<VenueDashboardData> {
  const supabase = await createClient();

  const venuesRes = await supabase
    .from("venues")
    .select(
      `id, name, city, district, address, latitude, longitude, contact_phone, contact_email, description,
       courts:courts(id, name, sport, surface, price_per_hour, capacity, facilities, description, is_active)`,
    )
    .eq("owner_profile_id", profile.id);

  if (venuesRes.error) {
    console.error("Failed to fetch owned venues", venuesRes.error.message);
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: [],
    };
  }

  const venues = (venuesRes.data ?? []) as any[];
  const managedVenues = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    city: venue.city ?? null,
    district: venue.district ?? null,
    address: venue.address ?? null,
    latitude: typeof venue.latitude === "number" ? venue.latitude : null,
    longitude: typeof venue.longitude === "number" ? venue.longitude : null,
    contact_phone: venue.contact_phone ?? null,
    contact_email: venue.contact_email ?? null,
    description: venue.description ?? null,
    courts: (venue.courts ?? []).map((court: any) => ({
      id: court.id,
      name: court.name,
      sport: court.sport,
      surface: court.surface ?? null,
      price_per_hour: Number(court.price_per_hour ?? 0),
      capacity: court.capacity ?? null,
      facilities: Array.isArray(court.amenities) ? court.amenities : [],
      description: court.description ?? null,
      is_active: court.is_active ?? true,
      primary_image_url: null,
      blackouts: [],
    })),
  }));

  const courtIds = managedVenues.flatMap((venue) =>
    (venue.courts || []).map((court: { id: string }) => court.id),
  );

  if (courtIds.length === 0) {
    return {
      ownedCourts: [],
      upcomingBookings: [],
      revenueTotal: 0,
      venues: managedVenues,
    };
  }

  const [courtsRes, bookingsRes, blackoutsRes] = await Promise.all([
    supabase.from("court_summaries").select("*").in("id", courtIds),
    supabase
      .from("bookings")
      .select(
        "id, start_time, end_time, status, checked_in_at, completed_at, price_total, court:courts(name, sport)",
      )
      .in("court_id", courtIds)
      .order("start_time", { ascending: true })
      .limit(20),
    supabase
      .from("court_blackouts")
      .select("*")
      .in("court_id", courtIds)
      .order("start_date", { ascending: true }),
  ]);

  const ownedCourts = ((courtsRes.data ?? []) as CourtSummaryRow[]).map(
    (court) => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour ?? 0),
      capacity: court.capacity ?? null,
      facilities: Array.isArray(court.amenities) ? court.amenities : [],
      description: court.description ?? null,
      venueName: court.venue_name,
      venueCity: court.venue_city ?? null,
      venueDistrict: court.venue_district ?? null,
      venueLatitude:
        typeof court.venue_latitude === "number" ? court.venue_latitude : null,
      venueLongitude:
        typeof court.venue_longitude === "number"
          ? court.venue_longitude
          : null,
      primaryImageUrl: court.primary_image_url ?? null,
      averageRating: Number(court.average_rating ?? 0),
      reviewCount: Number(court.review_count ?? 0),
    }),
  );

  const blackoutsByCourt = new Map<string, CourtBlackout[]>();
  ((blackoutsRes.data ?? []) as any[]).forEach((row) => {
    const current = blackoutsByCourt.get(row.court_id) ?? [];
    current.push({
      id: row.id,
      title: row.title,
      notes: row.notes ?? null,
      scope: row.scope,
      frequency: row.frequency,
      start_date: row.start_date,
      end_date: row.end_date,
      start_time: row.start_time ?? null,
      end_time: row.end_time ?? null,
      repeat_day_of_week: row.repeat_day_of_week ?? null,
    });
    blackoutsByCourt.set(row.court_id, current);
  });

  const upcomingBookingRows = (bookingsRes.data ??
    []) as unknown as BookingRow[];
  const upcomingBookings = upcomingBookingRows.map((booking) => ({
    id: booking.id,
    start_time: booking.start_time,
    end_time: booking.end_time,
    status: normalizeBookingStatus(booking.status),
    checked_in_at: booking.checked_in_at ?? null,
    completed_at: booking.completed_at ?? null,
    price_total: Number(booking.price_total ?? 0),
    court_name: booking.court?.name ?? "",
    sport: booking.court?.sport ?? "",
  }));

  const revenueTotal = upcomingBookings.reduce(
    (acc, booking) => acc + booking.price_total,
    0,
  );

  const primaryImageMap = new Map(
    ownedCourts.map((court) => [court.id, court.primaryImageUrl ?? null]),
  );

  const venuesWithImages = managedVenues.map((venue) => ({
    ...venue,
    courts: venue.courts.map((court: { id: string; primary_image_url?: string | null }) => ({
      ...court,
      primary_image_url:
        primaryImageMap.get(court.id) ?? court.primary_image_url ?? null,
      blackouts: blackoutsByCourt.get(court.id) ?? [],
    })),
  }));

  return {
    ownedCourts,
    upcomingBookings,
    revenueTotal,
    venues: venuesWithImages,
  };
}

// Fungsi tambahan dari user-bookings.ts
export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled",
  decisionNote?: string,
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

// Fungsi tambahan dari venue-bookings.ts
export async function getVenueBookings(
  venueId: string,
  filters?: {
    status?: string[];
    dateFrom?: string;
    dateTo?: string;
    courtId?: string;
  },
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select(
      `
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
    `,
    )
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
    date: new Date(booking.start_time).toISOString().split("T")[0],
    startTime: new Date(booking.start_time).toTimeString().slice(0, 5),
    endTime: new Date(booking.end_time).toTimeString().slice(0, 5),
    duration: Math.round(
      (new Date(booking.end_time).getTime() -
        new Date(booking.start_time).getTime()) /
        (1000 * 60 * 60),
    ),
    totalPrice: Number(booking.price_total) || 0,
    status: booking.status,
    paymentStatus: booking.payment_status,
    bookingDate: new Date(booking.created_at).toISOString().split("T")[0],
    notes: booking.notes,
    checkedInAt: booking.checked_in_at,
    completedAt: booking.completed_at,
  }));
}

export async function getVenueBookingMetrics(venueId: string): Promise<any> {
  const supabase = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [
    totalResult,
    todayResult,
    upcomingResult,
    pendingResult,
    courtsResult,
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
      .eq("is_active", true),
  ]);

  const totalBookings = (totalResult.data ?? []).length;
  const todayBookingsData = todayResult.data ?? [];
  const upcomingBookings = (upcomingResult.data ?? []).length;
  const pendingBookings = (pendingResult.data ?? []).length;
  const activeCourts = (courtsResult.data ?? []).length;

  // Calculate today's revenue (only from confirmed/completed bookings)
  const todayRevenue = todayBookingsData
    .filter(
      (booking: any) =>
        booking.status === "confirmed" || booking.status === "completed",
    )
    .reduce((sum, booking) => sum + Number(booking.price_total || 0), 0);

  // Calculate occupancy rate (assuming 16 operating hours per day per court)
  const totalOperatingHours = activeCourts * 16; // 16 hours per court
  const bookedHours = todayBookingsData
    .filter((booking: any) => booking.status !== "cancelled")
    .reduce((sum, booking) => {
      const duration =
        (new Date(booking.end_time).getTime() -
          new Date(booking.start_time).getTime()) /
        (1000 * 60 * 60);
      return sum + duration;
    }, 0);

  const occupancyRate =
    totalOperatingHours > 0
      ? Math.round((bookedHours / totalOperatingHours) * 100)
      : 0;
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

export async function getVenueCourts(venueId: string): Promise<
  Array<{
    id: string;
    name: string;
    sport: string;
    pricePerHour: number;
    isActive: boolean;
  }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("id, name, sport, price_per_hour, is_active")
    .eq("venue_id", venueId)
    .order("name", { ascending: true });

  if (error) {
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
