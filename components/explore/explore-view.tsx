"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import type { CourtSummary } from "@/lib/supabase/queries/courts";
import type { ForumThreadSummary } from "@/lib/supabase/queries/forum";
import { cn } from "@/lib/utils";

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
};

export function ExploreView({
  courts,
  threads,
  totalReplies,
}: ExploreViewProps) {
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sports = useMemo(() => {
    const unique = new Set<string>();
    courts.forEach((court) => {
      unique.add(court.sport);
    });
    return ["all", ...Array.from(unique)];
  }, [courts]);

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
    <div className="mx-auto max-w-6xl space-y-14 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-brand-soft/40 bg-gradient-to-br from-[hsl(var(--brand-soft))] via-white to-[hsl(var(--brand))] p-10 text-[hsl(var(--brand-contrast))] shadow-lg dark:border-brand-soft/30 dark:from-[hsl(var(--brand-strong))] dark:via-[hsl(var(--brand))] dark:to-[hsl(var(--brand-soft))]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">
              Explore
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Temukan lapangan & komunitas favoritmu
            </h1>
            <p className="max-w-2xl text-sm text-brand-soft/90">
              Filter berdasarkan olahraga, budget, dan rating untuk menemukan
              lapangan yang paling cocok. Aktivitas komunitas forum terbaru juga
              kami kurasi real-time dari Supabase.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left text-xs font-semibold uppercase tracking-wider text-brand-soft sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-brand-muted/80">
                Lapangan terdaftar
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {courts.length}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-brand-muted/80">
                Rata-rata rating
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {courts.length
                  ? (
                      courts.reduce(
                        (acc, court) => acc + court.averageRating,
                        0,
                      ) / courts.length
                    ).toFixed(1)
                  : "0"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-brand-muted/80">
                Balasan komunitas
              </p>
              <p className="mt-1 text-2xl font-bold text-white">
                {totalReplies}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-brand-soft/60 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-brand-soft/20 dark:bg-slate-900/70">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Lapangan pilihan Supabase
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Menampilkan {filteredCourts.length} dari {courts.length}{" "}
                  lapangan aktif.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-white/70 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow-sm dark:border-brand-soft/20">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-full px-3 py-1 transition",
                    viewMode === "grid"
                      ? "bg-brand/90 text-white shadow"
                      : "text-slate-300 hover:text-white",
                  )}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-full px-3 py-1 transition",
                    viewMode === "list"
                      ? "bg-brand/90 text-white shadow"
                      : "text-slate-300 hover:text-white",
                  )}
                >
                  List
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <FilterGroup
                label="Olahraga"
                options={sports.map((sport) => ({
                  id: sport,
                  label: sport === "all" ? "Semua" : sport,
                }))}
                value={sportFilter}
                onChange={setSportFilter}
              />
              <FilterGroup
                label="Budget per jam"
                options={priceOptions.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
                value={priceFilter}
                onChange={setPriceFilter}
              />
              <FilterGroup
                label="Rating"
                options={ratingOptions.map((option) => ({
                  id: option.id,
                  label: option.label,
                }))}
                value={ratingFilter}
                onChange={setRatingFilter}
              />
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
              <div className="rounded-3xl border border-dashed border-brand-soft/60 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-brand-soft/20 dark:bg-slate-900/60 dark:text-slate-400">
                Kombinasi filter saat ini belum menemukan lapangan yang cocok.
                Coba ubah filter untuk melihat opsi lainnya.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-brand-soft/60 bg-white/95 p-6 shadow-sm backdrop-blur dark:border-brand-soft/20 dark:bg-slate-900/70">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-muted">
              Forum terbaru
            </h3>
            <ul className="space-y-4 text-sm">
              {threads.map((thread) => (
                <li key={thread.id} className="space-y-1">
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
                    <p className="text-xs text-slate-500 dark:text-slate-400">
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
            <Link
              href="/forum"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-brand"
            >
              Buka forum lengkap
            </Link>
          </div>

          <div className="space-y-3 rounded-3xl border border-brand-soft/60 bg-gradient-to-br from-[hsl(var(--brand-soft))] via-[hsl(var(--brand))] to-[hsl(var(--brand-strong))] p-6 text-[hsl(var(--brand-contrast))] shadow-sm dark:border-brand-soft/30 dark:from-[hsl(var(--brand-strong))] dark:via-[hsl(var(--brand))] dark:to-[hsl(var(--brand-muted))]">
            <h3 className="text-base font-semibold">
              Tips: tarik traffic komunitas
            </h3>
            <p className="text-sm text-brand-soft/90">
              Simpan highlight event atau promo venue di dashboard. Data
              tersebut otomatis tampil di halaman Explore ketika sudah siap.
            </p>
            <Link
              href="/dashboard/venue"
              className="inline-flex items-center justify-center rounded-full bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-white/30"
            >
              Kelola venue sekarang
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

type FilterGroupProps = {
  label: string;
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
};

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              value === option.id
                ? "border-brand bg-brand/10 text-brand dark:border-brand dark:text-brand"
                : "border-brand-soft/60 text-slate-500 hover:border-brand hover:text-brand dark:border-brand-soft/30 dark:text-slate-400",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
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
