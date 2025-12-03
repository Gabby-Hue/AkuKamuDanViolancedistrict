import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Gauge,
  MapPin,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCourtSummaries, fetchForumThreads } from "@/lib/supabase/queries";
import { RealtimeThreadHighlights } from "@/components/forum/realtime-thread-highlights";
import {
  NearestCourtSpotlight,
} from "@/components/venues/nearest-courts";
import { HeroCarousel } from "@/components/landing/hero-carousel";
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
    <main className="space-y-20 bg-gradient-to-b from-white via-slate-50 to-white pb-24">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-8 rounded-4xl border border-slate-200/70 bg-white/90 p-8 shadow-xl shadow-brand/5 backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/70">
            <Badge className="bg-brand/10 text-brand-strong dark:bg-brand/20 dark:text-brand-contrast">
              Rombak total, siap dipakai komunitas
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white sm:text-5xl">
                Satu landing baru untuk booking, komunitas, dan operasi venue
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-300">
                CourtEase menghadirkan pengalaman cari lapangan yang imersif dengan UI shadcn baru. Booking, forum, dan integrasi
                Midtrans berjalan otomatis untuk pemain maupun operator.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-lg shadow-brand/20">
                <Link href="/explore">Jelajahi sekarang</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/venue-partner" className="gap-2">
                  Aktifkan venue
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Booking realtime", "Forum aktif", "Pembayaran aman"].map((label) => (
                <Card key={label} className="border-brand-soft/60 bg-gradient-to-br from-white via-white to-brand-soft/40 text-left dark:from-slate-900 dark:via-slate-900 dark:to-brand-soft/20">
                  <CardContent className="flex items-center gap-3 p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-brand shadow shadow-brand/40" />
                    {label}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-4 rounded-4xl border border-brand/30 bg-gradient-to-b from-brand/10 via-white to-brand-soft/40 p-4 shadow-lg shadow-brand/10 dark:border-brand/40 dark:from-brand/25 dark:via-slate-900 dark:to-brand-soft/30">
            <HeroCarousel courts={courts} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {automationHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/70 dark:bg-slate-900/70">
                <CardHeader className="flex flex-row items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-strong shadow-sm dark:bg-brand/25 dark:text-brand-contrast">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </CardTitle>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Sports hub</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Pilih olahraga favoritmu</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Koleksi visual baru memudahkanmu berpindah olahraga tanpa keluar dari pengalaman shadcn.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/explore" className="gap-2">
              Lihat jadwal cepat
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-lg shadow-brand/5 dark:border-slate-800/70 dark:bg-slate-900/70">
          <SportsTabs sports={sportsCategories} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">Sorotan venue</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Lapangan terdekat pilihan</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Rekomendasi terbaru dengan rating tinggi, siap dipesan lewat integrasi Midtrans yang otomatis.
            </p>
          </div>
          <Button variant="ghost" asChild className="text-brand hover:text-brand-strong">
            <Link href="/venues" className="gap-2">
              Lihat direktori venue
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-4xl border border-slate-200/80 bg-gradient-to-br from-brand/5 via-white to-brand-soft/40 p-6 shadow-lg shadow-brand/10 dark:border-slate-800/70 dark:from-brand/15 dark:via-slate-900 dark:to-brand-soft/25">
          <NearestCourtSpotlight courts={courts} limit={6} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
          <div className="space-y-4 rounded-4xl border border-brand/30 bg-gradient-to-br from-brand/10 via-white to-brand-soft/30 p-8 shadow-xl shadow-brand/15 dark:border-brand/35 dark:from-brand/20 dark:via-slate-900 dark:to-brand-soft/25">
            <div className="flex items-center gap-3">
              <Badge className="bg-white/70 text-brand shadow-sm dark:bg-slate-900/70">Venue partner</Badge>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">Midtrans ready</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Operasional mulus untuk operator</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Dashboard baru menghadirkan automasi laporan, broadcast tim, dan eksposur komunitas. Onboarding dibantu tim Courtease.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {partnerBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.label} className="border-brand-soft/60 bg-white/90 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-brand-soft/30 dark:bg-slate-900/70">
                    <CardHeader className="flex flex-row items-start gap-3 pb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand-strong dark:bg-brand/25 dark:text-brand-contrast">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        {benefit.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-slate-600 dark:text-slate-300">
                      {benefit.detail}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="gap-2">
                <Link href="/venue-partner">
                  Jadwalkan onboarding
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/venue">Lihat dashboard venue</Link>
              </Button>
            </div>
          </div>
          <Card className="border-brand/30 bg-white/95 shadow-xl shadow-brand/10 dark:border-brand/40 dark:bg-slate-900/80">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-brand dark:text-brand-contrast">Diskusi terbaru komunitas</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Forum dipantau real-time untuk menjaga vibe komunitas tetap hidup.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <RealtimeThreadHighlights threads={threads} limit={4} />
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link href="/forum" className="gap-2">
                    Masuk ke forum
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
