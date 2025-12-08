"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistance } from "@/lib/geo";
import type { Coordinates } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useProximitySort } from "@/components/location/use-proximity-sort";
import type { LocationState } from "@/components/location/use-user-geolocation";
import { LeafletMap } from "@/components/location/leaflet-map";
import { CourtSummary } from "@/lib/queries/types";

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
      <div className="rounded-xl bg-brand/10 p-1 text-[11px] font-semibold text-brand dark:bg-brand/25 dark:text-brand-contrast">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={handleShowManual}
            aria-pressed={mode === "manual"}
            className={cn(
              "rounded-lg px-3 py-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand/50 focus-visible:-outline-offset-2",
              mode === "manual"
                ? "bg-white text-brand shadow-sm dark:bg-brand/30 dark:text-brand-contrast"
                : "hover:text-brand dark:hover:text-brand-contrast",
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
                ? "bg-white text-brand shadow-sm dark:bg-brand/30 dark:text-brand-contrast"
                : "hover:text-brand dark:hover:text-brand-contrast",
            )}
          >
            Gunakan GPS
          </button>
        </div>
      </div>
      {isShowingMap ? (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-brand/30 shadow-sm shadow-brand/20 dark:border-brand/50">
            <LeafletMap
              value={manualCoords ?? SURABAYA_COORDS}
              onSelect={handleManualSelect}
              interactive
              fallbackZoom={12}
              className="h-60"
            />
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-100">
            Ketuk peta untuk memilih lokasi rekomendasi. Fokus awal berada di
            Surabaya.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === "manual" && manualCoords ? (
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-100">
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
            <div className="text-[11px] text-slate-600 dark:text-slate-100">
              {message}
            </div>
          )}
          <div className="grid gap-5 text-sm">
            {visible.map(({ item: court, distanceKm }) => {
              const distanceLabel = formatDistance(distanceKm);
              return (
                <ImprovedCourtCard key={court.id} court={court} distanceLabel={distanceLabel} viewMode="list" />
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
      <p className="text-xs text-slate-600 dark:text-slate-100">{message}</p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(({ item: court, distanceKm }) => {
          const distanceLabel = formatDistance(distanceKm);
          return (
            <ImprovedCourtCard key={court.id} court={court} distanceLabel={distanceLabel} viewMode="grid" />
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

type ImprovedCourtCardProps = {
  court: CourtSummary;
  distanceLabel?: string | null;
  viewMode: "grid" | "list";
};

function ImprovedCourtCard({ court, distanceLabel, viewMode }: ImprovedCourtCardProps) {
  const price = new Intl.NumberFormat("id-ID").format(court.pricePerHour);

  return (
    <Link
      href={`/court/${court.slug}`}
      className={cn(
        "group overflow-hidden rounded-3xl border border-brand/60 bg-white/95 shadow-sm transition hover:-translate-y-1 hover:border-brand hover:shadow-xl dark:border-brand/30 dark:bg-slate-900/70",
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
            sizes={viewMode === "list" ? "192px" : "(max-width: 768px) 50vw, 33vw"}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 via-white to-brand-soft/50 text-slate-500 dark:from-slate-800 dark:via-slate-900 dark:to-brand-soft/30">
            <span className="text-xs font-semibold uppercase tracking-widest text-center">
              {court.sport}
            </span>
          </div>
        )}
        {/* Rating badge */}
        <div className="absolute top-3 right-3">
          <div className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            {court.averageRating.toFixed(1)} ★
          </div>
        </div>
        {distanceLabel && (
          <div className="absolute top-3 left-3">
            <div className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
              {distanceLabel}
            </div>
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
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-muted">
              {court.sport}
            </p>
            <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-brand dark:text-white dark:group-hover:text-brand-muted line-clamp-1">
              {court.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {court.venueName}
              {court.venueCity ? ` • ${court.venueCity}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
            <p className="font-semibold text-brand dark:text-brand">
              Rp{price}
              <span className="font-normal">/jam</span>
            </p>
          </div>
        </div>
        {court.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            {court.facilities
              .slice(0, viewMode === "grid" ? 3 : 5)
              .map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80"
                >
                  {amenity}
                </span>
              ))}
            {court.facilities.length > (viewMode === "grid" ? 3 : 5) && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800/80">
                +{court.facilities.length - (viewMode === "grid" ? 3 : 5)}
              </span>
            )}
          </div>
        )}
        {court.description && viewMode === "grid" && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {court.description.length > 80
              ? `${court.description.slice(0, 80)}...`
              : court.description}
          </p>
        )}
        {distanceLabel && viewMode === "list" && (
          <div className="mt-auto">
            <p className="text-xs text-brand dark:text-brand-muted">
              📍 {distanceLabel}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
