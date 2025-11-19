"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

import { cn } from "@/lib/utils";
import type { Coordinates } from "@/lib/geo";

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

// Dynamically import Leaflet to avoid SSR issues
const loadLeaflet = async () => {
  const L = await import("leaflet");

  // Fix default icon issue
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  return L;
};

const DEFAULT_CENTER: LatLngExpression = [-2.548926, 118.0148634];
const DEFAULT_ZOOM = 5;
const FOCUSED_ZOOM = 15;

// Create dynamic components for react-leaflet hooks
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((reactLeaflet) => {
      const { useMapEvents } = reactLeaflet;

      return function MapClickHandler({ onSelect }: { onSelect: (coords: Coordinates) => void }) {
        useMapEvents({
          click(event) {
            onSelect({
              latitude: event.latlng.lat,
              longitude: event.latlng.lng,
            });
          },
        });
        return null;
      };
    }),
  { ssr: false }
);

const RecenterOnValue = dynamic(
  () =>
    import("react-leaflet").then((reactLeaflet) => {
      const { useMap } = reactLeaflet;

      return function RecenterOnValue({ coords }: { coords: Coordinates | null }) {
        const map = useMap();

        useEffect(() => {
          if (coords) {
            map.flyTo(
              [coords.latitude, coords.longitude],
              Math.max(map.getZoom(), FOCUSED_ZOOM),
              { duration: 0.5 },
            );
            return;
          }
          map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.5 });
        }, [coords, map]);

        return null;
      };
    }),
  { ssr: false }
);

type LeafletMapProps = {
  value: Coordinates | null;
  onSelect?: (coords: Coordinates) => void;
  interactive?: boolean;
  className?: string;
  fallbackZoom?: number;
};

export function LeafletMap({
  value,
  onSelect,
  interactive = false,
  className,
  fallbackZoom = DEFAULT_ZOOM,
}: LeafletMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Load Leaflet CSS only on client side
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Initialize Leaflet icons
    loadLeaflet().then(() => {
      setIsLoaded(true);
    });

    return () => {
      // Clean up CSS when component unmounts
      const existingLink = document.querySelector('link[href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]');
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);

  if (!isClient || !isLoaded) {
    return (
      <div className={cn("h-64 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center", className)}>
        <div className="text-slate-500 dark:text-slate-200">
          Loading map...
        </div>
      </div>
    );
  }

  const center: LatLngExpression = value
    ? [value.latitude, value.longitude]
    : DEFAULT_CENTER;
  const zoom = value ? FOCUSED_ZOOM : fallbackZoom;
  const isInteractive = Boolean(interactive);
  const enableSelection = Boolean(interactive && onSelect);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      zoomControl={isInteractive}
      scrollWheelZoom={isInteractive}
      doubleClickZoom={isInteractive}
      dragging={isInteractive}
      touchZoom={isInteractive}
      className={cn("h-64 w-full", className)}
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RecenterOnValue coords={value} />
      {value && <Marker position={[value.latitude, value.longitude]} />}
      {enableSelection && onSelect && <MapClickHandler onSelect={onSelect} />}
    </MapContainer>
  );
}
