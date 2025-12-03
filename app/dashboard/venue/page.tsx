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
import {
  fetchVenueDashboardData,
  fetchVenueRevenueData,
} from "@/lib/supabase/queries";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import type { NavProject } from "@/components/nav-projects";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueBarChart } from "@/components/revenue-bar-chart";
import { BookingLineChart } from "@/components/booking-line-chart";

export const dynamic = "force-dynamic";

export default async function Page() {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();
  const dashboardData = await fetchVenueDashboardData(profile);
  const revenueData = await fetchVenueRevenueData(profile);

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const avatarUrl = null;

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
      title: "Blackout Schedule",
      url: "/dashboard/venue/blackout",
      icon: "CalendarX",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = (
    dashboardData.venues.length
      ? dashboardData.venues
      : [
          {
            id: "placeholder",
            name: "Venue belum tersedia",
            city: null,
            district: null,
          },
        ]
  ).map((venue) => ({
    id: venue.id,
    name: venue.name,
    description:
      [venue.city, venue.district].filter(Boolean).join(", ") || null,
    icon: "MapPin",
  }));

  const navProjects: NavProject[] = dashboardData.venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        teams={teams}
        navMain={navMain}
        navProjects={navProjects}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {revenueData.totalRevenue.toLocaleString("id-ID")}
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
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueData.bookingStats.totalBookings}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    6 bulan terakhir
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Lapangan Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.venues.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +1 dari bulan lalu
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tingkat Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueData.bookingStats.averageOccupancy}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    6 bulan terakhir
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Bar Chart - Pendapatan Bulanan */}
              <RevenueBarChart
                data={revenueData.monthlyRevenue.map((item) => ({
                  month: item.month,
                  revenue: item.revenue,
                }))}
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
                    {revenueData.topCourts.length > 0 ? (
                      revenueData.topCourts.map((court, index) => (
                        <div key={court.courtId} className="flex items-center">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {court.courtName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {court.sport} • {court.bookingCount} booking
                            </p>
                          </div>
                          <div className="ml-auto font-medium">
                            Rp {court.revenue.toLocaleString("id-ID")}
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

            {/* Line Chart - Full Width */}
            <BookingLineChart
              data={[
                { date: "Senin", bookings: 24 },
                { date: "Selasa", bookings: 18 },
                { date: "Rabu", bookings: 22 },
                { date: "Kamis", bookings: 16 },
                { date: "Jumat", bookings: 28 },
                { date: "Sabtu", bookings: 32 },
                { date: "Minggu", bookings: 15 },
              ]}
            />

            {/* Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Jam Sibuk</CardTitle>
                  <CardDescription>
                    Jam dengan booking terbanyak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueData.bookingStats.peakHours}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueData.bookingStats.totalBookings > 0
                      ? `Total ${revenueData.bookingStats.totalBookings} booking`
                      : "Belum ada data"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Hari Terfavorit</CardTitle>
                  <CardDescription>
                    Hari dengan booking terbanyak
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {revenueData.bookingStats.peakDay}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {revenueData.bookingStats.totalBookings > 0
                      ? `Total ${revenueData.bookingStats.totalBookings} booking`
                      : "Belum ada data"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
