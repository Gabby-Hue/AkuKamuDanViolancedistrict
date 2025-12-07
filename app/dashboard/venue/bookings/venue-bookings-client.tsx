"use client";

import { useState, useEffect } from "react";
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
import type { NavProject } from "@/components/nav-projects";
import type { Booking } from "@/lib/queries/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  getVenueBookingsData,
  updateBookingStatus,
  cancelBooking,
} from "./venue-bookings-actions";

// We'll use the Booking type from lib/queries/types directly

interface VenueData {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
}

interface VenueBookingsClientProps {
  profile: any;
  identity: any;
  venues: VenueData[];
}

export default function VenueBookingsClient({
  profile,
  identity,
  venues,
}: VenueBookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
    null,
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("today");

  // Pagination & Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 10;

  // Action buttons renderer
  const renderBookingActions = (
    booking: VenueBooking,
    showCancel: boolean = true,
  ) => {
    const isPaid = booking.paymentStatus === "paid";
    const canConfirm = booking.status === "pending" || booking.status === "awaiting_information";

    switch (booking.status) {
      case "confirmed":
        return (
          <>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleUpdateBookingStatus(booking.id, "checked_in")}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Check In
            </Button>
            {showCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleCancelBooking(booking.id)}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Batalkan
              </Button>
            )}
          </>
        );

      case "checked_in":
        return (
          <>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => handleUpdateBookingStatus(booking.id, "completed")}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Selesai
            </Button>
          </>
        );

      case "completed":
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => viewBookingDetails(booking)}
          >
            Detail
          </Button>
        );

      case "pending":
      case "awaiting_information":
        return (
          <>
            <Button
              size="sm"
              className={`${isPaid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
              onClick={() => {
                if (isPaid) {
                  handleUpdateBookingStatus(booking.id, "confirmed");
                }
              }}
              disabled={!isPaid}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              {isPaid ? "Konfirmasi" : "Menunggu Pembayaran"}
            </Button>
            {showCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleCancelBooking(booking.id)}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Tolak
              </Button>
            )}
          </>
        );

      default:
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => viewBookingDetails(booking)}
          >
            Detail
          </Button>
        );
    }
  };

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";

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
    },
    {
      title: "Jadwal & Booking",
      url: "/dashboard/venue/bookings",
      icon: "CalendarClock",
      isActive: true,
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = (
    venues.length
      ? venues
      : [
          {
            id: "placeholder",
            name: "Venue belum tersedia",
            city: null,
            district: null,
          },
        ]
  ).map((venue) => ({
    id: venue.id,
    name: venue.name,
    description:
      [venue.city, venue.district].filter(Boolean).join(", ") || null,
    icon: "MapPin",
  }));

  // Fetch bookings data using server action
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const result = await getVenueBookingsData();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch bookings");
      }

      setBookings(result.data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Gagal mengambil data booking");
    } finally {
      setLoading(false);
    }
  };

  // Update booking status using server action
  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: string,
    decisionNote?: string,
  ) => {
    try {
      const result = await updateBookingStatus({
        bookingId,
        status,
        notes: decisionNote,
      });

      if (result.success) {
        toast.success("Status berhasil diperbarui");
        fetchBookings();
      } else {
        toast.error(result.error || "Gagal memperbarui status");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Gagal memperbarui status booking");
    }
  };

  // Cancel booking using server action
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const result = await cancelBooking({ bookingId });

      if (result.success) {
        toast.success("Booking berhasil dibatalkan");
        fetchBookings();
      } else {
        toast.error(result.error || "Gagal membatalkan booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error("Gagal membatalkan booking");
    }
  };

  // View booking details
  const viewBookingDetails = (booking: VenueBooking) => {
    setSelectedBooking(booking);
    setDetailModalOpen(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setSelectedBooking(null);
    setDetailModalOpen(false);
  };

  // Get pending bookings for the card
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending" || booking.status === "awaiting_information",
  );

  // Filter bookings based on selected tab
  const filterBookings = (allBookings: Booking[]) => {
    const today = new Date().toISOString().split("T")[0];

    switch (selectedTab) {
      case "today":
        // Today's bookings - all statuses except pending
        return allBookings.filter(
          (booking) => {
            const bookingDate = new Date(booking.startTime).toISOString().split("T")[0];
            return bookingDate === today && booking.status !== "pending";
          },
        );
      case "upcoming":
        // Future bookings - confirmed, checked_in, completed
        return allBookings.filter(
          (booking) =>
            (booking.status === "confirmed" ||
              booking.status === "checked_in" ||
              booking.status === "completed") &&
            new Date(booking.startTime) > new Date(today),
        );
      case "all":
        // All bookings with search and filter
        let filtered = allBookings;

        // Search filter
        if (searchTerm) {
          filtered = filtered.filter(
            (booking) =>
              booking.customer?.fullName
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              booking.court?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              booking.customer?.email
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
        }

        // Status filter
        if (statusFilter !== "all") {
          filtered = filtered.filter(
            (booking) => booking.status === statusFilter,
          );
        }

        return filtered;
      default:
        return allBookings;
    }
  };

  const filteredBookings = filterBookings(bookings);
  const today = new Date().toISOString().split("T")[0];

  // Pagination for All tab
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedTab]);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-close pending card when clicked "Lihat Semua" or when no pending bookings
  useEffect(() => {
    if (selectedTab === "pending" && pendingBookings.length === 0) {
      setSelectedTab("today");
    }
  }, [pendingBookings.length, selectedTab]);

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
                  <BreadcrumbLink href="/dashboard/venue">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Jadwal & Booking</BreadcrumbPage>
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
              Jadwal & Booking
            </h2>
          </div>

          {/* Pending Bookings Card */}
          {pendingBookings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <CardTitle>
                      Menunggu Konfirmasi ({pendingBookings.length})
                    </CardTitle>
                  </div>
                </div>
                <CardDescription>
                  Booking yang perlu ditinjau dan dikonfirmasi segera
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBookings.map((booking) => {
                    const isPaid = booking.paymentStatus === "paid";
                    return (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {booking.startTime && booking.endTime ?
                                `${new Date(booking.startTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - ${new Date(booking.endTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}` : "Waktu tidak tersedia"
                              }
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.court?.name || "Unknown Court"} • {booking.customer?.fullName || "Customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.startTime ?
                                new Date(booking.startTime).toLocaleDateString("id-ID") :
                                "Tanggal tidak tersedia"
                              }
                            </p>
                            {!isPaid && (
                              <div className="flex items-center gap-1 mt-1">
                                <DollarSign className="h-3 w-3 text-orange-600" />
                                <p className="text-xs text-orange-600 font-medium">
                                  Belum Dibayar - Tidak dapat dikonfirmasi
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={isPaid ? "default" : "secondary"}
                            className={isPaid ? "bg-green-100 text-green-800 border-green-200" : ""}
                          >
                            {isPaid ? "Dibayar" : "Belum Bayar"}
                          </Badge>
                          <div className="flex gap-1">
                            {renderBookingActions(booking, true)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs
            defaultValue="today"
            className="space-y-4"
            value={selectedTab}
            onValueChange={setSelectedTab}
          >
            <TabsList>
              <TabsTrigger value="today">Hari Ini</TabsTrigger>
              <TabsTrigger value="upcoming">Akan Datang</TabsTrigger>
              <TabsTrigger value="all">Semua Booking</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Jadwal Hari Ini</CardTitle>
                  <CardDescription>
                    Semua booking untuk tanggal{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            <Clock className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {booking.startTime && booking.endTime ?
                                `${new Date(booking.startTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - ${new Date(booking.endTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}` : "Waktu tidak tersedia"
                              }
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.court?.name || "Unknown Court"} • {booking.customer?.fullName || "Customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.startTime).toLocaleDateString(
                                "id-ID",
                              )}
                            </p>
                            {booking.notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Catatan: {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              booking.status === "confirmed" ||
                              booking.status === "checked_in" ||
                              booking.status === "completed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {booking.status === "confirmed" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "pending" && (
                              <AlertCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "cancelled" && (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "checked_in" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "completed" && (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            )}
                            {booking.status === "confirmed"
                              ? "Dikonfirmasi"
                              : booking.status === "pending"
                                ? "Menunggu"
                                : booking.status === "checked_in"
                                  ? "Check In"
                                  : booking.status === "completed"
                                    ? "Selesai"
                                    : "Dibatalkan"}
                          </Badge>
                          <Badge
                            variant={
                              booking.paymentStatus === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {booking.paymentStatus === "paid"
                              ? "Dibayar"
                              : "Belum Bayar"}
                          </Badge>
                          <div className="flex gap-1">
                            {renderBookingActions(booking, true)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada booking untuk hari ini
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Akan Datang</CardTitle>
                  <CardDescription>
                    Booking yang telah dikonfirmasi untuk tanggal berikutnya
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                            <Calendar className="h-6 w-6 text-primary" />
                            <span className="text-xs font-medium">
                              {booking.startTime ?
                                new Date(booking.startTime).getDate() :
                                new Date().getDate()
                              }
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{booking.court?.name || "Unknown Court"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.startTime ?
                                new Date(booking.startTime).toLocaleDateString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                ) : "Tanggal tidak tersedia"
                              }
                            </p>
                            <p className="text-sm">
                              {booking.startTime && booking.endTime ?
                                `${new Date(booking.startTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - ${new Date(booking.endTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}` : "Waktu tidak tersedia"
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.court?.name || "Unknown Court"}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.customer?.fullName || "Customer"}
                          </p>
                          <p className="font-medium text-primary">
                            Rp {(booking.priceTotal || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {renderBookingActions(booking, true)}
                        </div>
                      </div>
                    ))}
                    {filteredBookings.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Tidak ada booking yang akan datang
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Semua Booking</CardTitle>
                  <CardDescription>
                    Semua data booking dengan filter dan pagination
                  </CardDescription>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cari booking..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="max-w-40">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                        <SelectItem value="checked_in">Check In</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Booking</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Lapangan</TableHead>
                        <TableHead>Tanggal & Waktu</TableHead>
                        <TableHead>Durasi</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {booking.customer?.fullName || "Customer"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {booking.customer?.email || "No email"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.court?.name || "Unknown Court"}</p>
                              <p className="text-sm text-muted-foreground">
                                {booking.court?.sport || "Unknown Sport"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>
                                {new Date(booking.startTime).toLocaleDateString(
                                  "id-ID",
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.startTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })} - {new Date(booking.endTime).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {Math.round(
                              (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
                                (1000 * 60 * 60)
                            )} jam
                          </TableCell>
                          <TableCell>
                            Rp {(booking.priceTotal || 0).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed" ||
                                booking.status === "checked_in" ||
                                booking.status === "completed"
                                  ? "default"
                                  : booking.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {booking.status === "confirmed" && (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              {booking.status === "pending" && (
                                <AlertCircle className="mr-1 h-3 w-3" />
                              )}
                              {booking.status === "cancelled" && (
                                <XCircle className="mr-1 h-3 w-3" />
                              )}
                              {booking.status === "checked_in" && (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              {booking.status === "completed" && (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              )}
                              {booking.status === "confirmed"
                                ? "Dikonfirmasi"
                                : booking.status === "pending"
                                  ? "Menunggu"
                                  : booking.status === "checked_in"
                                    ? "Check In"
                                    : booking.status === "completed"
                                      ? "Selesai"
                                      : "Dibatalkan"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.paymentStatus === "paid"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {booking.paymentStatus === "paid"
                                ? "Dibayar"
                                : booking.paymentStatus === "pending"
                                  ? "Belum"
                                  : "Kedaluwarsa"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewBookingDetails(booking)}
                            >
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 py-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) {
                                  setCurrentPage(currentPage - 1);
                                }
                              }}
                              className={
                                currentPage <= 1
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) {
                                  setCurrentPage(currentPage + 1);
                                }
                              }}
                              className={
                                currentPage >= totalPages
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  {paginatedBookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Tidak ada booking yang ditemukan
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
            <DialogDescription>
              Informasi lengkap booking untuk lapangan{" "}
              {selectedBooking?.court?.name || "Unknown Court"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {selectedBooking && (
              <>
                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Informasi Customer
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama:</span>
                        <span className="font-medium">
                          {selectedBooking?.customer?.fullName || "Unknown Customer"}
                        </span>
                      </div>
                      {selectedBooking?.customer?.email && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">
                            {selectedBooking.customer.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informasi Booking</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          ID Booking:
                        </span>
                        <span className="font-mono text-sm">
                          {selectedBooking?.id?.slice(0, 8) || "N/A"}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lapangan:</span>
                        <span className="font-medium">
                          {selectedBooking?.court?.name || "Unknown Court"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipe:</span>
                        <span className="font-medium">
                          {selectedBooking?.court?.sport || "Unknown Sport"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal:</span>
                        <span className="font-medium">
                          {selectedBooking?.startTime ?
                            new Date(selectedBooking.startTime).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            ) : "N/A"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Waktu:</span>
                        <span className="font-medium">
                          {selectedBooking?.startTime && selectedBooking?.endTime ?
                            `${new Date(selectedBooking.startTime).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} - ${new Date(selectedBooking.endTime).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}` : "N/A"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durasi:</span>
                        <span className="font-medium">
                          {selectedBooking?.startTime && selectedBooking?.endTime ?
                            `${Math.round(
                              (new Date(selectedBooking.endTime).getTime() - new Date(selectedBooking.startTime).getTime()) /
                                (1000 * 60 * 60)
                            )} jam` : "N/A"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Status & Pembayaran
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Status Booking:
                        </span>
                        <Badge
                          variant={
                            selectedBooking.status === "confirmed"
                              ? "default"
                              : selectedBooking.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {selectedBooking.status === "confirmed" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedBooking.status === "pending" && (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedBooking.status === "cancelled" && (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedBooking.status === "checked_in" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedBooking.status === "completed" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {selectedBooking.status === "confirmed"
                            ? "Dikonfirmasi"
                            : selectedBooking.status === "pending"
                              ? "Menunggu"
                              : selectedBooking.status === "checked_in"
                                ? "Check In"
                                : selectedBooking.status === "completed"
                                  ? "Selesai"
                                  : "Dibatalkan"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Status Pembayaran:
                        </span>
                        <Badge
                          variant={
                            selectedBooking.paymentStatus === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedBooking.paymentStatus === "paid"
                            ? "Dibayar"
                            : selectedBooking.paymentStatus === "pending"
                              ? "Belum"
                              : "Kedaluwarsa"}
                        </Badge>
                      </div>
                      {selectedBooking.notes && (
                        <div>
                          <span className="text-muted-foreground">
                            Catatan:
                          </span>
                          <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                            {selectedBooking.notes}
                          </p>
                        </div>
                      )}
                      {selectedBooking.checkedInAt && (
                        <div>
                          <span className="text-muted-foreground">
                            Check In:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              selectedBooking.checkedInAt,
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {selectedBooking.completedAt && (
                        <div>
                          <span className="text-muted-foreground">
                            Selesai:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              selectedBooking.completedAt,
                            ).toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDetailModal}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}