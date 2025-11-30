import { createClient } from "@/lib/supabase/server";
import type { ProfileWithRole } from "../roles";

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
  bookingTrends: Array<{
    date: string;
    bookings: number;
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
      bookingTrends: [],
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
    .eq("payment_status", "paid")
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
      bookingTrends: [],
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

    // Handle case where court might be an array (from Supabase join)
    const courtData = Array.isArray(court) ? court[0] : court;
    if (!courtData) return;

    const courtId = courtData.id || '';
    const existing = courtStats.get(courtId) || {
      name: courtData.name,
      sport: courtData.sport,
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

  // Calculate average occupancy based on actual bookings vs available slots
  const totalBookings = bookingsData.length;

  // Get total courts owned by the partner
  const { data: courtsData } = await supabase
    .from("courts")
    .select("id")
    .in("venue_id", venueIds)
    .eq("is_active", true);

  const totalActiveCourts = courtsData?.length || 0;

  // Calculate occupancy: (booked hours / total available hours) * 100
  // Assuming 30 days in month, 16 operating hours per day per court
  const totalAvailableHours = totalActiveCourts * 30 * 16;
  const totalBookedHours = bookingsData.reduce((total, booking) => {
    const duration = (new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60 * 60);
    return total + duration;
  }, 0);

  const averageOccupancy = totalAvailableHours > 0 ? Math.round((totalBookedHours / totalAvailableHours) * 100) : 0;

  // Get daily booking trends for the last 30 days
  const thirtyDaysAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 29, 0, 0, 0),
  );

  const { data: dailyBookings } = await supabase
    .from("bookings")
    .select("start_time, court_id")
    .in("court_id", venueIds)
    .gte("start_time", thirtyDaysAgo.toISOString())
    .eq("status", "completed");

  // Process daily data for line chart
  const dailyData = new Map<string, number>();
  dailyBookings?.forEach((booking: any) => {
    if (booking.start_time) {
      const date = new Date(booking.start_time).toISOString().split('T')[0];
      dailyData.set(date, (dailyData.get(date) || 0) + 1);
    }
  });

  // Generate last 30 days with booking counts
  const bookingTrends = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i, 0, 0, 0)
    ).toISOString().split('T')[0];

    const dayName = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });
    bookingTrends.push({
      date: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      bookings: dailyData.get(date) || 0,
    });
  }

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
    bookingTrends,
  };
}
