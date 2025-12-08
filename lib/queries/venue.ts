// Venue Dashboard Queries - Optimized & No Duplication
// Pages: dashboard/venue/* (page.tsx, bookings/page.tsx, courts/*, settings/page.tsx)

import { createClient } from "@/lib/supabase/server";
import type {
  Venue,
  Court,
  Booking,
  VenueDashboardData,
  BookingQueryOptions,
  CourtQueryOptions,
} from "./types";

export class VenueQueries {
  /**
   * Get venue dashboard data - single optimized query for all venue pages
   * Used: ALL venue dashboard pages (main, bookings, courts, settings)
   */
  static async getVenueDashboardData(
    userId: string,
  ): Promise<VenueDashboardData> {
    const supabase = await createClient();

    // Get venue(s) for this venue partner with complete information
    const { data: venues, error: venuesError } = await supabase
      .from("venues")
      .select("*")
      .eq("owner_profile_id", userId)
      .eq("venue_status", "active");

    
    if (venuesError || !venues || venues.length === 0) {
      console.error("Error fetching venue data:", venuesError);
      return {
        venue: {} as Venue,
        courts: [],
        stats: {
          totalCourts: 0,
          totalBookings: 0,
          todayBookings: 0,
          todayRevenue: 0,
          totalRevenue: 0,
          averageRating: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        },
        topCourts: [],
      };
    }

    // Use first venue as current venue (or allow venue selection)
    const currentVenue = venues[0];

    // Get courts for current venue using optimized active_courts view
    // But we'll calculate our own revenue to ensure consistency with charts
    const { data: courts, error: courtsError } = await supabase
      .from("active_courts")
      .select("*")
      .eq("venue_id", currentVenue.id);

    if (courtsError) {
      console.error("Error fetching courts:", courtsError);
      return {
        venue: this.transformVenue(currentVenue),
        courts: [],
        stats: {
          totalCourts: Number(currentVenue.total_courts || 0),
          totalBookings: Number(currentVenue.total_bookings || 0),
          todayBookings: Number(currentVenue.today_bookings || 0),
          todayRevenue: Number(currentVenue.today_revenue || 0),
          totalRevenue: Number(currentVenue.total_revenue || 0),
          averageRating: Number(currentVenue.average_rating || 0),
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        },
        topCourts: [],
      };
    }

    // Transform courts with consistent revenue calculation
    // We need to get actual revenue data that matches chart logic (completed + paid)
    const courtIds = (courts || []).map(c => c.id);

    let courtRevenues: { [courtId: string]: { totalRevenue: number; todayRevenue: number; totalBookings: number; todayBookings: number } } = {};

    if (courtIds.length > 0) {
      // Get actual revenue data for consistency with charts
      const { data: revenueData } = await supabase
        .from("bookings")
        .select("court_id, price_total, status, payment_status, start_time")
        .in("court_id", courtIds)
        .eq("status", "completed")
        .eq("payment_status", "paid");

      const today = new Date().toISOString().split("T")[0];

      courtRevenues = courtIds.reduce((acc, courtId) => {
        acc[courtId] = { totalRevenue: 0, todayRevenue: 0, totalBookings: 0, todayBookings: 0 };
        return acc;
      }, {} as { [courtId: string]: { totalRevenue: number; todayRevenue: number; totalBookings: number; todayBookings: number } });

      revenueData?.forEach(booking => {
        const revenue = Number(booking.price_total || 0);
        const isToday = booking.start_time?.startsWith(today);

        if (courtRevenues[booking.court_id]) {
          courtRevenues[booking.court_id].totalRevenue += revenue;
          courtRevenues[booking.court_id].totalBookings += 1;
          if (isToday) {
            courtRevenues[booking.court_id].todayRevenue += revenue;
            courtRevenues[booking.court_id].todayBookings += 1;
          }
        }
      });
    }

    const transformedCourts = (courts || []).map((court) => {
      const revenues = courtRevenues[court.id] || { totalRevenue: 0, todayRevenue: 0, totalBookings: 0, todayBookings: 0 };

      return {
        id: court.id,
        slug: court.slug,
        name: court.name,
        sport: court.sport,
        surface: court.surface,
        pricePerHour: Number(court.price_per_hour || 0),
        capacity: court.capacity,
        facilities: Array.isArray(court.facilities) ? court.facilities : [],
        description: court.description,
        venueId: court.venue_id,
        venueName: court.venue_name,
        venueCity: court.venue_city,
                venueLatitude: court.venue_latitude,
        venueLongitude: court.venue_longitude,
        averageRating: Number(court.average_rating || 0),
        reviewCount: Number(court.review_count || 0),
        primaryImageUrl: court.primary_image_url,
        images: [],
        reviews: [],
        totalBookings: revenues.totalBookings,
        todayBookings: revenues.todayBookings,
        totalRevenue: revenues.totalRevenue,
        todayRevenue: revenues.todayRevenue,
        isActive: true, // active_courts view only returns active courts
      };
    });

    // Calculate consistent stats that match our court-level calculations
    const venueTotalRevenue = transformedCourts.reduce((sum, court) => sum + court.totalRevenue, 0);
    const venueTodayRevenue = transformedCourts.reduce((sum, court) => sum + court.todayRevenue, 0);
    const venueTotalBookings = transformedCourts.reduce((sum, court) => sum + court.totalBookings, 0);
    const venueTodayBookings = transformedCourts.reduce((sum, court) => sum + court.todayBookings, 0);

    const stats = {
      totalCourts: transformedCourts.length,
      totalBookings: venueTotalBookings,
      todayBookings: venueTodayBookings,
      todayRevenue: venueTodayRevenue,
      totalRevenue: venueTotalRevenue,
      averageRating: Number(currentVenue.average_rating || 0),
      confirmedBookings: venueTotalBookings, // Using completed + paid as confirmed
      pendingBookings: 0, // Would need additional query if needed
      cancelledBookings: 0, // Would need additional query if needed
    };

    // Get top courts by revenue (consistent with our calculation)
    const topCourts = [...transformedCourts]
      .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
      .slice(0, 5);

    return {
      venue: this.transformVenue(currentVenue),
      courts: transformedCourts,
      stats,
      topCourts,
    };
  }

