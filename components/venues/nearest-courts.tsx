"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CourtSummary } from "@/lib/supabase/queries/courts";
import { formatDistance } from "@/lib/geo";
import type { Coordinates } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useProximitySort } from "@/components/location/use-proximity-sort";
import type { LocationState } from "@/components/location/use-user-geolocation";
import { LeafletMap } from "@/components/location/leaflet-map";

type Props = {
  courts: CourtSummary[];
  limit: number;
};

const SURABAYA_COORDS: Coordinates = {
  latitude: -7.2574719,
  longitude: 112.7520883,
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

function formatCoordinateLabel(coords: Coordinates) {
  return `${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°`;
}

export function NearestCourtTiles({ courts, limit }: Props) {
  const [mode, setMode] = useState<"manual" | "gps">("manual");
  const [manualCoords, setManualCoords] = useState<Coordinates | null>(null);
  const [isPickerVisible, setIsPickerVisible] = useState(true);

  const manualOverride = useMemo<LocationState | null>(() => {
    if (mode === "manual" && !isPickerVisible && manualCoords) {
      return {
        status: "success",
        coords: manualCoords,
      } satisfies LocationState;
    }
    return null;
  }, [mode, isPickerVisible, manualCoords]);

  const proximity = useProximitySort(courts, {
    getLatitude: (court) => court.venueLatitude,
    getLongitude: (court) => court.venueLongitude,
    override: manualOverride,
  });

  const visible = proximity.items.slice(0, limit);
  const hasDistance = visible.some((entry) => entry.distanceKm !== null);
  const isManualActive = Boolean(manualOverride);
  const message = isManualActive
    ? "Menampilkan lapangan terdekat dari lokasi pilihanmu."
    : resolveMessage(proximity.status, hasDistance, proximity.error);

  const isShowingMap = mode === "manual" && isPickerVisible;

  const handleManualSelect = (coords: Coordinates) => {
    setManualCoords(coords);
    setIsPickerVisible(false);
  };

  const handleShowManual = () => {
    setMode("manual");
    setIsPickerVisible(manualCoords ? false : true);
  };

  const handleShowGps = () => {
    setMode("gps");
    setIsPickerVisible(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.3em] text-brand dark:text-brand">
          Lapangan terdekat
        </span>
        {!isShowingMap && (
          <span className="text-slate-500 dark:text-slate-200">{message}</span>
        )}
      </div>
      <div className="rounded-xl bg-slate-100 p-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-200">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={handleShowManual}
            aria-pressed={mode === "manual"}
            className={cn(
              "rounded-lg px-3 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand/50 focus-visible:-outline-offset-2",
              mode === "manual"
                ? "bg-white text-brand shadow-sm dark:bg-slate-900 dark:text-brand"
                : "hover:text-brand dark:hover:text-brand",
            )}
          >
            Pilih dari peta
          </button>
          <button
            type="button"
            onClick={handleShowGps}
            aria-pressed={mode === "gps"}
            className={cn(
              "rounded-lg px-3 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand/50 focus-visible:-outline-offset-2",
              mode === "gps"
                ? "bg-white text-brand shadow-sm dark:bg-slate-900 dark:text-brand"
                : "hover:text-brand dark:hover:text-brand",
            )}
          >
            Gunakan GPS
          </button>
        </div>
      </div>
      {isShowingMap ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-brand/30">
            <LeafletMap
              value={manualCoords ?? SURABAYA_COORDS}
              onSelect={handleManualSelect}
              interactive
              fallbackZoom={12}
              className="h-60"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-200">
            Ketuk peta untuk memilih lokasi rekomendasi. Fokus awal berada di
            Surabaya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === "manual" && manualCoords ? (
            <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  Lokasi pilihan: {formatCoordinateLabel(manualCoords)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerVisible(true)}
                  className="font-semibold text-brand transition hover:text-brand-strong dark:text-brand"
                >
                  Ubah lokasi peta
                </button>
              </div>
              <p>{message}</p>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 dark:text-slate-200">
              {message}
            </div>
          )}
          <div className="grid gap-3 text-sm">
            {visible.map(({ item: court, distanceKm }) => {
              const distanceLabel = formatDistance(distanceKm);
              return (
                <div
                  key={court.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-sm dark:border-brand/30 dark:bg-brand/20"
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
              <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/95 p-4 text-xs text-slate-500 dark:border-brand/30 dark:bg-brand/20 dark:text-slate-200">
                Data venue akan tampil otomatis setelah kamu mengisi seed
                Supabase.
              </div>
            )}
          </div>
        </div>
      )}
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
      <p className="text-xs text-slate-500 dark:text-slate-200">{message}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ item: court, distanceKm }) => {
          const distanceLabel = formatDistance(distanceKm);
          return (
            <article
              key={court.id}
              className="group flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-brand/30 dark:bg-brand/20"
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
                <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-brand/20">
                  {court.sport}
                </span>
                {court.venueCity && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-brand/20">
                    {court.venueCity}
                  </span>
                )}
                {distanceLabel && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 dark:bg-brand/20">
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
          <div className="rounded-3xl border border-dashed border-slate-200/70 bg-white/90 p-8 text-center text-sm text-slate-500 dark:border-brand/30 dark:bg-brand/20 dark:text-slate-200">
            Data venue akan tampil otomatis setelah kamu menambahkan venue di
            dashboard Supabase.
          </div>
        )}
      </div>
    </div>
  );
}
