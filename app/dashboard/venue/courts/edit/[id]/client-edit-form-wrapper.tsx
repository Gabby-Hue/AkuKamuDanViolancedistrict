"use client";

import { useEffect, useState } from "react";
import { EditCourtForm } from "@/components/edit-court-form";
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

interface ClientEditFormWrapperProps {
  profile: any;
  identity: any;
  venues: any[];
  courtId: string;
}

export default function ClientEditFormWrapper({
  profile,
  identity,
  venues,
  courtId,
}: ClientEditFormWrapperProps) {
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    description: [venue.city] || null,
    icon: "MapPin",
  }));

  const fetchCourt = async () => {
    if (!primaryVenue) {
      console.log("No primary venue found");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use direct query server action instead of API call
      const { getCourtDetailsAction } =
        await import("@/app/dashboard/venue/courts/court-actions");
      const courtData = await getCourtDetailsAction(courtId);

      if (courtData) {
        setCourt(courtData);
      } else {
        throw new Error("Court not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
      console.error("Failed to fetch court:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourt();
  }, [courtId, primaryVenue?.id]);

  if (loading) {
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/venue/courts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">
                Edit Lapangan
              </h2>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              Memuat data lapangan...
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/venue/courts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">
                Edit Lapangan
              </h2>
            </div>
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <h3 className="text-lg font-medium mb-2">Error Memuat Data</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={fetchCourt}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!court) {
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
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/venue/courts">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <h2 className="text-3xl font-bold tracking-tight">
                Edit Lapangan
              </h2>
            </div>
            <div className="text-center py-12 text-muted-foreground">
              Lapangan tidak ditemukan
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold tracking-tight">Edit Lapangan</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/venue/courts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>

          <div className="max-w-[800px]">
            <EditCourtForm
              court={court}
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
