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

// Dynamically import Leaflet to avoid SSR issues and create custom icon
let customIcon: any = null;

const loadLeaflet = async () => {
  const L = await import("leaflet");

  // Create custom icon using our SVG marker
  if (!customIcon) {
    const iconHtml = `
      <div style="
        width: 40px;
        height: 40px;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <svg width="40" height="40" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="
          width: 100%;
          height: 100%;
        ">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="#dc2626"/>
        </svg>
      </div>
    `;

    customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40], // Center bottom of the marker
      popupAnchor: [0, -40],
    });
  }

  // Set up default icon as fallback
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });

  return { L, customIcon };
};

const DEFAULT_CENTER: LatLngExpression = [-2.548926, 118.0148634];
const DEFAULT_ZOOM = 5;
const FOCUSED_ZOOM = 15;

// Optimized dynamic components for react-leaflet hooks
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
            map.flyTo([coords.latitude, coords.longitude], FOCUSED_ZOOM, {
              duration: 0.8,
              easeLinearity: 0.5,
            });
          } else {
            map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, {
              duration: 0.8,
              easeLinearity: 0.5,
            });
          }
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
  const [leafletLib, setLeafletLib] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    // Load Leaflet CSS only on client side
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Initialize Leaflet with custom icon
    loadLeaflet().then(({ L, customIcon }) => {
      setLeafletLib({ L, customIcon });
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
      <div className={cn(
        "h-64 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center",
        "rounded-lg border border-slate-200 dark:border-slate-700",
        className
      )}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-brand mb-2"></div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Loading map...
          </p>
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
    <>
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-marker::before {
          content: none !important;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={isInteractive}
        scrollWheelZoom={isInteractive}
        doubleClickZoom={isInteractive}
        dragging={isInteractive}
        touchZoom={isInteractive}
        className={cn(
          "h-64 w-full rounded-lg border border-slate-200 dark:border-slate-700",
          "shadow-sm hover:shadow-md transition-shadow duration-300",
          className
        )}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <RecenterOnValue coords={value} />
        {value && leafletLib?.customIcon && (
          <Marker
            position={[value.latitude, value.longitude]}
            icon={leafletLib.customIcon}
          />
        )}
        {enableSelection && onSelect && <MapClickHandler onSelect={onSelect} />}
      </MapContainer>
    </>
  );
}
