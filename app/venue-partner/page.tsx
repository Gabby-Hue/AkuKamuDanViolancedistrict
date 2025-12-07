"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Check,
  MapPin,
  CreditCard,
  Calendar,
  Users,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  submitPartnerApplication,
  type PartnerApplicationState,
} from "./actions";
import { useRouter } from "next/navigation";

// --- Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800"
    >
      {pending ? (
        <>
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Mengirim...
        </>
      ) : (
        <>
          Kirim Aplikasi Kemitraan
          <ArrowRight className="ml-2 h-5 w-5" />
        </>
      )}
    </button>
  );
}

// --- Komponen Form Aplikasi Partner ---
function PartnerApplicationForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<PartnerApplicationState, FormData>(
    submitPartnerApplication,
    { status: "idle" },
  );

  // Handle successful submission
  if (state.status === "success") {
    return (
      <div className="rounded-lg bg-green-50 p-8 text-center dark:bg-green-900/20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
          <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-green-900 dark:text-green-100">
          Aplikasi Berhasil Terkirim!
        </h3>
        <p className="mt-2 text-green-700 dark:text-green-300">
          {state.message}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-900"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Error message */}
      {state.status === "error" && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="organizationName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nama Venue
          </label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Nama usaha venue Anda"
          />
        </div>
        <div>
          <label
            htmlFor="contactName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nama Lengkap (Penanggung Jawab)
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Nama lengkap Anda"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contactEmail"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email Aktif
          </label>
          <input
            type="email"
            id="contactEmail"
            name="contactEmail"
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="email@venue.com"
          />
        </div>
        <div>
          <label
            htmlFor="contactPhone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nomor Telepon / WhatsApp
          </label>
          <input
            type="tel"
            id="contactPhone"
            name="contactPhone"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="0812-3456-7890"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="city"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Kota
        </label>
        <input
          type="text"
          id="city"
          name="city"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Jakarta, Bandung, Surabaya, dll"
        />
      </div>

      <div>
        <label
          htmlFor="existingSystem"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Sistem Booking Saat Ini (Opsional)
        </label>
        <input
          type="text"
          id="existingSystem"
          name="existingSystem"
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="WhatsApp, Manual, dll"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Informasi Tambahan (Opsional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="Ceritakan sedikit tentang venue Anda..."
        />
      </div>

      <div className="flex items-center">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          className="h-4 w-4 rounded border-gray-300 bg-white text-orange-600 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700"
        />
        <label
          htmlFor="terms"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          Saya menyetujui{" "}
          <Link
            href="/terms"
            className="font-medium text-orange-600 hover:text-orange-500 dark:text-teal-400 dark:hover:text-teal-300"
          >
            syarat dan ketentuan
          </Link>{" "}
          yang berlaku.
        </label>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}

// --- Komponen Halaman Utama ---
export default function VenuePartnerPage() {
  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Automasi Booking",
      description:
        "Sistem booking otomatis 24/7, mengurangi pekerjaan manual dan no-show.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Pembayaran Terintegrasi",
      description:
        "Terima pembayaran langsung via Midtrans. Aman, cepat, dan terpercaya.",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Tingkatkan Okupansi",
      description:
        "Eksposur ke komunitas olahraga kami untuk menarik lebih banyak pelanggan.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Dashboard Manajemen",
      description:
        "Kelola jadwal, laporan keuangan, dan informasi venue dari satu tempat.",
    },
  ];

  const milestones = [
    {
      title: "1. Kirim Aplikasi",
      description:
        "Isi formulir di bawah. Tim kami akan meninjau data venue Anda.",
    },
    {
      title: "2. Verifikasi & Aktivasi",
      description:
        "Kami akan menghubungi Anda untuk verifikasi dan bantuan setup awal.",
    },
    {
      title: "3. Go Live!",
      description:
        "Venue Anda aktif di CourtEase dan siap menerima booking pertama.",
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section - Didesain Ulang Total */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-teal-600 text-white">
        {/* Dekorasi Abstrak */}
        <div className="absolute inset-0 bg-brand-soft/20">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider backdrop-blur-sm">
                Kemitraan Venue CourtEase
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Jadilah bagian dari revolusi booking venue olahraga
              </h1>
              <p className="text-lg text-white/95">
                Bergabunglah dengan CourtEase dan maksimalkan potensi venue
                Anda. Nikmati automasi booking, pembayaran instan, dan akses ke
                ribuan atlet di platform kami.
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                  <Check className="h-4 w-4" />
                  <span>Setup Mudah</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                  <Check className="h-4 w-4" />
                  <span>Biaya Kompetitif</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
                  <Check className="h-4 w-4" />
                  <span>Support 24/7</span>
                </div>
              </div>
            </div>

            {/* Card Visual di Sisi Kanan */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
                <h2 className="text-2xl font-semibold mb-6">
                  Mengapa Memilih CourtEase?
                </h2>
                <ul className="space-y-4">
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        {benefit.icon}
                      </div>
                      <div>
                        <p className="font-semibold">{benefit.title}</p>
                        <p className="text-sm text-white/80">
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Solusi Lengkap untuk Venue Anda
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              CourtEase menyediakan semua alat yang Anda butuhkan untuk
              mengembangkan bisnis venue olahraga.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                  {benefit.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Proses Onboarding yang Mudah
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Tiga langkah sederhana untuk menghubungkan venue Anda dengan
              ribuan pengguna CourtEase.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-2xl font-bold text-white shadow-lg">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                  {milestone.title}
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  {milestone.description}
                </p>
                {index < milestones.length - 1 && (
                  <div className="absolute top-8 left-full hidden w-full justify-center md:flex">
                    <ArrowRight className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:p-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Daftarkan Venue Anda Sekarang
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Isi formulir berikut dan tim kami akan segera menghubungi Anda.
              </p>
            </div>
            <div className="mt-10">
              <PartnerApplicationForm />
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Sudah menjadi mitra?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-orange-600 hover:text-orange-500 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Masuk ke Dashboard Partner
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
