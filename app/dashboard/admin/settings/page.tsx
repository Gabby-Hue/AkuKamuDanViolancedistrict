export const dynamic = "force-dynamic";
export const revalidate = 0;

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

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  const displayName = identity?.fullName ?? profile.full_name ?? "Admin";
  const email = identity?.email ?? "admin@courtease.id";
  const avatarUrl = null;

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

  // Mock data for admin profile
  const adminData = {
    fullName: displayName,
    email: email,
    phone: "+62 812-3456-7890",
    role: "Super Admin",
    department: "IT Operations",
    bio: "Pengelola sistem utama Courtease dengan fokus pada keamanan dan operasional venue.",
    location: "Jakarta, Indonesia",
    joinDate: "2024-01-15",
    lastLogin: new Date().toISOString(),
    securityScore: 85,
  };

  const recentActivity = [
    {
      action: "Approved venue application",
      venue: "Champion Futsal Center",
      time: "2 hours ago",
      type: "approve",
    },
    {
      action: "Updated dashboard settings",
      venue: null,
      time: "5 hours ago",
      type: "settings",
    },
    {
      action: "Rejected venue application",
      venue: "Small Sports Corner",
      time: "1 day ago",
      type: "reject",
    },
    {
      action: "Generated monthly report",
      venue: null,
      time: "2 days ago",
      type: "report",
    },
    {
      action: "Reviewed user complaints",
      venue: null,
      time: "3 days ago",
      type: "support",
    },
  ];

  const activeSessions = [
    {
      device: "Desktop",
      browser: "Chrome",
      os: "Windows 11",
      ip: "192.168.1.1",
      current: true,
    },
    {
      device: "Mobile",
      browser: "Safari",
      os: "iOS 17",
      ip: "192.168.1.2",
      current: false,
    },
    {
      device: "Tablet",
      browser: "Chrome",
      os: "iPadOS",
      ip: "192.168.1.3",
      current: false,
    },
  ];

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
                      {adminData.role}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Account</Label>
                        <p className="font-medium">{adminData.fullName}</p>
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
                        <p className="font-medium">{adminData.joinDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Department</p>
                        <p className="font-medium">{adminData.department}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {adminData.location}
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
                          <Input
                            id="fullName"
                            defaultValue={adminData.fullName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            defaultValue={adminData.email}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          <Input
                            id="phone"
                            type="tel"
                            defaultValue={adminData.phone}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Lokasi</Label>
                          <Input
                            id="location"
                            defaultValue={adminData.location}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={3}
                          defaultValue={adminData.bio}
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
                          {activeSessions.map((session, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    {session.device} • {session.browser}
                                    {session.current && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        Current
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.os} • IP: {session.ip}
                                  </p>
                                </div>
                              </div>
                              {!session.current && (
                                <Button variant="outline" size="sm">
                                  Revoke
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recent Activity</h3>

                      <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 border rounded-lg"
                          >
                            <div
                              className={`mt-1 ${activity.type === "approve" ? "text-green-600" : activity.type === "reject" ? "text-red-600" : "text-blue-600"}`}
                            >
                              {activity.type === "approve" ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : activity.type === "reject" ? (
                                <AlertCircle className="h-4 w-4" />
                              ) : (
                                <Activity className="h-4 w-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {activity.action}
                              </p>
                              {activity.venue && (
                                <p className="text-xs text-muted-foreground">
                                  {activity.venue}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        ))}
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
