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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Building2,
  Bell,
  CreditCard,
  Users,
  Clock,
  Shield,
  Globe,
  Trash2,
  Plus,
  Edit,
  Key,
  Smartphone,
} from "lucide-react";

export default async function SettingsPage() {
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
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  // Mock data for settings
  const paymentMethods = [
    {
      id: 1,
      name: "BCA Virtual Account",
      type: "bank_transfer",
      status: "active",
      accountNumber: "1234567890",
      accountName: "Courtease Venue Partner",
    },
    {
      id: 2,
      name: "GoPay",
      type: "ewallet",
      status: "active",
      accountNumber: "08123456789",
      accountName: "Courtease Venue",
    },
    {
      id: 3,
      name: "OVO",
      type: "ewallet",
      status: "inactive",
      accountNumber: "08234567890",
      accountName: "Courtease Venue",
    },
    {
      id: 4,
      name: "Mandiri Virtual Account",
      type: "bank_transfer",
      status: "active",
      accountNumber: "0987654321",
      accountName: "Courtease Venue Partner",
    },
  ];

  const staffUsers = [
    {
      id: 1,
      name: "Andi Pratama",
      email: "andi@courtease.id",
      role: "Operator",
      status: "active",
      lastLogin: "2024-06-21 08:30",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti@courtease.id",
      role: "Maintenance",
      status: "active",
      lastLogin: "2024-06-20 14:15",
    },
    {
      id: 3,
      name: "Maya Putri",
      email: "maya@courtease.id",
      role: "Admin",
      status: "inactive",
      lastLogin: "2024-06-18 09:00",
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
              <TabsTrigger value="payment">Pembayaran</TabsTrigger>
              <TabsTrigger value="users">Pengguna</TabsTrigger>
              <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
              <TabsTrigger value="security">Keamanan</TabsTrigger>
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
                  <div className="space-y-2">
                    <Label>Fasilitas</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        "Wi-Fi",
                        "Parkir",
                        "Ruang Ganti",
                        "Kafe",
                        "Toilet",
                        "Loker",
                        "Musholla",
                        "Air Conditioner",
                        "Lampu",
                      ].map((facility) => (
                        <div
                          key={facility}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={facility}
                            defaultChecked={[
                              "Wi-Fi",
                              "Parkir",
                              "Ruang Ganti",
                              "Toilet",
                              "Lampu",
                            ].includes(facility)}
                          />
                          <Label htmlFor={facility} className="text-sm">
                            {facility}
                          </Label>
                        </div>
                      ))}
                    </div>
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

            <TabsContent value="payment" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Metode Pembayaran</CardTitle>
                      <CardDescription>
                        Kelola metode pembayaran yang tersedia untuk customer
                      </CardDescription>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Tambah Metode
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
                          <DialogDescription>
                            Tambah metode pembayaran baru untuk venue Anda
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment-type">
                              Tipe Pembayaran
                            </Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tipe" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bank_transfer">
                                  Bank Transfer
                                </SelectItem>
                                <SelectItem value="ewallet">
                                  E-Wallet
                                </SelectItem>
                                <SelectItem value="credit_card">
                                  Credit Card
                                </SelectItem>
                                <SelectItem value="qris">QRIS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="payment-name">Nama Metode</Label>
                            <Input placeholder="Contoh: BCA Virtual Account" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account-number">Nomor Akun</Label>
                            <Input placeholder="Nomor rekening atau nomor HP" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account-name">Nama Akun</Label>
                            <Input placeholder="Nama pemilik akun" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Simpan</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Metode</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead> Nomor Akun</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentMethods.map((method) => (
                        <TableRow key={method.id}>
                          <TableCell className="font-medium">
                            {method.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {method.type === "bank_transfer"
                                ? "Bank Transfer"
                                : "E-Wallet"}
                            </Badge>
                          </TableCell>
                          <TableCell>{method.accountNumber}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                method.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {method.status === "active"
                                ? "Aktif"
                                : "Non-aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Manajemen Staff</CardTitle>
                      <CardDescription>
                        Kelola akses dan izin untuk staff venue
                      </CardDescription>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Staff
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.status === "active" ? "Aktif" : "Non-aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.lastLogin}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Key className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pengaturan Notifikasi</CardTitle>
                  <CardDescription>
                    Atur jenis notifikasi yang ingin Anda terima
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifikasi Booking</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Booking Baru</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifikasi saat ada booking baru
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Booking Dibatalkan</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifikasi saat booking dibatalkan
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Pembayaran Berhasil</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifikasi saat pembayaran berhasil
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifikasi Email</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Laporan Harian</Label>
                          <p className="text-sm text-muted-foreground">
                            Kirim laporan harian via email
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Laporan Mingguan</Label>
                          <p className="text-sm text-muted-foreground">
                            Kirim laporan mingguan via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Marketing Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Tips dan update marketing
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notifikasi System</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Maintenance Schedule</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifikasi jadwal maintenance
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>System Updates</Label>
                          <p className="text-sm text-muted-foreground">
                            Notifikasi update system
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keamanan Akun</CardTitle>
                  <CardDescription>
                    Kelola pengaturan keamanan akun Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">
                        Password Saat Ini
                      </Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="new-password">Password Baru</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">
                        Konfirmasi Password Baru
                      </Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Tambahkan lapisan keamanan ekstra ke akun Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">
                        Gunakan aplikasi authenticator untuk keamanan tambahan
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" disabled>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Setup Authenticator App
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Login</CardTitle>
                  <CardDescription>
                    Riwayat login terakhir ke akun Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Chrome on Windows</p>
                        <p className="text-sm text-muted-foreground">
                          192.168.1.100 • Jakarta, Indonesia
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Hari ini, 08:30</p>
                        <Badge variant="default">Current</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Safari on iPhone</p>
                        <p className="text-sm text-muted-foreground">
                          192.168.1.101 • Jakarta, Indonesia
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">Kemarin, 19:45</p>
                      </div>
                    </div>
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
