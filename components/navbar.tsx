"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import SearchBar from "./search-bar";
import { NavbarAuthMenu } from "./navbar-auth-menu";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Venues", href: "/venues" },
  { label: "Forum", href: "/forum" },
];

export default function Navbar() {
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

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/80 backdrop-blur-lg border-b border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-800/50"
          : "bg-white dark:bg-gray-900"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-3"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-teal-500 dark:to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                CourtEase
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            <ModeToggle />
            <NavbarAuthMenu variant="inline" onAction={() => {}} />

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "fixed inset-0 z-50 md:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={clsx(
            "absolute inset-0 bg-black/50 transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />

        {/* Menu panel */}
        <div
          className={clsx(
            "absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-out dark:bg-gray-900",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
            <Link
              href="/"
              className="flex items-center space-x-3"
              onClick={() => setMenuOpen(false)}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 dark:from-teal-500 dark:to-teal-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                CourtEase
              </span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="px-6 py-6">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-gray-900 rounded-lg dark:text-white dark:hover:bg-gray-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Bottom actions */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
              <ModeToggle />
            </div>
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
