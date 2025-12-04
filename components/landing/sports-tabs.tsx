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
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(100);

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

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#0B0B0B]">Book by sports</p>
          <h2 className="text-3xl font-semibold text-[#0B0B0B]">Pilih olahraga favoritmu</h2>
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
            "scrollbar-modern flex gap-6 overflow-x-auto overflow-y-hidden py-4",
            "scroll-smooth",
            isOverflowing ? "scrollbar-modern" : "overflow-x-hidden",
          )}
        >
          {sports.map((sport, index) => (
            <Link
              key={sport.name}
              href={sport.href}
              className={cn(
                "group relative flex flex-col gap-3 transition-all duration-300",
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
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-slate-100 transition duration-500 group-hover:-translate-y-1 dark:bg-slate-800/60">
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
                <p className="text-base font-semibold text-slate-900 dark:text-white">{sport.name}</p>
              </div>
            </Link>
          ))}
        </div>

        {isOverflowing && (
          <div className="mt-6 hidden md:block">
            <div className="relative h-2 rounded-full bg-slate-200/80 shadow-inner dark:bg-slate-800">
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-brand/80 transition-[transform,width] duration-200 ease-out dark:bg-brand/70"
                style={{
                  width: `${Math.max(thumbWidth, 18)}%`,
                  transform: `translateX(${scrollProgress * (100 - Math.max(thumbWidth, 18))}%)`,
                }}
              />
            </div>
          </div>
        )}
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
          scrollbar-width: none;
          scrollbar-color: transparent transparent;
        }

        .scrollbar-modern::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
