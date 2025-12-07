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
  const [isOnHeroDark, setIsOnHeroDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      // Check if we're in hero section (top part of page)
      const heroSection = document.querySelector('[data-hero-section="true"]');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isInHero = rect.bottom > 0; // Hero section is still visible

        if (!isInHero) {
          setIsOnHeroDark(false); // Reset when scrolled past hero
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Listen for hero carousel slide changes
    const handleHeroSlideChange = (event: CustomEvent) => {
      const { isDarkBackground } = event.detail;
      setIsOnHeroDark(isDarkBackground);
    };

    // Check hero status directly by querying data attribute
    const checkHeroStatus = () => {
      const heroSection = document.querySelector('[data-hero-section="true"]');
      if (heroSection) {
        const isVisible = heroSection.getBoundingClientRect().top < window.innerHeight && heroSection.getBoundingClientRect().bottom > 0;
        const slideIsDark = heroSection.getAttribute('data-slide-is-dark') === 'true';

        // Fallback: Check current slide by analyzing images
        const images = heroSection.querySelectorAll('img');
        const firstImage = images[0];
        const isDarkByAlt = firstImage && (firstImage.alt === "Main hari ini, esok, atau kapan saja" || firstImage.alt === "Temukan bakat dan komunitas baru");

        const isDark = slideIsDark || isDarkByAlt;
        setIsOnHeroDark(isVisible && isDark);
      }
    };

    // Check if we're on landing page and add event listeners
    if (pathname === "/") {
      // Listen for window events (global scope)
      window.addEventListener("hero-slide-change", handleHeroSlideChange as EventListener);

      // Set up MutationObserver to detect data attribute changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-slide-is-dark') {
            checkHeroStatus();
          }
        });
      });

      const heroSection = document.querySelector('[data-hero-section="true"]');
      if (heroSection) {
        observer.observe(heroSection, { attributes: true });

        // Initial check after a short delay
        setTimeout(() => {
          checkHeroStatus();
        }, 100);
      }

      return () => {
        window.removeEventListener("hero-slide-change", handleHeroSlideChange as EventListener);
        observer.disconnect();
      };
    }

    return () => {};
  }, [pathname]);

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
          "fixed w-full transition-all duration-300 top-0 z-500",
          // When not scrolled and on hero with dark background
          !scrolled && pathname === "/" && isOnHeroDark
            ? "bg-transparent"
            : // When scrolled or not on hero
              scrolled
                ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-100/20 dark:border-slate-700/30"
                : "bg-transparent",
        )}
      >

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16">
          {/* Mobile view */}
          <div className="flex w-full items-center justify-between sm:hidden">
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
              <span className={clsx(
                "text-lg font-bold",
                pathname === "/" && !scrolled && isOnHeroDark
                  ? "text-white"
                  : "text-brand dark:text-brand-contrast"
              )}>
                courtease
              </span>
            </Link>
            <div className="flex items-center">
              <SearchBar
                className={
                  pathname === "/" && !scrolled && isOnHeroDark
                    ? "text-white hover:bg-white/10"
                    : ""
                }
              />
              <div className="scale-100 origin-right">
                <NavbarAuthMenu
                  variant="inline"
                  onAction={() => setMenuOpen(false)}
                />
              </div>
              <button
                type="button"
                aria-label="Buka menu navigasi"
                className={clsx(
                  "rounded-lg p-2 transition-colors duration-200",
                  pathname === "/" && !scrolled && isOnHeroDark
                    ? "text-white hover:bg-white/10"
                    : "text-brand hover:bg-brand/10 dark:text-brand-contrast dark:hover:bg-brand/20"
                )}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden w-full items-center justify-between sm:flex">
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
                <span className={clsx(
                  "text-xl font-bold normal-case",
                  pathname === "/" && !scrolled && isOnHeroDark
                    ? "text-white"
                    : "text-brand dark:text-brand-contrast"
                )}>
                  courtease
                </span>
              </Link>
              <nav
                aria-label="Navigasi utama"
                className="flex items-center gap-1"
              >
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;

                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        className={clsx(
                          "relative px-4 py-2 text-sm font-medium transition-colors duration-200 group",
                          isActive
                            ? pathname === "/" && !scrolled && isOnHeroDark
                              ? "text-white"
                              : "text-brand dark:text-brand-contrast"
                            : pathname === "/" && !scrolled && isOnHeroDark
                              ? "text-white"
                              : "text-slate-800 dark:text-slate-200",
                          pathname === "/" && !scrolled && isOnHeroDark
                            ? "hover:text-white/80"
                            : "hover:text-brand dark:hover:text-brand-contrast",
                        )}
                      >
                        {link.label}
                        <span
                          className={clsx(
                            "absolute bottom-0 left-0 h-0.5 w-full transform transition-transform duration-300 ease-out origin-left",
                            pathname === "/" && !scrolled && isOnHeroDark
                              ? "bg-white"
                              : "bg-gradient-to-r from-brand to-brand-strong",
                            isActive || scrolled ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>
            </div>
            <div className="flex items-center gap-3">
              <SearchBar
                className={
                  pathname === "/" && !scrolled && isOnHeroDark
                    ? "text-white hover:bg-white/10"
                    : ""
                }
              />
              <div>
                <ModeToggle
                  className={clsx(
                    "rounded-full",
                    pathname === "/" && !scrolled && isOnHeroDark
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-brand hover:bg-brand/10 hover:text-brand-strong"
                  )}
                />
              </div>
              <NavbarAuthMenu
              variant="inline"
              onAction={() => {}}
              isHeroDark={pathname === "/" && !scrolled && isOnHeroDark}
            />
            </div>
          </div>
        </div>
      </header>

      
      {/* Mobile menu overlay - FULL PAGE */}
      <div
        className={clsx(
          "fixed inset-0 z-600 sm:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-brand-strong/80 backdrop-blur-sm transition-opacity duration-300",
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
            <button className="w-full rounded-xl bg-brand px-6 py-4 font-semibold text-brand-contrast shadow-brand/30 transition-colors duration-200 hover:bg-brand-strong">
              Start to be a partner
            </button>
          </div>

          {/* Navigation links in the middle */}
          <nav className="flex-1 px-6 py-8" aria-label="Navigasi utama">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "block py-4 text-lg font-medium transition-colors duration-200",
                    isActive
                      ? "text-brand dark:text-brand-contrast"
                      : "text-gray-900 dark:text-white",
                    "hover:text-brand dark:hover:text-brand-contrast",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Authentication menu at bottom center */}
          <div className="px-6 pb-6">
            <NavbarAuthMenu
              variant="stacked"
              onAction={() => setMenuOpen(false)}
              isHeroDark={false} // Mobile menu uses its own dark background
            />
          </div>

          {/* Dark mode toggle in bottom left corner */}
          <div className="absolute bottom-6 left-6">
            <ModeToggle
              className={clsx(
                "rounded-full text-brand hover:bg-brand/10 hover:text-brand-strong dark:text-brand-contrast dark:hover:bg-brand/20 dark:hover:text-brand"
              )}
            />
          </div>

          {/* Close button in top right */}
          <button
            type="button"
            aria-label="Tutup menu navigasi"
            className="absolute top-6 right-6 rounded-lg p-2 text-brand transition-colors duration-200 hover:bg-brand/10 dark:text-brand-contrast dark:hover:bg-brand/20"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
    </>
  );
}
