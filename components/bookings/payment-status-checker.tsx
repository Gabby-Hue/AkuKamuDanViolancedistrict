"use client";

import { useEffect, useState } from "react";

interface PaymentStatusCheckerProps {
  bookingId: string;
  enabled: boolean;
}

export function PaymentStatusChecker({
  bookingId,
  enabled
}: PaymentStatusCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!enabled || hasChecked) return;

    const checkPaymentStatus = async () => {
      setIsChecking(true);
      setHasChecked(true);

      try {
        const response = await fetch(`/api/bookings/${bookingId}/payment-status`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();

          // If status was updated, trigger page refresh
          if (result.success && result.status_updated) {
            console.log("Payment status updated automatically:", result);

            // Wait a moment before refreshing to show success
            setTimeout(() => {
              window.location.reload();
            }, 2000); // Increased delay to show success
          } else if (result.success && result.status_mapping) {
            console.log("Payment status mapping found:", result.status_mapping);
            console.log("Payment completed in Midtrans but not updated yet");

            // Try once more immediately for settlement status
            setTimeout(() => {
              checkPaymentStatus();
            }, 3000); // Slightly longer delay
          } else {
            console.log("Payment status check result:", result);
          }
        } else {
          console.error("Failed to check payment status:", response.statusText);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately, then every 5 seconds for up to 2 minutes
    checkPaymentStatus();
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    // Clear interval after 2 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [enabled, hasChecked, bookingId]);

  // Only show loading indicator if actively checking
  if (!enabled || hasChecked) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <div className="text-sm">
          <p className="font-medium text-slate-900 dark:text-white">
            Menyesuaikan status pembayaran...
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {isChecking ? "Mengecek status Midtrans..." : "Menunggu pembayaran selesai..."}
          </p>
        </div>
      </div>
    </div>
  );
}