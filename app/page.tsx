import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Clock4, Sparkles } from "lucide-react";

import { CourteaseNavbar } from "@/components/courtease-navbar";
import { Button } from "@/components/ui/button";

const featureHighlights = [
  {
    icon: Sparkles,
    title: "Kurasi Lapangan Terbaik",
    description:
      "Telusuri lapangan indoor maupun outdoor dengan foto berkualitas dan detail fasilitas yang lengkap.",
  },
  {
    icon: Clock4,
    title: "Jadwal Real-time",
    description:
      "Cek ketersediaan jadwal secara langsung dan pesan slot favoritmu tanpa perlu menunggu konfirmasi manual.",
  },
  {
    icon: CalendarCheck,
    title: "Kelola Booking Mudah",
    description:
      "Atur ulang jadwal, bagikan reservasi ke tim, dan dapatkan pengingat otomatis sebelum pertandingan dimulai.",
  },
  {
    icon: BadgeCheck,
    title: "Pembayaran Aman",
    description:
      "Dilengkapi metode pembayaran digital yang tervalidasi serta bukti transaksi yang bisa diunduh kapan pun.",
  },
];

const stats = [
  { label: "Venue Terverifikasi", value: "120+" },
  { label: "Komunitas Aktif", value: "35K" },
  { label: "Rating Rata-rata", value: "4.8/5" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <CourteaseNavbar />
      <main className="flex-1">
        <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-12 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-soft/60 blur-3xl dark:bg-brand/20" />
            <div className="absolute -bottom-10 left-8 h-48 w-48 rounded-full bg-brand/20 blur-3xl dark:bg-brand/40" />
          </div>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-20 lg:px-8">
            <div className="flex-1 space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-brand-strong shadow-sm backdrop-blur dark:border-brand/30 dark:bg-slate-900/70">
                Booking olahraga #TanpaRibet
              </span>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl sm:leading-tight dark:text-white">
                Sewa lapangan olahraga favoritmu dalam hitungan menit.
              </h1>
              <p className="max-w-2xl text-pretty text-lg text-slate-600 dark:text-slate-300">
                Courtease membantu komunitas olahraga menemukan venue terbaik dengan ketersediaan jadwal real-time, review jujur, dan proses pembayaran yang aman.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group rounded-full px-8 text-base font-semibold">
                  <Link href="/auth/register">
                    Mulai Gratis
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-brand/40 bg-white/70 px-8 text-base font-semibold text-brand hover:border-brand hover:bg-brand/10 hover:text-brand-strong dark:border-brand/30 dark:bg-slate-950/50 dark:text-brand dark:hover:bg-brand/20"
                >
                  <Link href="/venues">Jelajahi Venue</Link>
                </Button>
              </div>
              <dl className="grid w-full gap-6 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-slate-200/70 bg-white/70 px-6 py-5 shadow-sm backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/60"
                  >
                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.label}</dt>
                    <dd className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative flex-1">
              <div className="relative mx-auto max-w-xl rounded-[2.5rem] border border-slate-200/80 bg-white/80 p-6 shadow-2xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/80">
                <div className="absolute inset-x-8 top-6 h-12 rounded-full bg-gradient-to-r from-brand/20 via-brand-soft/60 to-brand/40 blur-xl dark:from-brand/30 dark:via-brand/20 dark:to-brand/30" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-300">Rekomendasi hari ini</span>
                    <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-strong dark:bg-brand/20">
                      Untukmu
                    </span>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm transition hover:border-brand/40 hover:shadow-[0px_22px_45px_rgba(16,185,129,0.12)] dark:border-slate-800/60 dark:bg-slate-900/80">
                      <Image
                        src="/window.svg"
                        width={64}
                        height={64}
                        alt="Lapangan indoor"
                        className="h-16 w-16 rounded-2xl bg-brand/10 p-3"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Arena Futsal Senayan</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Jakarta Pusat • Mulai Rp180K/jam</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm transition hover:border-brand/40 hover:shadow-[0px_22px_45px_rgba(16,185,129,0.12)] dark:border-slate-800/60 dark:bg-slate-900/80">
                      <Image
                        src="/globe.svg"
                        width={64}
                        height={64}
                        alt="Lapangan outdoor"
                        className="h-16 w-16 rounded-2xl bg-brand/10 p-3"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Gelanggang Basket Surabaya</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Surabaya • Mulai Rp150K/jam</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm transition hover:border-brand/40 hover:shadow-[0px_22px_45px_rgba(16,185,129,0.12)] dark:border-slate-800/60 dark:bg-slate-900/80">
                      <Image
                        src="/file.svg"
                        width={64}
                        height={64}
                        alt="Bukti pembayaran"
                        className="h-16 w-16 rounded-2xl bg-brand/10 p-3"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Invoice otomatis siap kirim</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Bagikan ke tim atau simpan ke email</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-y border-slate-200/80 bg-white/80 py-20 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Semua yang dibutuhkan untuk mengelola venue dalam satu aplikasi.
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Dari pemilik venue hingga komunitas olahraga, Courtease memastikan pengalaman booking yang modern dan transparan.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featureHighlights.map((feature) => (
                <article
                  key={feature.title}
                  className="group flex h-full flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0px_28px_70px_rgba(16,185,129,0.18)] dark:border-slate-800/60 dark:bg-slate-900/80"
                >
                  <feature.icon className="h-10 w-10 text-brand" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center lg:gap-20 lg:px-8">
            <div className="flex-1 space-y-6">
              <h2 className="text-balance text-3xl font-semibold text-slate-900 dark:text-white sm:text-4xl">
                Jadwalkan pertandingan, undang lawan tanding, dan konfirmasi pembayaran tanpa ribet.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Sistem kami terintegrasi penuh dengan notifikasi WhatsApp dan email sehingga semua anggota tim tetap sinkron. Kelola beberapa venue sekaligus dengan dashboard yang rapi dan mudah diaudit.
              </p>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-strong dark:bg-brand/20">
                    1
                  </span>
                  Buat atau pilih venue favoritmu, lalu tentukan jadwal yang tersedia.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-strong dark:bg-brand/20">
                    2
                  </span>
                  Bagikan tautan reservasi ke tim atau komunitas untuk mengkonfirmasi kehadiran.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-strong dark:bg-brand/20">
                    3
                  </span>
                  Selesaikan pembayaran tanpa antri dan dapatkan bukti transaksi otomatis.
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="rounded-full border-brand/40 px-6 text-sm font-semibold text-brand hover:border-brand hover:bg-brand/10 hover:text-brand-strong dark:border-brand/30 dark:bg-slate-950/50 dark:text-brand dark:hover:bg-brand/20">
                  <Link href="/dashboard/admin">Lihat Dashboard Admin</Link>
                </Button>
                <Button asChild className="rounded-full px-6 text-sm font-semibold">
                  <Link href="/auth/login">Masuk untuk Venue Partner</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white/90 p-8 shadow-2xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/80">
                <div className="absolute -top-24 right-12 h-48 w-48 rounded-full bg-brand/20 blur-3xl dark:bg-brand/30" />
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">Timeline Booking</p>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Hari ini</span>
                  </div>
                  <ol className="space-y-4 text-sm">
                    <li className="rounded-2xl border border-brand/40 bg-brand/5 px-4 py-3 text-brand-strong dark:border-brand/30 dark:bg-brand/10">
                      07:30 • Tim Futsal Kantor mengkonfirmasi pembayaran
                    </li>
                    <li className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
                      09:00 • Booking basket komunitas &ldquo;Hoops ID&rdquo; menunggu pelunasan
                    </li>
                    <li className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
                      11:30 • Sistem mengirim pengingat ke Venue Partner
                    </li>
                    <li className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 text-slate-600 dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-300">
                      15:00 • Invoice turnamen internal siap diunduh
                    </li>
                  </ol>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Semua aktivitas tersinkronisasi otomatis di aplikasi Courtease dan bisa diakses kapan pun.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200/80 bg-white/80 py-10 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center text-sm text-slate-500 sm:flex-row sm:px-6 sm:text-left lg:px-8 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} Courtease. Semua hak cipta dilindungi.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-brand-strong">
              Kebijakan Privasi
            </Link>
            <Link href="/terms" className="hover:text-brand-strong">
              Syarat & Ketentuan
            </Link>
            <Link href="/forum" className="hover:text-brand-strong">
              Forum Komunitas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
