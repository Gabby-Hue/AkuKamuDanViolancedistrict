"use client";

/**
 * SearchBar component
 *
 * This component encapsulates the search UI for both desktop and mobile
 * views. On desktop (md and above), the search input sits in the
 * navbar and reveals a dropdown directly beneath it when a query is
 * entered. On mobile, clicking the search icon opens a full-screen
 * overlay with its own input and a cancel button. The search results
 * are filtered from a small sample dataset defined within this file.
 * You can replace the mock data and filtering logic with real API
 * integration as needed. Import this component into your Navbar and
 * remove the old search logic from there.
 */

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { useSearch, type SearchResult } from "@/hooks";

// Search categories for organizing results
type SearchCategory = "courts" | "venues" | "forums";

export default function SearchBar() {
  const { query, setQuery, results, searching } = useSearch();
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<SearchCategory>("courts");
  const categorizedResults = useMemo<Record<SearchCategory, SearchResult[]>>(() => {
    return results.reduce(
      (acc, item) => {
        if (item.type === "court") {
          acc.courts.push(item);
        }
        if (item.type === "venue") {
          acc.venues.push(item);
        }
        if (item.type === "forum") {
          acc.forums.push(item);
        }
        return acc;
      },
      {
        courts: [],
        venues: [],
        forums: [],
      },
    );
  }, [results]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(value.trim().length > 0);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="relative">
      {/* Desktop search input */}
      <div className="group relative hidden md:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-brand group-focus-within:text-brand" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(query.trim().length > 0)}
          placeholder="Search courts, venues, or forum…"
          className="h-10 w-[16rem] lg:w-[20rem] rounded-full border border-white/10 bg-white/5 px-12 pr-16 text-sm text-slate-100 placeholder:text-slate-400 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all duration-200 focus:border-brand-strong focus:ring-2 focus:ring-brand/50 focus:outline-none focus:bg-slate-900/60 group-hover:border-brand group-hover:bg-slate-900/60 dark:border-white/10 dark:bg-slate-900/70 dark:text-white"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center space-x-1">
          <kbd className="hidden xs:inline-flex items-center rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
            ⌘
          </kbd>
          <kbd className="hidden xs:inline-flex items-center rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
            K
          </kbd>
        </div>
      </div>

      {/* Mobile search trigger */}
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="md:hidden rounded-full border border-white/10 bg-white/5 p-2 text-brand-strong shadow-[0_6px_20px_rgba(0,0,0,0.2)] backdrop-blur"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden md:block absolute left-0 right-0 mt-2 z-40">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {(["courts", "venues", "forums"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-brand-strong text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {searching ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  Searching...
                </div>
              ) : categorizedResults[activeTab].length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  No results found.
                </div>
              ) : (
                <div className="py-2">
                  {categorizedResults[activeTab].map((item, index) => (
                    <Link
                      href={item.href}
                      key={`${item.type}-${index}`}
                      className="block px-4 py-3 transition-colors hover:bg-white/5"
                    >
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile full-screen overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
          {/* Search header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search className="h-5 w-5 text-brand" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={handleInputChange}
              placeholder="Search courts, venues, or forum…"
              className="flex-1 bg-transparent text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-brand-strong"
            >
              Cancel
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(["courts", "venues", "forums"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-brand-strong text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {searching ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                Searching...
              </div>
            ) : categorizedResults[activeTab].length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No results found.
              </div>
            ) : (
              <div className="py-2">
                {categorizedResults[activeTab].map((item, index) => (
                  <Link
                    href={item.href}
                    key={`${item.type}-${index}`}
                    className="block px-4 py-4 transition-colors hover:bg-white/5"
                  >
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
