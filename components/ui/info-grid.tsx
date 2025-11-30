import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Phone, Mail, Users, ChevronRight } from "lucide-react";

interface InfoGridProps {
  surface?: string | null;
  capacity?: number | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  location?: string | null;
  facilities?: string[] | null;
  className?: string;
}

export function InfoGrid({
  surface,
  capacity,
  contactPhone,
  contactEmail,
  location,
  facilities,
  className,
}: InfoGridProps) {
  const infoItems = [
    {
      title: "Permukaan",
      value: surface ?? "Disesuaikan venue",
      icon: null,
    },
    {
      title: "Kapasitas",
      value: capacity ? `${capacity} pemain` : "Fleksibel",
      icon: Users,
    },
    {
      title: "Kontak",
      value: contactPhone || contactEmail || "Hubungi venue via dashboard",
      icon: contactPhone ? Phone : Mail,
    },
    {
      title: "Lokasi",
      value: location ?? "Alamat lengkap tersedia saat booking",
      icon: MapPin,
    },
  ];

  return (
    <div className={cn("grid gap-6 md:grid-cols-2", className)}>
      {/* Court Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Lapangan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {infoItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                {item.icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-900 mt-0.5 break-words">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Amenities */}
          {facilities && facilities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Fasilitas Tersedia
              </h4>
              <div className="flex flex-wrap gap-2">
                {facilities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fitur Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Instant Booking</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  Pesan lapangan langsung tanpa menunggu konfirmasi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Pembayaran Aman</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  Transaksi dilindungi dengan sistem pembayaran terpercaya
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Paket Turnamen</h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  Tersedia paket khusus untuk event dan turnamen
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}