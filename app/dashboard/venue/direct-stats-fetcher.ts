"use server";

import { createClient } from "@/lib/supabase/server";

export type VenueStatsData = {
  venueStats: {
    totalCourts: number;
    totalBookings: number;
    todayBookings: number;
    todayRevenue: number;
    totalRevenue: number;
    averageRating: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  };
  courtStats: Array<{
    court_id: string;
    court_name: string;
    venue_id: string;
    total_bookings: number;
    today_bookings: number;
    today_revenue: number;
    total_revenue: number;
    review_count: number;
    average_rating: number;
    confirmed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
  }>;
};

/**
 * Fetch venue statistics directly from database
 * Replaces the API call to /api/dashboard/venue/stats
 */
export async function fetchVenueStatsDirect(venueId: string): Promise<VenueStatsData> {
  const supabase = await createClient();

  // Fetch courts for this venue
  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select(`
      id,
      venue_id,
      name,
      sport,
      surface,
      price_per_hour,
      capacity,
      facilities,
      description,
      primary_image_url,
      is_active,
      venues!inner (
        name,
        city,
        district,
        latitude,
        longitude
      )
    `)
    .eq("venue_id", venueId)
    .eq("is_active", true);

  if (courtsError) {
    console.error("Failed to fetch courts:", courtsError.message);
    throw new Error("Failed to fetch venue statistics");
  }

  const courtIds = courts?.map(c => c.id) || [];

  // Fetch booking stats for these courts
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      court_id,
      status,
      price_total,
      start_time
    `)
    .in("court_id", courtIds);

  // Fetch review stats for these courts
  const { data: reviews, error: reviewsError } = await supabase
    .from("court_reviews")
    .select(`
      court_id,
      rating
    `)
    .in("court_id", courtIds);

  // Calculate statistics for each court
  const courtStats = courts?.map(court => {
    const courtBookings = bookings?.filter(b => b.court_id === court.id) || [];
    const courtReviews = reviews?.filter(r => r.court_id === court.id) || [];

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = courtBookings.filter(b =>
      b.start_time.startsWith(today) &&
      !['pending', 'cancelled'].includes(b.status)
    );

    const completedBookings = courtBookings.filter(b => b.status === 'completed');
    const confirmedBookings = courtBookings.filter(b => b.status === 'confirmed');
    const pendingBookings = courtBookings.filter(b => b.status === 'pending');
    const cancelledBookings = courtBookings.filter(b => b.status === 'cancelled');

    return {
      court_id: court.id,
      court_name: court.name,
      venue_id: court.venue_id,
      total_bookings: completedBookings.length,
      today_bookings: todayBookings.length,
      today_revenue: todayBookings.reduce((sum, b) => sum + Number(b.price_total || 0), 0),
      total_revenue: completedBookings.reduce((sum, b) => sum + Number(b.price_total || 0), 0),
      review_count: courtReviews.length,
      average_rating: courtReviews.length > 0
        ? courtReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / courtReviews.length
        : 0,
      confirmed_bookings: confirmedBookings.length,
      pending_bookings: pendingBookings.length,
      cancelled_bookings: cancelledBookings.length,
    };
  }) || [];

  // Calculate aggregate venue statistics
  const venueStats = {
    totalCourts: courtStats.length,
    totalBookings: courtStats.reduce((sum, court) => sum + court.total_bookings, 0),
    todayBookings: courtStats.reduce((sum, court) => sum + court.today_bookings, 0),
    todayRevenue: courtStats.reduce((sum, court) => sum + court.today_revenue, 0),
    totalRevenue: courtStats.reduce((sum, court) => sum + court.total_revenue, 0),
    averageRating: courtStats.length > 0
      ? courtStats.reduce((sum, court) => sum + court.average_rating, 0) / courtStats.length
      : 0,
    confirmedBookings: courtStats.reduce((sum, court) => sum + court.confirmed_bookings, 0),
    pendingBookings: courtStats.reduce((sum, court) => sum + court.pending_bookings, 0),
    cancelledBookings: courtStats.reduce((sum, court) => sum + court.cancelled_bookings, 0),
  };

  return {
    venueStats,
    courtStats,
  };
}