"use client";

import { useState, useCallback } from "react";
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
import { useDropzone } from "react-dropzone";
import { createCourt } from "@/lib/supabase/queries/venue-courts";
import type { SportType, SurfaceType } from "@/lib/api/types";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface AddCourtFormWithImagesProps {
  venueId: string;
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

export function AddCourtFormWithImages({ venueId, onSuccess, onClose }: AddCourtFormWithImagesProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    surface: "",
    pricePerHour: "",
    capacity: "",
    facilities: [""],
    description: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter for image files only
    const imageFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/')
    );

    setImageFiles(prev => [...prev, ...imageFiles].slice(0, 5)); // Max 5 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 5,
    multiple: true
  });

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      // Create court first
      const courtResult = await createCourt(venueId, {
        name: formData.name.trim(),
        sport: formData.sport as SportType,
        surface: formData.surface || undefined,
        pricePerHour: Number(formData.pricePerHour),
        capacity: formData.capacity ? Number(formData.capacity) : undefined,
        facilities: formData.facilities.filter(f => f.trim()),
        description: formData.description.trim() || undefined,
      });

      if (courtResult.success && courtResult.courtId) {
        // Handle image uploads (dummy implementation for now)
        if (imageFiles.length > 0) {
          console.log("Images to upload:", imageFiles);
          // TODO: Implement actual image upload logic here
          // For now, just log the files
          imageFiles.forEach((file, index) => {
            console.log(`Image ${index + 1}:`, file.name, file.size, file.type);
          });
        }

        setFormData({
          name: "",
          sport: "",
          surface: "",
          pricePerHour: "",
          capacity: "",
          facilities: [""],
          description: "",
        });
        setImageFiles([]);
        onSuccess();
        router.push("/dashboard/venue/courts");
      } else {
        setError(courtResult.error || "Terjadi kesalahan saat menambah lapangan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Create court error:", err);
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

  const imagePreviews = imageFiles.map((file, index) => {
    const objectUrl = URL.createObjectURL(file);
    return (
      <div key={index} className="relative group">
        <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
          <img
            src={objectUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            onLoad={() => URL.revokeObjectURL(objectUrl)}
          />
        </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
        onClick={() => removeImage(index)}
        disabled={isSubmitting}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
        {file.name.slice(0, 15)}...
      </div>
    </div>
    );
  });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col gap-2 text-center sm:text-left mb-6">
        <h2 className="text-lg leading-none font-semibold">Tambah Lapangan Baru</h2>
        <p className="text-sm text-muted-foreground">
          Tambahkan lapangan baru ke venue Anda beserta foto-fotonya.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 py-4">
          {/* Images Upload Section */}
          <div className="space-y-2">
            <Label>Foto Lapangan</Label>
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Lepaskan gambar di sini..."
                    : "Klik atau seret gambar ke sini untuk mengunggah"
                  }
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Maksimal 5 gambar. Format: PNG, JPG, JPEG, GIF, WebP
                </p>
              </div>

              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-4">
                  {imagePreviews}
                </div>
              )}
            </div>
          </div>

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

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/venue/courts")}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </div>
  );
}