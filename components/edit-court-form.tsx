"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateCourt } from "@/lib/supabase/queries/venue-courts";
import type { SportType, SurfaceType } from "@/lib/api/types";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";

interface EditCourtFormProps {
  court: VenueCourtDetail;
  onSuccess: () => void;
  onClose: () => void;
}

const sportOptions = [
  { value: "futsal", label: "Futsal" },
  { value: "basketball", label: "Basketball" },
  { value: "soccer", label: "Soccer" },
  { value: "volleyball", label: "Volleyball" },
  { value: "badminton", label: "Badminton" },
  { value: "tennis", label: "Tennis" },
  { value: "padel", label: "Padel" },
];

const surfaceOptions = [
  { value: "vinyl", label: "Vinyl" },
  { value: "rubber", label: "Rubber" },
  { value: "parquet", label: "Parquet" },
  { value: "wood", label: "Wood" },
  { value: "synthetic", label: "Synthetic" },
  { value: "cement", label: "Cement" },
  { value: "turf", label: "Turf" },
  { value: "grass", label: "Grass" },
  { value: "hard_court", label: "Hard Court" },
  { value: "clay", label: "Clay" },
];

export function EditCourtForm({ court, onSuccess, onClose }: EditCourtFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    surface: "",
    pricePerHour: "",
    capacity: "",
    facilities: [""],
    description: "",
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: court.name,
      sport: court.sport,
      surface: court.surface || "",
      pricePerHour: court.pricePerHour.toString(),
      capacity: court.capacity?.toString() || "",
      facilities: court.facilities.length > 0 ? court.facilities : [""],
      description: court.description || "",
      isActive: court.isActive,
    });
  }, [court]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Nama lapangan wajib diisi");
      return;
    }

    if (!formData.sport) {
      setError("Tipe lapangan wajib dipilih");
      return;
    }

    if (!formData.pricePerHour || Number(formData.pricePerHour) <= 0) {
      setError("Harga per jam wajib diisi dengan benar");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateCourt(court.id, {
        name: formData.name.trim(),
        sport: formData.sport as SportType,
        surface: formData.surface || undefined,
        pricePerHour: Number(formData.pricePerHour),
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        facilities: formData.facilities.filter(f => f.trim()),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Terjadi kesalahan saat mengubah lapangan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Update court error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, ""]
    }));
  };

  const removeFacility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const updateFacility = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => i === index ? value : f)
    }));
  };

  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Lapangan</DialogTitle>
        <DialogDescription>
          Ubah detail lapangan {court.name}.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lapangan</Label>
            <Input
              id="name"
              placeholder="Lapangan Futsal 1"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">Tipe Lapangan</Label>
            <Select
              value={formData.sport}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sport: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                {sportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga per Jam</Label>
              <Input
                id="price"
                type="number"
                placeholder="150000"
                value={formData.pricePerHour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Kapasitas</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="10"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="surface">Permukaan</Label>
            <Select
              value={formData.surface}
              onValueChange={(value) => setFormData(prev => ({ ...prev, surface: value }))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih permukaan" />
              </SelectTrigger>
              <SelectContent>
                {surfaceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Deskripsi lapangan..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Fasilitas</Label>
            <div className="space-y-2">
              {formData.facilities.map((facility, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Fasilitas ${index + 1}`}
                    value={facility}
                    onChange={(e) => updateFacility(index, e.target.value)}
                    disabled={isSubmitting}
                  />
                  {formData.facilities.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFacility(index)}
                      disabled={isSubmitting}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFacility}
                disabled={isSubmitting}
              >
                + Tambah Fasilitas
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive">Lapangan Aktif</Label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}