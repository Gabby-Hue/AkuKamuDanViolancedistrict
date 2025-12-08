"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CourtSummary, ForumThreadSummary } from "@/lib/queries/types";

const priceOptions = [
  { id: "all", label: "Semua harga", predicate: () => true },
  {
    id: "budget",
    label: "< Rp200K",
    predicate: (court: CourtSummary) => court.pricePerHour < 200000,
  },
  {
    id: "mid",
    label: "Rp200K - Rp300K",
    predicate: (court: CourtSummary) =>
      court.pricePerHour >= 200000 && court.pricePerHour <= 300000,
  },
  {
    id: "premium",
    label: "> Rp300K",
    predicate: (court: CourtSummary) => court.pricePerHour > 300000,
  },
];

const ratingOptions = [
  { id: "all", label: "Semua rating", value: 0 },
  { id: "4", label: "4★ ke atas", value: 4 },
  { id: "45", label: "4.5★ ke atas", value: 4.5 },
];

type ExploreViewProps = {
  courts: CourtSummary[];
  threads: ForumThreadSummary[];
  totalReplies: number;
  selectedSport?: string;
};

export function ExploreView({
  courts,
  threads,
  totalReplies,
  selectedSport,
}: ExploreViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sportFilter, setSportFilter] = useState<string>(
    selectedSport || "all",
  );
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Update sport filter when URL parameter changes
  // Update sport filter when URL parameter changes
  useEffect(() => {
    const currentSport = searchParams.get("sport");
    const newSport = currentSport || "all";

    // Only update if the sport has actually changed
    if (sportFilter !== newSport) {
      setSportFilter(newSport);
    }
  }, [searchParams.toString()]);

  // Update URL when sport filter changes
  const handleSportFilterChange = (newSport: string) => {
    setSportFilter(newSport);

    // Create new URL parameters
    const params = new URLSearchParams(searchParams.toString());

    if (newSport === "all") {
      params.delete("sport");
    } else {
      params.set("sport", newSport);
    }

    // Update URL without scrolling
    router.push(`/explore?${params.toString()}`, { scroll: false });
  };

  const sports = useMemo(() => {
    const unique = new Set<string>();
    courts.forEach((court) => {
      unique.add(court.sport);
    });
    return ["all", ...Array.from(unique)];
  }, [courts]);

  // All available sports - this should include all sports regardless of current filter
  const allAvailableSports = useMemo(() => {
    return [
      "all",
      "basketball",
      "volleyball",
      "futsal",
      "padel",
      "badminton",
      "tennis",
      "soccer",
    ];
  }, []);

  // Sport name mapping for display
  const sportNames: Record<string, string> = {
    all: "Semua Olahraga",
    basketball: "Basket",
    volleyball: "Voli",
    futsal: "Futsal",
    padel: "Padel",
    badminton: "Badminton",
    tennis: "Tennis",
    soccer: "Sepak Bola",
  };

  const filteredCourts = useMemo(() => {
    const pricePredicate = priceOptions.find(
      (option) => option.id === priceFilter,
    )?.predicate;
    const minRating =
      ratingOptions.find((option) => option.id === ratingFilter)?.value ?? 0;

    return courts
      .filter((court) =>
        sportFilter === "all" ? true : court.sport === sportFilter,
      )
      .filter((court) => (pricePredicate ? pricePredicate(court) : true))
      .filter((court) => court.averageRating >= minRating)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [courts, sportFilter, priceFilter, ratingFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Simple Elegant Filter Bar - Lebar Horizontal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/40 p-6 shadow-xs dark:bg-slate-900/80 dark:border-slate-700/30">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                    {filteredCourts.length} lapangan ditemukan
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all",
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400",
                    )}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "px-2.5 py-1.5 text-xs font-medium rounded-md transition-all",
                      viewMode === "list"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400",
                    )}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filter Pills - Layout Lebar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Sport Filter */}
                <Select
                  value={sportFilter}
                  onValueChange={handleSportFilterChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Semua Olahraga">
                      {sportNames[sportFilter] || sportFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allAvailableSports.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sportNames[sport] || sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Price Filter */}
                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Budget per jam" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Rating Filter */}
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Rating minimum" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {(sportFilter !== "all" ||
                  priceFilter !== "all" ||
                  ratingFilter !== "all") && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Reset local state
                      setSportFilter("all");
                      setPriceFilter("all");
                      setRatingFilter("all");

                      // Clear URL parameters and navigate to clean URL
                      router.push("/explore", { scroll: false });
                    }}
                    className="h-9 text-sm justify-start"
                  >
                    Reset filter
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-5",
              viewMode === "grid" ? "md:grid-cols-2" : "md:grid-cols-1",
            )}
          >
            {filteredCourts.map((court) => (
              <CourtCard key={court.id} court={court} viewMode={viewMode} />
            ))}
            {!filteredCourts.length && (
              <div className="col-span-full rounded-3xl border border-dashed border-brand-soft/60 bg-white/80 p-12 text-center text-sm text-slate-500 dark:border-brand-soft/20 dark:bg-slate-900/60 dark:text-slate-400">
                <div className="space-y-3">
                  <svg
                    className="h-12 w-12 mx-auto text-brand/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="font-medium">
                    Kombinasi filter saat ini belum menemukan lapangan yang
                    cocok.
                  </p>
                  <p className="text-xs">
                    Coba ubah filter untuk melihat opsi lainnya.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          {/* Forum Card dengan jarak ke bawah yang sama dengan court cards */}
          <div className="space-y-6 rounded-3xl border border-brand-soft/60 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-brand-soft/20 dark:bg-slate-900/70">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-muted">
              Forum terbaru
            </h3>
            <ul className="space-y-6 text-sm">
              {threads.map((thread) => (
                <li key={thread.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted">
                    <span>{thread.category?.name ?? "Forum"}</span>
                    <span className="text-slate-400">•</span>
                    <span>
                      {new Date(thread.created_at).toLocaleDateString("id-ID", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Link
                    href={`/forum/${thread.slug}`}
                    className="text-base font-semibold text-slate-900 transition hover:text-brand dark:text-white dark:hover:text-brand-muted"
                  >
                    {thread.title}
                  </Link>
                  {thread.excerpt && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {thread.excerpt}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-brand dark:text-brand-muted">
                    <span>{thread.reply_count} balasan</span>
                    {thread.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-strong dark:bg-brand-soft/20 dark:text-brand-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
              {!threads.length && (
                <li className="rounded-2xl border border-dashed border-brand-soft/60 bg-white/80 p-4 text-xs text-slate-500 dark:border-brand-soft/20 dark:bg-slate-900/60 dark:text-slate-400">
                  Belum ada diskusi terbaru. Mulai thread pertamamu untuk
                  memancing komunitas!
                </li>
              )}
            </ul>
            <div className="pt-4">
              <Link
                href="/forum"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-brand"
              >
                Buka forum lengkap
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

type CourtCardProps = {
  court: CourtSummary;
  viewMode: "grid" | "list";
};

function CourtCard({ court, viewMode }: CourtCardProps) {
  const price = new Intl.NumberFormat("id-ID").format(court.pricePerHour);

  return (
    <Link
      href={`/court/${court.slug}`}
      className={cn(
        "group overflow-hidden rounded-3xl border border-brand-soft/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-xl dark:border-brand-soft/20 dark:bg-slate-900/70",
        viewMode === "list"
          ? "flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-6"
          : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          viewMode === "list"
            ? "h-48 w-full rounded-2xl sm:h-40 sm:w-48 sm:flex-shrink-0"
            : "h-52",
        )}
      >
        {court.primaryImageUrl ? (
          <Image
            src={court.primaryImageUrl}
            alt={court.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-white to-brand-soft text-slate-500 dark:from-slate-800 dark:via-slate-900 dark:to-brand-soft/50">
            <span className="text-xs font-semibold uppercase tracking-widest">
              Preview coming soon
            </span>
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-3 p-5",
          viewMode === "list" ? "p-0 sm:p-5" : "",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
              {court.sport}
            </p>
            <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-brand dark:text-white dark:group-hover:text-brand-muted">
              {court.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {court.venueName}
              {court.venueCity ? ` • ${court.venueCity}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-brand dark:text-brand">
              Rp{price}/jam
            </p>
            <p>{court.averageRating.toFixed(1)} ★</p>
            <p>{court.reviewCount} review</p>
          </div>
        </div>
        {court.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {court.facilities
              .slice(0, viewMode === "grid" ? 4 : 6)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80"
                >
                  {amenity}
                </span>
              ))}
            {court.facilities.length > (viewMode === "grid" ? 4 : 6) && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800/80">
                +{court.facilities.length - (viewMode === "grid" ? 4 : 6)}{" "}
                lainnya
              </span>
            )}
          </div>
        )}
        {court.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {court.description.length > 110 && viewMode === "grid"
              ? `${court.description.slice(0, 110)}...`
              : court.description}
          </p>
        )}
      </div>
    </Link>
  );
}
