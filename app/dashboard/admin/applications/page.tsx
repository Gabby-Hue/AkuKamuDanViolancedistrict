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
import { getAdminDashboardData, type AdminDashboardData } from "@/lib/supabase/queries/dashboard";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createAdminClient } from "@/lib/supabase/server";

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  let dashboardData: AdminDashboardData;
  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
    dashboardData = {
      metrics: {
        totalVenues: 0,
        totalCourts: 0,
        totalBookings: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingApplications: 0,
      },
      revenueTrend: [],
      sportBreakdown: [],
      venueLeaders: [],
      partnerApplications: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        recent: [],
      },
    };
  }

  // Fetch all partner applications
  let allApplications: any[] = [];
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      allApplications = data.map(app => ({
        id: app.id,
        name: app.business_name || app.full_name,
        owner: app.full_name,
        email: app.email,
        phone: app.phone,
        city: app.city || "Unknown",
        sport: app.sport_type || "Multi-sport",
        status: app.status,
        submittedDate: app.created_at,
        description: app.description || "No description provided",
        facilities: app.facilities ? JSON.parse(app.facilities as string) : [],
        operatingHours: app.operating_hours || "Not specified",
        courts: app.number_of_courts || 1,
        businessName: app.business_name,
        address: app.address,
        rejectionReason: app.rejection_reason,
      }));
    }
  } catch (error) {
    console.error("Failed to load partner applications:", error);
  }

  const pendingApplications = allApplications.filter(app => app.status === "pending");
  const approvedApplications = allApplications.filter(app => app.status === "approved");
  const rejectedApplications = allApplications.filter(app => app.status === "rejected");

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
      isActive: true,
    },
    {
      title: "Pengaturan",
      url: "/dashboard/admin/settings",
      icon: "Settings2",
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

  // Pagination logic
  const itemsPerPage = 5;
  const currentPage = 1;
  const totalPages = Math.ceil(allApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = allApplications.slice(startIndex, startIndex + itemsPerPage);

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
                  <BreadcrumbPage>Applications</BreadcrumbPage>
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
            <h2 className="text-3xl font-bold tracking-tight">Venue Applications</h2>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allApplications.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pendingApplications.length}
                  </div>
                  <p className="text-xs text-muted-foreground">Need review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Approved venues</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rejectedApplications.length}</div>
                  <p className="text-xs text-muted-foreground">Rejected venues</p>
                </CardContent>
              </Card>
            </div>

            {/* Applications Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Applications Management</CardTitle>
                <CardDescription>
                  Review and manage venue partnership applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
                    <TabsTrigger value="all">All Applications ({allApplications.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pending" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Venue Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Sport</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingApplications.map((application) => (
                          <ApplicationRow key={application.id} application={application} />
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="approved" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Venue Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Sport</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Approved Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approvedApplications.map((application) => (
                          <ApplicationRow key={application.id} application={application} />
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Venue Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Sport</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Rejected Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rejectedApplications.map((application) => (
                          <ApplicationRow key={application.id} application={application} />
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Venue Name</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Sport</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedApplications.map((application) => (
                          <ApplicationRow key={application.id} application={application} />
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allApplications.length)} of {allApplications.length} applications
                      </p>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">{currentPage}</PaginationLink>
                          </PaginationItem>
                          {totalPages > 1 && (
                            <PaginationItem>
                              <PaginationLink href="#">{currentPage + 1}</PaginationLink>
                            </PaginationItem>
                          )}
                          {totalPages > 2 && <PaginationEllipsis />}
                          <PaginationItem>
                            <PaginationLink href="#">{totalPages}</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
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

// ApplicationRow component for reusability
function ApplicationRow({ application }: { application: any }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{application.id.substring(0, 8)}...</TableCell>
      <TableCell>{application.name}</TableCell>
      <TableCell>{application.owner}</TableCell>
      <TableCell>
        <Badge variant="outline">{application.sport}</Badge>
      </TableCell>
      <TableCell>{application.city}</TableCell>
      <TableCell>{new Date(application.submittedDate).toLocaleDateString('id-ID')}</TableCell>
      {application.status === 'approved' && (
        <TableCell>{new Date(application.updated_at).toLocaleDateString('id-ID')}</TableCell>
      )}
      {application.status === 'rejected' && (
        <TableCell>{new Date(application.updated_at).toLocaleDateString('id-ID')}</TableCell>
      )}
      {application.status === 'pending' && <TableCell>-</TableCell>}
      <TableCell>
        <Badge
          variant={
            application.status === 'approved' ? 'default' :
            application.status === 'rejected' ? 'destructive' :
            'secondary'
          }
        >
          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{application.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Application ID</Label>
                    <p className="text-sm font-medium">{application.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge
                      variant={
                        application.status === 'approved' ? 'default' :
                        application.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Owner Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><strong>Name:</strong> {application.owner}</p>
                    <p className="text-sm"><strong>Email:</strong> {application.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {application.phone}</p>
                  </div>
                </div>

                <div>
                  <Label>Business Information</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><strong>Business Name:</strong> {application.businessName || "N/A"}</p>
                    <p className="text-sm"><strong>Sport Type:</strong> {application.sport}</p>
                    <p className="text-sm"><strong>City:</strong> {application.city}</p>
                    <p className="text-sm"><strong>Courts:</strong> {application.courts}</p>
                    <p className="text-sm"><strong>Operating Hours:</strong> {application.operatingHours}</p>
                    {application.address && <p className="text-sm"><strong>Address:</strong> {application.address}</p>}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-2">{application.description}</p>
                </div>

                <div>
                  <Label>Facilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {application.facilities.length > 0 ? application.facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="outline">{facility}</Badge>
                    )) : (
                      <span className="text-sm text-muted-foreground">No facilities listed</span>
                    )}
                  </div>
                </div>

                {application.status === 'approved' && (
                  <div>
                    <Label>Approval Information</Label>
                    <p className="text-sm mt-2">Approved on {new Date(application.updated_at).toLocaleDateString('id-ID')}</p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div>
                    <Label>Rejection Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm"><strong>Rejected Date:</strong> {new Date(application.updated_at).toLocaleDateString('id-ID')}</p>
                      {application.rejectionReason && <p className="text-sm"><strong>Reason:</strong> {application.rejectionReason}</p>}
                    </div>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {application.status === 'pending' && (
            <>
              <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}