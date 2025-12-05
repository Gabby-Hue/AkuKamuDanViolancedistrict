"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [showBackButton, setShowBackButton] = useState(false);

  // Check if user came from another page on the same domain
  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        const currentOrigin = window.location.origin;

        // Show back button if referrer is from the same domain
        if (referrerUrl.origin === currentOrigin) {
          setShowBackButton(true);
        }
      } catch (e) {
        // If URL parsing fails, default to home button
        setShowBackButton(false);
      }
    }
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
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
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <div className="bg-orange-500 dark:bg-teal-500 text-white flex size-6 items-center justify-center rounded-md">
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
    <Suspense fallback={<div className="flex min-h-svh items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
