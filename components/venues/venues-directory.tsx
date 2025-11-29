"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { calculateDistanceKm, formatDistance } from "@/lib/geo";
import type { Coordinates } from "@/lib/geo";
import type { CourtSummary, VenueSummary } from "@/lib/supabase/queries/courts";

import { useProximitySort } from "@/components/location/use-proximity-sort";
import type { LocationState } from "@/components/location/use-user-geolocation";

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
  venues: VenueSummary[];
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
    <div className="space-y-5">
      <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      {orderedVenues.map(({ item: venue, distanceKm }) => {
        const open = activeSlug === venue.slug;
        const distanceLabel = formatDistance(distanceKm);
        const courts = sortCourtsByDistance(venue.courts, coords);
        const sectionId = `venue-${venue.slug}`;
        const panelId = `${sectionId}-panel`;
        const triggerId = `${sectionId}-trigger`;

        return (
          <section
            key={venue.id}
            id={sectionId}
            className={`rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm transition dark:border-slate-800/70 dark:bg-slate-900/70 ${
              open
                ? "ring-1 ring-brand/25"
                : "hover:border-brand/40 hover:shadow-lg"
            }`}
          >
            <button
              type="button"
              className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-3xl bg-white/60 px-6 py-5 text-left transition dark:bg-slate-900/60"
              aria-expanded={open}
              aria-controls={panelId}
              id={triggerId}
              onClick={() => setActiveSlug(open ? null : venue.slug)}
            >
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand dark:text-brand-muted">
                  <span>Venue</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{venue.city ?? "Lokasi fleksibel"}</span>
                  {venue.district && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {venue.district}
                    </span>
                  )}
                  {distanceLabel && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold tracking-normal text-brand dark:bg-brand/10 dark:text-brand-muted">
                      {distanceLabel}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-slate-900 transition dark:text-white">
                  {venue.name}
                </h2>
                {venue.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {venue.address}
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                <p className="font-semibold text-brand">
                  {venue.courts.length} lapangan aktif
                </p>
                {(venue.contactPhone || venue.contactEmail) && (
                  <div className="mt-2 space-y-1 text-[11px]">
                    {venue.contactPhone && <p>{venue.contactPhone}</p>}
                    {venue.contactEmail && <p>{venue.contactEmail}</p>}
                  </div>
                )}
              </div>
            </button>
            {open && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="space-y-6 border-t border-slate-200/70 px-6 pb-6 pt-5 dark:border-slate-800/70"
              >
                {venue.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {venue.description}
                  </p>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {courts.map(({ court, distanceKm: courtDistance }) => (
                    <article
                      key={court.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 transition hover:border-brand/70 hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/60"
                    >
                      <Link
                        href={`/court/${court.slug}`}
                        className="flex flex-col"
                      >
                        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {court.primaryImageUrl ? (
                            <Image
                              src={court.primaryImageUrl}
                              alt={court.name}
                              fill
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                              Preview coming soon
                            </div>
                          )}
                          <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand shadow-sm dark:bg-slate-900/80">
                            {court.sport}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900 transition group-hover:text-brand dark:text-white dark:group-hover:text-brand-muted">
                                {court.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Rp
                                {new Intl.NumberFormat("id-ID").format(
                                  court.pricePerHour,
                                )}
                                /jam
                                {formatDistance(courtDistance)
                                  ? ` • ${formatDistance(courtDistance)}`
                                  : ""}
                              </p>
                            </div>
                            <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                              <p className="font-semibold text-brand">
                                {court.averageRating.toFixed(1)} ★
                              </p>
                              <p>{court.reviewCount} review</p>
                            </div>
                          </div>
                          {court.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              {court.amenities.slice(0, 4).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/70"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {court.amenities.length > 4 && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800/70">
                                  +{court.amenities.length - 4} lainnya
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
                {!venue.courts.length && (
                  <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-400">
                    Lapangan akan tampil otomatis setelah venue menambahkan data
                    di dashboard.
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
