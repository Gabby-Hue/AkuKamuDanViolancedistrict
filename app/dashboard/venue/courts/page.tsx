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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Upload,
  CalendarX,
  Image as ImageIcon,
} from "lucide-react";
import CourtImage from "@/components/court-image";

export default async function CourtsPage() {
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
      isActive: true,
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
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  // Mock data for courts
  const courts = [
    {
      id: 1,
      name: "Lapangan Futsal 1",
      type: "Futsal",
      status: "active",
      pricePerHour: 150000,
      capacity: 10,
      surface: "Synthetic Grass",
      photo: "/courts/futsal1.jpg",
      bookingsToday: 8,
      blackoutDates: ["2024-06-25", "2024-06-26"],
    },
    {
      id: 2,
      name: "Lapangan Badminton A",
      type: "Badminton",
      status: "active",
      pricePerHour: 80000,
      capacity: 4,
      surface: "Wooden",
      photo: "/courts/badminton-a.jpg",
      bookingsToday: 12,
      blackoutDates: [],
    },
    {
      id: 3,
      name: "Lapangan Basket 1",
      type: "Basket",
      status: "maintenance",
      pricePerHour: 200000,
      capacity: 20,
      surface: "Concrete",
      photo: "/courts/basket1.jpg",
      bookingsToday: 0,
      blackoutDates: ["2024-06-24", "2024-06-25", "2024-06-26"],
    },
    {
      id: 4,
      name: "Lapangan Tenis 1",
      type: "Tennis",
      status: "active",
      pricePerHour: 180000,
      capacity: 4,
      surface: "Hard Court",
      photo: "/courts/tennis1.jpg",
      bookingsToday: 6,
      blackoutDates: [],
    },
    {
      id: 5,
      name: "Lapangan Voli Pantai",
      type: "Volleyball",
      status: "active",
      pricePerHour: 120000,
      capacity: 12,
      surface: "Sand",
      photo: "/courts/voli-pantai.jpg",
      bookingsToday: 4,
      blackoutDates: ["2024-06-27"],
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Lapangan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Tambah Lapangan Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan lapangan baru ke venue Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto Lapangan</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <div className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Foto
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: JPG, PNG. Max 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lapangan</Label>
                      <Input id="name" placeholder="Lapangan Futsal 1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Tipe Lapangan</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="futsal">Futsal</SelectItem>
                          <SelectItem value="badminton">Badminton</SelectItem>
                          <SelectItem value="basket">Basket</SelectItem>
                          <SelectItem value="tennis">Tennis</SelectItem>
                          <SelectItem value="volleyball">Voli</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Harga per Jam</Label>
                      <Input id="price" type="number" placeholder="150000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Kapasitas</Label>
                      <Input id="capacity" type="number" placeholder="10" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surface">Permukaan</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih permukaan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="synthetic-grass">
                          Synthetic Grass
                        </SelectItem>
                        <SelectItem value="wooden">Wooden</SelectItem>
                        <SelectItem value="concrete">Concrete</SelectItem>
                        <SelectItem value="hard-court">Hard Court</SelectItem>
                        <SelectItem value="sand">Sand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Lapangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {courts.filter((c) => c.status === "active").length} aktif
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Booking Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {courts.reduce(
                      (sum, court) => sum + court.bookingsToday,
                      0,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rata-rata{" "}
                    {Math.round(
                      courts.reduce(
                        (sum, court) => sum + court.bookingsToday,
                        0,
                      ) / courts.length,
                    )}{" "}
                    per lapangan
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendapatan Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp{" "}
                    {courts
                      .reduce(
                        (sum, court) =>
                          sum + court.pricePerHour * court.bookingsToday,
                        0,
                      )
                      .toLocaleString("id-ID")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Proyeksi berdasarkan booking
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Kapasitas Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {courts.reduce((sum, court) => sum + court.capacity, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total semua lapangan
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Court Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <Card key={court.id} className="relative overflow-hidden">
                  <CourtImage
                    src={court.photo}
                    alt={court.name}
                    fallbackId={`fallback-${court.id}`}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        court.status === "active" ? "default" : "secondary"
                      }
                    >
                      {court.status === "active" ? "Aktif" : "Maintenance"}
                    </Badge>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <CardDescription>
                      {court.type} • {court.surface}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <DollarSign className="mr-2 h-4 w-4" />
                          Rp {court.pricePerHour.toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {court.bookingsToday} booking
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="flex items-center justify-between">
                          <span>Kapasitas:</span>
                          <span>{court.capacity} orang</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
