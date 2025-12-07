"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Plus,
  Building2,
  Clock,
  DollarSign,
  Camera,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import Link from "next/link";
import CourtImage from "@/components/court-image";
import { DeleteCourtDialog } from "@/components/delete-court-dialog";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import { getVenueCourtsAction } from "./court-actions";

interface CourtData {
  id: string;
  name: string;
  sport: string;
  surface: string | null;
  pricePerHour: number;
  capacity: number | null;
  facilities: string[];
  description: string | null;
  isActive: boolean;
  venueId: string;
  venueName: string;
  primaryImageUrl: string | null;
  images: any[];
  bookingsToday: number;
  monthlyRevenue: number;
  averageRating: number;
  reviewCount: number;
  totalBookings?: number;
  todayRevenue?: number;
}

interface CourtsData {
  courts: CourtData[];
  metrics: {
    totalCourts: number;
    activeCourts: number;
    totalCapacity: number;
    averagePricePerHour: number;
    todayBookings: number;
    todayRevenue: number;
    monthlyRevenue: number;
    mostPopularSport: string;
    occupancyRate: number;
  } | null;
  venues: any[];
}

interface CourtsClientWrapperProps {
  profile: any;
  identity: any;
  venues: any[];
}

function CourtCard({
  court,
  onRefresh,
}: {
  court: CourtData;
  onRefresh: () => void;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteSuccess = () => {
    setDeleteOpen(false);
    onRefresh();
  };

  // Ensure we have valid numbers to avoid React errors
  const safePricePerHour =
    typeof court.pricePerHour === "number" ? court.pricePerHour : 0;
  const safeTotalBookings =
    typeof court.totalBookings === "number" ? court.totalBookings : 0;
  const safeCapacity = typeof court.capacity === "number" ? court.capacity : 0;
  const safeAverageRating =
    typeof court.averageRating === "number" ? court.averageRating : 0;
  const safeReviewCount =
    typeof court.reviewCount === "number" ? court.reviewCount : 0;

  return (
    <>
      <Card className="relative overflow-hidden">
        <CourtImage
          src={court.primaryImageUrl || ""}
          alt={court.name}
          fallbackId={court.id}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={court.isActive ? "default" : "secondary"}>
            {court.isActive ? "Aktif" : "Maintenance"}
          </Badge>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{court.name}</CardTitle>
          <CardDescription>
            {court.sport} • {court.surface || "Tidak ada permukaan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                Rp {safePricePerHour.toLocaleString("id-ID")}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {safeTotalBookings} booking
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Kapasitas:</span>
                <span>{safeCapacity} orang</span>
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Rating:</span>
                <span>
                  ⭐ {safeAverageRating.toFixed(1)} ({safeReviewCount})
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/dashboard/venue/courts/edit/${court.id}`}>
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/dashboard/venue/courts/${court.id}/images`}>
                  <Camera className="mr-2 h-3 w-3" />
                  Foto
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteCourtDialog
        court={court as any}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

export default function CourtsClientWrapper({
  profile,
  identity,
  venues,
}: CourtsClientWrapperProps) {
  const [data, setData] = useState<CourtsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const primaryVenue = venues.length > 0 ? venues[0] : null;

  const navMain: NavMainItem[] = [
    { title: "Dashboard", url: "/dashboard/venue", icon: "LayoutDashboard" },
    {
      title: "Lapangan Saya",
      url: "/dashboard/venue/courts",
      icon: "Building2",
      isActive: true,
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

  const teams: TeamOption[] = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    description: [venue.city] || null,
    icon: "MapPin",
  }));

  const fetchData = async () => {
    if (!primaryVenue) {
      console.log("No primary venue found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // *** KONVERSI KE DIRECT QUERIES ***
      // Fetch all venue courts with stats using direct query
      const courtsWithStats = await getVenueCourtsAction(primaryVenue.id);

      if (courtsWithStats.length === 0) {
        setData({
          courts: [],
          metrics: null,
          venues: venues,
        });
        return;
      }

      // *** KONVERSI KE DIRECT QUERIES: Data sudah termasuk stats ***
      // Fetch images for each court (keep API for images)
      const enhancedCourts = await Promise.all(
        courtsWithStats.map(async (court) => {
          try {
            // Keep API call for images (file handling complexity)
            const imagesResponse = await fetch(
              `/api/dashboard/venue/courts/${court.id}/images`,
            );
            let primaryImageUrl = null;
            if (imagesResponse.ok) {
              const imagesResult = await imagesResponse.json();
              if (imagesResult.data?.primaryImage) {
                primaryImageUrl = imagesResult.data.primaryImage;
              } else if (imagesResult.data?.images?.length > 0) {
                primaryImageUrl = imagesResult.data.images[0].url;
              }
            }

            // Convert direct query data to expected format
            return {
              id: court.id,
              name: court.name,
              sport: court.sport,
              surface: court.surface || null,
              pricePerHour: court.pricePerHour || 0,
              capacity: court.capacity || null,
              facilities: Array.isArray(court.facilities)
                ? court.facilities
                : [],
              description: null, // court_summaries_with_stats doesn't include description
              isActive: court.isActive ?? true,
              venueId: primaryVenue.id,
              venueName: primaryVenue.name,
              primaryImageUrl: primaryImageUrl,
              images: [],
              // Data from direct query with stats
              bookingsToday: court.todayBookings || 0,
              totalBookings: court.totalBookings || 0,
              todayRevenue: court.todayRevenue || 0,
              monthlyRevenue: 0, // Calculate from total_revenue if needed
              averageRating: court.averageRating || 0,
              reviewCount: court.reviewCount || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching images for court ${court.id}:`,
              error,
            );
            // Fallback to basic data if image fetch fails
            return {
              id: court.id,
              name: court.name,
              sport: court.sport,
              surface: court.surface || null,
              pricePerHour: court.pricePerHour || 0,
              capacity: court.capacity || null,
              facilities: Array.isArray(court.facilities)
                ? court.facilities
                : [],
              description: null,
              isActive: court.isActive ?? true,
              venueId: primaryVenue.id,
              venueName: primaryVenue.name,
              primaryImageUrl: null,
              images: [],
              // Data from direct query with stats (no statsMap dependency)
              bookingsToday: court.todayBookings || 0,
              totalBookings: court.totalBookings || 0,
              todayRevenue: court.todayRevenue || 0,
              monthlyRevenue: 0,
              averageRating: court.averageRating || 0,
              reviewCount: court.reviewCount || 0,
            };
          }
        }),
      );

      // *** KONVERSI KE DIRECT QUERIES: Hitung metrik dari courtsWithStats ***
      // Calculate venue-wide totals from direct query data
      const todayBookingsCount = courtsWithStats.reduce(
        (sum, court) => sum + (court.todayBookings || 0),
        0,
      );
      const todayRevenue = courtsWithStats.reduce(
        (sum, court) => sum + (court.todayRevenue || 0),
        0,
      );

      // Calculate metrics
      const metrics = {
        totalCourts: enhancedCourts.length,
        activeCourts: enhancedCourts.filter((c) => c.isActive).length,
        totalCapacity: enhancedCourts.reduce(
          (sum, c) => sum + (c.capacity || 0),
          0,
        ),
        averagePricePerHour:
          enhancedCourts.length > 0
            ? enhancedCourts.reduce((sum, c) => sum + c.pricePerHour, 0) /
              enhancedCourts.length
            : 0,
        todayBookings: todayBookingsCount,
        todayRevenue: todayRevenue,
        monthlyRevenue: 0, // TODO: Calculate if needed
        mostPopularSport: "", // TODO: Calculate if needed
        occupancyRate: 0, // TODO: Calculate if needed
      };

      setData({
        courts: enhancedCourts,
        metrics,
        venues: venues,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
      console.error("Failed to fetch venue courts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [primaryVenue?.id]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    fetchData();
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={{ name: displayName, email }}
          navMain={navMain}
          teams={teams}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/venue">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Lapangan Saya</BreadcrumbPage>
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
                Lapangan Saya
              </h2>
              <div className="animate-pulse bg-muted h-10 w-32 rounded-md"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-24 mb-2"></div>
                  <div className="bg-muted rounded h-4 w-20"></div>
                </div>
              ))}
            </div>
            <div className="text-center py-12 text-muted-foreground">
              Memuat data lapangan...
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={{ name: displayName, email }}
          navMain={navMain}
          teams={teams}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/venue">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Lapangan Saya</BreadcrumbPage>
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
                Lapangan Saya
              </h2>
            </div>
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-medium mb-2">Error Memuat Data</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!data || !data.courts) {
    return (
      <SidebarProvider>
        <AppSidebar
          user={{ name: displayName, email }}
          teams={teams}
          navMain={navMain}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard/venue">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Lapangan Saya</BreadcrumbPage>
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
                Lapangan Saya
              </h2>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data tersedia
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const { courts, metrics } = data;

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        navMain={navMain}
        teams={teams}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/venue">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Lapangan Saya</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Lapangan Saya</h2>
            <Link href="/dashboard/venue/courts/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Lapangan
              </Button>
            </Link>
          </div>

          {/* Court Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => (
              <CourtCard
                key={`${court.id}-${refreshKey}`}
                court={court}
                onRefresh={handleRefresh}
              />
            ))}

            {courts.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      Belum ada lapangan
                    </h3>
                    <p className="text-sm mb-4">
                      Tambahkan lapangan pertama Anda untuk memulai bisnis venue
                    </p>
                    <Link href="/dashboard/venue/courts/add">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Lapangan
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
