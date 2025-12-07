"use server";

import { fetchVenueStatsDirect, type VenueStatsData } from "./direct-stats-fetcher";
import { fetchMonthlyRevenueChart, fetchBookingTrends, type ChartData } from "./chart-data-fetcher";

/**
 * Server Action to fetch real-time venue statistics
 * Replaces the API call in client component
 */
export async function refreshVenueStatsAction(venueId: string): Promise<VenueStatsData> {
  return await fetchVenueStatsDirect(venueId);
}

/**
 * Server Action to fetch chart data
 * Combines monthly revenue and booking trends
 */
export async function refreshChartDataAction(venueId: string): Promise<{
  monthly: ChartData['monthly'];
  trends: ChartData['trends'];
}> {
  const [monthly, trends] = await Promise.all([
    fetchMonthlyRevenueChart(venueId),
    fetchBookingTrends(venueId),
  ]);

  return {
    monthly,
    trends,
  };
}