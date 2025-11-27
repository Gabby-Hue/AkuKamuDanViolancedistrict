import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PhotoGalleryProps {
  images: { image_url: string }[];
  title: string;
  className?: string;
}

export function PhotoGallery({ images, title, className }: PhotoGalleryProps) {
  if (images.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Galeri Foto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
            <div className="text-center">
              <div className="mb-3 text-4xl text-gray-400">📸</div>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Galeri foto akan tersedia setelah venue mengunggah foto lapangan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Galeri Foto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {images.slice(0, 6).map((image, index) => (
            <div
              key={image.image_url}
              className={cn(
                "group relative overflow-hidden rounded-lg bg-gray-100 transition-transform hover:scale-105",
                index === 0 && "md:col-span-2 md:row-span-2 md:h-80"
              )}
            >
              <Image
                src={image.image_url}
                alt={`${title} - Foto ${index + 1}`}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
          ))}
        </div>

        {images.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Menampilkan 6 dari {images.length} foto
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}