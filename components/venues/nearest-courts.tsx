"use client";

import Link from "next/link";
import type { CourtSummary } from "@/lib/supabase/queries/courts";
import { formatDistance } from "@/lib/geo";
import { useProximitySort } from "@/components/location/use-proximity-sort";
import type { LocationState } from "@/components/location/use-user-geolocation";

type Props = {
  courts: CourtSummary[];
  limit: number;
};

function resolveMessage(
  status: LocationState["status"],
  hasDistance: boolean,
  error?: string,
) {
  if (status === "success") {
    if (hasDistance) {
      return "Menampilkan lapangan terdekat dari lokasimu.";
    }
    return "Menampilkan rekomendasi populer. Lokasi venue belum lengkap.";
  }
  if (status === "error") {
    return error
      ? `${error} Menampilkan rekomendasi populer.`
      : "Tidak dapat mengakses lokasi. Menampilkan rekomendasi populer.";
  }
  if (status === "locating") {
    return "Menentukan lapangan terdekat...";
  }
  return "Menunggu izin lokasi perangkat.";
}

export function NearestCourtTiles({ courts, limit }: Props) {
  const proximity = useProximitySort(courts, {
    getLatitude: (court) => court.venueLatitude,
    getLongitude: (court) => court.venueLongitude,
  });

  const visible = proximity.items.slice(0, limit);
  const hasDistance = visible.some((entry) => entry.distanceKm !== null);
  const message = resolveMessage(proximity.status, hasDistance, proximity.error);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.3em] text-brand dark:text-brand">
          Lapangan terdekat
        </span>
        <span className="text-slate-500 dark:text-slate-200">{message}</span>
      </div>
      <div className="space-y-3">
        <div className="text-[11px] text-slate-600 dark:text-slate-100">{message}</div>
        <div className="grid gap-3 text-sm">
          {visible.map(({ item: court, distanceKm }) => {
            const distanceLabel = formatDistance(distanceKm);
            return (
              <div
                key={court.id}
                className="rounded-2xl border border-brand/25 bg-white/95 p-4 shadow-sm shadow-brand/10 transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-brand/30 dark:border-brand/35 dark:bg-brand/20"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand dark:text-brand">
                  {court.venueCity ?? "Lokasi fleksibel"}
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
                  {court.name}
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-200">
                  Mulai dari Rp{court.pricePerHour.toLocaleString("id-ID")}
                  /jam
                  {distanceLabel ? ` • ${distanceLabel}` : ""}
                </p>
              </div>
            );
          })}
          {!visible.length && (
            <div className="rounded-2xl border border-dashed border-brand/30 bg-white/95 p-4 text-xs text-slate-600 dark:border-brand/50 dark:bg-brand/20 dark:text-brand-contrast">
              Data venue akan tampil otomatis setelah kamu mengisi seed
              Supabase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NearestCourtSpotlight({ courts, limit }: Props) {
  const proximity = useProximitySort(courts, {
    getLatitude: (court) => court.venueLatitude,
    getLongitude: (court) => court.venueLongitude,
  });
  const visible = proximity.items.slice(0, limit);
  const hasDistance = visible.some((entry) => entry.distanceKm !== null);
  const message = resolveMessage(
    proximity.status,
    hasDistance,
    proximity.error,
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 dark:text-slate-100">{message}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ item: court, distanceKm }) => {
          const distanceLabel = formatDistance(distanceKm);
          return (
            <article
              key={court.id}
              className="group flex flex-col gap-4 rounded-3xl border border-brand/25 bg-white/90 p-6 shadow-sm shadow-brand/10 transition hover:-translate-y-1 hover:border-brand/60 hover:shadow-brand/30 dark:border-brand/35 dark:bg-brand/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {court.name}
                </p>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/20 dark:text-brand">
                  {court.averageRating.toFixed(1)} ★
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-200">
                {court.venueName}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-200">
                <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand dark:bg-brand/25 dark:text-brand-contrast">
                  {court.sport}
                </span>
                {court.venueCity && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand dark:bg-brand/25 dark:text-brand-contrast">
                    {court.venueCity}
                  </span>
                )}
                {distanceLabel && (
                  <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand dark:bg-brand/25 dark:text-brand-contrast">
                    {distanceLabel}
                  </span>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between text-sm">
                <span className="font-semibold text-brand dark:text-brand">
                  Rp{court.pricePerHour.toLocaleString("id-ID")}/jam
                </span>
                <Link
                  href={`/court/${court.slug}`}
                  className="text-xs font-semibold text-slate-500 transition hover:text-brand dark:text-slate-200 dark:hover:text-brand"
                >
                  Detail venue →
                </Link>
              </div>
            </article>
          );
        })}
        {!visible.length && (
          <div className="rounded-3xl border border-dashed border-brand/30 bg-white/90 p-8 text-center text-sm text-slate-600 dark:border-brand/50 dark:bg-brand/20 dark:text-brand-contrast">
            Data venue akan tampil otomatis setelah kamu menambahkan venue di
            dashboard Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
