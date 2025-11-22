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

  const displayName = identity?.fullName ?? profile.full_name ?? "Admin";
  const email = identity?.email ?? "admin@courtease.id";
  const avatarUrl = identity?.avatarUrl ?? null;

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

  // Mock data untuk admin dashboard
  const stats = {
    totalVenues: 156,
    activeVenues: 142,
    totalUsers: 12450,
    totalBookings: 5678,
    monthlyRevenue: 2847650000,
    pendingApprovals: 8,
    totalPartners: 89,
  };

  const topVenues = [
    { rank: 1, name: "Champion Futsal Center", city: "Jakarta", bookings: 456, revenue: 89200000 },
    { rank: 2, name: "Elite Sports Complex", city: "Surabaya", bookings: 398, revenue: 78400000 },
    { rank: 3, name: "Premier Badminton Hall", city: "Bandung", bookings: 376, revenue: 72100000 },
    { rank: 4, name: "Victory Tennis Court", city: "Medan", bookings: 312, revenue: 65600000 },
    { rank: 5, name: "Dynamic Basketball Arena", city: "Semarang", bookings: 298, revenue: 58900000 },
  ];

  const recentOrders = [
    { id: "BK001", venue: "Champion Futsal Center", customer: "Budi Santoso", date: "22 Jun", amount: 450000, status: "completed" },
    { id: "BK002", venue: "Elite Sports Complex", customer: "Siti Nurhaliza", date: "22 Jun", amount: 320000, status: "confirmed" },
    { id: "BK003", venue: "Premier Badminton Hall", customer: "Ahmad Rizki", date: "23 Jun", amount: 280000, status: "pending" },
    { id: "BK004", venue: "Victory Tennis Court", customer: "Diana Putri", date: "21 Jun", amount: 520000, status: "completed" },
    { id: "BK005", venue: "Dynamic Basketball Arena", customer: "Rudi Hermawan", date: "21 Jun", amount: 680000, status: "cancelled" },
  ];

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email, avatarUrl }}
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
                  <div className="text-2xl font-bold">{stats.totalVenues}</div>
                  <p className="text-xs text-muted-foreground">{stats.activeVenues} aktif</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">+23.5% growth</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings.toLocaleString("id-ID")}</div>
                  <p className="text-xs text-muted-foreground">Bulan ini</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue Sistem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {(stats.monthlyRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">+15.2% dari bulan lalu</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <AdminRevenueChart
                data={[
                  { month: "Jan", revenue: 45 },
                  { month: "Feb", revenue: 52 },
                  { month: "Mar", revenue: 61 },
                  { month: "Apr", revenue: 72 },
                  { month: "Mei", revenue: 84 },
                  { month: "Jun", revenue: 96 },
                ]}
              />
              <AdminVenueGrowthChart
                data={[
                  { month: "Jan", venues: 120 },
                  { month: "Feb", venues: 128 },
                  { month: "Mar", venues: 135 },
                  { month: "Apr", venues: 142 },
                  { month: "Mei", venues: 148 },
                  { month: "Jun", venues: 156 },
                ]}
              />
            </div>

            {/* Booking Trend Chart */}
            <AdminBookingTrendChart
              data={[
                { date: "Sen", bookings: 24 },
                { date: "Sel", bookings: 18 },
                { date: "Rab", bookings: 22 },
                { date: "Kam", bookings: 16 },
                { date: "Jum", bookings: 28 },
                { date: "Sab", bookings: 32 },
                { date: "Min", bookings: 15 },
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
                    {topVenues.map((venue) => (
                      <div key={venue.rank} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                            <span className="text-sm font-bold">{venue.rank}</span>
                          </div>
                          <div>
                            <h4 className="font-medium">{venue.name}</h4>
                            <p className="text-sm text-muted-foreground">{venue.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{venue.bookings} booking</div>
                          <div className="text-sm text-muted-foreground">Rp {venue.revenue.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>5 pesanan terakhir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="font-medium">{order.id}</div>
                          <div>
                            <h4 className="font-medium">{order.venue}</h4>
                            <p className="text-sm text-muted-foreground">{order.customer} • {order.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">Rp {order.amount.toLocaleString("id-ID")}</div>
                          <Badge
                            variant={
                              order.status === "completed" ? "default" :
                              order.status === "confirmed" ? "secondary" :
                              order.status === "pending" ? "outline" : "destructive"
                            }
                          >
                            {order.status === "completed" ? "Selesai" :
                             order.status === "confirmed" ? "Konfirmasi" :
                             order.status === "pending" ? "Pending" : "Batal"}
                          </Badge>
                        </div>
                      </div>
                    ))}
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