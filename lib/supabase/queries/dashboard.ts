import { createClient } from "@/lib/supabase/server";
import type { CourtSummary } from "./courts";
import type { ProfileWithRole } from "../roles";

export type AdminMetrics = {
  totalRevenue: number;
  totalBookings: number;
  totalVenues: number;
  totalThreads: number;
  totalCourts: number;
  totalUsers: number;
  pendingApplications: number;
};

export type AdminDashboardData = {
  metrics: AdminMetrics;
  revenueTrend: Array<{
    label: string;
    month: string;
    revenue: number;
    bookings: number;
  }>;
  sportBreakdown: Array<{
    sport: string;
    bookings: number;
    revenue: number;
  }>;
  venueLeaders: Array<{
    venueId: string;
    venueName: string;
    city: string | null;
    revenue: number;
    bookings: number;
  }>;
  partnerApplications: {
    pending: any[];
    accepted: any[];
    rejected: any[];
  };
};

type BookingPriceRow = { price_total: number | null };

type PartnerApplicationRow = {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  facility_types: string[] | null;
  facility_count: number | null;
  existing_system: string | null;
  notes: string | null;
  status: string;
  handled_by: string | null;
  decision_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type PartnerApplicationWithCredentialRow = PartnerApplicationRow & {
  credential: {
    temporary_password: string | null;
    partner_profile_id: string | null;
  } | null;
};

function mapPartnerApplicationRow(row: PartnerApplicationRow): any {
  return {
    id: row.id,
    organization_name: row.organization_name,
    contact_name: row.contact_name,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone ?? null,
    city: row.city ?? null,
    facility_types: Array.isArray(row.facility_types) ? row.facility_types : [],
    facility_count: row.facility_count ?? null,
    existing_system: row.existing_system ?? null,
    notes: row.notes ?? null,
    status: row.status,
    handled_by: row.handled_by ?? null,
    decision_note: row.decision_note ?? null,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at ?? null,
  };
}

// Alias untuk backward compatibility
export const getAdminDashboardData = fetchAdminDashboardData;

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const supabase = await createClient();

  const [bookingsRes, venuesRes, threadsRes, usersRes] = await Promise.all([
    supabase.from("bookings").select("price_total", { count: "exact" }),
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const totalRevenue = ((bookingsRes.data ?? []) as BookingPriceRow[]).reduce(
    (acc, item) => acc + Number(item.price_total ?? 0),
    0,
  );

  return {
    totalRevenue,
    totalBookings: bookingsRes.count ?? 0,
    totalVenues: venuesRes.count ?? 0,
    totalThreads: threadsRes.count ?? 0,
    totalCourts: 0, // Not in original, would need separate query
    totalUsers: usersRes.count ?? 0,
    pendingApplications: 0, // Not in original, would need separate query
  };
}

export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();

  const now = new Date();
  const rangeStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );
  const rangeStartIso = rangeStart.toISOString();

  const [
    bookingsTotalsRes,
    venuesCountRes,
    courtsCountRes,
    threadsCountRes,
    usersCountRes,
    applicationsRes,
    bookingsRangeRes,
  ] = await Promise.all([
    supabase.from("bookings").select("price_total", { count: "exact" }),
    supabase.from("venues").select("id", { count: "exact", head: true }),
    supabase.from("courts").select("id", { count: "exact", head: true }),
    supabase.from("forum_threads").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("venue_partner_applications")
      .select(
        "*, credential:venue_partner_credentials(temporary_password, partner_profile_id)",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select(
        "id, start_time, price_total, court:courts(id, name, sport, venue:venues(id, name, city))",
      )
      .gte("start_time", rangeStartIso),
  ]);

  const totalRevenue = (
    (bookingsTotalsRes.data ?? []) as BookingPriceRow[]
  ).reduce((acc, item) => acc + Number(item.price_total ?? 0), 0);

  const applications =
    ((applicationsRes.data ?? []) as PartnerApplicationWithCredentialRow[]) ??
    [];

  const metrics: AdminDashboardData["metrics"] = {
    totalRevenue,
    totalBookings: bookingsTotalsRes.count ?? 0,
    totalVenues: venuesCountRes.count ?? 0,
    totalThreads: threadsCountRes.count ?? 0,
    totalCourts: courtsCountRes.count ?? 0,
    totalUsers: usersCountRes.count ?? 0,
    pendingApplications: applications.filter((app) => app.status === "pending")
      .length,
  };

  const monthBuckets = new Map<
    string,
    {
      label: string;
      revenue: number;
      bookings: number;
    }
  >();
  for (let offset = 0; offset < 6; offset += 1) {
    const bucketDate = new Date(rangeStart);
    bucketDate.setUTCMonth(rangeStart.getUTCMonth() + offset);
    const key = `${bucketDate.getUTCFullYear()}-${String(
      bucketDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    monthBuckets.set(key, {
      label: bucketDate.toLocaleDateString("id-ID", { month: "short" }),
      revenue: 0,
      bookings: 0,
    });
  }

  const sportMap = new Map<string, { bookings: number; revenue: number }>();
  const venueMap = new Map<
    string,
    {
      venueName: string;
      city: string | null;
      revenue: number;
      bookings: number;
    }
  >();

  const bookingRangeRows = (bookingsRangeRes.data ?? []) as unknown as any[];
  bookingRangeRows.forEach((booking) => {
    const bookingDate = new Date(booking.start_time);
    const monthKey = `${bookingDate.getUTCFullYear()}-${String(
      bookingDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const bucket = monthBuckets.get(monthKey);
    if (bucket) {
      bucket.revenue += Number(booking.price_total ?? 0);
      bucket.bookings += 1;
    }

    const sport = booking.court?.sport ?? "Lainnya";
    const sportEntry = sportMap.get(sport) ?? { bookings: 0, revenue: 0 };
    sportEntry.bookings += 1;
    sportEntry.revenue += Number(booking.price_total ?? 0);
    sportMap.set(sport, sportEntry);

    const venueId =
      booking.court?.venue?.id ?? booking.court?.venue?.name ?? "unknown";
    const venueEntry = venueMap.get(venueId) ?? {
      venueName: booking.court?.venue?.name ?? "Venue",
      city: booking.court?.venue?.city ?? null,
      revenue: 0,
      bookings: 0,
    };
    venueEntry.revenue += Number(booking.price_total ?? 0);
    venueEntry.bookings += 1;
    venueMap.set(venueId, venueEntry);
  });

  const revenueTrend = Array.from(monthBuckets.entries()).map(
    ([month, value]) => ({
      month,
      label: value.label,
      revenue: value.revenue,
      bookings: value.bookings,
    }),
  );

  const sportBreakdown = Array.from(sportMap.entries())
    .map(([sport, value]) => ({
      sport,
      bookings: value.bookings,
      revenue: value.revenue,
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6);

  const venueLeaders = Array.from(venueMap.entries())
    .map(([venueId, value]) => ({
      venueId,
      venueName: value.venueName,
      city: value.city,
      revenue: value.revenue,
      bookings: value.bookings,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const pending = applications
    .filter((row) => row.status === "pending")
    .map((row) => mapPartnerApplicationRow(row));
  const accepted = applications
    .filter((row) => row.status === "accepted")
    .map((row) => ({
      ...mapPartnerApplicationRow(row),
      partner_profile_id: row.credential?.partner_profile_id ?? null,
      temporary_password: row.credential?.temporary_password ?? null,
    }));
  const rejected = applications
    .filter((row) => row.status === "rejected")
    .map((row) => mapPartnerApplicationRow(row));

  return {
    metrics,
    revenueTrend,
    sportBreakdown,
    venueLeaders,
    partnerApplications: {
      pending,
      accepted,
      rejected,
    },
  };
}

export async function fetchPartnerApplications(limit = 10): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venue_partner_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch partner applications", error.message);
    return [];
  }

  return ((data ?? []) as PartnerApplicationRow[]).map(
    mapPartnerApplicationRow,
  );
}
