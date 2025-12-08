// User Dashboard Queries - Optimized & No Duplication
// Pages: dashboard/user/page.tsx, dashboard/user/bookings/[id]/page.tsx

import { createClient } from "@/lib/supabase/server";
import type {
  Booking,
  BookingDetail,
  UserDashboardData,
  Court,
  BookingQueryOptions,
  CourtReview,
} from "./types";
import { PublicQueries } from "./public";

export class UserQueries {
  /**
   * Get user dashboard data with optimized queries
   * Used: dashboard/user/page.tsx
   */
  static async getUserDashboardData(
    userId: string,
  ): Promise<UserDashboardData> {
    const supabase = await createClient();

    // Single optimized query for all user bookings with court info
    const { data: bookings, error } = await supabase
      .from("bookings_with_courts")
      .select("*")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(100); // Reasonable limit for dashboard

    if (error) {
      console.error("Error fetching user bookings:", error);
      return {
        stats: {
          totalBookings: 0,
          activeBookings: 0,
          pendingPayments: 0,
          totalSpent: 0,
        },
        recentBookings: [],
        activeBookings: [],
        pendingPayments: [],
      };
    }

    // Transform bookings
    const transformedBookings = this.transformBookings(bookings || []);

    // Calculate stats and categorize bookings
    const activeBookings = transformedBookings.filter((b) =>
      ["confirmed", "checked_in"].includes(b.status),
    );

    const pendingPayments = transformedBookings.filter(
      (b) => b.paymentStatus === "pending",
    );

    const totalSpent = transformedBookings.reduce(
      (sum, b) => sum + (b.paymentStatus === "paid" ? b.priceTotal : 0),
      0,
    );

    return {
      stats: {
        totalBookings: transformedBookings.length,
        activeBookings: activeBookings.length,
        pendingPayments: pendingPayments.length,
        totalSpent,
      },
      recentBookings: transformedBookings.slice(0, 5),
      activeBookings,
      pendingPayments,
    };
  }

  /**
   * Get booking detail for user
   * Used: dashboard/user/bookings/[id]/page.tsx
   */
  static async getBookingDetail(
    bookingId: string,
    userId: string,
  ): Promise<BookingDetail | null> {
    const supabase = await createClient();

    // Single query with all needed data
    const { data, error } = await supabase
      .from("bookings_with_courts")
      .select(
        `
        *,
        profile:profiles(full_name, email)
      `,
      )
      .eq("id", bookingId)
      .eq("profile_id", userId)
      .single();

    if (error) {
      console.error("Error fetching booking detail:", error);
      return null;
    }

    return this.transformBookingDetail(data);
  }

  /**
   * Get user's bookings with filtering
   * Used: Potential user booking history page
   */
  static async getUserBookings(
    userId: string,
    options: BookingQueryOptions = {},
  ): Promise<Booking[]> {
    const supabase = await createClient();

    let query = supabase
      .from("bookings_with_courts")
      .select("*")
      .eq("profile_id", userId)
      .order("start_time", { ascending: false });

    // Apply filters
    if (options.status) {
      query = query.eq("status", options.status);
    }

    if (options.paymentStatus) {
      query = query.eq("payment_status", options.paymentStatus);
    }

    if (options.startDate) {
      query = query.gte("start_time", options.startDate);
    }

    if (options.endDate) {
      query = query.lte("start_time", options.endDate);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user bookings:", error);
      return [];
    }

    return this.transformBookings(data || []);
  }

  /**
   * Get recommended courts for user
   * Used: dashboard/user/page.tsx (for recommendations)
   */
  static async getRecommendedCourts(
    userId: string,
    limit: number = 6,
  ): Promise<Court[]> {
    const supabase = await createClient();

    // Get user's booking history to infer preferences
    const { data: userBookings } = await supabase
      .from("bookings_with_courts")
      .select("sport, venue_id")
      .eq("profile_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    // Extract preferred sports and venues
    const preferredSports = [
      ...new Set(userBookings?.map((b) => b.sport) || []),
    ];
    const visitedVenueIds = [
      ...new Set(userBookings?.map((b) => b.venue_id) || []),
    ];

    // Get highly rated courts, prioritizing preferred sports
    let query = supabase
      .from("active_courts")
      .select("*")
      .gte("average_rating", 4)
      .order("average_rating", { ascending: false })
      .limit(limit * 2); // Get more to filter

    // If user has preferred sports, prioritize them
    if (preferredSports.length > 0) {
      query = query.in("sport", preferredSports);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching recommended courts:", error);
      return [];
    }

    // Transform and filter (exclude courts from visited venues if user has many options)
    const allCourts = PublicQueries["transformCourts"](data || []);
    const filteredCourts =
      visitedVenueIds.length > 5
        ? allCourts.filter((court) => !visitedVenueIds.includes(court.venueId))
        : allCourts;

    return filteredCourts.slice(0, limit);
  }

  /**
   * Get user's reviews
   * Used: Potential user profile page
   */
  static async getUserReviews(userId: string): Promise<CourtReview[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("court_reviews")
      .select(
        `
        *,
        court:courts(name, slug, venue_id),
        venue:venues(name)
      `,
      )
      .eq("profile_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reviews:", error);
      return [];
    }

    return this.transformUserReviews(data || []);
  }

