"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Camera,
} from "lucide-react";

interface CourtImage {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string;
  isPrimary: boolean;
}

interface CourtImageGalleryProps {
  courtId: string;
  courtName: string;
  images: CourtImage[];
  primaryImage: string | null;
  onImagesChange?: (images: CourtImage[], primaryImage: string | null) => void;
  disabled?: boolean;
}

export function CourtImageGallery({
  courtId,
  courtName,
  images,
  primaryImage,
  onImagesChange,
  disabled = false,
}: CourtImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImages, setCurrentImages] = useState<CourtImage[]>(images);
  const [currentPrimary, setCurrentPrimary] = useState<string | null>(primaryImage);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Filter for valid image files
      const validFiles = fileArray.filter((file) => {
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const isValidType = validTypes.includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

        if (!isValidType) {
          toast.error(`File ${file.name} tidak valid. Gunakan JPG, PNG, atau WebP.`);
          return false;
        }

        if (!isValidSize) {
          toast.error(`File ${file.name} terlalu besar. Maksimal 5MB.`);
          return false;
        }

        return true;
      });

      if (validFiles.length === 0) return;

      // Upload files one by one
      for (const file of validFiles) {
        await uploadFile(file);
      }
    },
    [courtId]
  );

  const uploadFile = async (file: File, isPrimary = false) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("isPrimary", isPrimary.toString());

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupload gambar");
      }

      const result = await response.json();

      // Update local state
      const newImage: CourtImage = {
        id: result.image.id,
        name: result.image.name,
        url: result.image.url,
        size: result.image.size,
        contentType: result.image.contentType,
        createdAt: result.image.createdAt,
        isPrimary: result.isPrimary,
      };

      const updatedImages = [...currentImages, newImage];
      setCurrentImages(updatedImages);

      if (result.isPrimary) {
        setCurrentPrimary(result.image.url);
      }

      if (onImagesChange) {
        onImagesChange(updatedImages, result.isPrimary ? result.image.url : currentPrimary);
      }

      toast.success(result.message);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mengupload gambar");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (image: CourtImage) => {
    try {
      const response = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images/${image.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus gambar");
      }

      const result = await response.json();

      // Update local state
      const updatedImages = currentImages.filter((img) => img.id !== image.id);
      setCurrentImages(updatedImages);

      if (result.wasPrimary) {
        setCurrentPrimary(result.newPrimaryUrl);
      }

      if (onImagesChange) {
        onImagesChange(updatedImages, result.wasPrimary ? result.newPrimaryUrl : currentPrimary);
      }

      toast.success(result.message);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal menghapus gambar");
    }
  };

  const setAsPrimary = async (image: CourtImage) => {
    if (image.isPrimary) return;

    try {
      const response = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images/${image.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPrimary: true }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengatur gambar utama");
      }

      const result = await response.json();

      // Update local state
      const updatedImages = currentImages.map((img) => ({
        ...img,
        isPrimary: img.id === image.id,
      }));
      setCurrentImages(updatedImages);
      setCurrentPrimary(result.primaryImageUrl);

      if (onImagesChange) {
        onImagesChange(updatedImages, result.primaryImageUrl);
      }

      toast.success(result.message);
    } catch (error) {
      console.error("Set primary error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mengatur gambar utama");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto Lapangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={!disabled ? openFileDialog : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={disabled || uploading}
              className="hidden"
            />

            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {uploading ? "Mengupload..." : "Upload Foto Lapangan"}
              </p>
              <p className="text-sm text-muted-foreground">
                {uploading
                  ? "Mohon tunggu, foto sedang diupload..."
                  : "Drag & drop gambar di sini atau klik untuk memilih file"}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, atau WebP • Maksimal 5MB per gambar
              </p>
            </div>

            {!disabled && !uploading && (
              <Button type="button" className="mt-4" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Pilih File
              </Button>
            )}

            {uploading && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Upload progress: {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {currentImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gambar Tersimpan</span>
              <Badge variant="outline">{currentImages.length} gambar</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentImages.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={image.url}
                      alt={`${courtName} - ${image.name}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="mr-1 h-3 w-3 fill-current" />
                          Utama
                        </Badge>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setAsPrimary(image)}
                          disabled={disabled}
                          className="bg-white/90 hover:bg-white text-black"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image)}
                        disabled={disabled}
                        className="bg-red-500/90 hover:bg-red-500 text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium truncate">
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(image.size)}</span>
                      <span>
                        {new Date(image.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {currentImages.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Belum ada gambar
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload gambar pertama untuk lapangan "{courtName}"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}