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
      "https://images.unsplash.com/photo-1518604666860-9ed391f183e1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "focus",
    kicker: "Venue fokus ke pengalaman",
    title: "Semua operasional terotomatisasi",
    description:
      "Dari Midtrans hingga laporan okupansi, dashboard CourtEase membuat pemilik venue tenang sambil pemain terus datang.",
    image:
      "https://images.unsplash.com/photo-1521417531039-56b0b33c5d68?auto=format&fit=crop&w=1600&q=80",
  },
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
            "h-2 w-8 rounded-full bg-white/40 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            index === activeIndex && "w-12 bg-white",
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
    <section className="relative isolate overflow-hidden rounded-none bg-black text-white">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === activeIndex ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          <span>Seperti Nike: headline besar, foto penuh</span>
          <span className="h-px w-10 bg-white/40" aria-hidden />
          <span>Autoplay slider</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <p className="text-sm font-semibold text-white/80">{activeSlide.kicker}</p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              {activeSlide.title}
            </h1>
            <p className="max-w-2xl text-lg text-white/80">
              {activeSlide.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-white text-slate-900">
                <Link href="/explore">Mulai jelajahi</Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link href="/venue-partner">Daftar sebagai venue partner</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 text-sm text-white/80">
              <span className="font-semibold">Temukan lapangan paling dekat</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Slide sebelumnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Slide selanjutnya"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/30 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <NearestCourtTiles courts={courts} limit={3} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-white/80">
          <SlideIndicators activeIndex={activeIndex} onSelect={setActiveIndex} />
          <span className="hidden sm:inline">Slide berganti otomatis setiap 6 detik</span>
        </div>
      </div>
    </section>
  );
}
