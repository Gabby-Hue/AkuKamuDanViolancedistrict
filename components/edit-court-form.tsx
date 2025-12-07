"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { SportType, SurfaceType } from "@/lib/api/types";

interface EditCourtFormProps {
  court: any; // Using any to accommodate both API and direct query types
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

export function EditCourtForm({
  court,
  onSuccess,
  onClose,
}: EditCourtFormProps) {
  const router = useRouter();
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
    // Handle both API format (pricePerHour, isActive) and direct query format (price_per_hour, is_active)
    setFormData({
      name: court.name || "",
      sport: court.sport || "",
      surface: court.surface || "",
      pricePerHour: ((court.price_per_hour || court.pricePerHour) ?? 0).toString(),
      capacity: (court.capacity?.toString() || ""),
      facilities: (court.facilities && court.facilities.length > 0) ? court.facilities : [""],
      description: court.description || "",
      isActive: court.is_active !== undefined ? court.is_active : (court.isActive ?? true),
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
      // Use server action for direct query update
      const { updateCourtAction } = await import("@/app/dashboard/venue/courts/court-actions");
      const result = await updateCourtAction(court.id, {
        name: formData.name.trim(),
        sport: formData.sport as SportType,
        surface: formData.surface || undefined,
        price_per_hour: Number(formData.pricePerHour),
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        facilities: formData.facilities.filter((f) => f.trim()),
        description: formData.description.trim() || undefined,
        is_active: formData.isActive,
      });

      if (result.success) {
        toast.success("Lapangan berhasil diperbarui.");
        onSuccess();
        // Redirect to courts page after successful update
        setTimeout(() => {
          router.push("/dashboard/venue/courts");
        }, 1500);
      } else {
        setError(result.error || "Terjadi kesalahan saat mengubah lapangan");
        toast.error(result.error || "Terjadi kesalahan saat mengubah lapangan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Update court error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFacility = () => {
    setFormData((prev) => ({
      ...prev,
      facilities: [...prev.facilities, ""],
    }));
  };

  const removeFacility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }));
  };

  const updateFacility = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => (i === index ? value : f)),
    }));
  };

  return (
    <div className="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            Ubah detail lapangan "{court.name}".
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lapangan</Label>
              <Input
                id="name"
                placeholder="Lapangan Futsal 1"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Tipe Lapangan</Label>
              <Select
                value={formData.sport}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, sport: value }))
                }
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">Harga per Jam</Label>
              <Input
                id="price"
                type="number"
                placeholder="150000"
                value={formData.pricePerHour}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pricePerHour: e.target.value,
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capacity: e.target.value }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="surface">Permukaan</Label>
              <Select
                value={formData.surface}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, surface: value }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
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
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="isActive">Lapangan Aktif</Label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="sm:w-auto w-full"
            >
              ← Kembali
            </Button>
            <div className="flex gap-2 sm:w-auto w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin membatalkan perubahan?")) {
                    router.back();
                  }
                }}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
