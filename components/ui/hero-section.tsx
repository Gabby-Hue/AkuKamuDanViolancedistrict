import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  sport: string;
  price: number;
  rating: number;
  reviewCount: number;
  heroImage?: string | null;
  className?: string;
}

export function HeroSection({
  title,
  subtitle,
  sport,
  price,
  rating,
  reviewCount,
  heroImage,
  className,
}: HeroSectionProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-brand/5", className)}>
      {/* Hero Image */}
      <div className="relative h-96 w-full overflow-hidden bg-gray-100">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="mb-2 text-6xl">🏟️</div>
              <p className="text-sm font-medium">Preview coming soon</p>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-strong/70 via-brand-strong/30 to-transparent" />

        {/* Sport Badge - Top Left */}
        <div className="absolute left-6 top-6">
          <Badge
            variant="secondary"
            className="bg-brand-soft/90 text-brand-contrast backdrop-blur-sm hover:bg-brand-soft"
          >
            {sport}
          </Badge>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative -mt-24 mx-6 mb-6">
        <div className="rounded-2xl border border-brand/25 bg-background/80 p-6 shadow-lg shadow-brand/15 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold text-brand-strong">
                {title}
              </h1>
              <p className="text-sm text-foreground/80">
                {subtitle}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-right">
              <p className="text-xs uppercase tracking-wider text-brand-muted">
                Mulai dari
              </p>
              <p className="text-2xl font-bold text-brand">
                Rp{new Intl.NumberFormat("id-ID").format(price)}
                <span className="ml-1 text-sm font-medium text-foreground/70">
                  /jam
                </span>
              </p>
              <div className="flex items-center gap-1 text-sm text-foreground/80">
                <span className="text-brand">★</span>
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-brand-muted">•</span>
                <span>{reviewCount} review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}