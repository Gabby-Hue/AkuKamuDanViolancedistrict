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
import {
  getAdminDashboardData,
  type AdminDashboardData,
} from "@/lib/supabase/queries/dashboard";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminClient } from "@/lib/supabase/server";
import { ApplicationsClient } from "./applications-client";

function getDefaultAdminDashboardData(): AdminDashboardData {
  return {
    metrics: {
      totalVenues: 0,
      totalCourts: 0,
      totalBookings: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingApplications: 0,
      totalThreads: 0,
    },
    revenueTrend: [],
    sportBreakdown: [],
    venueLeaders: [],
    partnerApplications: {
      pending: [],
      accepted: [],
      rejected: [],
    },
  };
}

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  let dashboardData = getDefaultAdminDashboardData();

  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    console.error("Failed to load admin dashboard data:", error);
  }

  // Fetch all partner applications
  let allApplications: any[] = [];
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("venue_partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      allApplications = data.map((app) => ({
        id: app.id,
        name: app.organization_name,
        owner: app.contact_name,
        email: app.contact_email,
        phone: app.contact_phone,
        city: app.city || "Unknown",
        sport: app.facility_types
          ? app.facility_types.join(", ")
          : "Multi-sport",
        status: app.status || "pending",
        submittedDate: app.created_at,
        description: app.notes || "No description provided",
        facilities: app.facility_types || [],
        operatingHours: "Not specified",
        courts: app.facility_count || 1,
        businessName: app.organization_name,
        address: null,
        decisionNote: app.decision_note,
        facilityCount: app.facility_count,
        existingSystem: app.existing_system,
        notes: app.notes,
        reviewedAt: app.reviewed_at,
        handledBy: app.handled_by,
      }));
    }
  } catch (error) {
    console.error("Failed to load partner applications:", error);
  }

  const pendingApplications = allApplications.filter(
    (app) => app.status === "pending",
  );
  const acceptedApplications = allApplications.filter(
    (app) => app.status === "accepted",
  );
  const rejectedApplications = allApplications.filter(
    (app) => app.status === "rejected",
  );

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
            <h2 className="text-3xl font-bold tracking-tight">
              Venue Applications
            </h2>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ApplicationsClient
            allApplications={allApplications}
            pendingApplications={pendingApplications}
            acceptedApplications={acceptedApplications}
            rejectedApplications={rejectedApplications}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
