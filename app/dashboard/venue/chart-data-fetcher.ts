"use server";

import { createClient } from "@/lib/supabase/server";

export type ChartData = {
  monthly: Array<{
    month: string;
    revenue: number;
    bookingCount: number;
  }>;
  trends: Array<{
    date: string;
    bookings: number;
    fullDate: string;
  }>;
};

/**
 * Fetch monthly revenue data for charts
 * Replaces the API call in fetchVenueRevenueData
 */
export async function fetchMonthlyRevenueChart(
  venueId: string,
  months: number = 6,
): Promise<ChartData["monthly"]> {
  const supabase = await createClient();

  // Get current date and 6 months back (same as API route)
  const now = new Date();
  const sixMonthsAgo = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );

  // Get court IDs for this venue first (same as API route)
  const { data: venueCourts, error: courtsError } = await supabase
    .from("courts")
    .select("id")
    .eq("venue_id", venueId);

  const courtIds = venueCourts?.map((c) => c.id) || [];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  try {
    // Fetch monthly revenue data using court IDs (same as API route)
    const { data } = await supabase
      .from("bookings")
      .select("start_time, price_total")
      .in("court_id", courtIds)
      .gte("start_time", sixMonthsAgo.toISOString())
      .eq("status", "completed")
      .eq("payment_status", "paid")
      .order("start_time", { ascending: true });

    const bookingsData = data || [];

    // Calculate monthly revenue using the same approach as API route
    const monthlyDataMap = new Map<
      string,
      { revenue: number; bookingCount: number; monthName: string }
    >();

    for (let i = 0; i < 6; i++) {
      // Calculate month going back from current month (same as API route)
      const targetMonth = (now.getUTCMonth() - 5 + i + 12) % 12; // Wrap around for negative months
      const targetYear =
        now.getUTCFullYear() + Math.floor((now.getUTCMonth() - 5 + i) / 12);

      const monthDate = new Date(Date.UTC(targetYear, targetMonth, 1));
      const monthKey = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
      const monthName = monthNames[targetMonth];
      monthlyDataMap.set(monthKey, { revenue: 0, bookingCount: 0, monthName });
    }

    // Aggregate monthly data
    bookingsData.forEach((booking) => {
      const bookingDate = new Date(booking.start_time);
      const monthKey = `${bookingDate.getUTCFullYear()}-${String(
        bookingDate.getUTCMonth() + 1,
      ).padStart(2, "0")}`;
      const monthData = monthlyDataMap.get(monthKey);
      if (monthData) {
        monthData.revenue += Number(booking.price_total || 0);
        monthData.bookingCount += 1;
      }
    });

    const monthlyData: ChartData["monthly"] = Array.from(
      monthlyDataMap.entries(),
    )
      .map(([month, data]) => ({
        month: data.monthName,
        revenue: data.revenue,
        bookingCount: data.bookingCount,
      }))
      .sort((a, b) => {
        // Sort by month order (Jan to Dec) - same as API route
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });

    return monthlyData;
  } catch (error) {
    console.error("Failed to fetch monthly revenue chart data:", error);
    return [];
  }
}

/**
 * Fetch booking trends for the last 7 days
 * Replaces the API call in fetchVenueRevenueData
 */
export async function fetchBookingTrends(
  venueId: string,
  days: number = 7,
): Promise<ChartData["trends"]> {
  const supabase = await createClient();

  // Get current date (reuse from previous function to match API route)
  const now = new Date();

  // Get court IDs for this venue first (reuse from previous function)
  const { data: venueCourts, error: courtsError } = await supabase
    .from("courts")
    .select("id")
    .eq("venue_id", venueId);

  const courtIds = venueCourts?.map((c) => c.id) || [];

  try {
    // Get daily booking trends for the last 7 days (same as API route)
    const sevenDaysAgo = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 6,
        0,
        0,
        0,
      ),
    );

    const { data: dailyBookings } = await supabase
      .from("bookings")
      .select("start_time")
      .in("court_id", courtIds)
      .gte("start_time", sevenDaysAgo.toISOString())
      .in("status", ["completed", "confirmed", "checked_in", "pending"]);

    // Process daily data for line chart (same as API route)
    const dailyDataByDate = new Map<string, number>();
    // Use all 7 days of the week
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    dailyBookings?.forEach((booking: any) => {
      if (booking.start_time) {
        const bookingDate = new Date(booking.start_time);
        const date = bookingDate.toISOString().split("T")[0];

        // Store by date for lookup (include all days)
        dailyDataByDate.set(date, (dailyDataByDate.get(date) || 0) + 1);
      }
    });

    // Generate booking trends for all 7 days including weekends
    const bookingTrends: ChartData["trends"] = [];

    // Always generate 7-day data regardless of whether data exists
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - i,
          0,
          0,
          0,
        ),
      )
        .toISOString()
        .split("T")[0];

      const dayOfWeek = new Date(date).getUTCDay(); // 0 = Sunday, 1 = Monday, 6 = Saturday
      const dayName = dayNames[dayOfWeek];
      const bookingsForDay = dailyDataByDate.get(date) || 0; // Use date-based lookup

      bookingTrends.push({
        date: dayName,
        bookings: bookingsForDay,
        fullDate: date,
      });
    }

    return bookingTrends;
  } catch (error) {
    console.error("Failed to fetch booking trends data:", error);
    return [];
  }
}
