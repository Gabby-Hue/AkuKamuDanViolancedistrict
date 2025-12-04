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
import { HeroCarousel } from "@/components/landing/hero-carousel";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const threads = await fetchForumThreads();

  return (
    <main className="space-y-20 bg-gradient-to-b from-white via-slate-50 to-white pb-24">
      <HeroCarousel />

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
