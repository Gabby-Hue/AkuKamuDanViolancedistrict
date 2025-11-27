import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingScheduler } from "@/components/venues/booking-scheduler";
import { cn } from "@/lib/utils";
import { Calendar, CreditCard, Shield, Users } from "lucide-react";

interface BookingSidebarProps {
  courtId: string;
  isConfigured: boolean;
  midtransClientKey: string | null;
  snapScriptUrl: string;
  isBookingAllowed: boolean;
  disallowedMessage?: string | null;
  className?: string;
}

export function BookingSidebar({
  courtId,
  isConfigured,
  midtransClientKey,
  snapScriptUrl,
  isBookingAllowed,
  disallowedMessage,
  className,
}: BookingSidebarProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Quick Booking Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Booking Cepat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Semua transaksi diproses melalui sistem pembayaran yang aman.
              Kamu bisa mengatur jadwal, mengundang tim, dan memantau pembayaran
              langsung dari dashboard CourtEase.
            </p>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-1">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-600">Aman</p>
              </div>
              <div className="text-center">
                <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg bg-green-50 text-green-600 mb-1">
                  <CreditCard className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-600">Terpercaya</p>
              </div>
              <div className="text-center">
                <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-lg bg-purple-50 text-purple-600 mb-1">
                  <Users className="h-4 w-4" />
                </div>
                <p className="text-xs text-gray-600">Mudah</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Scheduler */}
      <BookingScheduler
        courtId={courtId}
        isConfigured={isConfigured}
        midtransClientKey={midtransClientKey}
        snapScriptUrl={snapScriptUrl}
        isBookingAllowed={isBookingAllowed}
        disallowedMessage={disallowedMessage}
      />

      {/* Tournament Package Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Paket Khusus
              </Badge>
            </div>
            <h4 className="font-semibold text-gray-900">
              Butuh paket turnamen?
            </h4>
            <p className="text-sm text-gray-600">
              Hubungi tim venue untuk paket multi-hari. Data kontak dan dokumen
              penawaran dapat kamu akses setelah melakukan permintaan booking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}