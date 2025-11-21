"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { cn } from "@/lib/utils";

export type SportCategory = {
  name: string;
  href: string;
  image: string;
  accent: string;
};

const VISIBLE_COUNT = 5;
const GAP_PX = 16;

export function SportsTabs({ sports }: { sports: SportCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const itemWidth = `calc((100% - ${(VISIBLE_COUNT - 1) * GAP_PX}px) / ${VISIBLE_COUNT})`;

  const scroll = (direction: "next" | "prev") => {
    const container = trackRef.current;

    if (!container) return;

    const delta =
      (container.clientWidth / VISIBLE_COUNT + GAP_PX) * (direction === "next" ? 1 : -1);

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Pilihan cepat</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Popular sports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Temukan lapangan favorit komunitas, lengkap dengan akses menuju kategori court yang relevan.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll("prev")}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
            aria-label="Lihat olahraga sebelumnya"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
            aria-label="Lihat olahraga selanjutnya"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70"
        >
          {sports.map((sport) => (
            <Link
              key={sport.name}
              href={sport.href}
              className="group relative flex overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/70"
              style={{ minWidth: itemWidth, maxWidth: itemWidth }}
            >
              <div className="absolute inset-0" aria-hidden>
                <Image
                  src={sport.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 20vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-950/60"
                  style={{ backgroundColor: sport.accent }}
                />
              </div>
              <div className="relative flex w-full flex-col justify-end gap-3 p-4">
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur",
                    "bg-white/20"
                  )}
                >
                  {sport.name}
                </span>
                <span className="text-xs font-medium text-white/80">Klik untuk menuju court {sport.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
