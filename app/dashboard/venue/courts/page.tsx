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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign } from "lucide-react";

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
      title: "Tim & Staff",
      url: "/dashboard/venue/staff",
      icon: "Users",
    },
    {
      title: "Laporan",
      url: "/dashboard/venue/reports",
      icon: "NotepadText",
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
      features: ["Lighting", "Shaded Area", "Changing Room"],
      bookingsToday: 8,
      utilizationRate: 75,
    },
    {
      id: 2,
      name: "Lapangan Badminton A",
      type: "Badminton",
      status: "active",
      pricePerHour: 80000,
      capacity: 4,
      surface: "Wooden",
      features: ["Air Conditioning", "Lighting"],
      bookingsToday: 12,
      utilizationRate: 85,
    },
    {
      id: 3,
      name: "Lapangan Basket 1",
      type: "Basket",
      status: "maintenance",
      pricePerHour: 200000,
      capacity: 20,
      surface: "Concrete",
      features: ["Lighting", "Scoreboard", "Bleachers"],
      bookingsToday: 0,
      utilizationRate: 0,
    },
    {
      id: 4,
      name: "Lapangan Tenis 1",
      type: "Tennis",
      status: "active",
      pricePerHour: 180000,
      capacity: 4,
      surface: "Hard Court",
      features: ["Lighting", "Ball Machine"],
      bookingsToday: 6,
      utilizationRate: 60,
    },
    {
      id: 5,
      name: "Lapangan Voli Pantai",
      type: "Volleyball",
      status: "active",
      pricePerHour: 120000,
      capacity: 12,
      surface: "Sand",
      features: ["Night Lighting", "Shaded Seating"],
      bookingsToday: 4,
      utilizationRate: 45,
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
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Lapangan Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan lapangan baru ke venue Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Lapangan Baru"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipe
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih tipe lapangan" />
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Harga/Jam
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      defaultValue="100000"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Daftar Lapangan</TabsTrigger>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="maintenance">Perawatan</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courts.map((court) => (
                  <Card key={court.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{court.name}</CardTitle>
                        <Badge
                          variant={
                            court.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {court.status === "active" ? "Aktif" : "Maintenance"}
                        </Badge>
                      </div>
                      <CardDescription>{court.type}</CardDescription>
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
                          <div className="flex items-center justify-between">
                            <span>Permukaan:</span>
                            <span>{court.surface}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Utilisasi:</span>
                            <span>{court.utilizationRate}%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {court.features.slice(0, 2).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {court.features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{court.features.length - 2}
                            </Badge>
                          )}
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
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
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
                      {courts.filter(c => c.status === "active").length} aktif
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
                      {courts.reduce((sum, court) => sum + court.bookingsToday, 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rata-rata {Math.round(courts.reduce((sum, court) => sum + court.bookingsToday, 0) / courts.length)} per lapangan
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Utilisasi Rata-rata
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(courts.reduce((sum, court) => sum + court.utilizationRate, 0) / courts.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +5% dari minggu lalu
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
                      Rp {courts.reduce((sum, court) => sum + (court.pricePerHour * court.bookingsToday), 0).toLocaleString("id-ID")}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Proyeksi berdasarkan booking
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performa Lapangan</CardTitle>
                  <CardDescription>
                    Statistik detail per lapangan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Booking Hari Ini</TableHead>
                        <TableHead>Utilisasi</TableHead>
                        <TableHead>Pendapatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courts.map((court) => (
                        <TableRow key={court.id}>
                          <TableCell className="font-medium">
                            {court.name}
                          </TableCell>
                          <TableCell>{court.type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                court.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {court.status === "active" ? "Aktif" : "Maintenance"}
                            </Badge>
                          </TableCell>
                          <TableCell>{court.bookingsToday}</TableCell>
                          <TableCell>{court.utilizationRate}%</TableCell>
                          <TableCell>
                            Rp {(court.pricePerHour * court.bookingsToday).toLocaleString("id-ID")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Jadwal Maintenance</CardTitle>
                    <CardDescription>
                      Lapangan yang sedang dalam maintenance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courts.filter(court => court.status === "maintenance").map((court) => (
                        <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{court.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {court.type} • {court.surface}
                            </p>
                          </div>
                          <Badge variant="secondary">Maintenance</Badge>
                        </div>
                      ))}
                      {courts.filter(court => court.status === "maintenance").length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Tidak ada lapangan dalam maintenance
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lapangan Membutuhkan Perhatian</CardTitle>
                    <CardDescription>
                      Lapangan dengan utilisasi rendah
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courts.filter(court => court.utilizationRate < 60 && court.status === "active").map((court) => (
                        <div key={court.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{court.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Utilisasi: {court.utilizationRate}%
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Lihat Detail
                          </Button>
                        </div>
                      ))}
                      {courts.filter(court => court.utilizationRate < 60 && court.status === "active").length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Semua lapangan memiliki performa baik
                        </p>
                      )}
                    </div>
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