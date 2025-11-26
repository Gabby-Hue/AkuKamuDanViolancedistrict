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
  getVenueBlackouts,
  getVenueBlackoutMetrics,
  getVenueCourtsForBlackout,
  createCourtBlackout,
  updateCourtBlackout,
  deleteCourtBlackout,
  type VenueBlackout,
  type VenueBlackoutMetrics
} from "@/lib/supabase/queries/venue-blackouts";
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
import { CalendarX, Plus } from "lucide-react";

export default async function BlackoutPage() {
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
    },
    {
      title: "Blackout Schedule",
      url: "/dashboard/venue/blackout",
      icon: "CalendarX",
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

  // Get real data from Supabase
  const venues = dashboardData.venues;
  const primaryVenueId = venues.length > 0 ? venues[0].id : null;

  let blackouts: VenueBlackout[] = [];
  let metrics: VenueBlackoutMetrics | null = null;
  let venueCourts: Array<{ id: string; name: string; sport: string }> = [];

  if (primaryVenueId) {
    [blackouts, metrics, venueCourts] = await Promise.all([
      getVenueBlackouts(primaryVenueId),
      getVenueBlackoutMetrics(primaryVenueId),
      getVenueCourtsForBlackout(primaryVenueId),
    ]);
  }

  // Calculate courts with blackouts
  const courtsWithBlackouts = venueCourts.map(court => ({
    id: court.id,
    name: court.name,
    type: court.sport,
    status: "active" as const,
    blackoutDates: blackouts
      .filter(blackout => blackout.courtId === court.id)
      .map(blackout => blackout.startDate),
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
                  <BreadcrumbPage>Blackout Schedule</BreadcrumbPage>
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
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Blackout Schedule
              </h2>
              <p className="text-muted-foreground">
                Kelola tanggal ketika lapangan tidak tersedia untuk booking
              </p>
            </div>
            <Button>
              <CalendarX className="mr-2 h-4 w-4" />
              Tambah Blackout Baru
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Blackout</CardTitle>
                <CardDescription>
                  Statistik blackout schedule keseluruhan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Lapangan
                    </p>
                    <p className="text-2xl font-bold">{metrics?.totalCourts ?? venueCourts.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lapangan dengan Blackout
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics?.affectedCourts ??
                        courtsWithBlackouts.filter((c) => c.blackoutDates.length > 0).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Blackout Aktif
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics?.activeBlackouts ?? 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lapangan Tersedia
                    </p>
                    <p className="text-2xl font-bold">
                      {metrics?.totalCourts && metrics?.affectedCourts
                        ? metrics.totalCourts - metrics.affectedCourts
                        : venueCourts.length - courtsWithBlackouts.filter((c) => c.blackoutDates.length > 0).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulan Ini</CardTitle>
                <CardDescription>
                  Daftar tanggal blackout untuk bulan ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>25 Juni 2024</span>
                    <Badge variant="secondary">3 Lapangan</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>26 Juni 2024</span>
                    <Badge variant="secondary">2 Lapangan</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>27 Juni 2024</span>
                    <Badge variant="secondary">1 Lapangan</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Blackout per Lapangan</CardTitle>
              <CardDescription>
                Kelola tanggal blackout untuk setiap lapangan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courtsWithBlackouts.map((court) => (
                  <div key={court.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{court.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {court.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            court.status === "active" ? "default" : "secondary"
                          }
                        >
                          {court.status === "active" ? "Aktif" : "Maintenance"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <CalendarX className="mr-2 h-3 w-3" />
                          Tambah Tanggal
                        </Button>
                      </div>
                    </div>
                    {court.blackoutDates.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {court.blackoutDates.map((date, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {new Date(date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            <button className="ml-1 hover:text-red-600">
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Tidak ada jadwal blackout
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* All Blackouts List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Daftar Blackout Lengkap</CardTitle>
                  <CardDescription>
                    Semua jadwal blackout untuk venue Anda
                  </CardDescription>
                </div>
                <Button>
                  <CalendarX className="mr-2 h-4 w-4" />
                  Tambah Blackout Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blackouts.map((blackout) => (
                  <div
                    key={blackout.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-orange-100">
                        <CalendarX className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{blackout.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {blackout.courtName} • {blackout.courtSport}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm">
                            {new Date(blackout.startDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" - "}
                            {new Date(blackout.endDate).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {blackout.startTime && blackout.endTime && (
                            <span className="text-sm">
                              {blackout.startTime} - {blackout.endTime}
                            </span>
                          )}
                          <Badge
                            variant={
                              blackout.frequency === "once"
                                ? "secondary"
                                : blackout.frequency === "daily"
                                  ? "default"
                                  : "outline"
                            }
                          >
                            {blackout.frequency === "once"
                              ? "Sekali"
                              : blackout.frequency === "daily"
                                ? "Harian"
                                : blackout.frequency === "weekly"
                                  ? "Mingguan"
                                  : "Bulanan"}
                          </Badge>
                        </div>
                        {blackout.notes && (
                          <p className="text-sm text-muted-foreground italic mt-1">
                            Catatan: {blackout.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
                {blackouts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada jadwal blackout yang terdaftar
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
