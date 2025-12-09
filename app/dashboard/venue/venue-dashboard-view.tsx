"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueBarChart } from "@/components/revenue-bar-chart";
import { BookingLineChart } from "@/components/booking-line-chart";
import {
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  refreshVenueStatsAction,
  refreshChartDataAction,
} from "./venue-actions";
import type { VenueStatsData } from "./direct-stats-fetcher";

interface VenueDashboardClientProps {
  profile: any;
  identity: any;
  venues: any[];
  revenueData: any;
  venueStats: {
    stats: {
      totalRevenue: number;
      todayRevenue: number;
      totalBookings: number;
      todayBookings: number;
      confirmedBookings: number;
      pendingBookings: number;
      cancelledBookings: number;
      averageRating: number;
      totalCourts: number;
    };
    courts: any[];
    topCourts: any[];
  };
}

export default function VenueDashboardView({
  profile,
  identity,
  venues,
  revenueData,
  venueStats,
}: VenueDashboardClientProps) {
  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";

  const navMain: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard/venue",
      icon: "LayoutDashboard",
      isActive: true,
    },
    {
      title: "Lapangan Saya",
      url: "/dashboard/venue/courts",
      icon: "Building2",
    },
    {
      title: "Jadwal & Booking",
      url: "/dashboard/venue/bookings",
      icon: "CalendarClock",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = venues.length
    ? venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        description: venue.city || null,
        icon: "MapPin",
      }))
    : [
        {
          id: "placeholder",
          name: "Venue belum tersedia",
        },
      ];

  // Real-time statistics state
  const [realTimeStats, setRealTimeStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(
    venues.length > 0 ? venues[0].id : null,
  );

  // Chart data state
  const [chartData, setChartData] = useState<any>(null);

  // Fetch real-time stats from API when venue changes or manual refresh
  useEffect(() => {
    if (selectedVenue) {
      fetchRealTimeStats();
    }
  }, [selectedVenue]);

  // Initialize chart data when revenue data changes or venue changes
  useEffect(() => {
    if (selectedVenue) {
      fetchChartData();
    }
  }, [selectedVenue, revenueData]);

  // Fetch chart data using direct queries
  const fetchChartData = async () => {
    if (!selectedVenue) return;

    try {
      // Use server action with direct queries instead of using revenueData
      const { monthly, trends } = await refreshChartDataAction(selectedVenue);

      // Prepare monthly chart data (convert to millions)
      const monthlyData = monthly.map((item: any) => ({
        month: item.month,
        revenue: item.revenue,
        bookingCount: item.bookingCount,
      }));

      // Prepare booking trends data
      const trendsData = trends.map((item: any) => ({
        date: item.date,
        bookings: item.bookings,
        fullDate: item.fullDate,
      }));

      setChartData({
        monthly: monthlyData,
        trends: trendsData,
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      // Fallback to original revenueData if available
      if (revenueData) {
        const monthlyData =
          revenueData.monthlyRevenue?.map((item: any) => ({
            month: item.month,
            revenue: item.revenue / 1000000,
          })) || [];

        const trendsData =
          revenueData.bookingTrends?.map((item: any) => ({
            date: item.date,
            bookings: item.bookings,
          })) || [];

        setChartData({
          monthly: monthlyData,
          trends: trendsData,
        });
      }
    }
  };

  // Fetch real-time statistics using direct queries
  const fetchRealTimeStats = async () => {
    if (!selectedVenue) return;

    try {
      setLoading(true);

      // Use server action with direct queries instead of API call
      const result = await refreshVenueStatsAction(selectedVenue);
      setRealTimeStats(result);
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
      setRealTimeStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Get display stats (use server data as fallback)
  const displayStats = realTimeStats?.venueStats || venueStats.stats;
  const displayCourts = realTimeStats?.courtStats || venueStats.courts;
  const displayTopCourts = venueStats.topCourts;

  // Prepare chart data from dashboard data
  const monthlyChartData = chartData?.monthly || [];
  const bookingTrendsData = chartData?.trends || [];

  // If no venue data, show empty state
  if (!venues.length) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={{ name: displayName, email }}
          teams={teams}
          navMain={navMain}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/venue">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Ringkasan Venue</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto mr-4">
              <ModeToggle />
            </div>
          </header>

          <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Venue</h3>
              <p className="text-sm">
                Anda belum memiliki venue. Silakan tambahkan venue terlebih
                dahulu.
              </p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        teams={teams}
        navMain={navMain}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/venue">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Ringkasan Venue</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          </div>

          <div className="space-y-6">
            {/* Main Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pendapatan
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {displayStats.totalRevenue.toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    6 bulan terakhir
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Booking
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.totalBookings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    6 bulan terakhir
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Booking Hari Ini
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {displayStats.todayBookings}
                  </div>
                  <p className="text-xs text-muted-foreground">Hari ini</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendapatan Hari Ini
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {displayStats.todayRevenue.toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dari {displayStats.todayBookings} booking
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue Chart */}
              <RevenueBarChart
                data={
                  monthlyChartData.length > 0
                    ? monthlyChartData
                    : [
                        { month: "Jan", revenue: 0 },
                        { month: "Feb", revenue: 0 },
                        { month: "Mar", revenue: 0 },
                        { month: "Apr", revenue: 0 },
                        { month: "Mei", revenue: 0 },
                        { month: "Jun", revenue: 0 },
                      ]
                }
              />

              {/* Top Courts */}
              <Card>
                <CardHeader>
                  <CardTitle>Lapangan Terpopuler</CardTitle>
                  <CardDescription>
                    5 lapangan dengan booking terbanyak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayTopCourts.length > 0 ? (
                      displayTopCourts
                        .sort(
                          (a: any, b: any) => b.totalRevenue - a.totalRevenue,
                        )
                        .slice(0, 5)
                        .map((court: any, index: number) => (
                          <div key={court.id} className="flex items-center">
                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {court.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {court.totalBookings} booking
                              </p>
                            </div>
                            <div className="ml-auto font-medium">
                              Rp {court.totalRevenue.toLocaleString("id-ID")}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Belum ada data booking
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Trends Chart */}
            <BookingLineChart
              data={
                bookingTrendsData.length > 0
                  ? bookingTrendsData
                  : [
                      { date: "Minggu", bookings: 0 },
                      { date: "Senin", bookings: 0 },
                      { date: "Selasa", bookings: 0 },
                      { date: "Rabu", bookings: 0 },
                      { date: "Kamis", bookings: 0 },
                      { date: "Jumat", bookings: 0 },
                      { date: "Sabtu", bookings: 0 },
                    ]
              }
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
