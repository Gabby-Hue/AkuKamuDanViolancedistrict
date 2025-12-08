// Admin Dashboard Queries - Optimized & No Duplication
// Pages: dashboard/admin/* (page.tsx, applications/page.tsx, settings/page.tsx)

import { createClient } from "@/lib/supabase/server";
import type {
  AdminDashboardData,
  AdminDashboardStats,
  VenuePartnerApplication,
  Venue,
  Court,
  Booking,
  SportType,
} from "./types";

export class AdminQueries {
  /**
   * Get comprehensive admin dashboard data
   * Used: dashboard/admin/page.tsx
   */
  static async getAdminDashboardData(): Promise<AdminDashboardData> {
    const supabase = await createClient();

    try {
      // Get active courts first
      const { data: activeCourts } = await supabase
        .from("courts")
        .select("id")
        .eq("is_active", true);

      const activeCourtIds = activeCourts?.map((c) => c.id) || [];

      // Parallel queries for optimal performance
      const [
        venuesResult,
        usersResult,
        bookingsResult,
        applicationsResult,
        monthlyRevenueResult,
        venueGrowthResult,
        bookingTrendsResult,
      ] = await Promise.all([
        // Total venues
        supabase.from("venues").select("id", { count: "exact" }),
        // Total users
        supabase.from("profiles").select("id", { count: "exact" }),
        // Total bookings (hanya dari courts aktif)
        activeCourtIds.length > 0
          ? supabase
              .from("bookings")
              .select("price_total, start_time, status")
              .in("court_id", activeCourtIds)
          : supabase
              .from("bookings")
              .select("price_total, start_time, status")
              .eq("id", "none"), // Return empty jika tidak ada aktif courts
        // Pending applications with details
        supabase
          .from("venue_partner_applications")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10),
        // Charts data using optimized functions
        supabase.rpc("get_monthly_revenue"),
        supabase.rpc("get_venue_growth"),
        supabase.rpc("get_booking_trends"),
      ]);

      // Process stats
      const stats: AdminDashboardStats = {
        totalVenues: venuesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalBookings:
          bookingsResult.data?.filter(
            (b) => b.status !== "cancelled" && b.status !== "pending",
          ).length || 0,
        totalRevenue:
          bookingsResult.data
            ?.filter((b) => b.status !== "cancelled" && b.status !== "pending")
            .reduce((sum, b) => sum + Number(b.price_total || 0), 0) || 0,
        todayBookings:
          bookingsResult.data?.filter((b) => {
            const bookingDate = new Date(b.start_time)
              .toISOString()
              .split("T")[0];
            return (
              bookingDate === new Date().toISOString().split("T")[0] &&
              b.status !== "cancelled"
            );
          }).length || 0,
        todayRevenue:
          bookingsResult.data
            ?.filter((b) => {
              const bookingDate = new Date(b.start_time)
                .toISOString()
                .split("T")[0];
              return (
                bookingDate === new Date().toISOString().split("T")[0] &&
                b.status === "completed"
              );
            })
            .reduce((sum, b) => sum + Number(b.price_total || 0), 0) || 0,
        pendingApplications: applicationsResult.data?.length || 0,
        averageRating: 0, // Would need additional query
        totalCourts: 0, // Would need additional query
      };

      // Get top venues and courts count
      const { data: topVenuesData } = await supabase
        .from("venue_stats")
        .select(
          "venue_id, venue_name, venue_city, total_bookings, total_revenue",
        )
        .order("total_revenue", { ascending: false })
        .limit(5);

      const topVenues = (topVenuesData || []).map((venue) => ({
        venueId: venue.venue_id,
        venueName: venue.venue_name,
        city: venue.venue_city || "Unknown",
        bookings: Number(venue.total_bookings || 0),
        revenue: Number(venue.total_revenue || 0),
      }));

      // Get total courts count
      const { count: totalCourts } = await supabase
        .from("courts")
        .select("*", { count: "exact", head: true });

      stats.totalCourts = totalCourts || 0;

      // Get average rating from active courts
      const { data: ratingData } = await supabase
        .from("active_courts")
        .select("average_rating")
        .gt("average_rating", 0);

      if (ratingData && ratingData.length > 0) {
        stats.averageRating =
          ratingData.reduce(
            (sum, court) => sum + Number(court.average_rating || 0),
            0,
          ) / ratingData.length;
      }

      // Transform applications
      const pendingApplications = (applicationsResult.data || []).map(
        (app) => ({
          id: app.id,
          organizationName: app.organization_name,
          contactName: app.contact_name,
          contactEmail: app.contact_email,
          contactPhone: app.contact_phone,
          city: app.city,
          existingSystem: app.existing_system,
          notes: app.notes,
          status: app.status as "pending" | "accepted" | "rejected",
          handledBy: app.handled_by,
          createdAt: app.created_at,
          reviewedAt: app.reviewed_at,
        }),
      );

      return {
        stats,
        charts: {
          monthlyRevenue: (monthlyRevenueResult.data || []).map(
            (item: any) => ({
              month: item.month,
              revenue: Number(item.revenue || 0),
            }),
          ),
          venueGrowth: (venueGrowthResult.data || []).map((item: any) => ({
            month: item.month,
            totalVenues: Number(item.total_venues || 0),
          })),
          bookingTrends: (bookingTrendsResult.data || []).map((item: any) => ({
            date: item.date,
            bookings: Number(item.bookings || 0),
          })),
          lastUpdated: new Date().toISOString(),
        },
        topVenues,
        pendingApplications,
      };
    } catch (error) {
      console.error("Error fetching admin dashboard data:", error);

      // Return empty data structure
      return {
        stats: {
          totalVenues: 0,
          totalUsers: 0,
          totalBookings: 0,
          totalRevenue: 0,
          todayBookings: 0,
          todayRevenue: 0,
          pendingApplications: 0,
          averageRating: 0,
          totalCourts: 0,
        },
        charts: {
          monthlyRevenue: [],
          venueGrowth: [],
          bookingTrends: [],
          lastUpdated: new Date().toISOString(),
        },
        topVenues: [],
        pendingApplications: [],
      };
    }
  }

  /**
   * Get all venue partner applications with filtering
   * Used: dashboard/admin/applications/page.tsx
   */
  static async getVenuePartnerApplications(
    options: {
      status?: "pending" | "accepted" | "rejected";
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{
    allApplications: VenuePartnerApplication[];
    pending: VenuePartnerApplication[];
    accepted: VenuePartnerApplication[];
    rejected: VenuePartnerApplication[];
  }> {
    const supabase = await createClient();

    let query = supabase
      .from("venue_partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply status filter
    if (options.status) {
      query = query.eq("status", options.status);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching venue partner applications:", error);
      return {
        allApplications: [],
        pending: [],
        accepted: [],
        rejected: [],
      };
    }

    const allApplications = (data || []).map((app) => ({
      id: app.id,
      organizationName: app.organization_name,
      contactName: app.contact_name,
      contactEmail: app.contact_email,
      contactPhone: app.contact_phone,
      city: app.city,
      facilityTypes: Array.isArray(app.facility_types)
        ? app.facility_types
        : [],
      facilityCount: app.facility_count,
      existingSystem: app.existing_system,
      notes: app.notes,
      status: app.status as "pending" | "accepted" | "rejected",
      handledBy: app.handled_by,
      decisionNote: app.decision_note,
      createdAt: app.created_at,
      reviewedAt: app.reviewed_at,
    }));

    // Filter by status if not already filtered
    const pending =
      options.status === "pending"
        ? allApplications
        : allApplications.filter((app) => app.status === "pending");
    const accepted =
      options.status === "accepted"
        ? allApplications
        : allApplications.filter((app) => app.status === "accepted");
    const rejected =
      options.status === "rejected"
        ? allApplications
        : allApplications.filter((app) => app.status === "rejected");

    return {
      allApplications,
      pending,
      accepted,
      rejected,
    };
  }

  /**
   * Update application status
   * Used: dashboard/admin/applications/page.tsx (approval/rejection)
   */
  static async updateApplicationStatus(
    applicationId: string,
    status: "accepted" | "rejected",
    handledBy: string,
    decisionNote?: string,
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const updateData: any = {
      status,
      handled_by: handledBy,
      reviewed_at: new Date().toISOString(),
    };

    if (decisionNote) {
      updateData.decision_note = decisionNote;
    }

    const { error } = await supabase
      .from("venue_partner_applications")
      .update(updateData)
      .eq("id", applicationId);

    if (error) {
      return {
        success: false,
        error: "Failed to update application status",
      };
    }

    return { success: true };
  }

  /**
   * Get detailed application
   * Used: dashboard/admin/applications/page.tsx (detail view)
   */
  static async getApplicationDetail(
    applicationId: string,
  ): Promise<VenuePartnerApplication | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("venue_partner_applications")
      .select(
        `
        *,
        handler:profiles(full_name, email)
      `,
      )
      .eq("id", applicationId)
      .single();

    if (error || !data) {
      console.error("Error fetching application detail:", error);
      return null;
    }

    return {
      id: data.id,
      organizationName: data.organization_name,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      city: data.city,
      existingSystem: data.existing_system,
      notes: data.notes,
      status: data.status as "pending" | "accepted" | "rejected",
      handledBy: data.handled_by,
      createdAt: data.created_at,
      reviewedAt: data.reviewed_at,
    };
  }

  /**
   * Get venues statistics
   * Used: Potential admin analytics page
   */
  static async getVenuesStats(): Promise<Venue[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("venue_stats")
      .select("*")
      .order("total_bookings", { ascending: false });

    if (error) {
      console.error("Error fetching venues stats:", error);
      return [];
    }

    return (data || []).map((venue) => ({
      id: venue.venue_id,
      slug:
        venue.slug ||
        `${venue.venue_name.toLowerCase().replace(/\s+/g, "-")}-${venue.venue_id.slice(0, 6)}`,
      name: venue.venue_name,
      city: venue.venue_city,
      address: undefined, // Not in current view
      latitude: venue.venue_latitude,
      longitude: venue.venue_longitude,
      description: undefined, // Not in current view
      ownerProfileId: venue.owner_profile_id,
      contactPhone: undefined, // Not in current view
      contactEmail: undefined, // Not in current view
      venueStatus: venue.venue_status as "active" | "inactive",
      totalCourts: Number(venue.total_courts || 0),
      totalBookings: Number(venue.total_bookings || 0),
      todayBookings: Number(venue.today_bookings || 0),
      totalRevenue: Number(venue.total_revenue || 0),
      todayRevenue: Number(venue.today_revenue || 0),
      averageRating: Number(venue.average_rating || 0),
      verifiedAt: undefined, // Not in current view
      createdAt: venue.created_at,
    }));
  }

  /**
   * Get recent bookings
   * Used: Potential admin monitoring page
   */
  static async getRecentBookings(limit: number = 50): Promise<Booking[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("bookings_with_courts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent bookings:", error);
      return [];
    }

    return this.transformBookings(data || []);
  }

  // Private transformation method
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
      court: booking.court_name
        ? {
            id: booking.court_id,
            slug: booking.court_id, // Temporary slug
            name: booking.court_name,
            sport: "unknown" as SportType,
            pricePerHour: 0,
            facilities: [],
            venueId: booking.venue_id || "",
            venueName: booking.venue_name,
            venueCity: booking.venue_city,
            averageRating: 0,
            reviewCount: 0,
            totalBookings: 0,
            todayBookings: 0,
            totalRevenue: 0,
            isActive: true,
            images: [],
            reviews: [],
          }
        : undefined,
    }));
  }
}
