import Link from "next/link";
import { fetchCourtSummaries, fetchForumThreads } from "@/lib/supabase/queries";
import { RealtimeThreadHighlights } from "@/components/forum/realtime-thread-highlights";
import {
  NearestCourtSpotlight,
  NearestCourtTiles,
} from "@/components/venues/nearest-courts";

const automationHighlights = [
  {
    title: "Pembayaran Midtrans otomatis",
    description:
      "Booking langsung menghasilkan link pembayaran. Statusnya akan sinkron otomatis di dashboard tanpa input manual.",
  },
  {
    title: "Laporan realtime",
    description:
      "Setiap transaksi tercatat sebagai metrik revenue dan okupansi sehingga tim operasional bisa mengambil keputusan cepat.",
  },
  {
    title: "Koordinasi tim praktis",
    description:
      "Bagikan jadwal dan catatan latihan ke pemain hanya dengan sekali klik. Semua orang tahu fokus sesi berikutnya.",
  },
];

const partnerBenefits = [
  {
    label: "Integrasi pembayaran",
    detail:
      "Aktifkan Midtrans tanpa coding. Kami siapkan monitoring dan notifikasi otomatis untuk operator lapangan.",
  },
  {
    label: "Dashboard multi-venue",
    detail:
      "Kelola banyak cabang dalam satu akun. Manajemen harga, jadwal, dan laporan keuangan jadi terpusat.",
  },
  {
    label: "Eksposur komunitas",
    detail:
      "Tampil di halaman Explore dan Forum sehingga komunitas olahraga mudah menemukan venue kamu.",
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
              Temukan venue terbaik dan kelola pembayaran tim dalam satu
              platform.
            </h1>
            <p className="max-w-xl text-base text-slate-600 dark:text-slate-300">
              CourtEase menghubungkan pemain, operator venue, dan komunitas.
              Dari pemesanan sampai laporan keuangan, semuanya otomatis.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-strong"
              >
                Mulai jelajahi
              </Link>
              <Link
                href="/venue-partner"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-200"
              >
                Daftar sebagai venue partner
              </Link>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-2xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
              <NearestCourtTiles courts={courts} limit={3} />
              <div className="rounded-2xl border border-brand-soft/60 bg-brand/10 p-5 text-sm text-brand-strong dark:border-brand/30 dark:bg-brand/10 dark:text-brand-soft">
                <p className="font-semibold">
                  Integrasi pembayaran dan komunitas
                </p>
                <p className="text-brand-strong/70 dark:text-brand-soft/80">
                  Booking baru otomatis membuat sesi Midtrans dan muncul di
                  dashboard pemain maupun venue.
                </p>
              </div>
            </div>
          </div>
        </div>
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
            {automationHighlights.map((item) => (
              <div
                key={item.title}
                className="flex h-full flex-col justify-between rounded-3xl border border-slate-700/60 bg-white/5 p-6 backdrop-blur"
              >
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-300">{item.description}</p>
                </div>
              </div>
            ))}
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
              {partnerBenefits.map((benefit) => (
                <li
                  key={benefit.label}
                  className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700/60 dark:bg-slate-900/60"
                >
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {benefit.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {benefit.detail}
                  </p>
                </li>
              ))}
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
