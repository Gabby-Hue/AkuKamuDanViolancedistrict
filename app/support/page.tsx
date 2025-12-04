import { CheckCircle2, FileText, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    id: "bantuan",
    label: "Bantuan",
    description:
      "Panduan cepat untuk memulai, mengelola akun, dan menyelesaikan masalah umum seputar pemesanan serta pengelolaan venue.",
    icon: Users,
  },
  {
    id: "privasi",
    label: "Kebijakan privasi",
    description: "Transparansi tentang data yang kami kumpulkan, cara kami memprosesnya, dan pilihan kontrol yang kamu miliki.",
    icon: ShieldCheck,
  },
  {
    id: "terms",
    label: "Syarat & ketentuan",
    description: "Aturan penggunaan platform, tanggung jawab pengguna, dan ketentuan pembayaran untuk menjaga ekosistem tetap aman.",
    icon: FileText,
  },
];

export default function SupportPage() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.32em] text-brand">
            <Badge className="bg-white/10 text-brand-contrast">Dukungan</Badge>
            <span className="text-white/60">Courtease Care</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Semua jawaban dalam satu halaman</h1>
            <p className="max-w-2xl text-base text-white/70">
              Cari informasi Bantuan, Kebijakan privasi, serta Syarat & ketentuan di satu tempat. Gunakan pintasan di bawah
              untuk langsung menuju kategori yang kamu butuhkan.
            </p>
            <div className="flex flex-wrap gap-3">
              {sections.map((section) => (
                <Button key={section.id} asChild variant="outline" className="border-white/20 text-white hover:border-brand">
                  <Link href={`#${section.id}`}>{section.label}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-10 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.id}
                className="group border-white/10 bg-white/5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-brand hover:bg-brand/10"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand-contrast">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{section.label}</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-white/70">{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full bg-white text-slate-900 hover:bg-brand-contrast hover:text-slate-950">
                    <Link href={`#${section.id}`}>Buka {section.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-12 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <SectionContent
            id="bantuan"
            title="Bantuan"
            intro="Langkah praktis untuk menjawab pertanyaan populer dan menyelesaikan kendala dengan cepat."
            items={[
              "Tutorial pemesanan lapangan, pembatalan, dan pengembalian dana langkah demi langkah.",
              "Panduan operator untuk mengatur jadwal, mengonfirmasi booking, dan memantau pembayaran Midtrans.",
              "Kontak dukungan 24/7 lewat email support@courtease.id serta jalur eskalasi untuk kasus darurat.",
            ]}
          />

          <SectionContent
            id="privasi"
            title="Kebijakan privasi"
            intro="Kami mengutamakan transparansi dan keamanan data semua pengguna, baik pemain maupun operator venue."
            items={[
              "Jenis data yang dikumpulkan, alasan pemrosesan, dan durasi penyimpanan sesuai praktik terbaik industri.",
              "Pilihan kontrol privasi, termasuk permintaan penghapusan data, export data, dan preferensi komunikasi.",
              "Standar enkripsi, monitoring keamanan, serta komitmen kami terhadap kepatuhan regulasi lokal.",
            ]}
          />

          <SectionContent
            id="terms"
            title="Syarat & ketentuan"
            intro="Fondasi aturan main agar pengalaman di Courtease tetap adil dan aman untuk seluruh komunitas."
            items={[
              "Tanggung jawab pengguna terkait keakuratan informasi, pembayaran, dan perilaku selama menggunakan platform.",
              "Ketentuan refund, kebijakan pembatalan, serta hak Courtease untuk menangani penyalahgunaan layanan.",
              "Syarat khusus untuk partner venue, termasuk kepatuhan terhadap standar operasional dan keamanan.",
            ]}
          />
        </div>
      </section>
    </main>
  );
}

type SectionContentProps = {
  id: string;
  title: string;
  intro: string;
  items: string[];
};

function SectionContent({ id, title, intro, items }: SectionContentProps) {
  return (
    <div id={id} className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
        <CheckCircle2 className="h-4 w-4 text-brand" />
        <span>{title}</span>
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/70">{intro}</p>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3 pt-2 text-sm text-white/70">
        <Link href="#bantuan" className="text-brand hover:text-brand-contrast">
          Bantuan
        </Link>
        <span className="text-white/40">•</span>
        <Link href="#privasi" className="text-brand hover:text-brand-contrast">
          Kebijakan privasi
        </Link>
        <span className="text-white/40">•</span>
        <Link href="#terms" className="text-brand hover:text-brand-contrast">
          Syarat & ketentuan
        </Link>
      </div>
    </div>
  );
}
