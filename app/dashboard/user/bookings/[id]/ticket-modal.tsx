"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import Image from "next/image";
import type { BookingStatus } from "@/lib/supabase/status";
import type { BookingDetail } from "@/lib/supabase/queries";

const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  checked_in: "Sudah Check-in",
  completed: "Selesai",
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

interface TicketModalProps {
  booking: BookingDetail;
  startTime: Date;
  endTime: Date;
}

export default function TicketModal({
  booking,
  startTime,
  endTime,
}: TicketModalProps) {
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Load Google Font when modal opens
  useEffect(() => {
    if (showTicketModal) {
      const link = document.createElement("link");
      link.href =
        "https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@400;600;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);

      return () => {
        try {
          document.head.removeChild(link);
        } catch (e) {
          // Link might already be removed
        }
      };
    }
  }, [showTicketModal]);

  // Generate booking code
  const generateBookingCode = (id: string, date: Date, courtName: string) => {
    const dateStr = `${date.getFullYear().toString().slice(2)}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const courtCode = courtName.slice(-1).toUpperCase();
    return `SPV-${dateStr}-${courtCode}`;
  };

  // Format price
  const formatPrice = (price: number) => {
    return `Rp${(price / 1000).toFixed(0)}K`;
  };

  // Format date
  const formatDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const bookingCode = generateBookingCode(
    booking.id,
    startTime,
    booking.court?.name || "",
  );
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60),
  );
  const imageUrl =
    "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=450&fit=crop";

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowTicketModal(true)}
        className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
      >
        <Eye className="mr-2 h-4 w-4" />
        Lihat Ticket
      </Button>

      {/* Manual Modal Overlay */}
      {showTicketModal && (
        <div
          className="fixed inset-0 w-screen h-screen z-501"
          style={{
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background overlay untuk click to close */}
          <div
            className="absolute inset-0 w-full h-full"
            onClick={() => setShowTicketModal(false)}
          />

          {/* Close button */}
          <button
            onClick={() => setShowTicketModal(false)}
            className="absolute top-6 right-6 z-50 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200"
          >
            <X className="h-5 w-5 text-black" />
          </button>

          {/* SVG Mask Ticket with Perfect Holes */}
          <div
            className="relative z-10"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing
          >
            <svg
              width="280"
              height="550"
              viewBox="0 0 280 550"
              style={{
                fontFamily: '"Yanone Kaffeesatz", sans-serif',
                fontWeight: 600,
                filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))",
              }}
            >
              {/* Define mask for holes */}
              <defs>
                <mask id="ticketMask">
                  <rect width="280" height="550" fill="white" />
                  {/* Top holes */}
                  <circle cx="140" cy="0" r="20" fill="black" />
                  <circle cx="2" cy="0" r="20" fill="black" />
                  <circle cx="280" cy="0" r="20" fill="black" />
                  {/* Middle holes */}
                  <circle cx="0" cy="405" r="20" fill="black" />
                  <circle cx="280" cy="405" r="20" fill="black" />
                </mask>
              </defs>

              {/* Main ticket shape with mask applied */}
              <rect
                x="0"
                y="0"
                width="280"
                height="550"
                fill="white"
                rx="8"
                mask="url(#ticketMask)"
              />

              {/* Content inside ticket */}
              <g style={{ pointerEvents: "none" }}>
                {/* Title Section */}
                <text
                  x="140"
                  y="65"
                  textAnchor="middle"
                  fill="#aaa"
                  fontSize="13"
                >
                  SPORTIVO ARENA PRESENTS
                </text>
                <text
                  x="140"
                  y="95"
                  textAnchor="middle"
                  fontSize="24"
                  fontWeight="700"
                  fill="#333"
                >
                  {(booking.court?.name || "").toUpperCase()}
                </text>

                {/* Info Table 1 */}
                <text x="25" y="285" fontSize="19" fill="#666">
                  LAPANGAN
                </text>
                <text x="120" y="285" fontSize="19" fill="#666">
                  TANGGAL
                </text>
                <text x="233" y="285" fontSize="19" fill="#666">
                  JAM
                </text>

                <text x="25" y="310" fontSize="20" fontWeight="600" fill="#333">
                  {"Futsal"}
                </text>
                <text
                  x="129"
                  y="310"
                  fontSize="20"
                  fontWeight="600"
                  fill="#333"
                >
                  {formatDate(startTime)}
                </text>
                <text
                  x="237"
                  y="310"
                  fontSize="20"
                  fontWeight="600"
                  fill="#333"
                >
                  {startTime
                    .toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    .slice(0, 2)}
                </text>

                {/* Info Table 2 */}
                <text x="25" y="345" fontSize="19" fill="#666">
                  HARGA
                </text>
                <text x="120" y="345" fontSize="19" fill="#666">
                  DURASI
                </text>
                <text x="210" y="345" fontSize="19" fill="#666">
                  DIPESAN
                </text>

                <text x="27" y="360" fontSize="14" fill="#333">
                  {formatPrice(booking.price_total)}
                </text>
                <text x="127" y="365" fontSize="14" fill="#333">
                  {duration} Jam
                </text>
                <text x="223" y="365" fontSize="14" fill="#333">
                  {booking.profile?.full_name || "User"}
                </text>

                {/* Dashed line */}
                <line
                  x1="30"
                  y1="405"
                  x2="250"
                  y2="405"
                  stroke="#aaa"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                />

                {/* Booking Code */}
                <text
                  x="140"
                  y="495"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill="#333"
                  letterSpacing="1"
                >
                  {bookingCode}
                </text>
                <text
                  x="140"
                  y="510"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#aaa"
                  letterSpacing="2"
                >
                  BOOKING ID: #{booking.id.slice(-8).toUpperCase()}
                </text>
              </g>
            </svg>

            {/* Poster Image Overlay */}
            <div
              style={{
                position: "absolute",
                top: "110px",
                left: "10px",
                width: "260px",
                height: "146px",
                borderRadius: "4px",
                overflow: "hidden",
                zIndex: 5,
              }}
            >
              <Image
                src={imageUrl}
                alt={booking.court?.name || ""}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 280px) 100vw"
              />
            </div>

            {/* Status Badge Overlay */}
            <div
              className="absolute"
              style={{
                bottom: "90px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "240px",
              }}
            >
              <Badge
                variant={getBookingStatusVariant(booking.status)}
                className="w-full justify-center text-xs py-1"
              >
                {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
