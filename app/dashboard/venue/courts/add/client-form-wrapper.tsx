"use client";

import { AddCourtForm } from "@/components/add-court-form";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";

interface ClientFormWrapperProps {
  profile: any;
  identity: any;
  venues: any[];
}

export default function ClientFormWrapper({
  profile,
  identity,
  venues,
}: ClientFormWrapperProps) {
  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const primaryVenue = venues.length > 0 ? venues[0] : null;

  const navMain: NavMainItem[] = [
    { title: "Dashboard", url: "/dashboard/venue", icon: "LayoutDashboard" },
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
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    description:
      [venue.city, venue.district].filter(Boolean).join(", ") || null,
    icon: "MapPin",
  }));

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        teams={teams}
        navMain={navMain}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
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
                  <BreadcrumbPage>Tambah Lapangan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">
              Tambah Lapangan Baru
            </h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/venue/courts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>

          <div className="text-muted-foreground">
            <p>
              Tambah lapangan baru ke venue:{" "}
              <strong>{primaryVenue?.name || "Venue"}</strong>
            </p>
          </div>

          <div className="max-w-[800px]">
            <AddCourtForm
              venueId={primaryVenue?.id || ""}
              onSuccess={() => {
                // Success will be handled by client-side navigation
              }}
              onClose={() => {
                // Close will be handled by client-side navigation
              }}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
