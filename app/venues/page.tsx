import Link from "next/link";
import { fetchVenueSummaries } from "@/lib/supabase/queries";
import { VenuesDirectory } from "@/components/venues/venues-directory";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string }>;
}) {
  const params = await searchParams;
  const focusSlug = typeof params.focus === "string" ? params.focus : null;
  const venues = await fetchVenueSummaries();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <header className="rounded-4xl border border-brand/25 bg-gradient-to-br from-brand/10 via-white to-brand-soft/40 p-10 shadow-xl shadow-brand/10 dark:border-brand/40 dark:from-brand/20 dark:via-slate-900 dark:to-brand-soft/30">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-muted">
            <span className="rounded-full bg-white/70 px-3 py-1 text-brand shadow-sm dark:bg-slate-900/70">Directory</span>
            <span className="rounded-full bg-brand/15 px-3 py-1 text-brand-strong dark:bg-brand/25 dark:text-brand-contrast">
              Venue partner
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Direktori venue dengan sentuhan editorial
          </h1>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Kami rombak total tampilan direktori: kartu venue baru, panel detail
            yang kaya informasi, serta highlight kontak dan jarak agar kamu
            bisa memutuskan tempat bermain lebih cepat.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted">
            <span className="rounded-full bg-white/80 px-3 py-1 text-brand shadow-sm dark:bg-slate-900/70">
              Mode fokus lapangan
            </span>
            <span className="rounded-full bg-white/80 px-3 py-1 text-brand shadow-sm dark:bg-slate-900/70">
              Info kontak & jarak real-time
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <VenuesDirectory venues={venues} initialFocusSlug={focusSlug} />
        <aside className="space-y-5 rounded-3xl border border-brand-soft/40 bg-white/95 p-6 shadow-lg shadow-brand/5 dark:border-brand-soft/30 dark:bg-slate-900/70">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tips booking instan
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Supabase menyimpan jadwal real-time, jadi pilih slot kosong,
              selesaikan Midtrans, lalu bagikan ke tim tanpa keluar dari UI
              baru ini.
            </p>
          </div>
          <ul className="space-y-3 rounded-2xl border border-dashed border-brand-soft/60 bg-brand/5 p-4 text-sm text-slate-700 dark:border-brand-soft/30 dark:bg-brand/10 dark:text-slate-200">
            <li>• Filter Explore untuk mencari lapangan favorit komunitas.</li>
            <li>• Booking 3 jam sekaligus untuk memicu promo venue partner.</li>
            <li>• Kirim review setelah main agar rating selalu terkini.</li>
          </ul>
          <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-white to-brand-soft/30 p-5 text-sm shadow-sm shadow-brand/10 dark:border-brand/40 dark:from-brand/20 dark:via-slate-900 dark:to-brand-soft/30">
            <p className="font-semibold text-slate-900 dark:text-white">
              Punya venue sendiri?
            </p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              Ajukan akun venue partner dan nikmati automasi laporan, eksposur
              Explore, serta integrasi pembayaran yang sudah siap pakai.
            </p>
            <Link
              href="/dashboard/venue"
              className="mt-4 inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:bg-brand-strong"
            >
              Buka dashboard venue
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
