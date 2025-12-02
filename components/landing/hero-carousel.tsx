"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { CourtSummary } from "@/lib/supabase/queries/courts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NearestCourtTiles } from "@/components/venues/nearest-courts";

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
    image:
      "/landing/easy-day.png",},
  {
    id: "focus",
    kicker: "Venue fokus ke pengalaman",
    title: "Semua operasional terotomatisasi",
    description:
      "Dari Midtrans hingga laporan okupansi, dashboard CourtEase membuat pemilik venue tenang sambil pemain terus datang.",
    image:
      "/landing/chase-progress.png",},
  {
    id: "future",
    kicker: "Masa depan olahraga lokal",
    title: "Temukan bakat dan komunitas baru",
    description:
      "Forum dan Explore menyalakan ekosistem. Kamu tinggal hadir, sisanya sudah kami tata seperti highlight reel favoritmu.",
    image:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1600&q=80",
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

export function HeroCarousel({ courts }: { courts: CourtSummary[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setActiveIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1,
    );
  };

  const handleNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  const activeSlide = slides[activeIndex];

  return (
    <section className="relative isolate overflow-hidden rounded-none bg-gradient-to-b from-brand-soft via-brand-soft/80 to-brand-strong text-brand-contrast">
      <div className="absolute inset-0 bg-brand-strong">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity duration-700",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="relative w-full max-w-[3840px] overflow-hidden rounded-3xl min-[480px]:px-4 lg:px-0">
              <div className="relative aspect-[4/1] w-full overflow-hidden rounded-3xl min-h-[320px] lg:aspect-auto lg:h-[960px]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  className="object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-strong via-brand-strong/75 to-brand-soft/60" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand/25 px-4 py-1 text-sm font-semibold text-brand-contrast">
              <span className="h-2 w-2 rounded-full bg-brand" />
              {activeSlide.kicker}
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-2xl text-lg text-brand-contrast/80">
              {activeSlide.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="secondary"
                className="bg-brand text-brand-contrast shadow-lg shadow-brand/30 transition hover:bg-brand-strong hover:shadow-brand/40"
              >
                <Link href="/explore">Mulai jelajahi</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-brand/60 text-brand-contrast hover:bg-brand/20 hover:text-brand-contrast"
              >
                <Link href="/venue-partner">Daftar sebagai venue partner</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 text-sm text-brand-contrast">
              <span className="font-semibold">Temukan lapangan paling dekat</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Slide sebelumnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/60 bg-brand/20 text-brand-contrast transition hover:bg-brand/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Slide selanjutnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/60 bg-brand/20 text-brand-contrast transition hover:bg-brand/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-brand/40 bg-brand/10 p-4 shadow-2xl shadow-brand/30 backdrop-blur">
              <NearestCourtTiles courts={courts} limit={3} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-brand-contrast/80">
          <SlideIndicators activeIndex={activeIndex} onSelect={setActiveIndex} />
          <span className="hidden sm:inline">Slide berganti otomatis setiap 6 detik</span>
        </div>
      </div>
    </section>
  );
}
