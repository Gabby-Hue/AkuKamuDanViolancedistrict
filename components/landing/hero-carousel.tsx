"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Slide = {
  id: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: "community",
    kicker: "Komunitas selalu siap",
    title: "Main hari ini, esok, atau kapan saja",
    description:
      "Booking lapangan terasa seperti menggulir feed. Pilih jadwal, bayar, dan bagikan ke tim tanpa DM berulang.",
    image: "/landing/ball.jpg",
  },
  {
    id: "focus",
    kicker: "Venue fokus ke pengalaman",
    title: "Semua operasional terotomatisasi",
    description:
      "Dari Midtrans hingga laporan okupansi, dashboard CourtEase membuat pemilik venue tenang sambil pemain terus datang.",
    image: "/landing/padel.jpg",
  },
  {
    id: "future",
    kicker: "Masa depan olahraga lokal",
    title: "Temukan bakat dan komunitas baru",
    description:
      "Forum dan Explore menyalakan ekosistem. Kamu tinggal hadir, sisanya sudah kami tata seperti highlight reel favoritmu.",
    image: "/landing/basketball.jpg",
  },
];

function SlideIndicators({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`Tampilkan slide ${index + 1}`}
          className={cn(
            "h-2 w-8 rounded-full bg-brand/30 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
            index === activeIndex && "w-12 bg-brand",
          )}
        />
      ))}
    </div>
  );
}

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Function to determine if current slide has dark background
  const isSlideDark = (slideIndex: number): boolean => {
    // Slide 0 (ball.jpg) and slide 2 (basketball.jpg) have dark backgrounds
    return [0, 2].includes(slideIndex);
  };

  // Emit event when slide changes
  useEffect(() => {
    const isDark = isSlideDark(activeIndex);

    // Use both custom event and direct DOM approach for reliability
    const event = new CustomEvent("hero-slide-change", {
      detail: { isDarkBackground: isDark }
    });
    window.dispatchEvent(event);

    // Also set a data attribute directly on the hero section as fallback
    const heroSection = document.querySelector('[data-hero-section="true"]');
    if (heroSection) {
      heroSection.setAttribute('data-slide-is-dark', isDark.toString());
    }
  }, [activeIndex]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      // Putar terus hingga mencapai slide duplikat, lalu biarkan
      // `onTransitionEnd` mengatur ulang ke indeks pertama.
      setActiveIndex((current) => (current + 1) % (slides.length + 1));
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const handleTransitionEnd = () => {
    if (activeIndex >= slides.length) {
      setIsTransitioning(false);
      setActiveIndex(0);
      requestAnimationFrame(() => setIsTransitioning(true));
    }
  };

  const activeSlide = slides[activeIndex % slides.length];
  const displaySlides = [...slides, slides[0]];

  return (
    <section
      data-hero-section="true"
      className="relative isolate min-h-screen overflow-hidden rounded-none bg-gradient-to-b from-brand-soft via-brand-soft/80 to-brand-strong text-white"
    >
      <div className="absolute inset-0 bg-brand-strong overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
            transitionDuration: isTransitioning ? "700ms" : "0ms",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {displaySlides.map((slide, index) => (
            <div
              key={`${slide.id}-${index}`}
              className="relative flex min-h-full min-w-full items-center justify-center"
            >
              <div className="relative w-full max-w-[3840px] overflow-hidden min-[480px]:px-4 lg:px-0">
                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-b-3xl min-h-[100vh] sm:aspect-[16/9] sm:min-h-[520px] lg:aspect-auto lg:h-[100vh]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 1200px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/35 to-black/35" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-end gap-8 px-4 pb-20 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="space-y-4 lg:max-w-3xl lg:space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand/25 px-3 py-1 text-xs font-semibold text-white sm:px-4 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {activeSlide.kicker}
          </p>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            {activeSlide.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/90 sm:text-base lg:text-lg">
            {activeSlide.description}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              variant="secondary"
              className="w-full bg-brand text-white shadow-lg shadow-brand/30 transition hover:bg-brand-strong hover:shadow-brand/40 sm:w-auto"
            >
              <Link href="/explore">Mulai jelajahi</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full border-brand/60 text-white hover:bg-brand/20 hover:text-white sm:w-auto"
            >
              <Link href="/venue-partner">Daftar sebagai venue partner</Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-start text-xs text-white/80">
          <SlideIndicators
            activeIndex={activeIndex % slides.length}
            onSelect={(index) => {
              setIsTransitioning(true);
              setActiveIndex(index);
            }}
          />
        </div>
      </div>
    </section>
  );
}