  /**
   * Check if user can review a booking
   * Used: dashboard/user/bookings/[id]/page.tsx (review functionality)
   */
  static async canUserReviewBooking(
    bookingId: string,
    userId: string,
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings")
      .select("status, profile_id")
      .eq("id", bookingId)
      .eq("profile_id", userId)
      .single();

    if (error || !data) {
      return false;
    }

    // User can review if booking is completed
    return data.status === "completed";
  }

  // Private transformation methods
  private static transformBookings(data: any[]): Booking[] {
    return data.map((booking) => ({
      id: booking.id,
      courtId: booking.court_id,
      profileId: booking.profile_id,
      startTime: booking.start_time,
      endTime: booking.end_time,
      status: booking.status,
      paymentStatus: booking.payment_status,
      priceTotal: Number(booking.price_total || 0),
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      checkedInAt: booking.checked_in_at,
      completedAt: booking.completed_at,
      paymentCompletedAt: booking.payment_completed_at,
      paymentExpiredAt: booking.payment_expired_at,
      paymentReference: booking.payment_reference,
      paymentToken: booking.payment_token,
      paymentRedirectUrl: booking.payment_redirect_url,
      reviewSubmittedAt: booking.review_submitted_at,
      review: booking.court_review_id
        ? {
            id: booking.court_review_id,
            rating: Number(booking.court_review_rating || 0),
            comment: booking.court_review_comment,
            forumThreadId: booking.court_review_forum_thread_id,
          }
        : undefined,
      court: booking.court_name
        ? {
            id: booking.court_id,
            slug: booking.court_slug,
            name: booking.court_name,
            sport: booking.sport || ("unknown" as any),
            surface: booking.surface || ("hard" as any),
            pricePerHour: Number(booking.price_per_hour || 0),
            capacity: Number(booking.capacity || 1),
            facilities: Array.isArray(booking.facilities)
              ? booking.facilities
              : [],
            description: booking.description || "",
            venueId: booking.venue_id || "",
            venueName: booking.venue_name,
            venueCity: booking.venue_city,
                        venueAddress: booking.venue_address,
            venueLatitude: booking.venue_latitude,
            venueLongitude: booking.venue_longitude,
            primaryImageUrl: booking.primary_image_url,
            averageRating: Number(booking.average_rating || 0),
            reviewCount: Number(booking.review_count || 0),
            totalBookings: Number(booking.total_bookings || 0),
            todayBookings: Number(booking.today_bookings || 0),
            totalRevenue: Number(booking.total_revenue || 0),
            isActive: booking.is_active !== false,
            images: Array.isArray(booking.images) ? booking.images : [],
            reviews: [],
          }
        : undefined,
      customer: booking.profile
        ? {
            id: booking.profile_id,
            fullName: booking.profile.full_name,
            email: booking.profile.email,
          }
        : undefined,
    }));
  }

  private static transformBookingDetail(data: any): BookingDetail | null {
    if (!data) return null;

    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);
    const duration = Math.round(
      (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60),
    );

    return {
      id: data.id,
      courtId: data.court_id,
      profileId: data.profile_id,
      startTime: data.start_time,
      endTime: data.end_time,
      status: data.status,
      paymentStatus: data.payment_status,
      priceTotal: Number(data.price_total || 0),
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      checkedInAt: data.checked_in_at,
      completedAt: data.completed_at,
      paymentCompletedAt: data.payment_completed_at,
      paymentExpiredAt: data.payment_expired_at,
      paymentReference: data.payment_reference,
      paymentToken: data.payment_token,
      paymentRedirectUrl: data.payment_redirect_url,
      reviewSubmittedAt: data.review_submitted_at,
      venueName: data.venue_name,
      // venueAddress: data.venue_address, // Property doesn't exist in BookingDetail
      // venueCity: data.venue_city, // Property doesn't exist in BookingDetail
      courtName: data.court_name,
      sport: data.sport,
      surface: data.surface,
      duration,
      court: data.court_name
        ? {
            id: data.court_id,
            slug: data.court_slug,
            name: data.court_name,
            sport: data.sport || ("unknown" as any),
            surface: data.surface || ("hard" as any),
            pricePerHour: Number(data.price_per_hour || 0),
            capacity: Number(data.capacity || 1),
            facilities: Array.isArray(data.facilities) ? data.facilities : [],
            description: data.description || "",
            venueId: data.venue_id || "",
            venueName: data.venue_name,
            venueCity: data.venue_city,
                        venueAddress: data.venue_address,
            venueLatitude: data.venue_latitude,
            venueLongitude: data.venue_longitude,
            primaryImageUrl: data.primary_image_url,
            averageRating: Number(data.average_rating || 0),
            reviewCount: Number(data.review_count || 0),
            totalBookings: Number(data.total_bookings || 0),
            todayBookings: Number(data.today_bookings || 0),
            totalRevenue: Number(data.total_revenue || 0),
            isActive: data.is_active !== false,
            images: [],
            reviews: [],
          }
        : undefined,
      customer: data.profile
        ? {
            id: data.profile_id,
            fullName: data.profile.full_name,
            email: data.profile.email,
          }
        : undefined,
    };
  }

  private static transformUserReviews(data: any[]): CourtReview[] {
    return data.map((review) => ({
      id: review.id,
      rating: Number(review.rating),
      comment: review.comment,
      author: "You", // User's own reviews
      createdAt: review.created_at,
      bookingId: review.booking_id,
    }));
  }
}
