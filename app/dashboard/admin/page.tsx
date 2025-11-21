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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
      title: "Kelola Venue",
      url: "/dashboard/admin/venues",
      icon: "Building2",
    },
    {
      title: "Pengguna",
      url: "/dashboard/admin/users",
      icon: "Users",
    },
    {
      title: "Laporan",
      url: "/dashboard/admin/reports",
      icon: "NotepadText",
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

  // Mock data for admin dashboard
  const ecosystemStats = {
    totalVenues: 156,
    activeVenues: 142,
    totalUsers: 12450,
    newUsers: 892,
    totalBookings: 5678,
    monthlyRevenue: 2847650000,
    growthRate: 23.5,
    topCities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang"],
  };

  const recentActivity = [
    {
      id: 1,
      type: "venue",
      action: "New venue registered",
      name: "Sports Arena Jakarta",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "user",
      action: "New user signup",
      name: "Budi Santoso",
      time: "3 hours ago",
    },
    {
      id: 3,
      type: "booking",
      action: "Large booking completed",
      name: "Futsal Tournament - 10 venues",
      time: "5 hours ago",
    },
    {
      id: 4,
      type: "venue",
      action: "Venue updated",
      name: "Badminton Center Surabaya",
      time: "6 hours ago",
    },
    {
      id: 5,
      type: "user",
      action: "User reported issue",
      name: "Ahmad Rizki",
      time: "8 hours ago",
    },
  ];

  const topPerformingVenues = [
    {
      rank: 1,
      name: "Champion Futsal Center",
      city: "Jakarta",
      bookings: 456,
      revenue: 89200000,
      growth: 28.5,
    },
    {
      rank: 2,
      name: "Elite Sports Complex",
      city: "Surabaya",
      bookings: 398,
      revenue: 78400000,
      growth: 22.3,
    },
    {
      rank: 3,
      name: "Premier Badminton Hall",
      city: "Bandung",
      bookings: 376,
      revenue: 72100000,
      growth: 18.7,
    },
    {
      rank: 4,
      name: "Victory Tennis Court",
      city: "Medan",
      bookings: 312,
      revenue: 65600000,
      growth: 15.2,
    },
    {
      rank: 5,
      name: "Dynamic Basketball Arena",
      city: "Semarang",
      bookings: 298,
      revenue: 58900000,
      growth: 12.8,
    },
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
                  <BreadcrumbPage>Ringkasan Ekosistem</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">
              Dashboard Admin
            </h2>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="venues">Venue Performance</TabsTrigger>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
              <TabsTrigger value="activity">Aktivitas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Venue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ecosystemStats.totalVenues}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {ecosystemStats.activeVenues} aktif
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Pengguna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ecosystemStats.totalUsers.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{ecosystemStats.newUsers} baru bulan ini
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
                      {ecosystemStats.totalBookings.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">Bulan ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenue Sistem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp {(ecosystemStats.monthlyRevenue / 1000000).toFixed(1)}M
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{ecosystemStats.growthRate}% growth
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Growth Trend</CardTitle>
                    <CardDescription>
                      Pertumbuhan ekosistem 6 bulan terakhir
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="h-12 w-12 mx-auto mb-2 opacity-50 bg-muted rounded-lg flex items-center justify-center">
                          📊
                        </div>
                        <p>Growth Chart Component</p>
                        <p className="text-sm">Chart akan diimplementasikan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Top Cities</CardTitle>
                    <CardDescription>
                      Kota dengan venue terbanyak
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ecosystemStats.topCities.map((city, index) => (
                        <div key={city} className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {city}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Math.floor(Math.random() * 30) + 10} venues
                            </p>
                          </div>
                          <div className="ml-auto">
                            <Badge variant="outline">
                              {Math.floor(Math.random() * 5000) + 1000} bookings
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="venues" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Venues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ecosystemStats.activeVenues}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(
                        (ecosystemStats.activeVenues /
                          ecosystemStats.totalVenues) *
                        100
                      ).toFixed(1)}
                      % activation rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pending Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">
                      Menunggu verifikasi
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.6</div>
                    <p className="text-xs text-muted-foreground">
                      Dari 12,450 reviews
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg Monthly Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Rp 45.2M</div>
                    <p className="text-xs text-muted-foreground">Per venue</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Venues</CardTitle>
                  <CardDescription>
                    Venue dengan performa tertinggi bulan ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformingVenues.map((venue) => (
                      <div
                        key={venue.rank}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <span className="text-lg font-bold">
                              {venue.rank}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{venue.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {venue.city}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium">
                                {venue.bookings} bookings
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Rp {venue.revenue.toLocaleString("id-ID")}
                              </p>
                            </div>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              +{venue.growth}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ecosystemStats.totalUsers.toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +{ecosystemStats.growthRate}% growth
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8,234</div>
                    <p className="text-xs text-muted-foreground">
                      66% of total users
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      New This Month
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {ecosystemStats.newUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +15% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Retention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">
                      Monthly retention
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>User Demographics</CardTitle>
                    <CardDescription>
                      Distribusi pengguna berdasarkan demografi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">
                            18-24 years
                          </span>
                          <span className="text-sm">35%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "35%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">
                            25-34 years
                          </span>
                          <span className="text-sm">42%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "42%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">
                            35-44 years
                          </span>
                          <span className="text-sm">18%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "18%" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">45+ years</span>
                          <span className="text-sm">5%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: "5%" }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>
                      Aktivitas pengguna per kategori
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Daily Active Users
                        </span>
                        <span className="text-sm font-bold">2,847</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Weekly Active Users
                        </span>
                        <span className="text-sm font-bold">5,623</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Monthly Active Users
                        </span>
                        <span className="text-sm font-bold">8,234</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Avg Session Duration
                        </span>
                        <span className="text-sm font-bold">12 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Bookings per User
                        </span>
                        <span className="text-sm font-bold">3.2 per month</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Terbaru</CardTitle>
                  <CardDescription>
                    Aktivitas terbaru di seluruh ekosistem Courtease
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              activity.type === "venue"
                                ? "bg-blue-100"
                                : activity.type === "user"
                                  ? "bg-green-100"
                                  : activity.type === "booking"
                                    ? "bg-purple-100"
                                    : "bg-orange-100"
                            }`}
                          >
                            <span className="text-lg">
                              {activity.type === "venue"
                                ? "🏢"
                                : activity.type === "user"
                                  ? "👤"
                                  : activity.type === "booking"
                                    ? "📅"
                                    : "⚙️"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
