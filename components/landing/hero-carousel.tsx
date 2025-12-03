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
    image:
      "/landing/ball.jpg",},
  {
    id: "focus",
    kicker: "Venue fokus ke pengalaman",
    title: "Semua operasional terotomatisasi",
    description:
      "Dari Midtrans hingga laporan okupansi, dashboard CourtEase membuat pemilik venue tenang sambil pemain terus datang.",
    image:
      "/landing/padel.jpg",},
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

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  const activeSlide = slides[activeIndex];

  return (
    <section className="relative isolate min-h-screen overflow-hidden rounded-none bg-gradient-to-b from-brand-soft via-brand-soft/80 to-brand-strong text-brand-contrast">
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
              <div className="relative aspect-[4/1] w-full overflow-hidden rounded-3xl min-h-[520px] lg:aspect-auto lg:h-[100vh]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 1200px, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/65 to-black/45" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="space-y-6 lg:max-w-3xl">
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

        <div className="flex justify-start text-xs text-brand-contrast/80">
          <SlideIndicators activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>
      </div>
    </section>
  );
}
