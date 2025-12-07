import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/supabase/roles";
import { UserQueries } from "@/lib/queries/user";
import { PublicQueries } from "@/lib/queries/public";
import type {
  BookingStatus,
  PaymentStatus,
  ReviewData,
} from "@/lib/queries/types";
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
import { ContinuePaymentButton } from "@/components/bookings/continue-payment-button";
import { PaymentStatusChecker } from "@/components/bookings/payment-status-checker";
import { BookingExpiryMonitor } from "@/components/bookings/booking-expiry-monitor";
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
import ReviewForm from "./review-form-server-action";

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  checked_in: "Sudah Check-in",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Belum Dibayar",
  waiting_confirmation: "Diproses",
  paid: "Berhasil",
  expired: "Kedaluwarsa",
  cancelled: "Dibatalkan",
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
    case "paid":
      return "default";
    case "pending":
      return "destructive";
    case "waiting_confirmation":
      return "secondary";
    case "expired":
      return "destructive";
    case "cancelled":
      return "outline";
    default:
      return "secondary";
  }
};

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const profile = await requireRole(["user", "admin"]);
  const { id } = await params;
  const { check_payment } = await searchParams;

  // Fetch booking detail and review data in parallel
  const [booking, reviewData] = await Promise.all([
    UserQueries.getBookingDetail(id, profile.id),
    PublicQueries.getBookingReview(id, profile.id),
  ]);

  if (!booking) {
    notFound();
  }

  // Check review availability
  const hasExistingReview = !!booking.review || !!reviewData;
  const canReview =
    booking.status === "completed" &&
    booking.completedAt &&
    !hasExistingReview &&
    !booking.reviewSubmittedAt;

  const shouldCheckPayment =
    check_payment === "true" && booking.paymentStatus === "pending";

  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  const paymentExpiresAt = booking.paymentExpiredAt
    ? new Date(booking.paymentExpiredAt)
    : null;

  return (
    <div className="min-h-screen py-10">
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
                <Badge variant={getPaymentStatusVariant(booking.paymentStatus)}>
                  {PAYMENT_STATUS_LABEL[booking.paymentStatus] ??
                    booking.paymentStatus}
                </Badge>
                <Badge variant="outline">{booking.court?.sport}</Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                {booking.court?.name}
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                {booking.venueName || booking.court?.venueName}
                {booking.venueCity || booking.court?.venueCity && `, ${booking.venueCity || booking.court?.venueCity}`}
              </p>
              {booking.venueAddress || booking.court?.venueAddress ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {booking.venueAddress || booking.court?.venueAddress}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Bagikan
              </Button>
              {booking.court && (
                <TicketModal
                  booking={booking}
                  court={booking.court}
                  startTime={startTime}
                  endTime={endTime}
                />
              )}
              {booking.paymentStatus === "pending" && booking.paymentToken && (
                <ContinuePaymentButton
                  snapToken={booking.paymentToken}
                  redirectUrl={booking.paymentRedirectUrl}
                  clientKey={
                    process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || null
                  }
                  snapScriptUrl="https://app.sandbox.midtrans.com/snap/snap.js"
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
                      Rp {(booking.priceTotal || 0).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {booking.paymentReference && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Invoice
                        </label>
                        <p className="font-mono text-slate-900 dark:text-white">
                          #{booking.paymentReference || "N/A"}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-1" />
                        Salin
                      </Button>
                    </div>
                  </div>
                )}

                {booking.paymentCompletedAt && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-green-600 dark:text-green-400">
                          Pembayaran Selesai
                        </label>
                        <p className="text-slate-900 dark:text-white">
                          {new Date(booking.paymentCompletedAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Section */}
            {hasExistingReview ? (
              // Display existing review
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Review Anda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 ${
                            star <=
                            Math.round(
                              (booking.review || reviewData)?.rating || 0,
                            )
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {(booking.review || reviewData)?.rating.toFixed(1)} / 5.0
                    </p>
                    <p className="text-sm text-green-600 font-medium mb-3">
                      Review Anda telah dikirim
                    </p>
                    {(booking.review || reviewData)?.comment && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          "{(booking.review || reviewData)?.comment}"
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Terima kasih telah memberikan feedback untuk lapangan ini
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : booking.reviewSubmittedAt ? (
              // Show submitted message if review_submitted_at exists but no review data yet
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Review Anda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-8 w-8 fill-gray-200 text-gray-400"
                        />
                      ))}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      - / 5.0
                    </p>
                    <p className="text-sm text-green-600 font-medium mb-3">
                      Review Anda telah dikirim
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Review sedang diproses oleh sistem
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : !canReview ? (
              // Show cannot review message
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Review Lapangan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.status !== "completed"
                        ? "Review dapat ditulis setelah sesi bermain selesai"
                        : "Loading review data..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Show review form
              <ReviewForm
                bookingId={booking.id}
                profileId={profile.id}
                courtName={booking.court?.name}
              />
            )}

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
                    {booking.venueName || booking.court?.venueName}
                  </h3>
                  <div className="text-slate-600 dark:text-slate-300">
                    {booking.venueAddress || booking.court?.venueAddress ? (
                      <p>{booking.venueAddress || booking.court?.venueAddress}</p>
                    ) : null}
                    {booking.venueCity || booking.court?.venueCity ? (
                      <p>{booking.venueCity || booking.court?.venueCity}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Lapangan
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {booking.court?.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tipe Olahraga
                    </label>
                    <p className="text-slate-900 dark:text-white">
                      {booking.court?.sport}
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
                      variant={getPaymentStatusVariant(booking.paymentStatus)}
                    >
                      {PAYMENT_STATUS_LABEL[booking.paymentStatus] ??
                        booking.paymentStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Total Pembayaran
                    </span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">
                      Rp {(booking.priceTotal || 0).toLocaleString("id-ID")}
                    </span>
                  </div>

                  {booking.paymentReference && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">No. Invoice</span>
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                          #{booking.paymentReference || "N/A"}
                        </span>
                      </div>
                    </div>
                  )}

                  {booking.paymentStatus === "paid" && booking.paymentCompletedAt && (
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
                              {new Date(
                                booking.paymentCompletedAt,
                              ).toLocaleString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {/* Payment method would need to be tracked separately if needed */}
                        </div>
                      </div>
                    )}

                  {paymentExpiresAt && booking.paymentStatus === "pending" && (
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

                  {booking.paymentStatus === "waiting_confirmation" && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg space-y-2">
                      <div className="flex items-center text-blue-800 dark:text-blue-200">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          Menunggu Konfirmasi
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Pembayaran sedang diverifikasi oleh admin venue
                      </p>
                    </div>
                  )}

                  {booking.paymentStatus === "cancelled" &&
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
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Silakan buat booking baru jika masih ingin menggunakan
                          lapangan
                        </p>
                      </div>
                    )}

                  {booking.paymentStatus === "cancelled" &&
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
                {booking.court?.slug ? (
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <Link href={`/court/${booking.court?.slug || booking.courtId}`}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Lihat Court
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" size="sm" disabled>
                    <MapPin className="mr-2 h-4 w-4" />
                    Court tidak tersedia
                  </Button>
                )}
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

      {/* Auto Payment Status Checker */}
      <PaymentStatusChecker bookingId={id} enabled={shouldCheckPayment} />

      {/* Booking Expiry Monitor - auto-cancel after 30 minutes */}
      <BookingExpiryMonitor createdAt={booking.createdAt} />
    </div>
  );
}