  /**
   * Get venue bookings with filtering
   * Used: dashboard/venue/bookings/page.tsx
   */
  static async getVenueBookings(
    userId: string,
    venueId: string,
    options: BookingQueryOptions = {},
  ): Promise<Booking[]> {
    const supabase = await createClient();

    // Verify venue ownership
    const { data: venueCheck } = await supabase
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .eq("owner_profile_id", userId)
      .single();

    if (!venueCheck) {
      console.error("Access denied: Venue not found or access denied");
      return [];
    }

    // Get bookings for this venue with customer and court details
    let query = supabase
      .from("venue_bookings_with_details")
      .select("*")
      .eq("venue_id", venueId)
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
      console.error("Error fetching venue bookings:", error);
      return [];
    }

    return this.transformBookings(data || []);
  }

  /**
   * Get venue courts with filtering
   * Used: dashboard/venue/courts/page.tsx
   */
  static async getVenueCourts(
    userId: string,
    venueId: string,
    options: CourtQueryOptions = {},
  ): Promise<Court[]> {
    const supabase = await createClient();

    // Verify venue ownership
    const { data: venueCheck } = await supabase
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .eq("owner_profile_id", userId)
      .single();

    if (!venueCheck) {
      console.error("Access denied: Venue not found or access denied");
      return [];
    }

    // Get courts for this venue (including inactive ones) with statistics
    let query = supabase
      .from("all_courts_with_stats")
      .select("*")
      .eq("venue_id", venueId);

    // Apply filters
    if (options.sport) {
      query = query.eq("sport", options.sport);
    }

    if (options.minRating) {
      query = query.gte("average_rating", options.minRating);
    }

    if (options.maxPrice) {
      query = query.lte("price_per_hour", options.maxPrice);
    }

    // Apply sorting
    const sortField =
      options.sortBy === "rating"
        ? "average_rating"
        : options.sortBy === "price"
          ? "price_per_hour"
          : options.sortBy === "bookings"
            ? "total_bookings"
            : options.sortBy === "revenue"
              ? "total_revenue"
              : "name";

    query = query.order(sortField, {
      ascending: options.sortOrder === "asc",
    });

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
      console.error("Error fetching venue courts:", error);
      return [];
    }

    return this.transformCourts(data || []);
  }

  /**
   * Get court for editing
   * Used: dashboard/venue/courts/edit/[id]/page.tsx
   */
  static async getCourtForEdit(
    courtId: string,
    userId: string,
  ): Promise<Court | null> {
    const supabase = await createClient();

    // Single query with ownership verification
    const { data, error } = await supabase
      .from("active_courts")
      .select("*")
      .eq("id", courtId)
      .single();

    if (error || !data) {
      console.error("Error fetching court for edit:", error);
      return null;
    }

    // Verify venue ownership
    const { data: venueCheck } = await supabase
      .from("venues")
      .select("id")
      .eq("id", data.venue_id)
      .eq("owner_profile_id", userId)
      .single();

    if (!venueCheck) {
      console.error("Access denied: Court not found or access denied");
      return null;
    }

    return this.transformCourt(data);
  }

  /**
   * Update venue settings
   * Used: dashboard/venue/settings/page.tsx
   */
  static async updateVenueSettings(
    userId: string,
    venueId: string,
    settings: Partial<Venue>,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify ownership
    const { data: venueCheck } = await supabase
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .eq("owner_profile_id", userId)
      .single();

    if (!venueCheck) {
      return {
        success: false,
        error: "Access denied: Venue not found or access denied",
      };
    }

    // Update venue
    const { error } = await supabase
      .from("venues")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("id", venueId);

    if (error) {
      return {
        success: false,
        error: "Failed to update venue settings",
      };
    }

    return { success: true };
  }

  /**
   * Get venue settings
   * Used: dashboard/venue/settings/page.tsx
   */
  static async getVenueSettings(
    userId: string,
    venueId: string,
  ): Promise<Venue | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("id", venueId)
      .eq("owner_profile_id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching venue settings:", error);
      return null;
    }

    return this.transformVenue(data);
  }

  // Private transformation methods
  private static transformVenue(data: any): Venue {
    return {
      id: data.id,
      slug:
        data.slug ||
        `${(data.name || "").toLowerCase().replace(/\s+/g, "-")}-${data.id?.slice(0, 6) || "unknown"}`,
      name: data.name,
      city: data.city,
      address: data.address || "",
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description || "",
      ownerProfileId: data.owner_profile_id,
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      venueStatus: data.venue_status as "active" | "inactive" || "inactive",
      totalCourts: Number(data.total_courts || 0),
      totalBookings: Number(data.total_bookings || 0),
      todayBookings: Number(data.today_bookings || 0),
      totalRevenue: Number(data.total_revenue || 0),
      todayRevenue: Number(data.today_revenue || 0),
      averageRating: Number(data.average_rating || 0),
      verifiedAt: data.verified_at,
      createdAt: data.created_at,
    };
  }

  private static transformCourts(data: any[]): Court[] {
    return data.map((court) => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour || 0),
      capacity: court.capacity,
      facilities: Array.isArray(court.facilities) ? court.facilities : [],
      description: court.description,
      venueId: court.venue_id,
      venueName: court.venue_name,
      venueCity: court.venue_city,
      venueLatitude: court.venue_latitude,
      venueLongitude: court.venue_longitude,
      averageRating: Number(court.average_rating || 0),
      reviewCount: Number(court.review_count || 0),
      primaryImageUrl: court.primary_image_url,
      images: court.images || [],
      reviews: [],
      totalBookings: Number(court.total_bookings || 0),
      todayBookings: Number(court.today_bookings || 0),
      totalRevenue: Number(court.total_revenue || 0),
      todayRevenue: Number(court.today_revenue || 0),
      isActive: court.is_active ?? true, // Use actual is_active field from database
    }));
  }

  private static transformCourt(data: any): Court {
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      sport: data.sport,
      surface: data.surface,
      pricePerHour: Number(data.price_per_hour || 0),
      capacity: data.capacity,
      facilities: Array.isArray(data.facilities) ? data.facilities : [],
      description: data.description,
      venueId: data.venue_id,
      venueName: data.venue_name,
      venueCity: data.venue_city,
            venueLatitude: data.venue_latitude,
      venueLongitude: data.venue_longitude,
      averageRating: Number(data.average_rating || 0),
      reviewCount: Number(data.review_count || 0),
      primaryImageUrl: data.primary_image_url,
      images: data.images || [],
      reviews: data.reviews || [],
      totalBookings: Number(data.total_bookings || 0),
      todayBookings: Number(data.today_bookings || 0),
      totalRevenue: Number(data.total_revenue || 0),
      isActive: data.is_active ?? true,
    };
  }

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
      customer: booking.customer_full_name
        ? {
            id: booking.profile_id,
            fullName: booking.customer_full_name,
            email: booking.customer_email || "",
          }
        : {
            id: booking.profile_id,
            fullName: "Unknown Customer",
            email: "",
          },
      court: booking.court_name
        ? {
            id: booking.court_id,
            slug: booking.court_slug || `court-${booking.court_id}`,
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
            venueLatitude: booking.venue_latitude,
            venueLongitude: booking.venue_longitude,
            primaryImageUrl: booking.primary_image_url,
            averageRating: 0, // Not available in venue_bookings_with_details view
            reviewCount: 0, // Not available in venue_bookings_with_details view
            totalBookings: 0, // Not available in venue_bookings_with_details view
            todayBookings: 0, // Not available in venue_bookings_with_details view
            totalRevenue: 0, // Not available in venue_bookings_with_details view
            isActive: true, // Default to true since this is for active bookings
            images: [],
            reviews: [],
          }
        : undefined,
    }));
  }
}
