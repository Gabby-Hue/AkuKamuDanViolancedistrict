import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
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
import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { getAdminDashboardData, type AdminDashboardData } from "@/lib/supabase/queries/dashboard";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminRevenueChart } from "@/components/admin-revenue-chart";
import { AdminVenueGrowthChart } from "@/components/admin-venue-growth-chart";
import { AdminBookingTrendChart } from "@/components/admin-booking-trend-chart";

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  let dashboardData: AdminDashboardData;
  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
    // Fallback data if database query fails
    dashboardData = {
      metrics: {
        totalVenues: 0,
        totalCourts: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingApplications: 0,
      },
      revenueTrend: [],
      sportBreakdown: [],
      venueLeaders: [],
      partnerApplications: {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        recent: [],
      },
    };
  }

  const displayName = identity?.fullName ?? profile.full_name ?? "Admin";
  const email = identity?.email ?? "admin@courtease.id";
  const avatarUrl = null;

  const navMain: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: "LayoutDashboard",
      isActive: true,
    },
    {
      title: "Applications",
      url: "/dashboard/admin/applications",
      icon: "FileCheck",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/admin/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = [
    {
      id: "admin",
      name: "Courtease Admin",
      description: "Panel administrasi",
      icon: "ShieldCheck",
    },
  ];

  // Prepare chart data
  const revenueChartData = dashboardData.revenueTrend.slice(-6).map((item, index) => ({
    month: new Date(item.date).toLocaleDateString('id-ID', { month: 'short' }),
    revenue: Math.round(item.revenue / 1000000), // Convert to millions
  }));

  const venueGrowthData = [
    { month: "Jan", venues: Math.max(0, dashboardData.metrics.totalVenues - 36) },
    { month: "Feb", venues: Math.max(0, dashboardData.metrics.totalVenues - 30) },
    { month: "Mar", venues: Math.max(0, dashboardData.metrics.totalVenues - 21) },
    { month: "Apr", venues: Math.max(0, dashboardData.metrics.totalVenues - 14) },
    { month: "Mei", venues: Math.max(0, dashboardData.metrics.totalVenues - 7) },
    { month: "Jun", venues: dashboardData.metrics.totalVenues },
  ];

  const bookingTrendData = dashboardData.revenueTrend.slice(-7).map((item) => ({
    date: new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short' }).substring(0, 3),
    bookings: item.bookings,
  }));

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
                  <BreadcrumbLink href="/dashboard/admin">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin Overview</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          </div>

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.metrics.totalVenues}</div>
                  <p className="text-xs text-muted-foreground">{dashboardData.metrics.totalCourts} lapangan</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.metrics.totalUsers.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.metrics.totalBookings.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {(dashboardData.metrics.totalRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">Total revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <AdminRevenueChart
                data={revenueChartData.length > 0 ? revenueChartData : [
                  { month: "Jan", revenue: 0 },
                  { month: "Feb", revenue: 0 },
                  { month: "Mar", revenue: 0 },
                  { month: "Apr", revenue: 0 },
                  { month: "Mei", revenue: 0 },
                  { month: "Jun", revenue: 0 },
                ]}
              />
              <AdminVenueGrowthChart data={venueGrowthData} />
            </div>

            {/* Booking Trend Chart */}
            <AdminBookingTrendChart
              data={bookingTrendData.length > 0 ? bookingTrendData : [
                { date: "Sen", bookings: 0 },
                { date: "Sel", bookings: 0 },
                { date: "Rab", bookings: 0 },
                { date: "Kam", bookings: 0 },
                { date: "Jum", bookings: 0 },
                { date: "Sab", bookings: 0 },
                { date: "Min", bookings: 0 },
              ]}
            />

            {/* Bottom Row */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Top Venues */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 5 Venue</CardTitle>
                  <CardDescription>Venue dengan performa tertinggi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.venueLeaders.length > 0 ? dashboardData.venueLeaders.slice(0, 5).map((venue, index) => (
                      <div key={venue.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{venue.name}</h4>
                            <p className="text-sm text-muted-foreground">{venue.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{venue.bookingCount} booking</div>
                          <div className="text-sm text-muted-foreground">Rp {venue.revenue.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada data venue tersedia
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card>
                <CardHeader>
                  <CardTitle>Applications Terbaru</CardTitle>
                  <CardDescription>{dashboardData.partnerApplications.pending} pending applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.partnerApplications.recent.length > 0 ? dashboardData.partnerApplications.recent.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium">{application.businessName || application.fullName}</div>
                          <div>
                            <h4 className="font-medium">{application.fullName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(application.submittedAt).toLocaleDateString('id-ID')} • {application.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              application.status === "accepted" ? "default" :
                              application.status === "rejected" ? "destructive" :
                              "secondary"
                            }
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Belum ada aplikasi partner baru
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}