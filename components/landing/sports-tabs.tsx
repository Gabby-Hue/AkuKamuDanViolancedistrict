"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand dark:bg-brand/20">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Pilihan cepat
          </p>
          <h2 className="text-2xl font-semibold text-brand dark:text-brand-contrast">
            Shop by Sport
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Pilih olahraga favoritmu dan temukan lapangan terbaik di sekitar.
          </p>
        </div>
        <div
          className={cn(
            "items-center gap-3 transition-opacity duration-300",
            isOverflowing ? "flex" : "hidden sm:flex",
          )}
        >
          <button
            type="button"
            onClick={() => scroll("prev")}
            disabled={!canScrollLeft && isOverflowing}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition duration-200",
              "hover:scale-105 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
              "dark:bg-slate-900 dark:text-white dark:ring-white/10",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            )}
            aria-label="Lihat olahraga sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            disabled={!canScrollRight && isOverflowing}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition duration-200",
              "hover:scale-105 hover:shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
              "dark:bg-slate-900 dark:text-white dark:ring-white/10",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
            )}
            aria-label="Lihat olahraga selanjutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="relative">
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
            "flex gap-6 overflow-x-auto overflow-y-hidden py-4 scrollbar-hide",
            "scroll-smooth",
            isOverflowing ? "scrollbar-hide" : "overflow-x-hidden",
          )}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {sports.map((sport, index) => (
            <Link
              key={sport.name}
              href={sport.href}
              className={cn(
                "group relative flex flex-col gap-3 transition-all duration-300",
                "hover:scale-[1.01]",
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
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[28px] bg-slate-100 shadow-[0_14px_34px_rgba(0,0,0,0.14)] transition duration-500 group-hover:shadow-[0_18px_44px_rgba(0,0,0,0.18)] dark:bg-slate-800/60">
                <Image
                  src={sport.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80vw, 20vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="space-y-1 px-1 text-center">
                <p className="text-sm font-semibold text-slate-900 transition-colors duration-300 group-hover:text-black dark:text-white dark:group-hover:text-white">
                  {sport.name}
                </p>
                <p className="text-xs text-slate-500 transition-colors duration-300 group-hover:text-slate-700 dark:text-slate-300 dark:group-hover:text-white/80">
                  Jelajahi {sport.name}
                </p>
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
