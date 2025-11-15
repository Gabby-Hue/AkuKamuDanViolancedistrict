"use client";

import clsx from "clsx";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { ModeToggle } from "./mode-toggle";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venue", href: "/venue" },
  { label: "Forum", href: "/forum" },
];

const maskStyle: CSSProperties = {
  WebkitMaskImage: "url('/navbar.svg')",
  WebkitMaskRepeat: "repeat-x",
  WebkitMaskSize: "120px 88px",
  WebkitMaskPosition: "center bottom",
  maskImage: "url('/navbar.svg')",
  maskRepeat: "repeat-x",
  maskSize: "120px 88px",
  maskPosition: "center bottom",
};

/**
 * The CourteaseNavbar component renders a responsive navigation bar
 * inspired by arc.net and apple.com. It uses a repeating wave mask
 * behind a gradient to achieve a unique look. On small screens a full
 * page overlay menu is provided. Dark mode toggling is delegated to
 * the reusable `ModeToggle` component.
 */
export default function Navbar() {
  // `menuOpen` controls the visibility of the mobile overlay. When
  // enabled, body scrolling is locked to prevent background scroll.
  const [menuOpen, setMenuOpen] = useState(false);

  // When the overlay menu is opened we prevent scrolling on the body.
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

  // Close the overlay when the user hits the Escape key.
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
        "isolate sticky top-0 z-50 w-full transition-shadow duration-300",
      )}
    >
      {/* Background: wave mask + gradients. Removing padding here and
      specifying an explicit height on the content container below
      ensures the pattern lines up nicely with the navigation items. */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0" style={maskStyle}>
          {/* The base gradient stretches the full height of the header.
             In light mode it now uses CourtEase's orange coral palette
             (#FB923C and #F97316) for a warm, energetic feel. In dark
             mode it switches to the teal palette to maintain contrast. */}
          <div className="h-full w-full bg-[linear-gradient(90deg,#FB923C_0%,#F97316_50%,#FB923C_100%)] dark:bg-[linear-gradient(90deg,#0D9488_0%,#14B8A6_50%,#0D9488_100%)]" />
        </div>
        {/* Apply a subtle vertical gradient on top of the base gradient to
           mimic the soft fade used on Twibbonize. The light version fades
           from a hint of white into transparent, while the dark version
           uses translucent teal hues that complement the teal base. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_60%)] dark:bg-[linear-gradient(180deg,rgba(13,148,136,0.45)_0%,rgba(20,184,166,0)_70%)]" />
      </div>

      {/* Container for content: enforce a height of 88px (matching the
      wave mask) and center children vertically with flex. Padding
      responsively adjusts the horizontal spacing. */}
      <div
        className={clsx(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-[88px]",
        )}
      >
        {/* Mobile layout (smaller than `sm` breakpoint). Use flex to
        space between logo, controls and burger. */}
        <div className="flex w-full items-center justify-between text-white sm:hidden">
          {/* Left side: logo / brand name */}
          <Link
            href="#top"
            className="flex items-center gap-2 text-base font-semibold uppercase tracking-wide"
          >
            <span className="text-lg font-bold">courtease</span>
          </Link>
          {/* Right side: search, dark mode toggle, login and burger */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              type="button"
              aria-label="Cari konten"
              className="rounded-full border border-[#0D9488] bg-[#0D9488]/10 p-2 transition-colors duration-200 hover:bg-[#0D9488]/20 dark:border-[#14B8A6] dark:bg-[#14B8A6]/10 dark:hover:bg-[#14B8A6]/20"
            >
              <Search className="h-5 w-5 text-[#0D9488] dark:text-[#14B8A6]" />
            </button>
            {/* Dark mode toggle via ModeToggle component */}
            <ModeToggle />
            {/* Login link */}
            <Link
              href="#login"
              className="rounded-full border border-[#FB923C] px-3 py-1.5 text-sm font-semibold text-[#FB923C] transition-colors duration-200 hover:bg-[#FB923C]/15 dark:border-[#F97316] dark:text-[#F97316] dark:hover:bg-[#F97316]/20"
            >
              Login
            </Link>
            {/* Menu toggle (burger icon) */}
            <button
              type="button"
              aria-label="Buka menu navigasi"
              className="rounded-full border border-[#0D9488] bg-[#0D9488]/10 p-2 transition-colors duration-200 hover:bg-[#0D9488]/20 dark:border-[#14B8A6] dark:bg-[#14B8A6]/10 dark:hover:bg-[#14B8A6]/20"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-[#0D9488] dark:text-[#14B8A6]" />
            </button>
          </div>
        </div>

        {/* Desktop layout (≥ sm). Use flex gap and justify-between to
        evenly space the logo/nav and actions. */}
        <div className="hidden w-full items-center justify-between text-white sm:flex">
          <div className="flex items-center gap-8">
            {/* Logo / brand name */}
            <Link
              href="#top"
              className="flex items-center text-base font-semibold uppercase tracking-[0.32em]"
            >
              <span className="text-xl font-bold normal-case">courtease</span>
            </Link>
            {/* Navigation links */}
            <nav
              aria-label="Navigasi utama"
              className="flex items-center gap-1"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white/85 transition-colors duration-200 hover:bg-[#0D9488]/20 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          {/* Actions: search, mode toggle and login */}
          <div className="flex items-center gap-3">
            {/* Search bar: shown on medium and larger screens */}
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280] dark:text-[#9ca3af]" />
              <input
                type="search"
                placeholder="Search"
                className="w-40 md:w-56 lg:w-64 rounded-full border border-[#E5E7EB] bg-[#E5E7EB]/70 py-2 pl-9 pr-4 text-sm text-[#0f172a] placeholder-[#6b7280] transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6] dark:border-[#065649] dark:bg-[#052e2a] dark:text-white dark:placeholder-[#9ca3af] dark:focus:border-[#14B8A6] dark:focus:ring-[#14B8A6]"
              />
            </div>
            {/* Compact search button on small desktop screens (<md) */}
            <button
              type="button"
              aria-label="Cari konten"
              className="rounded-full border border-[#0D9488] bg-[#0D9488]/10 p-2 transition-colors duration-200 hover:bg-[#0D9488]/20 dark:border-[#14B8A6] dark:bg-[#14B8A6]/10 dark:hover:bg-[#14B8A6]/20 md:hidden"
            >
              <Search className="h-5 w-5 text-[#0D9488] dark:text-[#14B8A6]" />
            </button>
            {/* Dark mode toggle */}
            <ModeToggle />
            {/* Login link */}
            <Link
              href="#login"
              className="rounded-full border border-[#FB923C] px-5 py-2 text-sm font-semibold text-[#FB923C] transition-colors duration-200 hover:bg-[#FB923C]/15 dark:border-[#F97316] dark:text-[#F97316] dark:hover:bg-[#F97316]/20"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay menu: covers the page when opened. It slides down
      from the top to mimic the interactions on arc.net and apple.com. */}
      <div
        className={clsx(
          "fixed inset-0 z-50 sm:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Darkened backdrop; clicking it closes the menu */}
        <div
          className={clsx(
            "absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        {/* Sliding panel: full height; we remove any border or rounding to
        blend seamlessly with the page. */}
        <div
          className={clsx(
            "absolute inset-0 h-full overflow-y-auto bg-white text-[#0f172a] transition-transform duration-300 ease-out dark:bg-[#052e2a] dark:text-white",
            menuOpen ? "translate-y-0" : "-translate-y-full",
          )}
        >
          {/* Header inside overlay: brand and close button */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 dark:border-[#065649]">
            <Link
              href="#top"
              className="flex items-center text-base font-semibold uppercase"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-lg font-bold normal-case text-[#1c2440] dark:text-white">
                courtease
              </span>
            </Link>
            <button
              type="button"
              aria-label="Tutup menu navigasi"
              className="rounded-full border border-[#0D9488] bg-[#0D9488]/10 p-2 text-[#0D9488] transition-colors duration-200 hover:bg-[#0D9488]/20 dark:border-[#14B8A6] dark:bg-[#14B8A6]/10 dark:text-[#14B8A6] dark:hover:bg-[#14B8A6]/20"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Search bar at top of overlay */}
          <div className="px-6 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280] dark:text-[#9ca3af]" />
              <input
                type="search"
                placeholder="Search"
                className="w-full rounded-full border border-[#E5E7EB] bg-[#E5E7EB] py-2 pl-9 pr-4 text-sm text-[#0f172a] placeholder-[#6b7280] transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6] dark:border-[#065649] dark:bg-[#052e2a] dark:text-white dark:placeholder-[#9ca3af] dark:focus:border-[#14B8A6] dark:focus:ring-[#14B8A6]"
              />
            </div>
          </div>
          {/* Navigation links inside overlay */}
          <nav
            className="flex flex-col gap-2 px-6 py-4"
            aria-label="Navigasi utama"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-[#E5E7EB] bg-[#E5E7EB] px-4 py-3 text-base font-semibold text-[#0f172a] shadow-sm transition-colors duration-200 hover:border-[#14B8A6] hover:text-[#14B8A6] dark:border-[#065649] dark:bg-[#052e2a] dark:text-white dark:hover:border-[#14B8A6] dark:hover:text-[#14B8A6]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {/* Footer actions inside overlay: login and dark mode toggle */}
          <div className="flex flex-col gap-3 px-6 py-4 pb-6">
            <div className="flex items-center justify-between">
              {/* Dark mode toggle */}
              <ModeToggle />
              {/* Login button */}
              <Link
                href="#login"
                onClick={() => setMenuOpen(false)}
                className="ml-2 flex-1 rounded-full bg-[#FB923C] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-[0_20px_50px_-25px_rgba(251,146,60,0.9)] transition-colors duration-200 hover:bg-[#F97316] dark:bg-[#F97316] dark:text-[#0f172a] dark:hover:bg-[#FB923C]"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
