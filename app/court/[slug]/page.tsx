import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingScheduler } from "@/components/venues/booking-scheduler";
import { VenueLocationMap } from "@/components/venues/venue-location-map";
import { PublicQueries } from "@/lib/queries/public";
import { getProfileWithRole } from "@/lib/supabase/roles";
import { cn } from "@/lib/utils";

// Helper function to safely format dates
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "Tanggal tidak tersedia";

  try {
    const date = new Date(dateString);
    // Check if date is invalid
    if (isNaN(date.getTime())) return "Tanggal tidak tersedia";

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Tanggal tidak tersedia";
  }
}

// Helper function to get display name for author
function getAuthorName(profile: any): string {
  if (!profile || !profile.full_name || profile.full_name.trim() === "") {
    return "Member CourtEase";
  }

  // Check for common anonymous patterns
  const anonymousPatterns = [
    "anonymous",
    "anonim",
    "tidak diketahui",
    "user",
    "pengguna",
  ];

  const lowerAuthor = profile.full_name.toLowerCase().trim();
  if (anonymousPatterns.some((pattern) => lowerAuthor.includes(pattern))) {
    return "Member CourtEase";
  }

  return profile.full_name.trim();
}

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
  const otherImages = images.filter((image) => image.imageUrl !== heroImage);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-3 pb-24 pt-16 sm:px-4 lg:px-6">
      <nav className="text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/venues"
          className="hover:text-brand dark:hover:text-brand-muted"
        >
          Venues
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700 dark:text-slate-200">{court.name}</span>
      </nav>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand dark:border-brand/30 dark:bg-brand/10 dark:text-brand-muted">
          {court.sport}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              {court.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {court.venueName}
              {court.venueCity ? ` • ${court.venueCity}` : ""}
              {court.venueDistrict ? `, ${court.venueDistrict}` : ""}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500 dark:text-slate-400">
            <p className="text-xs uppercase tracking-[0.3em] text-brand">
              Mulai dari
            </p>
            <p className="text-2xl font-semibold text-brand dark:text-brand-muted">
              Rp{new Intl.NumberFormat("id-ID").format(court.pricePerHour)}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                /jam
              </span>
            </p>
            <p className="text-xs">
              {court.averageRating.toFixed(1)} ★ • {court.reviewCount} review
            </p>
          </div>
        </div>
        {court.description && (
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            {court.description}
          </p>
        )}
      </header>

      <section className="space-y-6">
        {/* Image Gallery - Desktop: 1 primary + 3 supporting, Mobile: 1 primary full */}
        <div className="lg:grid lg:grid-cols-[2fr_1fr] lg:gap-6">
          {/* Primary Image - Larger */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-lg dark:bg-slate-900 lg:aspect-[3/2]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={court.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <div className="mb-2">📷</div>
                  <div>Preview coming soon</div>
                </div>
              </div>
            )}
          </div>

          {/* Supporting Images - Desktop only, 2x2 grid */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3 lg:h-full">
            {otherImages.slice(0, 4).map((image, index) => (
              <div
                key={image.imageUrl}
                className="relative overflow-hidden rounded-2xl bg-slate-100 shadow-md dark:bg-slate-900 aspect-[4/3]"
              >
                <Image
                  src={image.imageUrl}
                  alt={`${court.name} preview ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
            {otherImages.length === 0 && (
              <div className="col-span-2 flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-white/70 text-xs text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400 p-4 text-center">
                <div className="mb-2 text-lg">🖼️</div>
                <div>
                  Galeri tambahan akan tampil setelah venue mengunggah foto
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Supporting Images - Horizontal scroll */}
        {otherImages.length > 0 && (
          <div className="lg:hidden">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Galeri tambahan
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-hide">
              {otherImages.map((image, index) => (
                <div
                  key={image.imageUrl}
                  className="relative flex-shrink-0 w-32 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-md dark:bg-slate-900"
                >
                  <Image
                    src={image.imageUrl}
                    alt={`${court.name} preview ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:space-y-0">
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Fasilitas & info teknis
            </h2>
            <dl className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Permukaan
                </dt>
                <dd>{court.surface ?? "Disesuaikan venue"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Kapasitas
                </dt>
                <dd>
                  {court.capacity ? `${court.capacity} pemain` : "Fleksibel"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Kontak
                </dt>
                <dd>
                  {court.venueContactPhone && (
                    <div>{court.venueContactPhone}</div>
                  )}
                  {court.venueContactEmail && (
                    <div>{court.venueContactEmail}</div>
                  )}
                  {!court.venueContactPhone &&
                    !court.venueContactEmail &&
                    "Hubungi venue via dashboard"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Lokasi
                </dt>
                <dd>
                  {court.venueAddress ?? "Alamat lengkap tersedia saat booking"}
                </dd>
              </div>
            </dl>
            {court.facilities.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Fasilitas unggulan
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {court.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/80"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <VenueLocationMap
            venueName={court.venueName}
            latitude={court.venueLatitude}
            longitude={court.venueLongitude}
            address={court.venueAddress}
          />

          <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Review komunitas
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
                {court.reviewCount} review
              </span>
            </div>
            <ul className="space-y-4">
              {court.reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {getAuthorName(review.author_name)}
                    </span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-brand dark:text-brand-muted">
                    {review.rating.toFixed(1)} ★
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {review.comment}
                    </p>
                  )}
                </li>
              ))}
              {!court.reviews.length && (
                <li className="rounded-2xl border border-dashed border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-900/60 dark:text-slate-400">
                  Belum ada review. Jadilah yang pertama memberikan pengalamanmu
                  setelah booking lapangan ini.
                </li>
              )}
            </ul>
          </div>
        </div>

        <aside className="space-y-6 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 sm:p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Booking cepat
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Semua transaksi diproses melalui Supabase. Kamu bisa mengatur
              jadwal, mengundang tim, dan memantau pembayaran langsung dari
              dashboard CourtEase.
            </p>
          </div>
          <BookingScheduler
            courtId={court.id}
            isConfigured={midtransConfigured}
            midtransClientKey={midtransClientKey}
            snapScriptUrl={midtransScriptUrl}
            isBookingAllowed={isBookingAllowed}
            disallowedMessage={bookingRestrictionMessage}
          />
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300 sm:p-5">
            <p className="font-semibold text-slate-900 dark:text-white">
              Butuh paket turnamen?
            </p>
            <p className="mt-2">
              Hubungi tim venue untuk paket multi-hari. Data kontak dan dokumen
              penawaran dapat kamu akses setelah melakukan permintaan booking.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
