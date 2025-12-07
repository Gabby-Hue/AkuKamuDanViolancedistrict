"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type SportCategory = {
  name: string;
  sport: string;
  image: string;
  accent: string;
};

const VISIBLE_COUNT_DESKTOP = 5;
const VISIBLE_COUNT_MOBILE = 1.3;
const GAP_PX = 16;

export function SportsTabs({ sports }: { sports: SportCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(100);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const container = trackRef.current;
    if (!container) return;

    const checkScroll = () => {
      setIsOverflowing(container.scrollWidth > container.clientWidth);
      const maxScroll = container.scrollWidth - container.clientWidth;
      const progress = maxScroll > 0 ? container.scrollLeft / maxScroll : 0;
      const visibleRatio =
        container.scrollWidth > 0
          ? (container.clientWidth / container.scrollWidth) * 100
          : 100;
      setScrollProgress(progress);
      setThumbWidth(visibleRatio);
      setScrollPosition(container.scrollLeft);
    };

    // Check scroll after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkScroll, 100);

    // Restore scroll position if available after another delay
    if (scrollPosition > 0) {
      setTimeout(() => {
        if (container) {
          container.scrollLeft = scrollPosition;
        }
      }, 150);
    }

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [sports]);

  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT_DESKTOP);

  useEffect(() => {
    const updateVisibleCount = () => {
      const count =
        typeof window !== "undefined" && window.innerWidth < 768
          ? VISIBLE_COUNT_MOBILE
          : VISIBLE_COUNT_DESKTOP;
      setVisibleCount(count);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const itemWidth = `calc((100% - ${(visibleCount - 1) * GAP_PX}px) / ${visibleCount})`;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] dark:text-white">
            Book by sports
          </p>
          <h2 className="text-3xl font-semibold dark:text-white">
            Pilih olahraga favoritmu
          </h2>
        </div>
        {isOverflowing && (
          <p className="hidden text-sm font-medium text-slate-500 transition-colors duration-200 md:block dark:text-slate-300">
            Geser untuk melihat lebih banyak pilihan olahraga
          </p>
        )}
      </div>

      <div className="relative">
        {/* Mobile scroll hint */}
        {isOverflowing && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 z-20 md:hidden">
            <div className="flex items-center gap-1 animate-pulse">
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
              <div className="w-1 h-1 bg-brand/60 rounded-full" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1 whitespace-nowrap">
              Geser untuk lebih banyak →
            </p>
          </div>
        )}

        <div
          ref={trackRef}
          className={cn(
            "scrollbar-modern flex gap-4 overflow-x-auto overflow-y-hidden pb-8 md:pb-4 md:gap-6",
            "scroll-smooth pl-4 md:pl-0 pr-4 md:pr-0",
            isOverflowing ? "scrollbar-modern" : "overflow-x-hidden",
          )}
        >
          {sports.map((sport, index) => (
            <Link
              key={sport.name}
              href={`/explore?sport=${encodeURIComponent(sport.sport)}`}
              className={cn(
                "group relative flex flex-col gap-3 transition-all duration-300",
                "animate-in fade-in slide-in-from-bottom",
                "md:max-w-none flex-shrink-0",
              )}
              style={{
                minWidth: itemWidth,
                maxWidth: itemWidth,
                animationDelay: `${index * 50}ms`,
                animationDuration: "500ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-slate-100 transition duration-500 group-hover:-translate-y-1 dark:bg-slate-800/60">
                <Image
                  src={sport.image}
                  alt={sport.name}
                  fill
                  sizes="(max-width: 768px) 80vw, 20vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="px-1 text-center">
                <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                  {sport.name}
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

        .scrollbar-modern {
          scrollbar-width: thin;
          /* Hide scrollbar by default */
          scrollbar-color: transparent transparent;
        }

        /* Hide scrollbar for Firefox */
        .scrollbar-modern {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        /* Hide scrollbar for Chrome, Safari, Edge */
        .scrollbar-modern::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        /* Show scrollbar on hover or scroll */
        .scrollbar-modern:hover {
          scrollbar-width: thin;
          scrollbar-color: rgb(148 163 184 / 0.7) transparent;
        }

        .scrollbar-modern:hover::-webkit-scrollbar {
          display: block;
          height: 6px;
          width: 6px;
        }

        .scrollbar-modern:hover::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-modern:hover::-webkit-scrollbar-thumb {
          background-color: rgb(148 163 184 / 0.7);
          border-radius: 9999px;
          transition: background-color 0.2s ease;
        }

        .scrollbar-modern:hover::-webkit-scrollbar-thumb:hover {
          background-color: rgb(100 116 139 / 0.9);
        }

        .dark .scrollbar-modern:hover {
          scrollbar-color: rgb(71 85 105 / 0.7) transparent;
        }

        .dark .scrollbar-modern:hover::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105 / 0.7);
        }

        .dark .scrollbar-modern:hover::-webkit-scrollbar-thumb:hover {
          background-color: rgb(55 65 81 / 0.9);
        }
      `}</style>
    </div>
  );
}
