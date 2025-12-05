import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchForumThreads } from "@/lib/supabase/queries";
import { RealtimeThreadHighlights } from "@/components/forum/realtime-thread-highlights";
import {
  SportsTabs,
  type SportCategory,
} from "@/components/landing/sports-tabs";
import { HeroCarousel } from "@/components/landing/hero-carousel";

export const dynamic = "force-dynamic";

const partnerBenefits: {
  label: string;
  detail: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Integrasi pembayaran",
    detail: "Aktifkan Midtrans instan, laporan dan notifikasi langsung siap.",
    icon: Sparkles,
  },
  {
    label: "Dashboard multi-venue",
    detail: "Atur banyak cabang, jadwal, dan harga di satu workspace.",
    icon: MapPin,
  },
  {
    label: "Eksposur komunitas",
    detail: "Muncul di Explore dan Forum agar komunitas cepat menemukan venue kamu.",
    icon: ShieldCheck,
  },
];

const sportsCategories: SportCategory[] = [
  {
    name: "Basket",
    sport: "basket",
    image: "/sports/basket.svg",
    accent: "rgba(255, 122, 31, 0.2)",
  },
  {
    name: "Voli",
    sport: "voli",
    image: "/sports/voli.svg",
    accent: "rgba(37, 99, 235, 0.2)",
  },
  {
    name: "Futsal",
    sport: "futsal",
    image: "/sports/futsal.svg",
    accent: "rgba(22, 163, 74, 0.2)",
  },
  {
    name: "Padel",
    sport: "padel",
    image: "/sports/padel.svg",
    accent: "rgba(6, 182, 212, 0.18)",
  },
  {
    name: "Badminton",
    sport: "badminton",
    image: "/sports/badminton.svg",
    accent: "rgba(139, 92, 246, 0.2)",
  },
  {
    name: "Tennis",
    sport: "tennis",
    image: "/sports/tennis.svg",
    accent: "rgba(34, 197, 94, 0.18)",
  },
  {
    name: "Sepak bola",
    sport: "sepak bola",
    image: "/sports/sepak-bola.svg",
    accent: "rgba(14, 165, 233, 0.2)",
  },
];

export default async function Home() {
  const threads = await fetchForumThreads();

  return (
    <main className="space-y-20 bg-gradient-to-b from-white via-slate-50 to-white pb-24">
      <HeroCarousel />

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SportsTabs sports={sportsCategories} />
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-orange-100/80 bg-orange-50 p-8 shadow-[0_20px_80px_-30px_rgba(249,115,22,0.45)] backdrop-blur-sm dark:border-orange-500/40 dark:bg-orange-900/40 dark:shadow-[0_20px_80px_-24px_rgba(249,115,22,0.45)]">
            <div className="absolute -left-10 -top-16 h-48 w-48 rounded-full bg-orange-200/50 blur-3xl dark:bg-orange-500/20" />
            <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-orange-200/60 blur-3xl dark:bg-orange-400/20" />
            <div className="relative space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <Badge className="rounded-full bg-white/80 px-3 py-1 text-orange-600 shadow-sm ring-1 ring-orange-100/80 dark:bg-slate-900/70 dark:text-orange-200 dark:ring-orange-500/40">
                  Venue partner
                </Badge>
                <span className="rounded-full bg-orange-500 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white shadow-md">
                  Midtrans ready
                </span>
              </div>

              <div className="grid gap-3 text-slate-900 dark:text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-200">
                  Operasional mulus untuk operator
                </p>
                <h2 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white">
                  Dashboard baru menghadirkan automasi laporan, broadcast tim, dan eksposur komunitas. Onboarding dibantu tim Courtease.
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {partnerBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <Card
                      key={benefit.label}
                      className="group relative overflow-hidden rounded-2xl border border-orange-100/80 bg-white/80 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-orange-500/40 dark:bg-slate-900/70"
                    >
                      <div className="absolute inset-0 bg-orange-50 opacity-0 transition duration-200 group-hover:opacity-100 dark:bg-slate-900/60" />
                      <CardHeader className="relative flex flex-row items-start gap-4 p-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-200/70 ring-2 ring-white/70 dark:bg-orange-500 dark:shadow-orange-900/40 dark:ring-slate-900">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                            {benefit.label}
                          </CardTitle>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-200/90">
                            {benefit.detail}
                          </p>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  className="gap-2 rounded-full bg-orange-500 px-6 font-semibold shadow-lg shadow-orange-200/70 transition hover:shadow-xl dark:bg-orange-500"
                >
                  <Link href="/venue-partner">
                    Jadwalkan onboarding
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-orange-200/80 bg-white/70 text-orange-700 transition hover:border-orange-300 hover:text-orange-800 dark:border-orange-500/40 dark:bg-slate-900/70 dark:text-orange-100 dark:hover:border-orange-400"
                >
                  <Link href="/dashboard/venue">Lihat dashboard venue</Link>
                </Button>
              </div>
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
