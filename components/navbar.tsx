"use client";

import clsx from "clsx";
import { Menu, X, LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ModeToggle } from "./mode-toggle";
import SearchBar from "./search-bar";
import { NavbarAuthMenu } from "./navbar-auth-menu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venue", href: "/venues" },
  { label: "Forum", href: "/forum" },
];

const maskStyle: CSSProperties = {
  WebkitMaskImage: "url('/navbar.svg')",
  WebkitMaskRepeat: "repeat-x",
  WebkitMaskSize: "100px 109px",
  WebkitMaskPosition: "center bottom",
  maskImage: "url('/navbar.svg')",
  maskRepeat: "repeat-x",
  maskSize: "100px 109px",
  maskPosition: "center bottom",
};
// button template dark mode
// dark:border-teal-200 dark:bg-teal-200

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const { style } = document.body;
    const previousOverflow = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header
      className={clsx(
        "isolate sticky top-0 z-500 w-full transition-shadow duration-300",
      )}
    >
      {/* wave navbar - TIDAK DIUBAH */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={maskStyle}>
          <div className="h-full w-full bg-[linear-gradient(90deg,#FB923C_0%,#F97316_50%,#FB923C_100%)] dark:bg-[linear-gradient(90deg,#0D9488_0%,#14B8A6_50%,#0D9488_100%)]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(180deg,rgba(13,148,136,0.45)_0%,rgba(20,184,166,0)_70%)]" />
      </div>

      <div
        className={clsx(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-[88px] pb-5",
        )}
      >
        {/* Mobile view */}
        <div className="flex w-full items-center justify-between text-white sm:hidden">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide"
          >
            <span className="text-lg font-bold">courtease</span>
          </Link>
          <div className="flex items-center gap-2">
            <SearchBar />
            <div className="text-orange-500 dark:text-teal-600">
              <ModeToggle />
            </div>
            <div className="scale-75 origin-right">
              <NavbarAuthMenu
                variant="inline"
                onAction={() => setMenuOpen(false)}
              />
            </div>
            <button
              type="button"
              aria-label="Buka menu navigasi"
              className="rounded-full border-white bg-white p-2 text-orange-500 transition-colors duration-200 hover:bg-gray-100 dark:text-teal-600 dark:hover:bg-teal-300"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden w-full items-center justify-between text-white sm:flex">
          <div className="flex items-center gap-8">
            <Link
              href="#top"
              className="flex items-center text-base font-semibold uppercase tracking-[0.32em]"
            >
              <span className="text-xl font-bold normal-case">courtease</span>
            </Link>
            <nav
              aria-label="Navigasi utama"
              className="flex items-center gap-1"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white/85 transition-colors duration-200 hover:bg-white/20 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <SearchBar />
            <ModeToggle />
            <NavbarAuthMenu variant="inline" onAction={() => {}} />
          </div>
        </div>
      </div>

      {/* Mobile menu overlay - DIUBAH MENJADI FLAT */}
      <div
        className={clsx(
          "fixed inset-0 z-50 sm:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-black/70 transition-opacity", // Mengurangi efek blur
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={clsx(
            "absolute inset-0 h-full overflow-y-auto bg-white text-gray-900 transition-transform duration-300 ease-out dark:bg-gray-900 dark:text-white",
            menuOpen ? "translate-y-0" : "-translate-y-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <Link
              href="#top"
              className="flex items-center text-base font-semibold uppercase"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-lg font-bold normal-case text-gray-900 dark:text-white">
                courtease
              </span>
            </Link>
            <button
              type="button"
              aria-label="Tutup menu navigasi"
              className="rounded-full border border-gray-300 bg-gray-100 p-2 text-gray-500 transition-colors duration-200 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Search bar at top of overlay - DIUBAH MENJADI FLAT */}
          <div className="px-6 py-4"></div>
          {/* Navigation links inside overlay - DIUBAH MENJADI FLAT */}
          <nav
            className="flex flex-col gap-2 px-6 py-4"
            aria-label="Navigasi utama"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900 transition-colors duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:border-teal-500 dark:hover:bg-teal-950 dark:hover:text-teal-400"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Footer actions inside overlay: login and dark mode toggle - DIUBAH MENJADI FLAT */}
          <div className="flex flex-col gap-3 px-6 py-4 pb-6">
            <div className="flex items-center justify-between">
              {/* Dark mode toggle */}
              <ModeToggle />
            </div>
            {/* Authentication menu */}
            <NavbarAuthMenu
              variant="stacked"
              onAction={() => setMenuOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
