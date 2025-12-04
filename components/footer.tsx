import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const productLinks = [
  { label: "Landing", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venue", href: "/venues" },
  { label: "Forum", href: "/forum" },
];

const supportLinks = [
  { label: "Bantuan", href: "/support#bantuan" },
  { label: "Kebijakan privasi", href: "/support#privasi" },
  { label: "Syarat & ketentuan", href: "/support#terms" },
];

const communityLinks = [
  { label: "Venue partner", href: "/venue-partner" },
  { label: "Karier", href: "/docs/careers" },
  { label: "Hubungi kami", href: "/forum?tab=contact" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 py-12">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between md:gap-10">
            <div className="space-y-3 md:max-w-xl">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-white/60">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900">
                  Courtease
                </span>
                <span>Move like the city courts</span>
              </div>
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                Semua pemain, venue, dan komunitas menyatu dalam satu langkah.
              </h2>
              <p className="text-sm text-white/70">
                Footer ini mengikuti gaya bold ala Nike: kontras tinggi, tipografi tegas, dan ajakan bergerak. Tetap di dasar
                setiap halaman agar pengguna mudah menemukan navigasi inti.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm md:max-w-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Dapatkan highlight terbaru</p>
                  <p className="text-xs text-white/60">
                    Jadwal venue baru, promo komunitas, dan recap turnamen langsung ke inbox kamu.
                  </p>
                </div>
                <Mail className="h-6 w-6 text-brand" />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="Masukkan emailmu"
                  className="h-10 border-white/20 bg-white/10 text-sm text-white placeholder:text-white/60 focus-visible:ring-brand"
                />
                <Button className="h-10 bg-white text-slate-900 hover:bg-brand-contrast hover:text-slate-950">
                  Langganan
                </Button>
              </div>
              <p className="text-[11px] text-white/60">
                Kami hanya mengirim insight penting, tanpa spam. Bisa berhenti kapan saja.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">Produk</p>
                <ul className="mt-3 space-y-2 text-sm font-medium text-white/80">
                  {productLinks.map((link) => (
                    <li key={link.label}>
                      <Link className="transition hover:text-white" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" />
                  <span>Operasional di 12 kota besar Indonesia</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Dukungan</p>
              <ul className="space-y-2 text-sm font-medium text-white/80">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link className="transition hover:text-white" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Komunitas</p>
              <ul className="space-y-2 text-sm font-medium text-white/80">
                {communityLinks.map((link) => (
                  <li key={link.label}>
                    <Link className="transition hover:text-white" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-white/50">Ikuti kami</p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand/20"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-white/60">
                Gerakanmu mendefinisikan kota. Jadilah bagian dari komunitas Courtease.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Courtease. Semua hak cipta dilindungi.</p>
            <div className="flex flex-wrap gap-4">
              <Link className="hover:text-white" href="/docs/security">
                Keamanan data
              </Link>
              <Link className="hover:text-white" href="/docs/brand">
                Panduan brand
              </Link>
              <Link className="hover:text-white" href="/docs/accessibility">
                Aksesibilitas
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
