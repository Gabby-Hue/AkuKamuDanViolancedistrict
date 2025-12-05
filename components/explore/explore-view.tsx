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
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeSport, setActiveSport] = useState<string>("all");

  const sports = useMemo(() => {
    const unique = new Set<string>();
    courts.forEach((court) => {
      unique.add(court.sport);
    });
    return Array.from(unique);
  }, [courts]);

  const filteredCourts = useMemo(() => {
    const pricePredicate = priceOptions.find(
      (option) => option.id === priceFilter,
    )?.predicate;
    const minRating =
      ratingOptions.find((option) => option.id === ratingFilter)?.value ?? 0;

    return courts
      .filter((court) => (pricePredicate ? pricePredicate(court) : true))
      .filter((court) => court.averageRating >= minRating)
      .sort((a, b) => b.averageRating - a.averageRating);
  }, [courts, priceFilter, ratingFilter]);

  const sportSections = useMemo(
    () =>
      sports.map((sport) => ({
        sport,
        courts: filteredCourts.filter((court) => court.sport === sport),
      })),
    [filteredCourts, sports],
  );

  const handleSportSelect = (sport: string) => {
    setActiveSport(sport);

    if (sport === "all") return;

    const sectionId = `sport-${sport.toLowerCase().replace(/\s+/g, "-")}`;
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <header className="grid gap-8 rounded-4xl border border-brand-soft/40 bg-gradient-to-br from-brand/10 via-white to-brand-soft/50 p-10 shadow-xl shadow-brand/10 backdrop-blur dark:border-brand-soft/30 dark:from-brand/20 dark:via-slate-900 dark:to-brand-soft/30 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-muted">
            <span className="rounded-full bg-white/60 px-3 py-1 text-brand shadow-sm dark:bg-slate-900/60">Explore 2.0</span>
            <span className="rounded-full bg-brand/15 px-3 py-1 text-brand-strong dark:bg-brand/25 dark:text-brand-contrast">
              UI shadcn baru
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
              Jelajahi lapangan dengan tampilan yang lebih editorial
            </h1>
            <p className="max-w-2xl text-base text-slate-700 dark:text-slate-200">
              Kombinasi kartu imersif, filter instan, dan mode tampilan baru memudahkanmu mencari lapangan sesuai gaya bermain.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Lapangan terdaftar" value={courts.length} />
            <Stat
              label="Rata-rata rating"
              value={
                courts.length
                  ? (
                      courts.reduce((acc, court) => acc + court.averageRating, 0) /
                      courts.length
                    ).toFixed(1)
                  : "0"
              }
            />
            <Stat label="Balasan komunitas" value={totalReplies} />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-inner shadow-brand/10 backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">
                Mode tampilan
              </p>
              <p>Pilih layout favorit untuk membaca detail venue.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-brand-soft/60 bg-white/70 px-2 py-1 text-xs font-semibold text-brand shadow-sm dark:border-brand-soft/30 dark:bg-slate-900/70">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  viewMode === "grid"
                    ? "bg-brand text-white shadow"
                    : "text-brand hover:text-brand-strong",
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
                    ? "bg-brand text-white shadow"
                    : "text-brand hover:text-brand-strong",
                )}
              >
                List
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Jalur olahraga
            </p>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-brand-soft/60 bg-white/70 p-2 shadow-inner dark:border-brand-soft/30 dark:bg-slate-900/70">
              <button
                type="button"
                onClick={() => handleSportSelect("all")}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition",
                  activeSport === "all"
                    ? "bg-brand text-white shadow"
                    : "text-brand hover:text-brand-strong",
                )}
              >
                Semua
              </button>
              {sports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => handleSportSelect(sport)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    activeSport === sport
                      ? "border-brand bg-brand/10 text-brand dark:border-brand"
                      : "border-brand-soft/60 text-slate-500 hover:border-brand hover:text-brand dark:border-brand-soft/30 dark:text-slate-400",
                  )}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
          <div className="rounded-2xl border border-dashed border-brand-soft/60 bg-brand/5 p-4 text-xs text-slate-500 dark:border-brand-soft/30 dark:bg-brand/10 dark:text-slate-300">
            Tip: simpan filter favorit lalu bagikan tautan Explore ke tim untuk
            mempercepat koordinasi pertandingan.
          </div>
        </div>
      </header>

      <section
        className={cn(
          "grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]",
          viewMode === "list" ? "lg:grid-cols-1" : "",
        )}
      >
        <div className="space-y-6">
          {(activeSport === "all"
            ? sportSections
            : sportSections.filter((section) => section.sport === activeSport)
          ).map((section) => (
            <div
              key={section.sport}
              id={`sport-${section.sport.toLowerCase().replace(/\s+/g, "-")}`}
              className="scroll-mt-32 space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-muted">
                    Olahraga
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {section.sport}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {section.courts.length} lapangan tersedia untuk {section.sport}.
                  </p>
                </div>
                <span className="rounded-full border border-brand-soft/60 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:border-brand-soft/30 dark:bg-brand/20 dark:text-brand-contrast">
                  Jalur khusus {section.sport}
                </span>
              </div>

              <div
                className={cn(
                  "grid gap-5",
                  viewMode === "grid" ? "md:grid-cols-2" : "md:grid-cols-1",
                )}
              >
                {section.courts.map((court) => (
                  <CourtCard key={court.id} court={court} viewMode={viewMode} />
                ))}
              </div>

              {!section.courts.length && (
                <div className="rounded-3xl border border-dashed border-brand-soft/60 bg-white/80 p-6 text-center text-sm text-slate-500 dark:border-brand-soft/20 dark:bg-slate-900/60 dark:text-slate-400">
                  Belum ada lapangan yang cocok untuk {section.sport} dengan filter saat ini.
                  Sesuaikan budget atau rating untuk melihat opsi lainnya.
                </div>
              )}
            </div>
          ))}

          {!filteredCourts.length && (
            <div className="rounded-3xl border border-dashed border-brand-soft/60 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-brand-soft/20 dark:bg-slate-900/60 dark:text-slate-400">
              Kombinasi filter saat ini belum menemukan lapangan yang cocok.
              Coba ubah filter untuk melihat opsi lainnya.
            </div>
          )}
        </div>

        <aside className="space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-lg shadow-brand/5 dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-brand-muted">
                Forum terbaru
              </h3>
              <Link
                href="/forum"
                className="text-xs font-semibold text-brand hover:text-brand-strong"
              >
                Buka forum →
              </Link>
            </div>
            <ul className="space-y-4 text-sm">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="space-y-1 rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:border-brand/60 hover:shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-brand-muted">
                    <span>{thread.category?.name ?? "Forum"}</span>
                    <span className="text-slate-300">•</span>
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
          </div>

          <div className="space-y-3 rounded-2xl border border-brand-soft/60 bg-gradient-to-br from-brand/15 via-brand/5 to-brand-strong/20 p-5 text-brand-strong shadow-sm dark:border-brand-soft/30 dark:from-brand/25 dark:via-slate-900 dark:to-brand-soft/30">
            <h3 className="text-base font-semibold">Tarik traffic komunitas</h3>
            <p className="text-sm text-brand-muted/90 dark:text-brand-soft">
              Tampilkan event, promo, atau highlight venue di dashboard. Sorotanmu otomatis muncul di tab Explore.
            </p>
            <Link
              href="/dashboard/venue"
              className="inline-flex items-center justify-center rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand shadow-sm transition hover:bg-white dark:bg-slate-900/70 dark:text-brand-contrast dark:hover:bg-slate-900"
            >
              Kelola venue sekarang
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4 text-left shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
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
            <p className="font-semibold text-brand dark:text-brand">Rp{price}/jam</p>
            <p>{court.averageRating.toFixed(1)} ★</p>
            <p>{court.reviewCount} review</p>
          </div>
        </div>
        {court.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {court.amenities
              .slice(0, viewMode === "grid" ? 4 : 6)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80"
                >
                  {amenity}
                </span>
              ))}
            {court.amenities.length > (viewMode === "grid" ? 4 : 6) && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800/80">
                +{court.amenities.length - (viewMode === "grid" ? 4 : 6)} lainnya
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
