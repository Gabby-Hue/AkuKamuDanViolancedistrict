import { AppSidebar } from "@/components/app-sidebar";
import { ClientEditFormWrapper } from "./client-edit-form-wrapper";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { fetchVenueDashboardData } from "@/lib/supabase/queries";
import { getVenueCourts } from "@/lib/supabase/queries/venue-courts";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import type { NavProject } from "@/components/nav-projects";

interface EditCourtPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCourtPage({ params }: EditCourtPageProps) {
  // Server-side authentication and data loading
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();
  const dashboardData = await fetchVenueDashboardData(profile);

  if (!profile || !dashboardData.venues.length) {
    redirect("/dashboard/venue");
  }

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";

  // Await the params to get the id
  const { id } = await params;

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
      title: "Blackout Schedule",
      url: "/dashboard/venue/blackout",
      icon: "CalendarX",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = dashboardData.venues.length
    ? dashboardData.venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        description:
          [venue.city, venue.district].filter(Boolean).join(", ") || null,
        icon: "MapPin",
      }))
    : [
        {
          id: "placeholder",
          name: "Venue belum tersedia",
          description: null,
          icon: "MapPin",
        },
      ];

  const navProjects: NavProject[] = dashboardData.venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    url: `/dashboard/venue/venues/${venue.id}`,
    icon: "MapPin",
  }));

  const primaryVenue = dashboardData.venues[0];

  // Get the court to edit
  const courts = await getVenueCourts(primaryVenue.id);
  const courtToEdit = courts.find((court) => court.id === id);

  if (!courtToEdit) {
    redirect("/dashboard/venue/courts");
  }

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        teams={teams}
        navMain={navMain}
        navProjects={navProjects}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
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
                  <BreadcrumbLink href="/dashboard/venue/courts">
                    Lapangan Saya
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Lapangan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/dashboard/venue/courts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Edit Lapangan</h2>
          </div>

          <div className="text-muted-foreground">
            <p>Edit lapangan: <strong>{courtToEdit.name}</strong> di venue <strong>{primaryVenue.name}</strong></p>
          </div>

          <ClientEditFormWrapper court={courtToEdit} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}