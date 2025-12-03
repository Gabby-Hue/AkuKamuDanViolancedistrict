"use client";

import { useEffect, useState } from "react";
import type React from "react";

import type { Coordinates } from "@/lib/geo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type VenueLocationPickerProps = {
  value: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
};

export function VenueLocationPicker({ value, onChange }: VenueLocationPickerProps) {
  const [latitudeInput, setLatitudeInput] = useState(
    value?.latitude?.toString() ?? "",
  );
  const [longitudeInput, setLongitudeInput] = useState(
    value?.longitude?.toString() ?? "",
  );

  useEffect(() => {
    setLatitudeInput(value?.latitude?.toString() ?? "");
    setLongitudeInput(value?.longitude?.toString() ?? "");
  }, [value?.latitude, value?.longitude]);

  const handleCoordinateChange = (field: "latitude" | "longitude") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      if (field === "latitude") {
        setLatitudeInput(nextValue);
      } else {
        setLongitudeInput(nextValue);
      }

      const latValue = field === "latitude" ? nextValue : latitudeInput;
      const lngValue = field === "longitude" ? nextValue : longitudeInput;

      const parsedLat = parseFloat(latValue);
      const parsedLng = parseFloat(lngValue);

      if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
        onChange({ latitude: parsedLat, longitude: parsedLng });
      }
    };

  const handleClear = () => {
    setLatitudeInput("");
    setLongitudeInput("");
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-4 rounded-2xl border border-[#E5E7EB] bg-white/95 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
        <p className="text-sm text-slate-600 dark:text-slate-200">
          Peta dimatikan. Masukkan koordinat latitude dan longitude secara
          manual untuk menentukan posisi venue.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-200">
            <span>Latitude</span>
            <Input
              type="number"
              value={latitudeInput}
              onChange={handleCoordinateChange("latitude")}
              placeholder="-7.2575"
              step="0.00001"
            />
          </label>
          <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-200">
            <span>Longitude</span>
            <Input
              type="number"
              value={longitudeInput}
              onChange={handleCoordinateChange("longitude")}
              placeholder="112.7521"
              step="0.00001"
            />
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <p>Koordinat valid akan tersimpan otomatis ketika kedua kolom terisi.</p>
        {value ? (
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            Hapus koordinat
          </Button>
        ) : null}
      </div>
    </div>
  );
}
