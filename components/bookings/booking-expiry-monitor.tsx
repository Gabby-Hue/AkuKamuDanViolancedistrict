"use client";

import { useEffect } from "react";

interface BookingExpiryMonitorProps {
  createdAt: string;
}

export function BookingExpiryMonitor({
  createdAt
}: BookingExpiryMonitorProps) {
  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in ms
    const expiryTime = createdTime + thirtyMinutes;

    const checkExpiry = async () => {
      const now = Date.now();
      const timeLeft = expiryTime - now;

      if (timeLeft <= 0) {
        console.log("Booking expired - triggering cleanup");

        try {
          const response = await fetch('/api/jobs/cancel-expired-bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Auto-cancellation result:', result);

            // Only refresh if booking was actually updated
            if (result.success && (result.updated > 0)) {
              // Refresh page to show updated status
              setTimeout(() => {
                window.location.reload();
              }, 2000); // Longer delay to ensure backend completes
            } else {
              console.log('No bookings were updated - no refresh needed');
            }
          } else {
            console.error('Failed to auto-cancel booking');
          }
        } catch (error) {
          console.error('Error in auto-cancellation:', error);
        }
      } else {
        const minutesLeft = Math.floor(timeLeft / (60 * 1000));
        console.log(`Booking expires in ${minutesLeft} minutes`);
      }
    };

    // Check immediately
    checkExpiry();

    // Set up interval to check every minute
    const interval = setInterval(checkExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return null; // This component is invisible, just handles the logic
}