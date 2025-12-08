import Link from "next/link";
import { PublicQueries } from "@/lib/queries/public";
import { VenuesDirectory } from "@/components/venues/venues-directory";
import type { Venue, Court } from "@/lib/queries/types";
import {
  Building2,
  ArrowRight,
} from "lucide-react";

// Adapter function to transform Venue to VenueSummary interface
function adaptVenueToSummary(venue: Venue, courts: Court[] = []) {
  return {
    id: venue.id,
    slug: venue.slug,
    name: venue.name,
    city: venue.city || null,
    address: venue.address || null,
    latitude: venue.latitude || null,
    longitude: venue.longitude || null,
    description: venue.description || null,
    contactPhone: venue.contactPhone || null,
    contactEmail: venue.contactEmail || null,
    createdAt: venue.createdAt,
    courts: courts.map((court) => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface || null,
      pricePerHour: court.pricePerHour,
      capacity: court.capacity || null,
      facilities: court.facilities,
      description: court.description || null,
      venueName: court.venueName,
      venueAddress: court.venueAddress || null,
      venueCity: court.venueCity || null,
      venueLatitude: court.venueLatitude || null,
      venueLongitude: court.venueLongitude || null,
      primaryImageUrl: court.primaryImageUrl || null,
      averageRating: court.averageRating,
      reviewCount: court.reviewCount,
    })),
  };
}

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const params = await searchParams;
  const focusSlug = typeof params.focus === "string" ? params.focus : null;

  // Fetch venues and courts in parallel
  const [venues, courts] = await Promise.all([
    PublicQueries.getVenues({ limit: 50 }),
    PublicQueries.getActiveCourts({ limit: 200 }),
  ]);

  // Group courts by venue ID
  const courtsByVenue = courts.reduce(
    (acc, court) => {
      if (!acc[court.venueId]) {
        acc[court.venueId] = [];
      }
      acc[court.venueId].push(court);
      return acc;
    },
    {} as Record<string, Court[]>,
  );

  // Transform venues with their associated courts
  const adaptedVenues = venues.map((venue) =>
    adaptVenueToSummary(venue, courtsByVenue[venue.id] || []),
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <VenuesDirectory
            venues={adaptedVenues}
            initialFocusSlug={focusSlug}
          />

          {/* Sticky CTA Card */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl bg-linear-to-br from-brand to-brand-strong p-6 text-white shadow-xl">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Punya Venue Olahraga?</h3>
                  <p className="mt-2 text-sm text-white/90">
                    Bergabung dengan CourtEase dan kelola venue kamu dengan
                    dashboard modern. Pantau okupansi, pembayaran, dan review
                    komunitas real-time.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    href="/venue-partner"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand transition hover:bg-white/90"
                  >
                    Daftar Venue Partner
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
