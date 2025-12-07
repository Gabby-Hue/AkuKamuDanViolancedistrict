import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand Section - spans 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <h3 className="text-2xl font-bold">CourtEase</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Platform booking lapangan olahraga terbesar di Indonesia.
                Temukan dan booking venue favoritmu dengan mudah.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Follow Us</p>
              <div className="flex space-x-3">
                <a href="#" className="h-10 w-10 rounded-lg bg-slate-700 text-slate-300 hover:bg-brand hover:text-white transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-lg bg-slate-700 text-slate-300 hover:bg-brand hover:text-white transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="h-10 w-10 rounded-lg bg-slate-700 text-slate-300 hover:bg-brand hover:text-white transition-colors flex items-center justify-center">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links - spans 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/explore" className="text-slate-300 hover:text-brand transition-colors">Explore Venues</Link></li>
              <li><Link href="/forum" className="text-slate-300 hover:text-brand transition-colors">Forum</Link></li>
              <li><Link href="/venues" className="text-slate-300 hover:text-brand transition-colors">All Venues</Link></li>
              <li><Link href="/venue-partner" className="text-slate-300 hover:text-brand transition-colors">Become Partner</Link></li>
            </ul>
          </div>

          {/* Sports - spans 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand">Sports</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/explore?sport=futsal" className="text-slate-300 hover:text-brand transition-colors">Futsal</Link>
              <Link href="/explore?sport=basket" className="text-slate-300 hover:text-brand transition-colors">Basketball</Link>
              <Link href="/explore?sport=voli" className="text-slate-300 hover:text-brand transition-colors">Volleyball</Link>
              <Link href="/explore?sport=badminton" className="text-slate-300 hover:text-brand transition-colors">Badminton</Link>
              <Link href="/explore?sport=padel" className="text-slate-300 hover:text-brand transition-colors">Padel</Link>
              <Link href="/explore?sport=tennis" className="text-slate-300 hover:text-brand transition-colors">Tennis</Link>
            </div>
          </div>

          {/* Support - spans 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-brand">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/help" className="text-slate-300 hover:text-brand transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="text-slate-300 hover:text-brand transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="text-slate-300 hover:text-brand transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-300 hover:text-brand transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-sm text-slate-400">
              © 2024 CourtEase. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                Made with <span className="text-red-500">❤️</span> in Indonesia
              </span>
              <span className="hidden lg:inline">•</span>
              <Link href="/dashboard" className="hover:text-brand transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}