import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/supabase/roles";
import {
  fetchUserBookingDetail,
  fetchCourtDetail,
} from "@/lib/supabase/queries";
import type { BookingStatus, PaymentStatus } from "@/lib/supabase/status";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CalendarClock,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Timer,
  Star,
  Phone,
  Mail,
  Share2,
  Download,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import TicketModal from "./ticket-modal";

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  checked_in: "Sudah Check-in",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Belum Dibayar",
  processing: "Diproses",
  completed: "Berhasil",
  failed: "Gagal",
  cancelled: "Dibatalkan",
  refunded: "Dikembalikan",
};

const getBookingStatusVariant = (status: BookingStatus) => {
  switch (status) {
    case "confirmed":
      return "default";
    case "pending":
      return "secondary";
    case "checked_in":
      return "default";
    case "completed":
      return "outline";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const getPaymentStatusVariant = (status: PaymentStatus) => {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "destructive";
    case "processing":
      return "secondary";
    case "failed":
      return "destructive";
    case "cancelled":
      return "outline";
    case "refunded":
      return "outline";
    default:
      return "secondary";
  }
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireRole(["user", "admin"]);
  const { id } = await params;

  const booking = await fetchUserBookingDetail(id, profile);

  if (!booking) {
    notFound();
  }

  const court = await fetchCourtDetail(booking.court.slug);

  const heroImage =
    court?.images.find((image) => image.is_primary)?.image_url ??
    court?.images[0]?.image_url ??
    null;

  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);
  const paymentExpiresAt = booking.payment_expires_at
    ? new Date(booking.payment_expires_at)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/dashboard/user">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </Button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant={getBookingStatusVariant(booking.status)}>
                  {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
                </Badge>
                <Badge
                  variant={getPaymentStatusVariant(booking.payment_status)}
                >
                  {PAYMENT_STATUS_LABEL[booking.payment_status] ??
                    booking.payment_status}
                </Badge>
                <Badge variant="outline">{booking.court.sport}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {booking.court.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {booking.court.venue_name || booking.court.name}
                {booking.court.venue_city && ` • ${booking.court.venue_city}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
              <TicketModal
                booking={booking}
                startTime={startTime}
                endTime={endTime}
              />
              {booking.payment_status === "pending" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Lanjutkan Pembayaran
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            {heroImage && (
              <Card className="overflow-hidden">
                <div className="aspect-video relative">
                  <img
                    src={heroImage}
                    alt={booking.court.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </Card>
            )}

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  Detail Booking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tanggal
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {startTime.toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Waktu
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {startTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {endTime.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Durasi
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {Math.round(
                        (endTime.getTime() - startTime.getTime()) /
                          (1000 * 60 * 60),
                      )}{" "}
                      jam
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Harga
                    </label>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      Rp {booking.price_total.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {booking.payment_reference && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Invoice
                        </label>
                        <p className="font-mono text-slate-900 dark:text-white">
                          #{booking.payment_reference}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Salin
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Venue Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Informasi Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {booking.court.venue_name || booking.court.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {booking.court.venue_address || "Alamat venue"}
                    {booking.court.venue_city &&
                      `, ${booking.court.venue_city}`}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Lapangan
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {booking.court.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tipe Olahraga
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {booking.court.sport}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Phone contact info would need to be fetched from venues table if needed */}

                {/* Venue ratings would need to be fetched separately if needed */}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Detail Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge
                      variant={getPaymentStatusVariant(booking.payment_status)}
                    >
                      {PAYMENT_STATUS_LABEL[booking.payment_status] ??
                        booking.payment_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total Pembayaran
                    </span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      Rp {booking.price_total.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {booking.payment_reference && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">No. Invoice</span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                          #{booking.payment_reference}
                        </span>
                      </div>
                    </div>
                  )}

                  {booking.payment_status === "completed" &&
                    booking.completed_at && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg space-y-2">
                        <div className="flex items-center text-green-800 dark:text-green-200">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Pembayaran Berhasil
                          </span>
                        </div>
                        <div className="grid gap-1 text-xs text-green-700 dark:text-green-300">
                          <div className="flex justify-between">
                            <span>Waktu Bayar:</span>
                            <span>
                              {new Date(booking.completed_at).toLocaleString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                          {/* Payment method would need to be tracked separately if needed */}
                        </div>
                      </div>
                    )}

                  {paymentExpiresAt && booking.payment_status === "pending" && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center text-orange-800 dark:text-orange-200">
                        <Timer className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          Batas Waktu Pembayaran
                        </span>
                      </div>
                      <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                        {paymentExpiresAt.toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        Sisa waktu:{" "}
                        {Math.max(
                          0,
                          Math.ceil(
                            (paymentExpiresAt.getTime() -
                              new Date().getTime()) /
                              (1000 * 60),
                          ),
                        )}{" "}
                        menit
                      </p>
                    </div>
                  )}

                  {booking.payment_status === "processing" && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                      <div className="flex items-center text-blue-800 dark:text-blue-200">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          Sedang Diproses
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Pembayaran sedang diverifikasi oleh admin venue
                      </p>
                    </div>
                  )}

                  {booking.payment_status === "cancelled" &&
                    paymentExpiresAt &&
                    new Date() > paymentExpiresAt && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-2">
                        <div className="flex items-center text-red-800 dark:text-red-200">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Pembayaran Kadaluarsa
                          </span>
                        </div>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Waktu pembayaran telah habis pada{" "}
                          {paymentExpiresAt.toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Silakan buat booking baru jika masih ingin menggunakan
                          lapangan
                        </p>
                      </div>
                    )}

                  {booking.payment_status === "cancelled" &&
                    (!paymentExpiresAt || new Date() <= paymentExpiresAt) && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg space-y-2">
                        <div className="flex items-center text-gray-800 dark:text-gray-200">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">
                            Pembayaran Dibatalkan
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          Booking ini telah dibatalkan
                        </p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Bagikan ke Tim
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link href={`/court/${booking.court.slug}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Lihat Venue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Butuh Bantuan?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Hubungi Venue
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Contact venue for details
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Email Support
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      support@courtease.id
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
