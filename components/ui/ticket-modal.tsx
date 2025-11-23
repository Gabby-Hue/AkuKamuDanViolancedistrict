"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useEffect } from "react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalPrice: number;
    customerName: string;
    customerEmail: string;
    courtType: string;
  };
}

export function TicketModal({ isOpen, onClose, booking }: TicketModalProps) {
  // Generate booking code dari ID dan tanggal
  const generateBookingCode = (id: string, date: string, courtName: string) => {
    const dateStr = date.replace(/-/g, '').slice(2); // 241124
    const courtCode = courtName.slice(-1).toUpperCase(); // A1
    return `SPV-${dateStr}-${courtCode}`;
  };

  // Format harga
  const formatPrice = (price: number) => {
    return `Rp${(price / 1000).toFixed(0)}K`;
  };

  // Format tanggal
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // Load Google Font
  useEffect(() => {
    if (isOpen) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@400;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [isOpen]);

  const bookingCode = generateBookingCode(booking.id, booking.date, booking.courtName);
  const imageUrl = "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&h=450&fit=crop";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-transparent border-none">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Ticket Container */}
          <div
            className="relative bg-white mx-auto"
            style={{
              width: '100%',
              maxWidth: '300px',
              fontFamily: '"Yanone Kaffeesatz", sans-serif',
              fontWeight: 600,
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Top holes */}
            <div
              style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#D8BFD8', // Thistle color
                borderRadius: '50%',
                position: 'absolute',
                left: '50%',
                marginLeft: '-20px',
                top: '-20px'
              }}
            />
            <div
              style={{
                content: '',
                height: '40px',
                width: '40px',
                backgroundColor: '#D8BFD8',
                position: 'absolute',
                borderRadius: '50%',
                left: '-150px',
                top: '0'
              }}
            />
            <div
              style={{
                content: '',
                height: '40px',
                width: '40px',
                backgroundColor: '#D8BFD8',
                position: 'absolute',
                borderRadius: '50%',
                left: '150px',
                top: '0'
              }}
            />

            {/* Title Section */}
            <div style={{ padding: '35px 20px 5px' }}>
              <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '2px' }}>
                SPORTIVO ARENA PRESENTS
              </p>
              <p
                style={{
                  fontSize: '28px',
                  lineHeight: '1.1',
                  margin: '0',
                  fontWeight: 700
                }}
              >
                {booking.courtName.toUpperCase()}
              </p>
            </div>

            {/* Poster Image */}
            <div style={{ marginBottom: '10px' }}>
              <img
                src={imageUrl}
                alt={booking.courtName}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Info Section */}
            <div style={{ padding: '10px 20px' }}>
              {/* First table */}
              <table style={{ width: '100%', fontSize: '12px', marginBottom: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: '38%' }}>LAPANGAN</th>
                    <th style={{ textAlign: 'left', width: '40%' }}>TANGGAL</th>
                    <th style={{ textAlign: 'left', width: '15%' }}>JAM</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontSize: '22px', fontWeight: 600 }}>
                      {booking.courtName.slice(-1)}
                    </td>
                    <td style={{ fontSize: '22px', fontWeight: 600 }}>
                      {formatDate(booking.date)}
                    </td>
                    <td style={{ fontSize: '22px', fontWeight: 600 }}>
                      {booking.startTime.slice(0, 2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Second table */}
              <table style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>HARGA</th>
                    <th style={{ textAlign: 'left' }}>DURASI</th>
                    <th style={{ textAlign: 'left' }}>PEMESAN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontSize: '16px' }}>{formatPrice(booking.totalPrice)}</td>
                    <td style={{ fontSize: '16px' }}>{booking.duration} Jam</td>
                    <td style={{ fontSize: '16px' }}>{booking.customerName}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Lower holes */}
            <div
              style={{
                position: 'relative',
                margin: '15px',
                border: '1px dashed #aaa'
              }}
            >
              <div
                style={{
                  content: '',
                  height: '40px',
                  width: '40px',
                  backgroundColor: '#D8BFD8',
                  position: 'absolute',
                  borderRadius: '50%',
                  top: '-20px',
                  left: '-40px'
                }}
              />
              <div
                style={{
                  content: '',
                  height: '40px',
                  width: '40px',
                  backgroundColor: '#D8BFD8',
                  position: 'absolute',
                  borderRadius: '50%',
                  top: '-20px',
                  right: '-40px'
                }}
              />
            </div>

            {/* Serial/Booking Code */}
            <div style={{ padding: '15px', textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#333',
                  letterSpacing: '1px',
                  marginBottom: '4px'
                }}
              >
                {bookingCode}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', letterSpacing: '2px' }}>
                BOOKING ID: #{booking.id}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}