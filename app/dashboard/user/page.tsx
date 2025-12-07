import { requireRole } from "@/lib/supabase/roles";
import { UserQueries } from "@/lib/queries/user";
import { PublicQueries } from "@/lib/queries/public";
import type { Court } from "@/lib/queries/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  CalendarClock,
  CreditCard,
  Sparkles,
  MapPin,
  Users,
  Clock,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Timer,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

// Adapter function to transform Court to the expected format for recommendations
function adaptCourtToLegacyFormat(court: Court) {
  return {
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface || null,
    pricePerHour: court.pricePerHour,
    capacity: court.capacity || null,
    facilities: court.facilities,
    description: court.description || null,
    venueName: court.venueName,
    venueCity: court.venueCity || null,
    venueAddress: court.venueAddress || null,
    venueLatitude: court.venueLatitude || null,
    venueLongitude: court.venueLongitude || null,
    primaryImageUrl: court.primaryImageUrl || null,
    averageRating: court.averageRating,
    reviewCount: court.reviewCount,
  };
}

export default async function UserDashboardPage() {
  const profile = await requireRole(["user", "admin"]);

  // Get user bookings using UserQueries
  const userBookings = await UserQueries.getUserBookings(profile.id, {
    limit: 10,
    upcoming: false,
  });

  // Get recommended courts using PublicQueries
  const recommendedCourts = await PublicQueries.getActiveCourts({ limit: 20 });
  const adaptedCourts = recommendedCourts.map(adaptCourtToLegacyFormat);

  const activeBookings = userBookings.filter((booking) =>
    ["pending", "confirmed", "checked_in"].includes(booking.status),
  ).length;

  const totalBookings = userBookings.length;

  const pendingPayments = userBookings.filter(
    (booking) => booking.paymentStatus === "pending",
  ).length;

  const recommendations = adaptedCourts.slice(0, 6);
  const firstName = profile.full_name?.split(" ")[0] ?? "Pemain";

  const stats = [
    {
      title: "Booking Aktif",
      value: activeBookings,
      description:
        activeBookings > 0
          ? "Slot terdekat sudah tersusun"
          : "Belum ada jadwal mendatang",
      icon: CalendarClock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Pembayaran Tertunda",
      value: pendingPayments,
      description:
        pendingPayments > 0
          ? "Selesaikan sebelum batas waktu"
          : "Tidak ada transaksi menggantung",
      icon: CreditCard,
      color: pendingPayments > 0 ? "text-orange-600" : "text-green-600",
      bgColor:
        pendingPayments > 0
          ? "bg-orange-100 dark:bg-orange-900/20"
          : "bg-green-100 dark:bg-green-900/20",
      highlight: pendingPayments > 0,
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      description:
        totalBookings > 0 ? "Jumlah booking kamu" : "Belum ada booking",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  const quickActions = [
    {
      title: "Cari Venue Baru",
      description: "Temukan lapangan impian untuk latihan",
      icon: MapPin,
      href: "/venues",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Jelajahi Komunitas",
      description: "Gabung dengan pemain lain",
      icon: Users,
      href: "/explore",
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={undefined} alt={firstName} />
                  <AvatarFallback className="text-lg">
                    {firstName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Hai, {firstName}!
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Dashboard Booking Kamu
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-gray-600 dark:text-gray-300">
                Pantau status pembayaran real-time, kelola jadwal, dan temukan
                venue baru yang sesuai dengan preferensi tim kamu.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  asChild
                  className={`${action.color} text-white`}
                >
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4" />
                    {action.title}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={`relative overflow-hidden ${
                stat.highlight
                  ? "ring-2 ring-orange-200 dark:ring-orange-800"
                  : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
                {stat.highlight && (
                  <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Perlu tindakan segera
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Active Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Booking Aktif</CardTitle>
                    <CardDescription>
                      Kelola jadwal dan pembayaran dalam satu view
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/venues">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Tambah Booking
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userBookings.length > 0 ? (
                    userBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {booking.court?.name || "Unknown Court"}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {booking.court?.venueName || "Unknown Venue"}
                              {booking.court?.venueCity &&
                                ` • ${booking.court.venueCity}`}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 text-right">
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {booking.status === "pending"
                                ? "Menunggu Konfirmasi"
                                : booking.status === "confirmed"
                                  ? "Dikonfirmasi"
                                  : booking.status}
                            </Badge>
                            <Badge
                              variant={
                                booking.paymentStatus === "paid"
                                  ? "default"
                                  : booking.paymentStatus === "pending"
                                    ? "destructive"
                                    : booking.paymentStatus === "cancelled"
                                      ? "outline"
                                      : booking.paymentStatus ===
                                          "waiting_confirmation"
                                        ? "secondary"
                                        : "secondary"
                              }
                            >
                              {booking.paymentStatus === "pending"
                                ? "Belum Dibayar"
                                : booking.paymentStatus === "paid"
                                  ? "Berhasil"
                                  : booking.paymentStatus === "cancelled"
                                    ? "Dibatalkan"
                                    : booking.paymentStatus ===
                                        "waiting_confirmation"
                                      ? "Menunggu Konfirmasi"
                                      : booking.paymentStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(booking.startTime).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}{" "}
                              -{" "}
                              {new Date(booking.endTime).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarClock className="h-4 w-4" />
                              {new Date(booking.startTime).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                },
                              )}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Rp{" "}
                            {Number(booking.priceTotal || 0).toLocaleString(
                              "id-ID",
                            )}
                          </span>
                        </div>

                        {booking.paymentReference && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            <span className="font-semibold uppercase">
                              Invoice:
                            </span>{" "}
                            #{booking.paymentReference}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {booking.court?.sport || "Unknown"}
                          </span>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/dashboard/user/bookings/${booking.id}`}
                            >
                              Lihat Detail
                            </Link>
                          </Button>
                        </div>

                        {booking.paymentStatus === "pending" &&
                          booking.paymentExpiredAt && (
                            <div className="mt-2 flex items-center text-xs text-orange-600 dark:text-orange-400">
                              <Timer className="h-3 w-3 mr-1" />
                              Batas Bayar:{" "}
                              {new Date(
                                booking.paymentExpiredAt,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {new Date(booking.paymentExpiredAt) <
                                new Date() && (
                                <span className="ml-1 text-red-600 dark:text-red-400 font-semibold">
                                  (Kadaluarsa)
                                </span>
                              )}
                            </div>
                          )}

                        {booking.paymentStatus === "cancelled" &&
                          booking.paymentExpiredAt &&
                          new Date(booking.paymentExpiredAt) < new Date() && (
                            <div className="mt-2 flex items-center text-xs text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Kadaluarsa:{" "}
                              {new Date(
                                booking.paymentExpiredAt,
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarClock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Belum ada booking terjadwal</p>
                      <p className="text-sm">
                        Mulai dengan mencari venue favorit kamu
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Aktivitas</CardTitle>
                <CardDescription>
                  Update otomatis dari pembayaran Midtrans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Booking Aktif
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {activeBookings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Menunggu Pembayaran
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pendingPayments}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Rekomendasi Venue
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {recommendations.length}
                    </span>
                  </div>

                  {pendingPayments > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="flex items-center text-orange-800 dark:text-orange-200 text-sm font-medium mb-2">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Perlu Tindakan
                      </div>
                      <div className="space-y-2 text-xs text-orange-700 dark:text-orange-300">
                        {userBookings
                          .filter(
                            (booking) => booking.paymentStatus === "pending",
                          )
                          .slice(0, 2)
                          .map((booking) => (
                            <div
                              key={booking.id}
                              className="flex items-center justify-between"
                            >
                              <span className="font-medium">
                                {booking.court?.name || "Unknown Court"}
                              </span>
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                <Link
                                  href={`/dashboard/user/bookings/${booking.id}`}
                                >
                                  Bayar
                                </Link>
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips Untuk Tim</CardTitle>
                <CardDescription>
                  Optimalkan sesi latihan dan transparansi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Planning Fokus Sesi
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Tambahkan catatan strategis pada booking
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Bagikan ke Tim
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Kirim link detail untuk transparansi
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          Review Venue
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Bantu komunitas dengan feedback
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rekomendasi Venue</CardTitle>
                    <CardDescription>
                      Disesuaikan dengan preferensi dan histori kamu
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/explore?sport=all">
                      Lihat Semua
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((court) => (
                    <div
                      key={court.id}
                      className="group cursor-pointer rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <Link href={`/court/${court.slug}`}>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {court.primaryImageUrl ? (
                            <Image
                              src={court.primaryImageUrl}
                              alt={court.name}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <div className="text-center p-4">
                                <div className="text-3xl mb-2">🏟️</div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {court.sport}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {court.averageRating ? Number(court.averageRating).toFixed(1) : "0.0"}
                              {court.reviewCount > 0 && (
                                <span className="text-gray-300">
                                  ({court.reviewCount})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {court.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                              {court.venueName}
                              {court.venueCity && `, ${court.venueCity}`}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {court.sport}
                                </Badge>
                                {court.surface && (
                                  <Badge variant="outline" className="text-xs">
                                    {court.surface}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-blue-600 dark:text-blue-400">
                                  Rp{Number(court.pricePerHour || 0).toLocaleString("id-ID")}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  /jam
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
