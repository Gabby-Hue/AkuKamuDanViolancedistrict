import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Gauge, MapPin, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchCourtSummaries, fetchForumThreads } from "@/lib/supabase/queries";
import { RealtimeThreadHighlights } from "@/components/forum/realtime-thread-highlights";
import {
  NearestCourtSpotlight,
  NearestCourtTiles,
} from "@/components/venues/nearest-courts";
import {
  SportsTabs,
  type SportCategory,
} from "@/components/landing/sports-tabs";

const automationHighlights: {
  title: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    title: "Pembayaran Midtrans otomatis",
    description:
      "Link pembayaran terbit instan, statusnya sinkron ke dashboard operator dan pemain tanpa perlu rekonsiliasi manual.",
    icon: ShieldCheck,
  },
  {
    title: "Laporan realtime",
    description:
      "Metrik pendapatan, okupansi, dan jam sibuk disusun otomatis sehingga tim bisa melihat progres layaknya live dashboard.",
    icon: Gauge,
  },
  {
    title: "Koordinasi tim praktis",
    description:
      "Bagikan jadwal, catatan latihan, dan broadcast komunitas dalam sekali klik. Semua pemain langsung mendapat konteks.",
    icon: Waves,
  },
];

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
    href: "/courts/basket",
    image: "/sports/basket.svg",
    accent: "rgba(255, 122, 31, 0.2)",
  },
  {
    name: "Voli",
    href: "/courts/voli",
    image: "/sports/voli.svg",
    accent: "rgba(37, 99, 235, 0.2)",
  },
  {
    name: "Futsal",
    href: "/courts/futsal",
    image: "/sports/futsal.svg",
    accent: "rgba(22, 163, 74, 0.2)",
  },
  {
    name: "Padel",
    href: "/courts/padel",
    image: "/sports/padel.svg",
    accent: "rgba(6, 182, 212, 0.18)",
  },
  {
    name: "Badminton",
    href: "/courts/badminton",
    image: "/sports/badminton.svg",
    accent: "rgba(139, 92, 246, 0.2)",
  },
  {
    name: "Tennis",
    href: "/courts/tennis",
    image: "/sports/tennis.svg",
    accent: "rgba(34, 197, 94, 0.18)",
  },
  {
    name: "Sepak bola",
    href: "/courts/sepak-bola",
    image: "/sports/sepak-bola.svg",
    accent: "rgba(14, 165, 233, 0.2)",
  },
];

export default async function Home() {
  const [courts, threads] = await Promise.all([
    fetchCourtSummaries(),
    fetchForumThreads(),
  ]);

  return (
    <main className="space-y-24 pb-24">
      <section className="lg:min-h-screen relative overflow-hidden bg-linear-to-br from-orange-50 via-white to-orange-100 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900/70">
        <div className="lg:min-h-screen mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl dark:text-white">
              Cari Lapangan, Booking Instan, Main Sekarang.
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
              Temukan venue terdekat, atur jadwal bareng tim, dan selesaikan
              pembayaran dalam satu langkah. Semua hal yang kamu butuhkan untuk
              mulai bermain, tanpa ribet dan tanpa drama.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="link">
                <Link href="/venue-partner">Daftar sebagai venue partner</Link>
              </Button>
              <Button>
                <Link href="/explore">Mulai jelajahi</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-7 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <NearestCourtTiles courts={courts} limit={3} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SportsTabs sports={sportsCategories} />
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Venue pilihan
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Rekomendasi lapangan dengan rating tertinggi dan fasilitas
              lengkap.
            </p>
          </div>
          <Link
            href="/venues"
            className="text-sm font-semibold text-brand transition hover:text-brand-strong"
          >
            Lihat semua venue →
          </Link>
        </div>
        <NearestCourtSpotlight courts={courts} limit={6} />
      </section>

      <section className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Jadi venue partner CourtEase
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ajukan profil venue kamu dan tim admin akan membantu aktivasi
              akun, lengkap dengan integrasi Midtrans serta onboarding
              operasional.
            </p>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {partnerBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <li
                    key={benefit.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand-strong dark:bg-brand-soft/20 dark:text-brand-soft">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {benefit.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {benefit.detail}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Link
              href="/venue-partner"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              Ajukan kemitraan sekarang
            </Link>
          </div>
          <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-6 dark:border-slate-800/70 dark:bg-slate-900/70">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Diskusi terbaru komunitas
            </h3>
            <RealtimeThreadHighlights threads={threads} limit={4} />
            <div className="flex justify-center">
              <Link
                href="/forum"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-200"
              >
                Masuk ke forum komunitas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
