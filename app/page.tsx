import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicQueries } from "@/lib/queries/public";
import type { Court, ForumThread } from "@/lib/queries/types";
import { NearestCourtSpotlight } from "@/components/venues/nearest-courts";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import {
  SportsTabs,
  type SportCategory,
} from "@/components/landing/sports-tabs";

// Forum Thread Card Component
type ForumThreadCardProps = {
  thread: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    reply_count: number;
    created_at: string;
    tags: string[];
    category: { name: string } | null;
    author_name: string | null;
  };
  index: number;
};

function ForumThreadCard({ thread, index }: ForumThreadCardProps) {
  return (
    <article
      className="group relative overflow-hidden rounded-3xl border border-brand/20 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-xl dark:border-brand/30 dark:bg-slate-900/60 dark:hover:border-brand/50"
      style={{
        opacity: 0,
        transform: "translateY(30px)",
        animation: "fadeInUp 0.6s ease-out forwards",
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand dark:bg-brand/20 dark:text-brand-contrast">
              {thread.category?.name ?? "Umum"}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(thread.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
              />
            </svg>
            <span>{thread.reply_count}</span>
          </div>
        </div>

        <Link href={`/forum/${thread.slug}`} className="block space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-brand dark:text-white dark:group-hover:text-brand-contrast line-clamp-2">
            {thread.title}
          </h3>
          {thread.excerpt && (
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
              {thread.excerpt}
            </p>
          )}
        </Link>

        {thread.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {thread.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
            {thread.tags.length > 3 && (
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-500">
                +{thread.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-6 w-6 rounded-full bg-linear-to-br from-brand to-brand-strong text-white flex items-center justify-center">
              {thread.author_name?.[0]?.toUpperCase() || "C"}
            </div>
            <span>{thread.author_name ?? "Member CourtEase"}</span>
          </div>
          <Link
            href={`/forum/${thread.slug}`}
            className="text-xs font-semibold text-brand transition hover:text-brand-strong dark:text-brand-contrast dark:hover:text-brand"
          >
            Baca selengkapnya →
          </Link>
        </div>
      </div>
    </article>
  );
}

const partnerBenefits: {
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Integrasi pembayaran",
    detail:
      "Aktifkan Midtrans tanpa coding. Monitoring dan notifikasi otomatis sudah terpasang seperti template Supa Snowy.",
    icon: Sparkles,
  },
  {
    label: "Dashboard multi-venue",
    detail:
      "Kelola banyak cabang dalam satu akun. Harga, jadwal, dan laporan keuangan tersusun rapi di satu workspace.",
    icon: MapPin,
  },
  {
    label: "Eksposur komunitas",
    detail:
      "Tampil di halaman Explore dan Forum sehingga komunitas olahraga mudah menemukan venue kamu dan segera booking.",
    icon: ShieldCheck,
  },
];

const sportsCategories: SportCategory[] = [
  {
    name: "Basket",
    sport: "basketball",
    image: "/sports/basket.jpg",
    accent: "rgba(255, 122, 31, 0.2)",
  },
  {
    name: "Voli",
    sport: "volleyball",
    image: "/sports/voli.jpg",
    accent: "rgba(37, 99, 235, 0.2)",
  },
  {
    name: "Futsal",
    sport: "futsal",
    image: "/sports/futsal.jpg",
    accent: "rgba(22, 163, 74, 0.2)",
  },
  {
    name: "Padel",
    sport: "padel",
    image: "/sports/padel.jpg",
    accent: "rgba(6, 182, 212, 0.18)",
  },
  {
    name: "Badminton",
    sport: "badminton",
    image: "/sports/badminton.jpg",
    accent: "rgba(139, 92, 246, 0.2)",
  },
  {
    name: "Tennis",
    sport: "tennis",
    image: "/sports/tennis.jpg",
    accent: "rgba(34, 197, 94, 0.18)",
  },
  {
    name: "Sepak bola",
    sport: "soccer",
    image: "/sports/soccer.jpg",
    accent: "rgba(14, 165, 233, 0.2)",
  },
];

// Adapter function to transform Court to CourtSummary-like interface
function adaptCourtToSummary(court: Court) {
  return {
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
    venueCity: court.venueCity || null,
    venueDistrict: court.venueDistrict || null,
    venueLatitude: court.venueLatitude || null,
    venueLongitude: court.venueLongitude || null,
    primaryImageUrl: court.primaryImageUrl || null,
    averageRating: court.averageRating,
    reviewCount: court.reviewCount,
  };
}

// Adapter function to transform ForumThread to ForumThreadSummary-like interface
function adaptThreadToSummary(thread: ForumThread) {
  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt || null,
    reply_count: thread.replyCount,
    created_at: thread.createdAt,
    tags: thread.tags,
    category: thread.category || null,
    author_name: thread.author || null,
    latestReplyBody: null, // Would need additional data fetching
    latestReplyAt: null, // Would need additional data fetching
    reviewCourt: null, // Would need additional data fetching
  };
}

export default async function Home() {
  const [courts, threads] = await Promise.all([
    PublicQueries.getActiveCourts({ limit: 50 }), // Fetch courts for spotlight
    PublicQueries.getForumThreads({ limit: 20 }), // Fetch forum threads for highlights
  ]);

  // Transform data to match component expectations
  const adaptedCourts = courts.map(adaptCourtToSummary);
  const adaptedThreads = threads.map(adaptThreadToSummary);

  // Add animation styles to head
  const animationStyles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <main className="space-y-20 pb-24">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <HeroCarousel />

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SportsTabs sports={sportsCategories} />
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-brand dark:text-brand-contrast">
              Court pilihan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Rekomendasi lapangan dengan rating tertinggi dan fasilitas
              lengkap.
            </p>
          </div>
          <Link
            href="/explore"
            className="text-sm font-semibold text-brand transition hover:text-brand-strong"
          >
            Lihat semua court →
          </Link>
        </div>
        <NearestCourtSpotlight courts={adaptedCourts} limit={6} />
      </section>

      {/* Forum Komunitas Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Komunitas <span className="text-brand">CourtEase</span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Bergabung dengan ribuan pemain olahraga yang berbagi tips, review
              venue, dan mencari teman bermain di forum komunitas kami.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {adaptedThreads.slice(0, 3).map((thread, index) => (
              <ForumThreadCard key={thread.id} thread={thread} index={index} />
            ))}
          </div>

          <div className="text-center pt-8">
            <Link
              href="/forum"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-brand to-brand-strong px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand/30 transition hover:shadow-xl hover:scale-105"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              Join Forum Komunitas
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Partner Promotion Section */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Jadi <span className="text-brand">Venue Partner</span> CourtEase
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                Tingkatkan okupansi venue kamu dengan platform booking
                terintegrasi Midtrans dan eksposur ke komunitas olahraga
                terbesar di Indonesia.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {partnerBenefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.label}
                    className="flex flex-col items-center text-center space-y-3"
                    style={{
                      opacity: 0,
                      transform: "translateY(20px)",
                      animation: "fadeInUp 0.6s ease-out forwards",
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-brand/20 dark:bg-slate-800 dark:border-brand/30">
                      <Icon className="h-7 w-7 text-brand dark:text-brand-contrast" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {benefit.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {benefit.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <Link
                href="/venue-partner"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-strong hover:shadow-lg"
              >
                Ajukan Kemitraan
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
