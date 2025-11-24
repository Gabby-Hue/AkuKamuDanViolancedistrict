"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type SportCategory = {
  name: string;
  href: string;
  image: string;
  accent: string;
};

const VISIBLE_COUNT_DESKTOP = 5;
const VISIBLE_COUNT_MOBILE = 2.5;
const GAP_PX = 16;

export function SportsTabs({ sports }: { sports: SportCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    const checkScroll = () => {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
      setIsOverflowing(container.scrollWidth > container.clientWidth);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [sports]);

  const getVisibleCount = () => {
    if (typeof window === "undefined") return VISIBLE_COUNT_DESKTOP;
    return window.innerWidth < 768
      ? VISIBLE_COUNT_MOBILE
      : VISIBLE_COUNT_DESKTOP;
  };

  const itemWidth = `calc((100% - ${(getVisibleCount() - 1) * GAP_PX}px) / ${getVisibleCount()})`;

  const scroll = (direction: "next" | "prev") => {
    const container = trackRef.current;

    if (!container) return;

    const delta =
      (container.clientWidth / getVisibleCount() + GAP_PX) *
      (direction === "next" ? 1 : -1);

    container.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
            Pilihan cepat
          </p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Popular sports
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Temukan lapangan favorit komunitas, lengkap dengan akses menuju
            kategori court yang relevan.
          </p>
        </div>
        <div
          className={cn(
            "items-center gap-2 transition-opacity duration-300",
            isOverflowing ? "flex" : "hidden sm:flex",
          )}
        >
          <button
            type="button"
            onClick={() => scroll("prev")}
            disabled={!canScrollLeft && isOverflowing}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200",
              "border-slate-200 bg-white text-slate-700",
              "hover:border-brand hover:text-brand hover:shadow-md",
              "dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:hover:shadow-sm",
              "dark:disabled:hover:border-slate-700 dark:disabled:hover:text-slate-200",
            )}
            aria-label="Lihat olahraga sebelumnya"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!canScrollRight && isOverflowing}
            className={cn(
              "rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition-all duration-200",
              "border-slate-200 bg-white text-slate-700",
              "hover:border-brand hover:text-brand hover:shadow-md",
              "dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-700 disabled:hover:shadow-sm",
              "dark:disabled:hover:border-slate-700 dark:disabled:hover:text-slate-200",
            )}
            aria-label="Lihat olahraga selanjutnya"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Scroll indicator gradient */}
        {isOverflowing && (
          <>
            <div
              className={cn(
                "absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-300",
                canScrollLeft ? "opacity-0" : "opacity-100",
              )}
            >
              <div className="h-full w-full bg-gradient-to-r from-white/90 via-white/50 to-transparent dark:from-slate-900/90 dark:via-slate-900/50" />
            </div>
            <div
              className={cn(
                "absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none transition-opacity duration-300",
                canScrollRight ? "opacity-0" : "opacity-100",
              )}
            >
              <div className="h-full w-full bg-gradient-to-l from-white/90 via-white/50 to-transparent dark:from-slate-900/90 dark:via-slate-900/50" />
            </div>
          </>
        )}

        {/* Mobile scroll hint */}
        {isOverflowing && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 z-20 md:hidden">
            <div className="flex items-center gap-1 animate-pulse">
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
              Geser untuk melihat lebih banyak →
            </p>
          </div>
        )}

        <div
          ref={trackRef}
          className={cn(
            "flex gap-4 overflow-x-auto overflow-y-hidden rounded-3xl border p-4 shadow-sm backdrop-blur scrollbar-hide",
            "border-slate-200/80 bg-white/90",
            "dark:border-slate-800/70 dark:bg-slate-900/70",
            "scroll-smooth",
            isOverflowing ? "scrollbar-hide" : "overflow-x-hidden",
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {sports.map((sport, index) => (
            <Link
              key={sport.name}
              href={sport.href}
              className={cn(
                "group relative flex overflow-hidden rounded-2xl border bg-slate-50 shadow-sm transition-all duration-300",
                "hover:-translate-y-1 hover:border-brand hover:shadow-xl hover:scale-[1.02]",
                "dark:border-slate-700/80 dark:bg-slate-800/70",
                "border-slate-200/80",
                // Add subtle animation delay for each card
                `animate-in fade-in slide-in-from-bottom`,
                `animation-delay-[${index * 50}ms]`,
              )}
              style={{
                minWidth: itemWidth,
                maxWidth: itemWidth,
                animationDelay: `${index * 50}ms`,
                animationDuration: "500ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="absolute inset-0" aria-hidden>
                <Image
                  src={sport.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 20vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                  priority
                />
                <div
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-slate-950/70 transition-opacity duration-300 group-hover:opacity-90"
                  style={{ backgroundColor: sport.accent }}
                />
              </div>
              <div className="relative flex w-full flex-col justify-end gap-3 p-4">
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur transition-all duration-300",
                    "bg-white/20 group-hover:bg-white/30",
                  )}
                >
                  {sport.name}
                </span>
                <span className="text-xs font-medium text-white/80 transition-colors duration-300 group-hover:text-white">
                  Klik untuk menuju court {sport.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.5s ease-out forwards;
        }

        .fade-in {
          opacity: 0;
        }

        .slide-in-from-bottom {
          transform: translateY(20px);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
