"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  MapPin,
  Menu,
  Search,
  Volleyball,
  X,
} from "lucide-react";

import { NavbarAuthMenu } from "@/components/navbar-auth-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/venues", label: "Venues" },
  { href: "/forum", label: "Forum" },
];

type SearchResult = {
  type: "court" | "venue" | "forum";
  title: string;
  description: string;
  href: string;
};

type SuggestedCourt = {
  id: string;
  name: string;
  slug: string;
  venueName: string;
  venueCity: string | null;
  pricePerHour: number | null;
  averageRating: number | null;
};

const escapeRegex = (value: string) =>
  value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const highlightMatches = (text: string, query: string): ReactNode => {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const escaped = escapeRegex(trimmed);
  const regex = new RegExp(`(${escaped})`, "gi");
  const lowerQuery = trimmed.toLowerCase();
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === lowerQuery ? (
      <mark
        key={index}
        className="rounded bg-brand-soft px-0.5 text-slate-900 dark:bg-brand/20 dark:text-brand"
      >
        {part}
      </mark>
    ) : (
      <span key={index} className="contents">
        {part}
      </span>
    )
  );
};

export function CourteaseNavbar() {
  const pathname = usePathname() || "/";
  const [openSearch, setOpenSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedCourt[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpenSearch((prev) => !prev);
      }
      if (event.key === "Escape") {
        setOpenSearch(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenSearch(false);
  }, [pathname]);

  useEffect(() => {
    if (openSearch) {
      const focusTimeout = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 20);

      return () => window.clearTimeout(focusTimeout);
    }
    return undefined;
  }, [openSearch]);

  useEffect(() => {
    if (!openSearch) {
      return undefined;
    }

    const handleClick = (event: MouseEvent) => {
      if (!searchContainerRef.current) {
        return;
      }

      if (!searchContainerRef.current.contains(event.target as Node)) {
        setOpenSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openSearch]);

  useEffect(() => {
    if (!openSearch || suggestions.length > 0 || loadingSuggestions) {
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        setSuggestionError(null);
        const response = await fetch("/api/recommended-courts", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Gagal memuat rekomendasi lapangan.");
        }

        const body = (await response.json()) as {
          data?: SuggestedCourt[];
        };
        if (!controller.signal.aborted) {
          setSuggestions(body.data ?? []);
        }
      } catch (error_) {
        if ((error_ as Error).name === "AbortError") {
          return;
        }
        console.error("Failed to fetch court suggestions", error_);
        if (!controller.signal.aborted) {
          setSuggestionError("Rekomendasi tidak dapat dimuat.");
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();

    return () => {
      controller.abort();
    };
  }, [openSearch, suggestions.length, loadingSuggestions]);

  useEffect(() => {
    if (!openSearch) {
      setQuery("");
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    setSearching(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Gagal memuat hasil pencarian.");
        }

        const body = (await response.json()) as { data?: SearchResult[] };
        if (!controller.signal.aborted) {
          setResults(body.data ?? []);
        }
      } catch (error_) {
        if ((error_ as Error).name === "AbortError") {
          return;
        }
        console.error("Universal search failed", error_);
        if (!controller.signal.aborted) {
          setError("Terjadi kesalahan saat mencari. Coba lagi.");
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, openSearch]);

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard/admin") ||
    pathname.startsWith("/dashboard/venue")
  ) {
    return null;
  }

  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = mounted ? currentTheme === "dark" : false;
  const mobileMenuClass = isDark
    ? "border-slate-800/70 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900/95"
    : "border-slate-200/70 bg-gradient-to-b from-white via-white/95 to-[hsl(var(--brand-soft))]/15";
  const trimmedQuery = query.trim();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB]/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800/70 dark:bg-slate-950/70">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-2">
            <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white shadow-sm shadow-brand/30">
              <Volleyball className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-12" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-800 dark:text-slate-100">
              Court<span className="text-brand">Ease</span>
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <span
                  className={`absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-200 ${
                    active ? "opacity-100" : ""
                  }`}
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-strong)) 100%)",
                    boxShadow: "0 2px 10px hsla(var(--brand),0.25)",
                    opacity: active ? 0.18 : 0,
                  }}
                />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div ref={searchContainerRef} className="relative flex items-center">
            <Button
              variant="outline"
              className="hidden min-w-[15rem] items-center gap-3 rounded-full border-[#E5E7EB] bg-white/90 px-5 py-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand hover:text-brand-strong dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 md:flex"
              onClick={() => setOpenSearch(true)}
            >
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">
                Cari courts, venues, atau forum…
              </span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Ctrl + K
              </kbd>
            </Button>

            {openSearch && (
              <div className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[min(100vw-2rem,640px)] rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-xl ring-1 ring-slate-100 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/95 dark:ring-slate-800/40">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        setOpenSearch(false);
                      }
                    }}
                    placeholder="Cari courts, venues, atau forum…"
                    className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  />
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Esc
                  </span>
                </div>

                <div className="mt-6 space-y-6">
                  {trimmedQuery.length === 0 ? (
                    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                            Suggested Lapangan
                          </h3>
                          <Link
                            href="/venues"
                            className="text-xs font-medium text-brand transition hover:text-brand-strong"
                            onClick={() => setOpenSearch(false)}
                          >
                            Lihat semua
                          </Link>
                        </div>
                        <div className="space-y-3">
                          {loadingSuggestions ? (
                            <div className="space-y-3">
                              {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="h-16 animate-pulse rounded-2xl bg-slate-100/70 dark:bg-slate-800/60"
                                />
                              ))}
                            </div>
                          ) : suggestionError ? (
                            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-200">
                              {suggestionError}
                            </p>
                          ) : suggestions.length === 0 ? (
                            <p className="rounded-2xl bg-slate-100/70 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                              Belum ada rekomendasi lapangan.
                            </p>
                          ) : (
                            suggestions.map((court) => (
                              <Link
                                key={court.id}
                                href={`/court/${court.slug}`}
                                className="flex items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 text-sm transition hover:border-brand/40 hover:bg-brand-strong/5 dark:hover:border-brand/40 dark:hover:bg-brand/10"
                                onClick={() => setOpenSearch(false)}
                              >
                                <div className="space-y-1">
                                  <p className="font-semibold text-slate-900 dark:text-white">
                                    {court.name}
                                  </p>
                                  <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span>
                                      {court.venueName}
                                      {court.venueCity
                                        ? ` • ${court.venueCity}`
                                        : ""}
                                    </span>
                                  </p>
                                </div>
                                <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                                  {court.averageRating ? (
                                    <p>
                                      <span className="font-semibold text-slate-900 dark:text-white">
                                        {court.averageRating.toFixed(1)}
                                      </span>{" "}
                                      / 5
                                    </p>
                                  ) : null}
                                  {court.pricePerHour ? (
                                    <p>
                                      Rp{" "}
                                      {court.pricePerHour.toLocaleString(
                                        "id-ID"
                                      )}
                                      /jam
                                    </p>
                                  ) : null}
                                </div>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Mulai jelajahi
                        </h3>
                        <div className="grid gap-3">
                          {LINKS.map((link) => (
                            <Link
                              key={`quick-${link.href}`}
                              href={link.href}
                              className="flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-brand/40 hover:text-brand-strong dark:border-slate-700/70 dark:text-slate-300 dark:hover:border-brand/40 dark:hover:text-brand"
                              onClick={() => setOpenSearch(false)}
                            >
                              <span>{link.label}</span>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : searching ? (
                    <p className="rounded-2xl bg-slate-100/70 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                      Mencari “{query}”…
                    </p>
                  ) : error ? (
                    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-200">
                      {error}
                    </p>
                  ) : results.length === 0 ? (
                    <p className="rounded-2xl bg-slate-100/70 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
                      Tidak ada hasil untuk “{query}”.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <Link
                          key={`${result.type}-${result.href}`}
                          href={result.href}
                          className="flex items-center justify-between gap-4 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-600 transition hover:border-brand/40 hover:bg-brand-strong/5 dark:text-slate-300 dark:hover:border-brand/40 dark:hover:bg-brand/10"
                          onClick={() => setOpenSearch(false)}
                        >
                          <div className="flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-strong dark:text-brand">
                              {result.type === "court"
                                ? "Lapangan"
                                : result.type === "venue"
                                ? "Venue"
                                : "Forum"}
                            </p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {highlightMatches(result.title, query)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {highlightMatches(result.description, query)}
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-brand" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex">
            <ThemeSwitcher label="Toggle theme" />
          </div>

          <div className="md:hidden">
            <ThemeSwitcher
              className="h-11 w-11 border-brand/30"
              label="Toggle theme"
            />
          </div>

          <div className="hidden md:block">
            <NavbarAuthMenu />
          </div>

          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="border-slate-200 dark:border-slate-800"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity dark:bg-slate-950/70"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 flex justify-center px-3 pt-2">
            <div
              className={`w-full max-w-lg origin-top animate-in fade-in slide-in-from-top-6 rounded-b-3xl border p-6 shadow-2xl transition dark:shadow-slate-950/40 ${mobileMenuClass}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <span className="inline-grid h-9 w-9 place-items-center rounded-2xl bg-brand text-white">
                    <Volleyball className="h-5 w-5" />
                  </span>
                  <span className="font-semibold">
                    Court<span className="text-brand">Ease</span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                {LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`rounded-xl px-3 py-2 text-base font-medium transition-colors ${
                        active
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                          : "text-slate-600 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:bg-slate-800/60"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Mode tampilan
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pilih tampilan terang atau gelap sesuai kenyamananmu.
                      </p>
                    </div>
                    <ThemeSwitcher
                      className="h-12 w-12 border-brand/20"
                      label="Toggle theme"
                    />
                  </div>
                </div>
                <NavbarAuthMenu
                  variant="stacked"
                  onAction={() => {
                    setMobileOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {openSearch && (
        <div className="fixed inset-0 z-[60] md:hidden" aria-hidden />
      )}
    </header>
  );
}
