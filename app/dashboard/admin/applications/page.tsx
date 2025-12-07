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
import { AdminQueries } from "@/lib/queries";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationsClient } from "./applications-client";

export default async function Page() {
  const profile = await requireRole("admin");
  const identity = await getAuthenticatedProfile();

  // Fetch all partner applications using new query
  const applications = await AdminQueries.getVenuePartnerApplications();

  const {
    allApplications,
    pending,
    accepted,
    rejected
  } = applications;

  const displayName = profile.full_name ?? "Admin";
  const email = identity?.email ?? "admin@courtease.id";

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
            pendingApplications={pending}
            acceptedApplications={accepted}
            rejectedApplications={rejected}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
