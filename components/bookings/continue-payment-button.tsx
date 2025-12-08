"use client";

import { useCallback, useState } from "react";
import Script from "next/script";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, Clock, AlertCircle } from "lucide-react";

type ContinuePaymentButtonProps = {
  snapToken: string | null;
  redirectUrl: string | null;
  clientKey: string | null;
  snapScriptUrl: string;
};

export function ContinuePaymentButton({
  snapToken,
  redirectUrl,
  clientKey,
  snapScriptUrl,
}: ContinuePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [snapReady, setSnapReady] = useState(false);

  const handleClick = useCallback(() => {
    if (!snapToken && !redirectUrl) {
      toast.info("Pembayaran belum tersedia", {
        description: "Hubungi admin apabila transaksi belum dibuat.",
      });
      return;
    }

    if (!snapToken && redirectUrl) {
      window.open(redirectUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (
      !snapReady ||
      !window.snap ||
      typeof window.snap.pay !== "function" ||
      !snapToken
    ) {
      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener,noreferrer");
        return;
      }

      toast.error("Midtrans belum siap", {
        description: "Muat ulang halaman atau hubungi admin.",
      });
      return;
    }

    setIsLoading(true);

    try {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          toast.success("Pembayaran berhasil", {
            description: "Transaksi kamu telah dikonfirmasi oleh Midtrans.",
          });
          window.location.reload();
        },
        onPending: () => {
          toast.info("Masih menunggu", {
            description:
              "Kamu bisa kembali ke halaman ini kapan saja untuk menyelesaikan pembayaran.",
          });
        },
        onError: (error) => {
          console.error("Midtrans Snap error", error);
          toast.error("Pembayaran dibatalkan", {
            description: "Coba ulangi proses pembayaran.",
          });
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, [redirectUrl, snapReady, snapToken]);

  return (
    <>
      {clientKey && (
        <Script
          src={snapScriptUrl}
          data-client-key={clientKey}
          strategy="lazyOnload"
          onLoad={() => setSnapReady(true)}
        />
      )}

      <div className="space-y-3">
        {/* Payment Info */}
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4 dark:border-orange-800 dark:bg-orange-950/20">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Pembayaran Menunggu Konfirmasi
              </h4>
              <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
                Selesaikan pembayaran untuk mengkonfirmasi booking Anda
              </p>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <Button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          size="lg"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyambungkan ke Midtrans...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Lanjutkan Pembayaran
            </div>
          )}
        </Button>

        {/* Additional Info */}
        <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Pembayaran akan dikonfirmasi secara otomatis</span>
          </div>
          {!clientKey && redirectUrl && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              <span>Halaman pembayaran akan terbuka di tab baru</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
