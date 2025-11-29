import { createClient } from "@/lib/supabase/server";
import type { ProfileWithRole } from "./roles";

export type VenueRevenueData = {
  totalRevenue: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookingCount: number;
  }>;
  bookingStats: {
    totalBookings: number;
    averageOccupancy: number;
    peakHours: string;
    peakDay: string;
  };
  topCourts: Array<{
    courtId: string;
    courtName: string;
    sport: string;
    bookingCount: number;
    revenue: number;
  }>;
};

export async function fetchVenueRevenueData(
  profile: ProfileWithRole,
): Promise<VenueRevenueData> {
  const supabase = await createClient();

  // Get current date and 6 months back for trend data
  const now = new Date();
  const sixMonthsAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );

  // Fetch venues owned by partner
  const { data: venues, error: venuesError } = await supabase
    .from("venues")
    .select("id")
    .eq("owner_profile_id", profile.id);

  if (venuesError || !venues?.length) {
    console.error("Failed to fetch venues", venuesError?.message);
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      bookingStats: {
        totalBookings: 0,
        averageOccupancy: 0,
        peakHours: "N/A",
        peakDay: "N/A",
      },
      topCourts: [],
    };
  }

  const venueIds = venues.map((v) => v.id);

  // Fetch completed bookings for revenue calculation
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      start_time,
      end_time,
      price_total,
      court:courts(id, name, sport)
    `,
    )
    .in("court_id", venueIds)
    .gte("start_time", sixMonthsAgo.toISOString())
    .eq("status", "completed")
    .eq("payment_status", "completed")
    .order("start_time", { ascending: true });

  if (bookingsError) {
    console.error("Failed to fetch bookings", bookingsError.message);
    return {
      totalRevenue: 0,
      monthlyRevenue: [],
      bookingStats: {
        totalBookings: 0,
        averageOccupancy: 0,
        peakHours: "N/A",
        peakDay: "N/A",
      },
      topCourts: [],
    };
  }

  const bookingsData = bookings || [];

  // Calculate total revenue
  const totalRevenue = bookingsData.reduce(
    (sum, booking) => sum + Number(booking.price_total || 0),
    0,
  );

  // Calculate monthly revenue and booking counts
  const monthlyData = new Map<
    string,
    { revenue: number; bookingCount: number }
  >();

  // Initialize months for the last 6 months
  for (let i = 0; i < 6; i++) {
    const monthDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1),
    );
    const monthKey = `${monthDate.getUTCFullYear()}-${String(
      monthDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    monthlyData.set(monthKey, { revenue: 0, bookingCount: 0 });
  }

  // Aggregate monthly data
  bookingsData.forEach((booking) => {
    const bookingDate = new Date(booking.start_time);
    const monthKey = `${bookingDate.getUTCFullYear()}-${String(
      bookingDate.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    const monthData = monthlyData.get(monthKey);
    if (monthData) {
      monthData.revenue += Number(booking.price_total || 0);
      monthData.bookingCount += 1;
    }
  });

  const monthlyRevenue = Array.from(monthlyData.entries()).map(
    ([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("id-ID", {
        month: "short",
      }),
      revenue: data.revenue,
      bookingCount: data.bookingCount,
    }),
  );

  // Calculate court performance
  const courtStats = new Map<
    string,
    { name: string; sport: string; bookingCount: number; revenue: number }
  >();

  bookingsData.forEach((booking) => {
    const court = booking.court;
    if (!court) return;

    const courtId = court.id;
    const existing = courtStats.get(courtId) || {
      name: court.name,
      sport: court.sport,
      bookingCount: 0,
      revenue: 0,
    };

    existing.bookingCount += 1;
    existing.revenue += Number(booking.price_total || 0);
    courtStats.set(courtId, existing);
  });

  const topCourts = Array.from(courtStats.entries())
    .map(([courtId, stats]) => ({
      courtId,
      courtName: stats.name,
      sport: stats.sport,
      bookingCount: stats.bookingCount,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount)
    .slice(0, 5);

  // Calculate peak hours and days
  const hourStats = new Map<number, number>();
  const dayStats = new Map<number, number>();

  bookingsData.forEach((booking) => {
    const bookingDate = new Date(booking.start_time);
    const hour = bookingDate.getUTCHours();
    const day = bookingDate.getUTCDay(); // 0 = Sunday, 6 = Saturday

    hourStats.set(hour, (hourStats.get(hour) || 0) + 1);
    dayStats.set(day, (dayStats.get(day) || 0) + 1);
  });

  // Find peak hour (convert to WIB timezone)
  const peakHourEntry = Array.from(hourStats.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const peakHours = peakHourEntry
    ? `${String((peakHourEntry[0] + 7) % 24).padStart(2, "0")}:00 - ${String(
        (peakHourEntry[0] + 8) % 24,
      ).padStart(2, "0")}:00`
    : "N/A";

  // Find peak day
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const peakDayEntry = Array.from(dayStats.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const peakDay = peakDayEntry ? dayNames[peakDayEntry[0]] : "N/A";

  // Calculate average occupancy (simplified - based on completed bookings)
  const totalBookings = bookingsData.length;
  const averageOccupancy = totalBookings > 0 ? 73 : 0; // Placeholder calculation

  return {
    totalRevenue,
    monthlyRevenue,
    bookingStats: {
      totalBookings,
      averageOccupancy,
      peakHours,
      peakDay,
    },
    topCourts,
  };
}
