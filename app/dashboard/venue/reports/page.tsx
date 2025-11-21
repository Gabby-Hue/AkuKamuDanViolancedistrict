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
import { fetchVenueDashboardData } from "@/lib/supabase/queries";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  Search,
} from "lucide-react";

export default async function ReportsPage() {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();
  const dashboardData = await fetchVenueDashboardData(profile);

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const avatarUrl = identity?.avatarUrl ?? null;

  const navMain: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard/venue",
      icon: "LayoutDashboard",
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
      title: "Tim & Staff",
      url: "/dashboard/venue/staff",
      icon: "Users",
    },
    {
      title: "Laporan",
      url: "/dashboard/venue/reports",
      icon: "NotepadText",
      isActive: true,
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
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  // Mock data for reports
  const monthlyRevenue = [
    { month: "Jan", revenue: 45000000, bookings: 186 },
    { month: "Feb", revenue: 52000000, bookings: 213 },
    { month: "Mar", revenue: 48000000, bookings: 198 },
    { month: "Apr", revenue: 61000000, bookings: 247 },
    { month: "May", revenue: 58000000, bookings: 235 },
    { month: "Jun", revenue: 67000000, bookings: 289 },
  ];

  const courtPerformance = [
    { name: "Lapangan Futsal 1", revenue: 18500000, bookings: 89, utilization: 78 },
    { name: "Lapangan Badminton A", revenue: 14200000, bookings: 124, utilization: 85 },
    { name: "Lapangan Tenis 1", revenue: 16800000, bookings: 67, utilization: 62 },
    { name: "Lapangan Basket 1", revenue: 12300000, bookings: 45, utilization: 51 },
    { name: "Lapangan Voli Pantai", revenue: 8900000, bookings: 34, utilization: 43 },
  ];

  const timeSlotData = [
    { time: "06:00-09:00", bookings: 23, utilization: 38 },
    { time: "09:00-12:00", bookings: 45, utilization: 75 },
    { time: "12:00-15:00", bookings: 38, utilization: 63 },
    { time: "15:00-18:00", bookings: 56, utilization: 93 },
    { time: "18:00-21:00", bookings: 89, utilization: 98 },
    { time: "21:00-24:00", bookings: 34, utilization: 57 },
  ];

  const recentReports = [
    {
      id: 1,
      name: "Laporan Bulanan Juni 2024",
      type: "Monthly Report",
      date: "2024-07-01",
      size: "2.3 MB",
      status: "completed",
    },
    {
      id: 2,
      name: "Laporan Performa Lapangan Q2 2024",
      type: "Performance Report",
      date: "2024-07-01",
      size: "1.8 MB",
      status: "completed",
    },
    {
      id: 3,
      name: "Laporan Revenue Mingguan",
      type: "Weekly Report",
      date: "2024-06-30",
      size: "892 KB",
      status: "completed",
    },
    {
      id: 4,
      name: "Analisis Customer Behavior",
      type: "Analytics Report",
      date: "2024-06-28",
      size: "3.1 MB",
      status: "processing",
    },
    {
      id: 5,
      name: "Laporan Staff Performance",
      type: "Staff Report",
      date: "2024-06-25",
      size: "1.2 MB",
      status: "completed",
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email, avatarUrl }}
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
                  <BreadcrumbPage>Laporan</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Laporan</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export Laporan
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
              <TabsTrigger value="performance">Performa</TabsTrigger>
              <TabsTrigger value="generated">Laporan Tersedia</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
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
                      Rp {(monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)).toLocaleString("id-ID")}
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
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {monthlyRevenue.reduce((sum, month) => sum + month.bookings, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +15% dari periode sebelumnya
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rata-rata Pendapatan
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp {Math.round(monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0) / monthlyRevenue.length).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Per bulan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Growth Rate
                    </CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+18.5%</div>
                    <p className="text-xs text-muted-foreground">
                      YoY growth
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Pendapatan Bulanan</CardTitle>
                    <CardDescription>
                      Trend pendapatan 6 bulan terakhir
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Revenue Chart</p>
                        <p className="text-sm">Chart component akan diimplementasikan</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Performa Lapangan</CardTitle>
                    <CardDescription>
                      5 lapangan teratas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courtPerformance.slice(0, 5).map((court, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="ml-4 space-y-1 flex-1">
                            <p className="text-sm font-medium leading-none">
                              {court.name}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{court.bookings} booking</span>
                              <span className="mx-1">•</span>
                              <span>{court.utilization}% utilization</span>
                            </div>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="font-medium text-sm">
                              Rp {court.revenue.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Pendapatan per Jam</CardTitle>
                    <CardDescription>
                      Analisis pendapatan berdasarkan waktu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Time Slot Analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution</CardTitle>
                    <CardDescription>
                      Distribusi pendapatan per tipe lapangan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <PieChart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Revenue Distribution</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Prediction</CardTitle>
                    <CardDescription>
                      Proyeksi pendapatan 3 bulan ke depan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>July 2024</span>
                        <span className="font-medium">Rp 71.500.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>August 2024</span>
                        <span className="font-medium">Rp 68.200.000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>September 2024</span>
                        <span className="font-medium">Rp 74.800.000</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total Projection</span>
                          <span>Rp 214.500.000</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detail Analisis Pendapatan</CardTitle>
                  <CardDescription>
                    Data pendapatan per waktu dan lapangan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Analisis per Time Slot</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Jumlah Booking</TableHead>
                            <TableHead>Utilization Rate</TableHead>
                            <TableHead>Pendapatan Estimasi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {timeSlotData.map((slot, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{slot.time}</TableCell>
                              <TableCell>{slot.bookings}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-12 bg-muted rounded-full h-2 mr-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${slot.utilization}%` }}
                                    />
                                  </div>
                                  {slot.utilization}%
                                </div>
                              </TableCell>
                              <TableCell>
                                Rp {(slot.bookings * 150000).toLocaleString("id-ID")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Utilization Rate per Lapangan</CardTitle>
                    <CardDescription>
                      Persentase penggunaan setiap lapangan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courtPerformance.map((court, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{court.name}</span>
                            <span className="text-sm">{court.utilization}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${court.utilization}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Booking Trends</CardTitle>
                    <CardDescription>
                      Pola booking berdasarkan hari dan waktu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">Sabtu</p>
                          <p className="text-sm text-muted-foreground">Hari Terfavorit</p>
                          <p className="text-sm font-medium">89 booking/minggu</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">18:00-21:00</p>
                          <p className="text-sm text-muted-foreground">Jam Puncak</p>
                          <p className="text-sm font-medium">98% utilization</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">Performa per Hari</h4>
                        <div className="space-y-2">
                          {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((day, index) => (
                            <div key={day} className="flex justify-between items-center">
                              <span className="text-sm">{day}</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${40 + (index * 8)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">
                                  {40 + (index * 8)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performa Detail Lapangan</CardTitle>
                  <CardDescription>
                    Analisis lengkap performa setiap lapangan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lapangan</TableHead>
                        <TableHead>Total Booking</TableHead>
                        <TableHead>Total Revenue</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Avg Booking/Hari</TableHead>
                        <TableHead>Peak Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courtPerformance.map((court, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{court.name}</TableCell>
                          <TableCell>{court.bookings}</TableCell>
                          <TableCell>Rp {court.revenue.toLocaleString("id-ID")}</TableCell>
                          <TableCell>
                            <Badge variant={court.utilization >= 70 ? "default" : "secondary"}>
                              {court.utilization}%
                            </Badge>
                          </TableCell>
                          <TableCell>{Math.round(court.bookings / 30)}</TableCell>
                          <TableCell>18:00-21:00</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generated" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Laporan Tersedia</CardTitle>
                      <CardDescription>
                        Download atau generate laporan yang dibutuhkan
                      </CardDescription>
                    </div>
                    <Button>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Laporan Baru
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.type} • {new Date(report.date).toLocaleDateString("id-ID")} • {report.size}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={report.status === "completed" ? "default" : "secondary"}
                          >
                            {report.status === "completed" ? "Selesai" : "Processing"}
                          </Badge>
                          <Button size="sm" variant="outline" disabled={report.status !== "completed"}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Generate</CardTitle>
                    <CardDescription>
                      Generate laporan dengan cepat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Laporan Harian
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Laporan Mingguan
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Laporan Bulanan
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="mr-2 h-4 w-4" />
                      Laporan Performa
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Report</CardTitle>
                    <CardDescription>
                      Buat laporan custom sesuai kebutuhan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Tipe Laporan</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe laporan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="revenue">Revenue Report</SelectItem>
                          <SelectItem value="booking">Booking Report</SelectItem>
                          <SelectItem value="customer">Customer Report</SelectItem>
                          <SelectItem value="staff">Staff Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-range">Rentang Waktu</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rentang waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                          <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                          <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                          <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                          <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      Generate Laporan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}