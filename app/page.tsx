import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Gauge, MapPin, ShieldCheck, Sparkles, Waves } from "lucide-react";

import { fetchCourtSummaries, fetchForumThreads } from "@/lib/supabase/queries";
import { RealtimeThreadHighlights } from "@/components/forum/realtime-thread-highlights";
import {
  NearestCourtSpotlight,
  NearestCourtTiles,
} from "@/components/venues/nearest-courts";
import { SportsTabs, type SportCategory } from "@/components/landing/sports-tabs";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 py-24 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-900/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-soft/60 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand shadow-sm dark:border-brand/20 dark:bg-slate-900/80 dark:text-brand-muted">
              Booking & komunitas olahraga terpadu
            </span>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl dark:text-white">
              Temukan venue terbaik dengan nuansa super app dan pembayaran
              langsung nyambung.
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
              CourtEase menghadirkan gradien lembut, copy yang ringkas, dan alur
              pemesanan seperti Supa Snowy. Cari lapangan, cek komunitas, lalu
              bayar tanpa hambatan.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:bg-slate-900/70">
                <Waves className="h-4 w-4 text-brand" />
                Animasi lembut di setiap halaman
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm backdrop-blur dark:bg-slate-900/70">
                <Gauge className="h-4 w-4 text-brand" />
                Status transaksi realtime
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong"
              >
                Mulai jelajahi
              </Link>
              <Link
                href="/venue-partner"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              >
                Daftar sebagai venue partner
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  Lapangan terdekat
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Live tiles
                </span>
              </div>
              <NearestCourtTiles courts={courts} limit={3} />
              <div className="rounded-2xl border border-brand-soft/60 bg-brand/10 p-5 text-sm text-brand-strong shadow-sm dark:border-brand/30 dark:bg-brand/15 dark:text-brand-soft">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  Integrasi pembayaran dan komunitas
                </p>
                <p className="text-brand-strong/70 dark:text-brand-soft/80">
                  Booking baru otomatis membuat sesi Midtrans, muncul di forum,
                  dan terhubung ke dashboard pemain maupun venue.
                </p>
              </div>
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
              Venue pilihan komunitas
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

      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">
              Automasi operasional
            </span>
            <h2 className="text-3xl font-semibold">
              Workflow modern untuk tim lapangan
            </h2>
            <p className="max-w-2xl text-sm text-slate-300">
              CourtEase menggabungkan jadwal, pembayaran, dan komunitas dalam
              satu sistem. Tidak ada lagi spreadsheet terpisah.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {automationHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex h-full flex-col justify-between gap-4 rounded-3xl border border-slate-700/60 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-brand-soft">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-lg font-semibold text-white">
                      {item.title}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
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
