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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Calendar,
  Award,
  Clock,
  Search,
  Filter,
} from "lucide-react";

export default async function StaffPage() {
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
      isActive: true,
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

  // Mock data for staff
  const staffMembers = [
    {
      id: 1,
      name: "Andi Pratama",
      email: "andi@courtease.id",
      phone: "+628123456789",
      role: "Operator",
      department: "Operations",
      status: "active",
      joinDate: "2023-01-15",
      avatar: "/avatars/andi.jpg",
      performance: {
        rating: 4.5,
        totalShifts: 156,
        completedTasks: 342,
        attendanceRate: 98,
      },
      skills: ["Customer Service", "Booking Management", "First Aid"],
      schedule: {
        today: "08:00 - 16:00",
        tomorrow: "Off",
        thisWeek: 5,
      },
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti@courtease.id",
      phone: "+628234567890",
      role: "Maintenance",
      department: "Facilities",
      status: "active",
      joinDate: "2023-03-20",
      avatar: "/avatars/siti.jpg",
      performance: {
        rating: 4.8,
        totalShifts: 142,
        completedTasks: 278,
        attendanceRate: 99,
      },
      skills: ["Equipment Maintenance", "Cleaning", "Safety Protocols"],
      schedule: {
        today: "14:00 - 22:00",
        tomorrow: "14:00 - 22:00",
        thisWeek: 6,
      },
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi@courtease.id",
      phone: "+628345678901",
      role: "Coach",
      department: "Training",
      status: "active",
      joinDate: "2022-11-10",
      avatar: "/avatars/budi.jpg",
      performance: {
        rating: 4.9,
        totalShifts: 198,
        completedTasks: 456,
        attendanceRate: 97,
      },
      skills: ["Futsal Coaching", "Physical Training", "Nutrition Guidance"],
      schedule: {
        today: "16:00 - 21:00",
        tomorrow: "16:00 - 21:00",
        thisWeek: 6,
      },
    },
    {
      id: 4,
      name: "Maya Putri",
      email: "maya@courtease.id",
      phone: "+628456789012",
      role: "Admin",
      department: "Administration",
      status: "on_leave",
      joinDate: "2023-02-05",
      avatar: "/avatars/maya.jpg",
      performance: {
        rating: 4.3,
        totalShifts: 128,
        completedTasks: 234,
        attendanceRate: 95,
      },
      skills: ["Data Entry", "Report Generation", "Customer Communication"],
      schedule: {
        today: "Off",
        tomorrow: "09:00 - 17:00",
        thisWeek: 3,
      },
    },
    {
      id: 5,
      name: "Rudi Hermawan",
      email: "rudi@courtease.id",
      phone: "+628567890123",
      role: "Security",
      department: "Operations",
      status: "active",
      joinDate: "2023-04-12",
      avatar: "/avatars/rudi.jpg",
      performance: {
        rating: 4.6,
        totalShifts: 167,
        completedTasks: 298,
        attendanceRate: 100,
      },
      skills: ["Security Protocols", "Emergency Response", "Crowd Control"],
      schedule: {
        today: "22:00 - 06:00",
        tomorrow: "22:00 - 06:00",
        thisWeek: 6,
      },
    },
  ];

  const activeStaff = staffMembers.filter(staff => staff.status === "active");
  const onLeaveStaff = staffMembers.filter(staff => staff.status === "on_leave");
  const todaySchedule = staffMembers.filter(staff => staff.schedule.today !== "Off");

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
                  <BreadcrumbPage>Tim & Staff</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Tim & Staff</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tambah Staff Baru</DialogTitle>
                  <DialogDescription>
                    Tambahkan staff baru ke tim Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nama
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Nama Staff"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="email@example.com"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Pilih role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
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

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="schedule">Jadwal</TabsTrigger>
              <TabsTrigger value="performance">Performa</TabsTrigger>
              <TabsTrigger value="all">Semua Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Staff
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{staffMembers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {activeStaff.length} aktif
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Staff Hari Ini
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{todaySchedule.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Sedang bertugas
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Rata-rata Rating
                    </CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(staffMembers.reduce((sum, staff) => sum + staff.performance.rating, 0) / staffMembers.length).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      +0.2 dari bulan lalu
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Attendance Rate
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(staffMembers.reduce((sum, staff) => sum + staff.performance.attendanceRate, 0) / staffMembers.length)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rata-rata kehadiran
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staffMembers.slice(0, 6).map((staff) => (
                  <Card key={staff.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{staff.name}</CardTitle>
                          <CardDescription>{staff.role} • {staff.department}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            staff.status === "active"
                              ? "default"
                              : staff.status === "on_leave"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {staff.status === "active" ? "Aktif" :
                           staff.status === "on_leave" ? "Cuti" : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4" />
                            {staff.email}
                          </div>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4" />
                          {staff.phone}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Rating:</span>
                          <span className="font-medium">⭐ {staff.performance.rating}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Jadwal Hari Ini:</span>
                          <span className="font-medium">{staff.schedule.today}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {staff.skills.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {staff.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{staff.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Jadwal
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Jadwal Hari Ini</CardTitle>
                  <CardDescription>
                    Staff yang sedang bertugas hari ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaySchedule.map((staff) => (
                      <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={staff.avatar} alt={staff.name} />
                            <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{staff.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {staff.role} • {staff.department}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{staff.schedule.today}</p>
                          <Badge variant="outline">
                            {staff.schedule.thisWeek} shift minggu ini
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {todaySchedule.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada staff yang bertugas hari ini
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>
                      Staff dengan rating tertinggi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staffMembers
                        .sort((a, b) => b.performance.rating - a.performance.rating)
                        .slice(0, 5)
                        .map((staff, index) => (
                          <div key={staff.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                <span className="text-sm font-medium">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">⭐ {staff.performance.rating}</p>
                              <p className="text-sm text-muted-foreground">
                                {staff.performance.totalShifts} shifts
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Summary</CardTitle>
                    <CardDescription>
                      Kehadiran staff bulan ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staffMembers.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.avatar} alt={staff.name} />
                              <AvatarFallback className="text-xs">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{staff.name}</p>
                              <p className="text-xs text-muted-foreground">{staff.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${staff.performance.attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-10 text-right">
                              {staff.performance.attendanceRate}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Semua Staff</CardTitle>
                      <CardDescription>
                        Daftar lengkap staff venue
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Cari staff..." className="pl-8" />
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
                        <TableHead>Staff</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffMembers.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={staff.avatar} alt={staff.name} />
                                <AvatarFallback className="text-xs">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{staff.role}</TableCell>
                          <TableCell>{staff.department}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                staff.status === "active"
                                  ? "default"
                                  : staff.status === "on_leave"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {staff.status === "active" ? "Aktif" :
                               staff.status === "on_leave" ? "Cuti" : "Tidak Aktif"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              ⭐ {staff.performance.rating}
                            </div>
                          </TableCell>
                          <TableCell>{staff.performance.attendanceRate}%</TableCell>
                          <TableCell>
                            {new Date(staff.joinDate).toLocaleDateString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
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
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}