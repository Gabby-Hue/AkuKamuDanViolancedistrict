"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import SearchBar from "./search-bar";
import { NavbarAuthMenu } from "./navbar-auth-menu";
import { usePathname } from "next/navigation";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venue", href: "/venues" },
  { label: "Forum", href: "/forum" },
];

export default function NavbarNew() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const hideNavbarRoutes = ["/dashboard/admin", "/auth", "/dashboard/venue"];
  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <>
      <header
        className={clsx(
          "fixed w-full transition-all duration-300 top-0 z-50",
          scrolled
            ? "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            : "bg-transparent",
        )}
      >
        {/* Gradient line - hanya muncul saat scroll */}
        {scrolled && (
          <div className="h-px bg-linear-to-r from-orange-500 via-teal-500 to-orange-500 dark:from-teal-400 dark:via-orange-400 dark:to-teal-400" />
        )}

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16">
          {/* Mobile view */}
          <div className="flex w-full items-center justify-between text-white sm:hidden">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="text-lg font-bold text-black dark:text-white">
                courtease
              </span>
            </Link>
            <div className="flex items-center">
              <SearchBar />
              <div className="scale-100 origin-right">
                <NavbarAuthMenu
                  variant="inline"
                  onAction={() => setMenuOpen(false)}
                />
              </div>
              <button
                type="button"
                aria-label="Buka menu navigasi"
                className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5 text-black dark:text-white" />
              </button>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden w-full items-center justify-between text-white sm:flex">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex items-center gap-3 text-xl font-bold"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
                <span className="text-xl font-bold normal-case text-black dark:text-white">
                  courtease
                </span>
              </Link>
              <nav
                aria-label="Navigasi utama"
                className="flex items-center gap-1"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative px-4 py-2 text-sm font-medium text-black dark:text-white hover:text-orange-500 dark:hover:text-teal-500 transition-colors duration-200 group"
                  >
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-orange-500 to-teal-500 dark:from-teal-400 dark:to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left" />
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar />
              <div className="text-white">
                <ModeToggle />
              </div>
              <NavbarAuthMenu variant="inline" onAction={() => {}} />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay - FULL PAGE */}
      <div
        className={clsx(
          "fixed inset-0 z-50 sm:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={clsx(
            "absolute inset-0 h-full w-full bg-white text-gray-900 transition-transform duration-300 ease-out dark:bg-gray-900 dark:text-white flex flex-col",
            menuOpen ? "translate-y-0" : "-translate-y-full",
          )}
        >
          {/* CTA Button at top - Like Twibbonize */}
          <div className="px-6 pt-6">
            <button className="w-full bg-linear-to-r from-orange-500 to-teal-500 text-white font-semibold py-4 px-6 rounded-xl hover:from-orange-600 hover:to-teal-600 transition-colors duration-200">
              Start to be a partner
            </button>
          </div>

          {/* Navigation links in the middle */}
          <nav className="flex-1 px-6 py-8" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-4 text-lg font-medium text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-teal-400 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Authentication menu at bottom center */}
          <div className="px-6 pb-6">
            <NavbarAuthMenu
              variant="stacked"
              onAction={() => setMenuOpen(false)}
            />
          </div>

          {/* Dark mode toggle in bottom left corner */}
          <div className="absolute bottom-6 left-6">
            <ModeToggle />
          </div>

          {/* Close button in top right */}
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
}
