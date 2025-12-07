"use client";

import { useState, useEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { NavMainItem } from "@/components/nav-main";
import type { TeamOption } from "@/components/team-switcher";
import type { NavProject } from "@/components/nav-projects";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Image as ImageIcon,
  Upload,
  Star,
  Trash2,
  Loader2,
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  Download,
  X,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";

interface CourtImage {
  id: string;
  name: string;
  url: string;
  size: number;
  contentType: string;
  createdAt: string;
  isPrimary: boolean;
  filename?: string; // Add filename for delete operations
}

interface VenueData {
  id: string;
  name: string;
  city: string | null;
  district: string | null;
}

interface ClientImagesWrapperProps {
  profile: any;
  identity: any;
  venues: VenueData[];
  courtId: string;
}

export default function ClientImagesWrapper({
  profile,
  identity,
  venues,
  courtId,
}: ClientImagesWrapperProps) {
  const [images, setImages] = useState<CourtImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<CourtImage | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [primaryModalOpen, setPrimaryModalOpen] = useState(false);
  const [courtData, setCourtData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = identity?.fullName ?? profile.full_name ?? "Partner";
  const email = identity?.email ?? "partner@courtease.id";
  const primaryVenue = venues.length > 0 ? venues[0] : null;

  const navMain: NavMainItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard/venue",
      icon: "LayoutDashboard",
    },
    {
      title: "Lapangan Saya",
      url: "/dashboard/venue/courts",
      icon: "Building2",
    },
    {
      title: "Jadwal & Booking",
      url: "/dashboard/venue/bookings",
      icon: "CalendarClock",
    },
    {
      title: "Pengaturan",
      url: "/dashboard/venue/settings",
      icon: "Settings2",
    },
  ];

  const teams: TeamOption[] = (
    venues.length
      ? venues
      : [
          {
            id: "placeholder",
            name: "Venue belum tersedia",
            city: null,
            district: null,
          },
        ]
  ).map((venue) => ({
    id: venue.id,
    name: venue.name,
    description:
      [venue.city, venue.district].filter(Boolean).join(", ") || null,
    icon: "MapPin",
  }));

  // Fetch court images and court details
  const fetchCourtData = async () => {
    if (!courtId) {
      return;
    }

    try {
      setLoading(true);

      // Fetch court details using direct query
      const { getCourtDetailsAction } = await import("../../court-actions");
      const courtData = await getCourtDetailsAction(courtId);

      if (!courtData) {
        throw new Error("Court not found");
      }

      // console.log("Setting court data (direct query):", courtData);
      setCourtData(courtData);

      // Fetch court images
      // console.log("Fetching court images for:", courtId);
      const imagesResponse = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images`,
      );
      // console.log("Images response status:", imagesResponse.status);

      if (!imagesResponse.ok) {
        const errorText = await imagesResponse.text();
        // console.error("Images API error response:", errorText);
        throw new Error(
          `Failed to fetch court images: ${imagesResponse.status} ${errorText}`,
        );
      }

      let imagesResult;
      try {
        imagesResult = await imagesResponse.json();
      } catch (parseError) {
        console.error("Failed to parse images API response:", parseError);
        // console.log("Setting empty images array due to parse error");
        setImages([]);
        return; // Continue with court data even if images fail
      }
      // console.log("Images API response:", imagesResult);

      // Handle different response formats for images
      if (imagesResult.success !== undefined) {
        // New format with success property
        if (imagesResult.success) {
          console.log("Setting images (new format):", imagesResult.images);
          setImages(imagesResult.images || []);
        } else {
          console.error("Images API error (new format):", imagesResult.error);
          throw new Error(imagesResult.error || "Failed to fetch court images");
        }
      } else if (imagesResult.data && Array.isArray(imagesResult.data.images)) {
        // API response with data wrapper (actual format from logs)
        console.log(
          "Setting images (data.images format):",
          imagesResult.data.images,
        );
        const imagesWithFilename = imagesResult.data.images.map((img: any) => ({
          ...img,
          filename: img.name, // Store the filename for delete operations
        }));
        setImages(imagesWithFilename || []);
      } else if (Array.isArray(imagesResult.images)) {
        // Direct images array response
        setImages(imagesResult.images || []);
      } else if (Array.isArray(imagesResult)) {
        // Direct images response as array
        setImages(imagesResult || []);
      } else {
        console.warn("Unknown images API response format:", imagesResult);
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching court data:", error);

      // Try to get basic court info from venues list as fallback
      if (primaryVenue && !courtData) {
        console.log("Trying fallback court info from venues list");
        // This is a basic fallback - ideally we'd have court info in the venues list
        // For now, set minimal court info to prevent "Loading..." state
        setCourtData({
          id: courtId,
          name: "Lapangan " + courtId.slice(0, 8),
          sport: "Unknown",
          pricePerHour: 0,
          surface: null,
          capacity: null,
          facilities: [],
        });
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data lapangan",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);

    // Filter for valid image files
    const validFiles = fileArray.filter((file) => {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast.error(
          `File ${file.name} tidak valid. Gunakan JPG, PNG, atau WebP.`,
        );
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
  };

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
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupload gambar");
      }

      const result = await response.json();
      console.log("Upload API response:", result);

      // Handle different response formats
      let imageInfo, isPrimary, message;
      if (result.data) {
        // New format with data wrapper
        imageInfo = result.data.image;
        isPrimary = result.data.isPrimary;
        message = result.data.message;
      } else {
        // Old/direct format
        imageInfo = result.image;
        isPrimary = result.isPrimary;
        message = result.message;
      }

      if (!imageInfo) {
        console.error("No image info in upload response:", result);
        throw new Error("Invalid upload response format");
      }

      // Update local state
      const newImage: CourtImage = {
        id: imageInfo.id || imageInfo.path || Date.now().toString(),
        name: imageInfo.name || file.name,
        url: imageInfo.url,
        size: imageInfo.size || file.size,
        contentType: imageInfo.contentType || file.type,
        createdAt: imageInfo.createdAt || new Date().toISOString(),
        isPrimary: isPrimary,
        filename: imageInfo.name || file.name, // Store filename for delete operations
      };

      if (isPrimary) {
        setImages((prev) => prev.map((img) => ({ ...img, isPrimary: false })));
      }

      setImages((prev) => [...prev, newImage]);

      toast.success(message);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengupload gambar",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete image
  const deleteImage = async (image: CourtImage) => {
    try {
      // Use filename instead of ID for delete operation
      const deleteTarget = image.filename || image.id;
      console.log("Deleting image with target:", deleteTarget);

      const response = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images/${deleteTarget}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus gambar");
      }

      const result = await response.json();
      console.log("Delete API response:", result);

      // Handle different response formats
      let deleteInfo, message;
      if (result.data) {
        // New format with data wrapper
        deleteInfo = result.data;
        message = result.data.message;
      } else {
        // Old/direct format
        deleteInfo = result;
        message = result.message;
      }

      // Update local state - remove the deleted image
      setImages((prev) => prev.filter((img) => img.id !== image.id));

      // If this was primary, update all other images
      if (deleteInfo.wasPrimary && deleteInfo.newPrimaryUrl) {
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            isPrimary: img.url === deleteInfo.newPrimaryUrl,
          })),
        );
      } else if (deleteInfo.wasPrimary) {
        setImages((prev) => prev.map((img) => ({ ...img, isPrimary: false })));
      }

      setDeleteModalOpen(false);
      toast.success(message);

      // Refetch images from server to ensure UI is in sync
      setTimeout(() => {
        fetchCourtData();
      }, 500); // Small delay to allow server to process deletion
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus gambar",
      );
    }
  };

  // Set as primary
  const setAsPrimary = async (image: CourtImage) => {
    if (image.isPrimary) return;

    try {
      // Use filename instead of ID for set primary operation
      const primaryTarget = image.filename || image.id;
      console.log("Setting primary image with target:", primaryTarget);

      const response = await fetch(
        `/api/dashboard/venue/courts/${courtId}/images/${primaryTarget}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isPrimary: true }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengatur gambar utama");
      }

      const result = await response.json();
      console.log("Set primary API response:", result);

      // Handle different response formats
      let message;
      if (result.data) {
        // New format with data wrapper
        message = result.data.message;
      } else {
        // Old/direct format
        message = result.message;
      }

      // Update local state
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === image.id,
        })),
      );

      setPrimaryModalOpen(false);
      toast.success(message);
    } catch (error) {
      console.error("Set primary error:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal mengatur gambar utama",
      );
    }
  };

  // View image details
  const viewImageDetails = (image: CourtImage) => {
    setSelectedImage(image);
    setDetailModalOpen(true);
  };

  // Drag and drop handlers
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

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    fetchCourtData();
  }, [courtId]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={{ name: displayName, email }}
        teams={teams}
        navMain={navMain}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/venue">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard/venue/courts">
                    Lapangan Saya
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Foto Lapangan - {courtData?.name || "Loading..."}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <ModeToggle />
          </div>
        </header>

        <div className="flex-1 space-y-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">
                Foto Lapangan
              </h2>
              <p className="text-muted-foreground">
                {courtData?.name || "Loading..."} • {courtData?.sport || ""}
              </p>
            </div>
            <Link href="/dashboard/venue/courts">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Lapangan
              </Button>
            </Link>
          </div>

          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Foto Baru
              </CardTitle>
              <CardDescription>
                Drag & drop gambar atau klik untuk memilih file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                } ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={!uploading ? openFileDialog : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) =>
                    e.target.files && handleFiles(e.target.files)
                  }
                  disabled={uploading}
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
                    JPG, PNG, atau WebP • Maksimal 5MB per gambar • Banyak file
                    bisa dipilih
                  </p>
                </div>

                {!uploading && (
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Galeri Gambar ({images.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted rounded-lg mb-2"></div>
                      <div className="bg-muted rounded h-4 w-3/4 mb-1"></div>
                      <div className="bg-muted rounded h-3 w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {images.map((image) => (
                    <div key={image.id} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border">
                        <img
                          src={image.url}
                          alt={`${courtData?.name || "Lapangan"} - ${image.name}`}
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
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => viewImageDetails(image)}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!image.isPrimary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setSelectedImage(image);
                                setPrimaryModalOpen(true);
                              }}
                              className="bg-white/90 hover:bg-white text-black"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedImage(image);
                              setDeleteModalOpen(true);
                            }}
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
                            {new Date(image.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tidak ada gambar</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload gambar pertama untuk lapangan{" "}
                    {courtData?.name || "lapangan ini"}
                  </p>
                  {images.length === 0 && (
                    <Button onClick={openFileDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload Gambar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Image Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Gambar</DialogTitle>
            <DialogDescription>
              Informasi lengkap gambar untuk lapangan "
              {courtData?.name || "Lapangan"}"
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="space-y-4">
                <img
                  src={selectedImage.url}
                  alt={`${courtData?.name || "Lapangan"} - ${selectedImage.name}`}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
                {selectedImage.isPrimary && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Gambar Utama
                  </Badge>
                )}
              </div>

              {/* Image Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi File</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama File:</span>
                      <span className="font-medium">{selectedImage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipe File:</span>
                      <span className="font-medium">
                        {selectedImage.contentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Ukuran File:
                      </span>
                      <span className="font-medium">
                        {formatFileSize(selectedImage.size)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tanggal Upload:
                      </span>
                      <span className="font-medium">
                        {new Date(selectedImage.createdAt).toLocaleString(
                          "id-ID",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informasi Lapangan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Nama Lapangan:
                      </span>
                      <span className="font-medium">
                        {courtData?.name || "Lapangan"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tipe Olahraga:
                      </span>
                      <span className="font-medium">
                        {courtData?.sport || "Tidak ada"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Permukaan:</span>
                      <span className="font-medium">
                        {courtData?.surface || "Tidak ada"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Harga/Jam:</span>
                      <span className="font-medium">
                        Rp{" "}
                        {courtData?.pricePerHour?.toLocaleString("id-ID") ||
                          "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedImage.url;
                    link.download = selectedImage.name;
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {!selectedImage.isPrimary && (
                  <Button
                    onClick={() => {
                      setDetailModalOpen(false);
                      setPrimaryModalOpen(true);
                    }}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Jadikan Utama
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailModalOpen(false);
                    setDeleteModalOpen(true);
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Gambar</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus gambar "{selectedImage?.name}"?
              {selectedImage?.isPrimary && " Ini adalah gambar utama."}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={`${courtData?.name || "Lapangan"} - ${selectedImage.name}`}
                className="w-full max-h-48 object-contain rounded-lg"
              />
              <div className="text-sm">
                <p>
                  <strong>Nama:</strong> {selectedImage.name}
                </p>
                <p>
                  <strong>Ukuran:</strong> {formatFileSize(selectedImage.size)}
                </p>
                {selectedImage.isPrimary && (
                  <p className="text-orange-600">
                    <strong>Peringatan:</strong> Gambar utama akan dihapus
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedImage && deleteImage(selectedImage)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus Gambar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Primary Confirmation Modal */}
      <Dialog open={primaryModalOpen} onOpenChange={setPrimaryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadikan Gambar Utama</DialogTitle>
            <DialogDescription>
              Jadikan gambar "{selectedImage?.name}" sebagai gambar utama untuk
              lapangan "{courtData?.name || "Lapangan"}"?
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <img
                src={selectedImage.url}
                alt={`${courtData?.name || "Lapangan"} - ${selectedImage.name}`}
                className="w-full max-h-48 object-contain rounded-lg"
              />
              <div className="text-sm">
                <p>
                  <strong>Nama:</strong> {selectedImage.name}
                </p>
                <p>
                  <strong>Ukuran:</strong> {formatFileSize(selectedImage.size)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPrimaryModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              onClick={() => selectedImage && setAsPrimary(selectedImage)}
            >
              <Star className="mr-2 h-4 w-4" />
              Jadikan Utama
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
