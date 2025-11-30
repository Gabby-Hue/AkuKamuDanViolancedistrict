"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useDropzone } from "react-dropzone";
import { updateCourt } from "@/lib/supabase/queries/venue-courts";
import type { SportType, SurfaceType } from "@/lib/api/types";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";
import { Upload, X, Image as ImageIcon, Camera } from "lucide-react";

interface EditCourtFormWithImagesProps {
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

export function EditCourtFormWithImages({ court, onSuccess, onClose }: EditCourtFormWithImagesProps) {
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState(court.images || []);
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
    setExistingImages(court.images || []);
  }, [court]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file =>
      file.type.startsWith('image/')
    );

    setImageFiles(prev => [...prev, ...imageFiles].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 5,
    multiple: true
  });

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
    // TODO: Implement actual image deletion from server
    console.log("Remove existing image:", imageId);
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
        // Handle image uploads and deletions (dummy implementation)
        if (imageFiles.length > 0) {
          console.log("New images to upload:", imageFiles);
          imageFiles.forEach((file, index) => {
            console.log(`New Image ${index + 1}:`, file.name, file.size, file.type);
          });
        }

        if (existingImages.length !== court.images.length) {
          const removedImages = court.images.filter(img =>
            !existingImages.some(existing => existing.id === img.id)
          );
          console.log("Images to remove:", removedImages);
        }

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

  const newImagePreviews = imageFiles.map((file, index) => (
    <div key={`new-${index}`} className="relative group">
      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-blue-200">
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
        onClick={() => removeNewImage(index)}
        disabled={isSubmitting}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
        <span className="block truncate">NEW: {file.name.slice(0, 12)}...</span>
      </div>
    </div>
  ));

  const existingImagePreviews = existingImages.map((image) => (
    <div key={image.id} className="relative group">
      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
        <img
          src={image.imageUrl}
          alt={image.caption || `Court image ${image.id}`}
          className="w-full h-full object-cover"
        />
        {image.isPrimary && (
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 py-0.5">
            Utama
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => removeExistingImage(image.id)}
        disabled={isSubmitting}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
        <span className="block truncate">{image.caption || `Image ${image.id}`}</span>
      </div>
    </div>
  ));

  return (
    <div className="max-w-3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Edit Lapangan</h2>
          <p className="text-muted-foreground">
            Ubah detail dan foto-foto lapangan "{court.name}".
          </p>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Foto Lapangan</Label>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Foto saat ini:</p>
              <div className="flex flex-wrap gap-4">
                {existingImagePreviews}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Tambah foto baru:</p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 hover:border-gray-400"
              } ${imageFiles.length >= 5 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input {...getInputProps()} disabled={imageFiles.length >= 5} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600">
                {imageFiles.length >= 5
                  ? "Maksimal 5 gambar tercapai"
                  : isDragActive
                    ? "Lepaskan gambar di sini..."
                    : "Klik atau seret gambar ke sini untuk menambah"
                  }
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {5 - imageFiles.length} slot tersisa. Format: PNG, JPG, JPEG, GIF, WebP
              </p>
            </div>

            {imageFiles.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {newImagePreviews}
              </div>
            )}
          </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
          </div>
        </form>
      </div>
    </div>
  );
}