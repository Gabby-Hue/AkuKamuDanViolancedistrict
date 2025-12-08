"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { calculateDistanceKm, formatDistance } from "@/lib/geo";
import type { Coordinates } from "@/lib/geo";
import { useProximitySort } from "@/components/location/use-proximity-sort";
import type { LocationState } from "@/components/location/use-user-geolocation";
import type { CourtSummary, Venue } from "@/lib/queries/types";

function resolveMessage(
  status: LocationState["status"],
  hasDistance: boolean,
  error?: string,
) {
  if (status === "success") {
    if (hasDistance) {
      return "Menampilkan venue terdekat berdasarkan lokasimu.";
    }
    return "Menampilkan urutan default. Koordinat venue belum lengkap.";
  }
  if (status === "error") {
    return error
      ? `${error} Menampilkan urutan default.`
      : "Tidak dapat mengakses lokasi. Menampilkan urutan default.";
  }
  if (status === "locating") {
    return "Menentukan venue terdekat...";
  }
  return "Menunggu izin lokasi perangkat.";
}

function sortCourtsByDistance(
  courts: CourtSummary[],
  coords: Coordinates | null,
): Array<{ court: CourtSummary; distanceKm: number | null }> {
  if (!coords) {
    return courts.map((court) => ({ court, distanceKm: null }));
  }

  return [...courts]
    .map((court) => {
      const lat = court.venueLatitude;
      const lng = court.venueLongitude;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return { court, distanceKm: null };
      }
      return {
        court,
        distanceKm: calculateDistanceKm(
          coords.latitude,
          coords.longitude,
          lat,
          lng,
        ),
      };
    })
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) {
        return 0;
      }
      if (a.distanceKm === null) {
        return 1;
      }
      if (b.distanceKm === null) {
        return -1;
      }
      return a.distanceKm - b.distanceKm;
    });
}

type VenuesDirectoryProps = {
  venues: Venue[];
  initialFocusSlug: string | null;
};

export function VenuesDirectory({
  venues,
  initialFocusSlug,
}: VenuesDirectoryProps) {
  const proximity = useProximitySort(venues, {
    getLatitude: (venue) => venue.latitude,
    getLongitude: (venue) => venue.longitude,
  });

  const [activeSlug, setActiveSlug] = useState<string | null>(() => {
    return initialFocusSlug ?? proximity.items[0]?.item.slug ?? null;
  });

  useEffect(() => {
    if (initialFocusSlug) {
      setActiveSlug(initialFocusSlug);
    }
  }, [initialFocusSlug]);

  useEffect(() => {
    if (!activeSlug) {
      return;
    }
    const exists = proximity.items.some(
      (entry) => entry.item.slug === activeSlug,
    );
    if (!exists) {
      setActiveSlug(proximity.items[0]?.item.slug ?? null);
    }
  }, [activeSlug, proximity.items]);

  const message = resolveMessage(
    proximity.status,
    proximity.items.some((entry) => entry.distanceKm !== null),
    proximity.error,
  );

  const coords = proximity.coords;

  const orderedVenues = useMemo(
    () => proximity.items.map((entry) => ({ ...entry })),
    [proximity.items],
  );

  if (!orderedVenues.length) {
    return (
      <div className="space-y-5">
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
        <div className="rounded-3xl border border-dashed border-slate-200/70 bg-white/80 p-8 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
          Data venue akan tampil otomatis setelah kamu menambahkan venue di
          dashboard Supabase.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
        {message}
      </p>
      {orderedVenues.map(({ item: venue, distanceKm }) => {
        const open = activeSlug === venue.slug;
        const distanceLabel = formatDistance(distanceKm);
        const courts = sortCourtsByDistance(venue.courts ?? [], coords);
        const sectionId = `venue-${venue.slug}`;
        const panelId = `${sectionId}-panel`;
        const triggerId = `${sectionId}-trigger`;

        return (
          <section
            key={venue.id}
            id={sectionId}
            className={`rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm transition-all duration-300 dark:border-slate-700/40 dark:bg-slate-900/60 ${
              open
                ? "ring-2 ring-brand/20 shadow-lg"
                : "hover:border-brand/40 hover:shadow-md"
            }`}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl p-6 text-left transition"
              aria-expanded={open}
              aria-controls={panelId}
              id={triggerId}
              onClick={() => setActiveSlug(open ? null : venue.slug)}
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/20 dark:text-brand-contrast">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Venue
                  </span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {venue.city ?? "Lokasi fleksibel"}
                  </span>
                  {distanceLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {distanceLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 transition dark:text-white">
                  {venue.name}
                </h2>
                {venue.address && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                    {venue.address}
                  </p>
                )}
                {venue.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {venue.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 text-right">
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand">
                    {venue.courts?.length ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Lapangan
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="border-t border-slate-200/60 dark:border-slate-700/40"
              >
                <div className="p-6 space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courts.map(({ court, distanceKm: courtDistance }) => (
                      <article
                        key={court.id}
                        className="group overflow-hidden rounded-xl border border-slate-200/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-brand/40 dark:border-slate-700/40 dark:bg-slate-900/40"
                      >
                        <Link
                          href={`/court/${court.slug}`}
                          className="flex flex-col h-full"
                        >
                          <div className="relative h-32 overflow-hidden bg-slate-100 dark:bg-slate-800">
                            {court.primaryImageUrl ? (
                              <Image
                                src={court.primaryImageUrl}
                                alt={court.name}
                                fill
                                className="object-cover transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                                No Image
                              </div>
                            )}
                            <div className="absolute left-2 top-2 rounded-full bg-brand/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                              {court.sport}
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-slate-900 transition group-hover:text-brand dark:text-white dark:group-hover:text-brand-contrast truncate">
                                  {court.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs font-medium text-brand">
                                    Rp
                                    {new Intl.NumberFormat("id-ID").format(
                                      court.pricePerHour,
                                    )}
                                    /jam
                                  </p>
                                  {formatDistance(courtDistance) && (
                                    <span className="text-xs text-slate-400">
                                      • {formatDistance(courtDistance)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-semibold text-brand">
                                  {court.averageRating.toFixed(1)} ★
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {court.reviewCount}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    ))}
                  </div>
                  {!venue.courts?.length && (
                    <div className="rounded-xl border border-dashed border-slate-200/60 bg-slate-50/60 p-8 text-center text-sm text-slate-500 dark:border-slate-700/40 dark:bg-slate-900/40 dark:text-slate-400">
                      <svg
                        className="h-12 w-12 mx-auto text-slate-300 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <p className="font-medium">Belum ada lapangan</p>
                      <p className="text-xs mt-1">
                        Venue ini belum menambahkan data lapangan
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
