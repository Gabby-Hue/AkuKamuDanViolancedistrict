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
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Shield,
  Camera,
  CheckCircle,
  AlertCircle,
  Lock,
  Key,
  Activity,
  Smartphone,
  MapPin,
} from "lucide-react";

// Komponen sekarang bersifat sinkron
export default function Page() {
  // Data statis untuk navigasi dan tim
  const navMain: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard/admin",
      icon: "LayoutDashboard",
    },
    {
      title: "Applications",
      url: "/dashboard/admin/applications",
      icon: "FileCheck",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/admin/settings",
      icon: "Settings2",
      isActive: true,
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

  // Data statis untuk pengguna
  const displayName = "Admin User";
  const email = "admin@courtease.id";

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
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
            <h2 className="text-3xl font-bold tracking-tight">
              Pengaturan Admin
            </h2>
          </div>

          <div className="space-y-6">
            {/* Profile Overview Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl">
                          {/* Menggunakan displayName statis */}
                          {displayName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-3 w-3" />
                      {/* Nilai statis */}
                      Super Admin
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Account</Label>
                        {/* Nilai statis */}
                        <p className="font-medium">Admin User</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-muted-foreground">
                          Account Status
                        </Label>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="font-medium">Verified & Active</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        {/* Nilai statis */}
                        <p className="font-medium">2024-01-15</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        {/* Nilai statis */}
                        <p className="font-medium">IT Operations</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {/* Nilai statis */}
                          Jakarta, Indonesia
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Login</p>
                        <p className="font-medium">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Informasi Pribadi</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Nama Lengkap</Label>
                          {/* Nilai statis di defaultValue */}
                          <Input id="fullName" defaultValue="Admin User" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          {/* Nilai statis di defaultValue */}
                          <Input
                            id="email"
                            type="email"
                            defaultValue="admin@courtease.id"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          {/* Nilai statis di defaultValue */}
                          <Input
                            id="phone"
                            type="tel"
                            defaultValue="+62 812-3456-7890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Lokasi</Label>
                          {/* Nilai statis di defaultValue */}
                          <Input
                            id="location"
                            defaultValue="Jakarta, Indonesia"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={3}
                          // Nilai statis di defaultValue
                          defaultValue="Pengelola sistem utama Courtease dengan fokus pada keamanan dan operasional venue."
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Batal</Button>
                        <Button>Simpan Perubahan</Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Keamanan Akun</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              Password
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Password Strength
                                </span>
                                <Badge variant="outline">Strong</Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                <Key className="h-4 w-4 mr-2" />
                                Change Password
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Two-Factor Auth
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">2FA Enabled</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Configure 2FA
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h4 className="text-base font-medium mb-3 flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Active Sessions
                        </h4>
                        <div className="space-y-3">
                          {/* Data sesi langsung ditulis di sini */}
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium flex items-center gap-2">
                                  Desktop • Chrome
                                  <Badge variant="default" className="text-xs">
                                    Current
                                  </Badge>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Windows 11 • IP: 192.168.1.1
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium flex items-center gap-2">
                                  Mobile • Safari
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  iOS 17 • IP: 192.168.1.2
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium flex items-center gap-2">
                                  Tablet • Chrome
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  iPadOS • IP: 192.168.1.3
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Revoke
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recent Activity</h3>

                      <div className="space-y-3">
                        {/* Data aktivitas langsung ditulis di sini */}
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Approved venue application
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Champion Futsal Center
                            </p>
                            <p className="text-xs text-muted-foreground">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1 text-blue-600">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Updated dashboard settings
                            </p>
                            <p className="text-xs text-muted-foreground">
                              5 hours ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Rejected venue application
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Small Sports Corner
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1 day ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1 text-blue-600">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Generated monthly report
                            </p>
                            <p className="text-xs text-muted-foreground">
                              2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="mt-1 text-blue-600">
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Reviewed user complaints
                            </p>
                            <p className="text-xs text-muted-foreground">
                              3 days ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
