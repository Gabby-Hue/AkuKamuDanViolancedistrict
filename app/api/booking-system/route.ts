import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";
import { fetchUserDashboardData } from "@/lib/supabase/queries/bookings";
import { fetchVenueDashboardData } from "@/lib/supabase/queries/bookings";

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "user";

    let dashboardData;

    if (type === "venue") {
      // Check if user is venue partner
      const { data: venueCheck } = await supabase
        .from("venues")
        .select("id")
        .eq("owner_profile_id", profile.id)
        .limit(1);

      if (!venueCheck || venueCheck.length === 0) {
        return NextResponse.json(
          {
            error: "Access denied",
            message: "You don't have venue partner permissions"
          },
          { status: 403 }
        );
      }

      dashboardData = await fetchVenueDashboardData({
        id: profile.id,
        full_name: profile.fullName,
        email: profile.email,
      });
    } else {
      // Default: user dashboard
      dashboardData = await fetchUserDashboardData({
        id: profile.id,
        full_name: profile.fullName,
        email: profile.email,
      });
    }

    // Get booking stats
    const now = new Date().toISOString();

    const [
      totalBookingsResult,
      upcomingBookingsResult,
      completedBookingsResult,
      cancelledBookingsResult,
    ] = await Promise.all([
      // Total bookings for user
      supabase
        .from("bookings")
        .select("id, status, payment_status, price_total")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(10),

      // Upcoming bookings
      supabase
        .from("bookings")
        .select("id, start_time, end_time, status, court:courts(name, venue:venues(name))")
        .eq("profile_id", profile.id)
        .gte("start_time", now)
        .in("status", ["pending", "confirmed"])
        .order("start_time", { ascending: true })
        .limit(5),

      // Completed bookings
      supabase
        .from("bookings")
        .select("id, start_time, court:courts(name), court_reviews(rating)")
        .eq("profile_id", profile.id)
        .eq("status", "completed")
        .order("start_time", { ascending: false })
        .limit(5),

      // Cancelled bookings count
      supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("profile_id", profile.id)
        .eq("status", "cancelled"),
    ]);

    const totalBookings = totalBookingsResult.data || [];
    const upcomingBookings = upcomingBookingsResult.data || [];
    const completedBookings = completedBookingsResult.data || [];
    const cancelledCount = cancelledBookingsResult.data?.length || 0;

    // Calculate statistics
    const stats = {
      total: totalBookings.length,
      upcoming: upcomingBookings.length,
      completed: completedBookings.length,
      cancelled: cancelledCount,
      totalSpent: totalBookings
        .filter(b => b.status === 'completed' && b.payment_status === 'paid')
        .reduce((sum, b) => sum + Number(b.price_total || 0), 0),
      averageRating: completedBookings.length > 0
        ? completedBookings.reduce((sum, b) => {
            const rating = b.court_reviews?.[0]?.rating || 0;
            return sum + Number(rating);
          }, 0) / completedBookings.filter(b => b.court_reviews?.[0]?.rating).length
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role,
        },
        dashboard: dashboardData,
        stats,
        recentBookings: totalBookings.slice(0, 5).map(booking => ({
          id: booking.id,
          status: booking.status,
          payment_status: booking.payment_status,
          price_total: Number(booking.price_total || 0),
        })),
        upcomingBookings: upcomingBookings.map(booking => ({
          id: booking.id,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          court: booking.court,
        })),
        completedBookings: completedBookings.map(booking => ({
          id: booking.id,
          start_time: booking.start_time,
          court: booking.court,
          rating: booking.court_reviews?.[0]?.rating || null,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching booking system data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch booking system data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for booking system
export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Test database connection
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", profile.id)
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Test booking access
    const { data: bookingTest, error: bookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("profile_id", profile.id)
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "Booking system is operational",
      health: {
        database: "connected",
        bookings: bookingError ? "error" : "accessible",
        profile: data ? "loaded" : "not_found",
      },
      user: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.email,
      },
      system_info: {
        timestamp: new Date().toISOString(),
        booking_count: bookingTest?.length || 0,
      },
    });
  } catch (error) {
    console.error("Booking system health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Booking system health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}