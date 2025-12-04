import Link from "next/link";
import { Facebook, Instagram, MapPin, Youtube } from "lucide-react";

const productLinks = [
  { label: "Landing", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venue", href: "/venues" },
  { label: "Forum", href: "/forum" },
];

const supportLinks = [
  { label: "Bantuan", href: "/support#bantuan" },
  { label: "Kebijakan privasi", href: "/support#privasi" },
  { label: "About us", href: "/about" },
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
