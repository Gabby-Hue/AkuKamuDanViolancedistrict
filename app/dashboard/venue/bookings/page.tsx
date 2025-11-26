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
import {
  getVenueBookings,
  getVenueBookingMetrics,
  getVenueCourts,
  updateBookingStatus,
  type VenueBooking,
  type VenueBookingMetrics
} from "@/lib/supabase/queries/venue-bookings-fixed";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default async function BookingsPage() {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();
  const dashboardData = await fetchVenueDashboardData(profile);

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const avatarUrl = null;

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
      isActive: true,
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
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  // Get real data from Supabase
  const venues = dashboardData.venues;
  const primaryVenueId = venues.length > 0 ? venues[0].id : null;

  let bookings: VenueBooking[] = [];
  let metrics: VenueBookingMetrics | null = null;

  if (primaryVenueId) {
    [bookings, metrics] = await Promise.all([
      getVenueBookings(primaryVenueId),
      getVenueBookingMetrics(primaryVenueId),
    ]);
  }

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(
    (booking) => booking.date === today,
  );
  const upcomingBookings = bookings.filter(
    (booking) =>
      (booking.status === "confirmed" || booking.status === "checked_in") &&
      new Date(booking.date) >= new Date(today),
  );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  );

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
                  <BreadcrumbPage>Jadwal & Booking</BreadcrumbPage>
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
              Jadwal & Booking
            </h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Lihat Kalender
              </Button>
              <Button>Tambah Booking Manual</Button>
            </div>
          </div>

          <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">Hari Ini</TabsTrigger>
              <TabsTrigger value="upcoming">Akan Datang</TabsTrigger>
              <TabsTrigger value="pending">Menunggu Konfirmasi</TabsTrigger>
              <TabsTrigger value="all">Semua Booking</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Booking Hari Ini
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.todayBookings ?? todayBookings.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metrics?.todayBookings
                        ? `${todayBookings.filter((b) => b.status === "confirmed").length} dikonfirmasi`
                        : "Data tidak tersedia"
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Pendapatan Hari Ini
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Rp{" "}
                      {(metrics?.todayRevenue ??
                        todayBookings
                          .filter((b) => b.status === "confirmed")
                          .reduce((sum, b) => sum + b.totalPrice, 0)
                      ).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dari{" "}
                      {metrics?.todayBookings ?? todayBookings.filter((b) => b.status === "confirmed").length}{" "}
                      booking
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Jam Tersedia
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.availableHours ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dari {metrics?.totalHours ?? 16} jam operasional
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Occupancy Rate
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics?.occupancyRate ?? 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {metrics?.totalHours
                        ? `${metrics.totalHours - metrics.availableHours} dari ${metrics.totalHours} jam terisi`
                        : "Data tidak tersedia"
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Jadwal Hari Ini</CardTitle>
                  <CardDescription>
                    Semua booking untuk tanggal 21 Juni 2024
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {booking.startTime} - {booking.endTime}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.courtName} • {booking.customerName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {booking.status === "confirmed" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "pending" && (
                              <AlertCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "cancelled" && (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "confirmed"
                              ? "Dikonfirmasi"
                              : booking.status === "pending"
                                ? "Menunggu"
                                : "Dibatalkan"}
                          </Badge>
                          <Badge
                            variant={
                              booking.paymentStatus === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {booking.paymentStatus === "paid"
                              ? "Dibayar"
                              : "Belum Bayar"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Detail
                          </Button>
                        </div>
                      </div>
                    ))}
                    {todayBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada booking untuk hari ini
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Akan Datang</CardTitle>
                  <CardDescription>
                    Booking yang telah dikonfirmasi untuk tanggal berikutnya
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-xs font-medium">
                              {new Date(booking.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{booking.courtName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-sm">
                              {booking.startTime} - {booking.endTime} •{" "}
                              {booking.duration} jam
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.customerEmail}
                          </p>
                          <p className="font-medium text-primary">
                            Rp {booking.totalPrice.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {upcomingBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada booking yang akan datang
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Menunggu Konfirmasi</CardTitle>
                  <CardDescription>
                    Booking yang perlu ditinjau dan dikonfirmasi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Booking #{booking.id}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.courtName} •{" "}
                              {new Date(booking.date).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                            <p className="text-sm">
                              {booking.startTime} - {booking.endTime} •{" "}
                              {booking.customerName}
                            </p>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Catatan: {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right mr-4">
                            <p className="font-medium">
                              Rp {booking.totalPrice.toLocaleString("id-ID")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Belum dibayar
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Konfirmasi
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pendingBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada booking yang menunggu konfirmasi
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Semua Booking</CardTitle>
                      <CardDescription>
                        Daftar semua booking dalam sistem
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari booking..." className="pl-8" />
                      </div>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Booking</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Lapangan</TableHead>
                        <TableHead>Tanggal & Waktu</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {booking.customerName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {booking.customerEmail}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.courtName}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.courtType}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>
                                {new Date(booking.date).toLocaleDateString(
                                  "id-ID",
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{booking.duration} jam</TableCell>
                          <TableCell>
                            Rp {booking.totalPrice.toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {booking.status === "confirmed"
                                ? "Dikonfirmasi"
                                : booking.status === "pending"
                                  ? "Menunggu"
                                  : "Dibatalkan"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.paymentStatus === "paid"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.paymentStatus === "paid"
                                ? "Dibayar"
                                : booking.paymentStatus === "unpaid"
                                  ? "Belum"
                                  : "Refund"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
