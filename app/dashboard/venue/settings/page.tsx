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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Settings, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
      isActive: true,
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
                  <BreadcrumbPage>Pengaturan</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
          </div>

          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Umum</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>
                    Perbarui informasi profil venue partner Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" defaultValue={displayName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input id="phone" defaultValue="+6281234567890" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Nama Perusahaan</Label>
                      <Input
                        id="company"
                        defaultValue="PT Courtease Venue Partner"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio/Deskripsi</Label>
                    <Textarea
                      id="bio"
                      placeholder="Ceritakan tentang venue Anda..."
                      defaultValue="Venue partner terpercaya dengan fasilitas lengkap dan pelayanan terbaik."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>Simpan Perubahan</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferensi Bahasa & Waktu</CardTitle>
                  <CardDescription>
                    Atur bahasa dan zona waktu yang Anda inginkan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="language">Bahasa</Label>
                      <Select defaultValue="id">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Bahasa Indonesia</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Zona Waktu</Label>
                      <Select defaultValue="jakarta">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jakarta">WIB (GMT+7)</SelectItem>
                          <SelectItem value="bali">WITA (GMT+8)</SelectItem>
                          <SelectItem value="papua">WIT (GMT+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="24hour" defaultChecked />
                    <Label htmlFor="24hour">Gunakan format 24 jam</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="venue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Venue</CardTitle>
                  <CardDescription>
                    Kelola informasi dasar venue Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="venue-name">Nama Venue</Label>
                      <Input
                        id="venue-name"
                        defaultValue="Courtease Sports Center"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue-type">Tipe Venue</Label>
                      <Select defaultValue="sports">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sports">Sports Complex</SelectItem>
                          <SelectItem value="futsal">Futsal Center</SelectItem>
                          <SelectItem value="badminton">
                            Badminton Hall
                          </SelectItem>
                          <SelectItem value="basketball">
                            Basketball Court
                          </SelectItem>
                          <SelectItem value="tennis">Tennis Court</SelectItem>
                          <SelectItem value="multipurpose">
                            Multipurpose
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Kapasitas Total</Label>
                      <Input id="capacity" type="number" defaultValue="150" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courts">Jumlah Lapangan</Label>
                      <Input id="courts" type="number" defaultValue="8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Alamat Lengkap</Label>
                      <Input
                        id="address"
                        defaultValue="Jl. Olahraga No. 123, Jakarta Selatan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Kota</Label>
                      <Input id="city" defaultValue="Jakarta" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi Venue</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsikan venue Anda..."
                      defaultValue="Fasilitas olahraga lengkap dengan lapangan futsal, badminton, basket, dan tenis. Dilengkapi dengan ruang ganti, kafe, dan area parkir luas."
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button>Simpan Perubahan</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jam Operasional</CardTitle>
                  <CardDescription>
                    Atur jam buka dan tutup venue Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Senin",
                      "Selasa",
                      "Rabu",
                      "Kamis",
                      "Jumat",
                      "Sabtu",
                      "Minggu",
                    ].map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`open-${day.toLowerCase()}`}
                            defaultChecked
                          />
                          <Label
                            htmlFor={`open-${day.toLowerCase()}`}
                            className="w-20"
                          >
                            {day}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            defaultValue="06:00"
                            className="w-24"
                          />
                          <span>sampai</span>
                          <Input
                            type="time"
                            defaultValue="23:00"
                            className="w-24"
                          />
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
