"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Display404() {
  const router = useRouter();

  const handleGoBack = () => {
    // Try to go back in history
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // If no history, go to home
      router.push('/');
    }
  };
  return (
    <main className="min-h-dvh">
      <h2 className="absolute ml-12.5 top-25 text-2xl font-bold dark:text-white">
        404 NOT FOUND
      </h2>
      <div className="mt-40 mx-8 md:mx-20 mb-20 grid gap-10 md:grid-cols-2">
        <div>
          <Image
            src="/light-404.png"
            alt="404"
            width={500}
            height={500}
            className="w-full h-auto select-none dark:[content:url('/dark-404.png')]"
          />
        </div>
        <div className="ml-0 md:ml-20">
          <h2 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight dark:text-neutral-300 light:text-shadow-neutral-800">
            I have bad news for you
          </h2>
          <p className="mt-4 font-mono text-base sm:text-lg leading-7 dark:text-neutral-300 max-w-40rem">
            The page you are looking for might be removed or is temporarily
            unavailable
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600/40 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 bg-[#fb8f39] hover:bg-amber-500 dark:bg-orange-600 dark:hover:bg-orange-500 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-600/40 transition-colors"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
