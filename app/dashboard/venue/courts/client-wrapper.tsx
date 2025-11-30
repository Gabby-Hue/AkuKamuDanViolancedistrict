"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit,
  Trash2,
  Plus,
  Building2,
  Clock,
  DollarSign,
  CalendarX,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import CourtImage from "@/components/court-image";
import { DeleteCourtDialog } from "@/components/delete-court-dialog";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";

interface CourtCardProps {
  court: VenueCourtDetail;
  onRefresh: () => void;
}

function CourtCard({ court, onRefresh }: CourtCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleEditSuccess = () => {
    setEditOpen(false);
    onRefresh();
  };

  const handleDeleteSuccess = () => {
    setDeleteOpen(false);
    onRefresh();
  };

  return (
    <>
      <Card key={court.id} className="relative overflow-hidden">
        <CourtImage
          src={
            court.primaryImageUrl ||
            `/courts/fallback-${court.id}.jpg`
          }
          alt={court.name}
          fallbackId={`fallback-${court.id}`}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={court.isActive ? "default" : "secondary"}>
            {court.isActive ? "Aktif" : "Maintenance"}
          </Badge>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{court.name}</CardTitle>
          <CardDescription>
            {court.sport} • {court.surface || "Tidak ada permukaan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                Rp {court.pricePerHour.toLocaleString("id-ID")}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {court.bookingsToday} booking
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Kapasitas:</span>
                <span>{court.capacity || 0} orang</span>
              </div>
            </div>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span>Rating:</span>
                <span>
                  ⭐ {court.averageRating.toFixed(1)} (
                  {court.reviewCount})
                </span>
              </div>
            </div>
            {court.blackouts.length > 0 && (
              <div className="text-sm text-orange-600">
                <div className="flex items-center">
                  <CalendarX className="mr-2 h-4 w-4" />
                  {court.blackouts.length} blackout terdaftar
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href={`/dashboard/venue/courts/edit/${court.id}`}>
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteCourtDialog
        court={court}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}

interface CourtsClientWrapperProps {
  courts: VenueCourtDetail[];
  metrics: any;
  primaryVenueId: string | null;
}

export function CourtsClientWrapper({
  courts,
  metrics,
  primaryVenueId
}: CourtsClientWrapperProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    window.location.reload(); // Simple refresh for now - in production you'd want to refetch data
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lapangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalCourts ?? courts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.activeCourts
                ? courts.filter((c) => c.isActive).length
                : 0}{" "}
              aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Booking Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.todayBookings ??
                courts.reduce(
                  (sum, court) => sum + court.bookingsToday,
                  0,
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics
                ? "Data real dari booking"
                : "Proyeksi berdasarkan booking"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendapatan Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp{" "}
              {(
                metrics?.todayRevenue ??
                courts.reduce(
                  (sum, court) =>
                    sum + court.pricePerHour * court.bookingsToday,
                  0,
                )
              ).toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics
                ? "Data real dari booking"
                : "Proyeksi berdasarkan booking"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Kapasitas Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.totalCapacity ??
                courts.reduce(
                  (sum, court) => sum + (court.capacity || 0),
                  0,
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              Total semua lapangan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Court Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courts.map((court) => (
          <CourtCard
            key={`${court.id}-${refreshKey}`}
            court={court}
            onRefresh={handleRefresh}
          />
        ))}

        {courts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  Belum ada lapangan
                </h3>
                <p className="text-sm mb-4">
                  Tambahkan lapangan pertama Anda untuk memulai bisnis
                  venue
                </p>
                <Link href="/dashboard/venue/courts/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Lapangan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}