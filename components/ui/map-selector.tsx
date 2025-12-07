"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { MapPin, Search } from "lucide-react";
import type { Coordinates } from "@/lib/geo";

// Import the existing LeafletMap components
const LeafletMap = dynamic(
  () => import("@/components/location/leaflet-map").then((mod) => mod.LeafletMap),
  { ssr: false }
);

interface MapSelectorProps {
  value?: { latitude: number; longitude: number } | null;
  onChange: (location: { latitude: number; longitude: number } | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MapSelector({
  value,
  onChange,
  placeholder = "Pilih lokasi pada peta",
  disabled = false
}: MapSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSelect = (coords: Coordinates) => {
    if (disabled) return;
    const newLocation = { latitude: coords.latitude, longitude: coords.longitude };
    onChange(newLocation);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      // Using Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        handleLocationSelect({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        });
      }
    } catch (error) {
      console.error("Error searching location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (disabled || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect({ latitude, longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };

  const handleClear = () => {
    if (disabled) return;
    onChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Pilih Lokasi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search controls */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari alamat atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
              disabled={disabled}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={disabled || isSearching || !searchQuery.trim()}
            variant="outline"
            size="sm"
          >
            {isSearching ? "Mencari..." : "Cari"}
          </Button>
          <Button
            onClick={handleGetCurrentLocation}
            disabled={disabled}
            variant="outline"
            size="sm"
          >
            Lokasi Saya
          </Button>
          {value && (
            <Button
              onClick={handleClear}
              disabled={disabled}
              variant="outline"
              size="sm"
            >
              Hapus
            </Button>
          )}
        </div>

        {/* Map display */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {placeholder}
          </Label>
          <LeafletMap
            value={value || null}
            onSelect={handleLocationSelect}
            interactive={!disabled}
            className="h-96"
            fallbackZoom={13}
          />
        </div>

        {/* Coordinates display */}
        {value && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                Latitude
              </Label>
              <Input
                id="latitude"
                value={value.latitude.toFixed(6)}
                readOnly
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                Longitude
              </Label>
              <Input
                id="longitude"
                value={value.longitude.toFixed(6)}
                readOnly
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Klik pada peta untuk memilih lokasi atau gunakan fitur pencarian/lokasi saat ini.
        </p>
      </CardContent>
    </Card>
  );
}