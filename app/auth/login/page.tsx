"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.origin === window.location.origin) {
          setShowBackButton(true);
        }
      } catch {}
    }
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/auth.jpg"
          alt="green court"
          fill
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900"
          >
            <div className="bg-orange-500 text-white flex size-6 items-center justify-center rounded-md">
              <ChevronLeft className="size-4" />
            </div>
            {showBackButton ? "Kembali" : "Back to home"}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
