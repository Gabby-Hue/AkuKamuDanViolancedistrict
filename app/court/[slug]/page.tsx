import Link from "next/link";
import { notFound } from "next/navigation";

import { HeroSection } from "@/components/ui/hero-section";
import { InfoGrid } from "@/components/ui/info-grid";
import { PhotoGallery } from "@/components/ui/photo-gallery";
import { BookingSidebar } from "@/components/ui/booking-sidebar";
import { VenueLocationMap } from "@/components/venues/venue-location-map";
import { PublicQueries } from "@/lib/queries/public";
import { getProfileWithRole } from "@/lib/supabase/roles";

export default async function CourtDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const court = await PublicQueries.getCourtDetail(slug);
  const profile = await getProfileWithRole();

  if (!court) {
    notFound();
  }

  const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? null;
  const midtransScriptUrl =
    process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ??
    "https://app.sandbox.midtrans.com/snap/snap.js";
  const midtransConfigured = Boolean(
    midtransClientKey && process.env.MIDTRANS_SERVER_KEY,
  );

  const isBookingAllowed = !profile || profile.role === "user";
  const bookingRestrictionMessage = profile
    ? profile.role === "admin"
      ? "Admin platform tidak dapat melakukan booking dari halaman ini."
      : profile.role === "venue_partner"
        ? "Akun venue partner tidak dapat melakukan booking untuk menghindari benturan kepentingan."
        : null
    : null;

  const images = court.images ?? [];
  const heroImage =
    images.find((image) => image.isPrimary)?.imageUrl ??
    images[0]?.imageUrl ??
    null;
  const otherImages = images
    .filter((image) => image.imageUrl !== heroImage)
    .map((image) => ({ image_url: image.imageUrl }));

  const subtitle = `${court.venueName}${court.venueCity ? ` • ${court.venueCity}` : ""}`;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500">
        <Link
          href="/venues"
          className="hover:text-blue-600 transition-colors"
        >
          Venues
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">{court.name}</span>
      </nav>

      {/* Hero Section */}
      <HeroSection
        title={court.name}
        subtitle={subtitle}
        sport={court.sport}
        price={court.pricePerHour}
        rating={court.averageRating}
        reviewCount={court.reviewCount}
        heroImage={heroImage}
      />

      {/* Description */}
      {court.description && (
        <div className="max-w-4xl">
          <p className="text-gray-600 leading-relaxed">
            {court.description}
          </p>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Information Grid */}
          <InfoGrid
            surface={court.surface}
            capacity={court.capacity}
            contactPhone={court.venueContactPhone}
            contactEmail={court.venueContactEmail}
            location={court.venueAddress}
            facilities={court.facilities}
          />

          {/* Photo Gallery */}
          <PhotoGallery
            images={otherImages}
            title={court.name}
          />

          {/* Location Map */}
          <VenueLocationMap
            venueName={court.venueName}
            latitude={court.venueLatitude}
            longitude={court.venueLongitude}
            address={court.venueAddress}
          />

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Review Komunitas
              </h2>
              <span className="text-sm font-medium text-blue-600">
                {court.reviewCount} review
              </span>
            </div>
            <div className="space-y-4">
              {court.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {review.author ?? "Member CourtEase"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-400">
                      ★
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
              {!court.reviews.length && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
                  <div className="text-4xl mb-3">⭐</div>
                  <p className="text-gray-500 text-sm">
                    Belum ada review. Jadilah yang pertama memberikan pengalamanmu
                    setelah booking lapangan ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8">
            <BookingSidebar
              courtId={court.id}
              isConfigured={midtransConfigured}
              midtransClientKey={midtransClientKey}
              snapScriptUrl={midtransScriptUrl}
              isBookingAllowed={isBookingAllowed}
              disallowedMessage={bookingRestrictionMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
