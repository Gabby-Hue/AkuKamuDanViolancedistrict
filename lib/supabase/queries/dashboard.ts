import { createClient } from "@/lib/supabase/server";
import type { CourtSummary } from "./courts";

export type AdminMetrics = {
  totalVenues: number;
  totalCourts: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  pendingApplications: number;
};

export type RevenueTrend = {
  date: string;
  revenue: number;
  bookings: number;
};

export type SportBreakdown = {
  sport: string;
  count: number;
  percentage: number;
};

export type VenueLeader = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  bookingCount: number;
  revenue: number;
  averageRating: number;
};

export type PartnerApplications = {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  recent: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    businessName: string | null;
    submittedAt: string;
    status: "pending" | "accepted" | "rejected";
  }>;
};

export type AdminDashboardData = {
  metrics: AdminMetrics;
  revenueTrend: RevenueTrend[];
  sportBreakdown: SportBreakdown[];
  venueLeaders: VenueLeader[];
  partnerApplications: PartnerApplications;
};

export type UserDashboardData = {
  bookings: Array<{
    id: string;
    courtName: string;
    sport: string;
    startTime: string;
    endTime: string;
    status: "pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
    totalPrice: number;
  }>;
  recommendedCourts: CourtSummary[];
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const [
    venuesResult,
    courtsResult,
    bookingsResult,
    usersResult,
    applicationsResult,
  ] = await Promise.all([
    supabase.from("venues").select("id").eq("is_active", true),
    supabase.from("courts").select("id").eq("is_active", true),
    supabase.from("bookings").select("price_total, created_at"),
    supabase.from("profiles").select("id").eq("role", "user"),
    supabase
      .from("venue_partner_applications")
      .select("id, status, created_at, reviewed_at, contact_name, contact_email, contact_phone, organization_name, decision_note, handled_by")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const metrics: AdminMetrics = {
    totalVenues: (venuesResult.data ?? []).length,
    totalCourts: (courtsResult.data ?? []).length,
    totalBookings: (bookingsResult.data ?? []).length,
    totalUsers: (usersResult.data ?? []).length,
    totalRevenue: (bookingsResult.data ?? []).reduce(
      (sum, booking) => sum + Number(booking.price_total ?? 0),
      0
    ),
    pendingApplications: (applicationsResult.data ?? []).filter(
      (app) => (app.status ?? "pending") === "pending"
    ).length,
  };

  const revenueTrend = await getRevenueTrend();
  const sportBreakdown = await getSportBreakdown();
  const venueLeaders = await getVenueLeaders();
  const partnerApplications = await getPartnerApplications();

  return {
    metrics,
    revenueTrend,
    sportBreakdown,
    venueLeaders,
    partnerApplications,
  };
}

export async function getUserDashboardData(
  userId: string
): Promise<UserDashboardData> {
  const supabase = await createClient();

  const [bookingsResult, recommendedResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(`
        id,
        start_time,
        end_time,
        status,
        price_total,
        court:courts(name, sport)
      `)
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("court_summaries")
      .select("*")
      .eq("is_active", true)
      .order("average_rating", { ascending: false })
      .limit(6),
  ]);

  const bookings = (bookingsResult.data ?? []).map((booking) => ({
    id: booking.id,
    courtName: (booking.court as any)?.name ?? "",
    sport: (booking.court as any)?.sport ?? "",
    startTime: booking.start_time,
    endTime: booking.end_time,
    status: normalizeBookingStatus(booking.status),
    totalPrice: Number(booking.price_total ?? 0),
  }));

  const recommendedCourts = (recommendedResult.data ?? []).map((court) => ({
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface ?? null,
    pricePerHour: court.price_per_hour,
    capacity: court.capacity ?? null,
    amenities: Array.isArray(court.amenities) ? court.amenities : [],
    description: court.description ?? null,
    venueName: court.venue_name,
    venueCity: court.venue_city ?? null,
    venueDistrict: court.venue_district ?? null,
    venueLatitude: court.venue_latitude ?? null,
    venueLongitude: court.venue_longitude ?? null,
    primaryImageUrl: court.primary_image_url ?? null,
    averageRating: court.average_rating ?? 0,
    reviewCount: court.review_count ?? 0,
  }));

  return {
    bookings,
    recommendedCourts,
  };
}

async function getRevenueTrend(): Promise<RevenueTrend[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data } = await supabase
    .from("bookings")
    .select("price_total, created_at")
    .gte("created_at", thirtyDaysAgo.toISOString())
    .eq("status", "completed");

  const revenueByDate = new Map<string, { revenue: number; bookings: number }>();

  (data ?? []).forEach((booking) => {
    const date = new Date(booking.created_at).toISOString().split("T")[0];
    const current = revenueByDate.get(date) ?? { revenue: 0, bookings: 0 };
    current.revenue += Number(booking.price_total ?? 0);
    current.bookings += 1;
    revenueByDate.set(date, current);
  });

  const trend: RevenueTrend[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayData = revenueByDate.get(dateStr) ?? { revenue: 0, bookings: 0 };
    trend.push({
      date: dateStr,
      revenue: dayData.revenue,
      bookings: dayData.bookings,
    });
  }

  return trend;
}

async function getSportBreakdown(): Promise<SportBreakdown[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("courts")
    .select("sport")
    .eq("is_active", true);

  const sportCounts = new Map<string, number>();
  (data ?? []).forEach((court) => {
    const current = sportCounts.get(court.sport) ?? 0;
    sportCounts.set(court.sport, current + 1);
  });

  const total = (data ?? []).length;
  return Array.from(sportCounts.entries())
    .map(([sport, count]) => ({
      sport,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

async function getVenueLeaders(): Promise<VenueLeader[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("venue_bookings_summary")
    .select("*")
    .order("booking_count", { ascending: false })
    .limit(10);

  return (data ?? []).map((venue) => ({
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city,
    bookingCount: venue.booking_count ?? 0,
    revenue: Number(venue.total_revenue ?? 0),
    averageRating: Number(venue.average_rating ?? 0),
  }));
}

async function getPartnerApplications(): Promise<PartnerApplications> {
  const supabase = await createClient();

  const [totalResult, recentResult] = await Promise.all([
    supabase
      .from("venue_partner_applications")
      .select("status")
      .eq("status", "pending"),
    supabase
      .from("venue_partner_applications")
      .select(
        "id, status, created_at, reviewed_at, contact_name, contact_email, contact_phone, organization_name, decision_note, handled_by"
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pending = (totalResult.data ?? []).length;

  return {
    total: pending,
    pending,
    accepted: 0,
    rejected: 0,
    recent: (recentResult.data ?? []).map((app) => ({
      id: app.id,
      fullName: app.contact_name,
      email: app.contact_email,
      phone: app.contact_phone,
      businessName: app.organization_name,
      submittedAt: app.created_at,
      status: app.status ?? "pending",
    })),
  };
}

function normalizeBookingStatus(status: string): "pending" | "confirmed" | "checked_in" | "completed" | "cancelled" {
  switch (status) {
    case "pending":
    case "confirmed":
    case "checked_in":
    case "completed":
    case "cancelled":
      return status;
    default:
      return "pending";
  }
}