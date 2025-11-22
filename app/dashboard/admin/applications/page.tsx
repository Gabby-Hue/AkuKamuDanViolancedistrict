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

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  const displayName = identity?.fullName ?? profile.full_name ?? "Admin";
  const email = identity?.email ?? "admin@courtease.id";
  const avatarUrl = identity?.avatarUrl ?? null;

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

  // Mock data untuk venue applications
  const pendingApplications = [
    {
      id: "VNY-001",
      name: "Champion Futsal Center",
      owner: "Budi Santoso",
      email: "budi@championfutsal.com",
      phone: "0812-3456-7890",
      city: "Jakarta Selatan",
      sport: "Futsal",
      status: "pending" as const,
      submittedDate: "2024-06-20",
      description: "Futsal court dengan fasilitas lengkap, lokasi strategis di tengah kota",
      facilities: ["Lapangan Standar", "Loker", "Mushola", "Parkir Luas", "Kantin"],
      operatingHours: "08:00 - 23:00",
      courts: 3,
    },
    {
      id: "VNY-002",
      name: "Elite Badminton Hall",
      owner: "Siti Nurhaliza",
      email: "siti@elitebadminton.com",
      phone: "0813-9876-5432",
      city: "Bandung",
      sport: "Badminton",
      status: "pending" as const,
      submittedDate: "2024-06-21",
      description: "Hall bulutangkis profesional dengan lantai kayu import",
      facilities: ["8 Lapangan", "AC", "Loker", "Cafe", "Pro Shop"],
      operatingHours: "06:00 - 22:00",
      courts: 8,
    },
    {
      id: "VNY-003",
      name: "Victory Tennis Court",
      owner: "Ahmad Rizki",
      email: "ahmad@victorytennis.com",
      phone: "0815-6789-0123",
      city: "Surabaya",
      sport: "Tenis",
      status: "pending" as const,
      submittedDate: "2024-06-22",
      description: "Lapangan tenis hardcourt dengan lighting malam",
      facilities: ["2 Lapangan Hardcourt", "Floodlight", "Loker", "Rest Area"],
      operatingHours: "07:00 - 21:00",
      courts: 2,
    },
    {
      id: "VNY-004",
      name: "Premier Basketball Arena",
      owner: "Rina Wijaya",
      email: "rina@premierbasketball.com",
      phone: "0816-2345-6789",
      city: "Jakarta Pusat",
      sport: "Basket",
      status: "pending" as const,
      submittedDate: "2024-06-23",
      description: "Lapangan basket indoor dengan standar internasional",
      facilities: ["2 Lapangan", "Scoreboard", "Locker Room", "Shower", "Cafeteria"],
      operatingHours: "07:00 - 22:00",
      courts: 2,
    },
    {
      id: "VNY-005",
      name: "Golden Swimming Pool",
      owner: "Faisal Rahman",
      email: "faisal@goldenswim.com",
      phone: "0817-3456-7890",
      city: "Tangerang",
      sport: "Renang",
      status: "pending" as const,
      submittedDate: "2024-06-23",
      description: "Kolam renang olympic size dengan fasilitas lengkap",
      facilities: ["8 Lane Olympic Pool", "Warm-up Pool", "Kids Pool", "Gym", "Sauna"],
      operatingHours: "06:00 - 21:00",
      courts: 1,
    },
  ];

  const approvedApplications = [
    {
      id: "VNY-006",
      name: "Mega Sport Center",
      owner: "Joko Widodo",
      email: "joko@megaport.com",
      phone: "0818-4567-8901",
      city: "Bekasi",
      sport: "Multi-sport",
      status: "approved" as const,
      submittedDate: "2024-06-15",
      approvedDate: "2024-06-18",
      description: "Multi-sport complex dengan berbagai macam olahraga",
      facilities: ["Futsal", "Basket", "Badminton", "Gym", "Cafe"],
      operatingHours: "06:00 - 23:00",
      courts: 10,
    },
    {
      id: "VNY-007",
      name: "Victory Volleyball Hall",
      owner: "Dewi Lestari",
      email: "dewi@victoryvolly.com",
      phone: "0819-5678-9012",
      city: "Depok",
      sport: "Voli",
      status: "approved" as const,
      submittedDate: "2024-06-10",
      approvedDate: "2024-06-12",
      description: "Hall voli dengan matras berkualitas tinggi",
      facilities: ["4 Lapangan Voli", "Matras Import", "AC", "Loker", "Gym"],
      operatingHours: "07:00 - 22:00",
      courts: 4,
    },
  ];

  const rejectedApplications = [
    {
      id: "VNY-008",
      name: "Small Sports Corner",
      owner: "Andi Pratama",
      email: "andi@smallcorner.com",
      phone: "0820-6789-0123",
      city: "Bogor",
      sport: "Futsal",
      status: "rejected" as const,
      submittedDate: "2024-06-05",
      rejectedDate: "2024-06-07",
      description: "Lapangan futsal mini di kompleks perumahan",
      facilities: ["1 Lapangan Mini", "Loker Sederhana"],
      operatingHours: "08:00 - 18:00",
      courts: 1,
      rejectionReason: "Lokasi tidak strategis dan fasilitas belum memenuhi standar minimum",
    },
  ];

  const allApplications = [...pendingApplications, ...approvedApplications, ...rejectedApplications];

  // Pagination logic
  const itemsPerPage = 5;
  const currentPage = 1;
  const totalPages = Math.ceil(allApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = allApplications.slice(startIndex, startIndex + itemsPerPage);

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email, avatarUrl }}
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
      <TableCell className="font-medium">{application.id}</TableCell>
      <TableCell>{application.name}</TableCell>
      <TableCell>{application.owner}</TableCell>
      <TableCell>
        <Badge variant="outline">{application.sport}</Badge>
      </TableCell>
      <TableCell>{application.city}</TableCell>
      <TableCell>{application.submittedDate}</TableCell>
      {application.status === 'approved' && (
        <TableCell>{application.approvedDate}</TableCell>
      )}
      {application.status === 'rejected' && (
        <TableCell>{application.rejectedDate}</TableCell>
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
                    <p className="text-sm font-medium">{application.id}</p>
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
                  <Label>Venue Details</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm"><strong>Sport Type:</strong> {application.sport}</p>
                    <p className="text-sm"><strong>City:</strong> {application.city}</p>
                    <p className="text-sm"><strong>Courts:</strong> {application.courts}</p>
                    <p className="text-sm"><strong>Operating Hours:</strong> {application.operatingHours}</p>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <p className="text-sm mt-2">{application.description}</p>
                </div>

                <div>
                  <Label>Facilities</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {application.facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="outline">{facility}</Badge>
                    ))}
                  </div>
                </div>

                {application.status === 'approved' && (
                  <div>
                    <Label>Approval Date</Label>
                    <p className="text-sm mt-2">{application.approvedDate}</p>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div>
                    <Label>Rejection Information</Label>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm"><strong>Rejected Date:</strong> {application.rejectedDate}</p>
                      <p className="text-sm"><strong>Reason:</strong> {application.rejectionReason}</p>
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