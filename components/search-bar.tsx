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

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

// Database search result type
type SearchResult = {
  type: "court" | "venue" | "forum";
  title: string;
  description: string;
  href: string;
};

// Search categories for organizing results
type SearchCategory = "courts" | "venues" | "forums";

// Search results organized by category
type SearchResults = {
  courts: SearchResult[];
  venues: SearchResult[];
  forums: SearchResult[];
};

// Function to fetch search results from the database API
async function fetchSearchResults(query: string): Promise<SearchResults> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const { data } = await response.json();

    // Organize results by category
    const organizedResults: SearchResults = {
      courts: [],
      venues: [],
      forums: [],
    };

    (data || []).forEach((item: SearchResult) => {
      switch (item.type) {
        case "court":
          organizedResults.courts.push(item);
          break;
        case "venue":
          organizedResults.venues.push(item);
          break;
        case "forum":
          organizedResults.forums.push(item);
          break;
      }
    });

    return organizedResults;
  } catch (error) {
    console.error("Search error:", error);
    return {
      courts: [],
      venues: [],
      forums: [],
    };
  }
}

export default function SearchBar() {
  // Current search text
  const [query, setQuery] = useState<string>("");
  // Whether the overlay/dropdown is currently visible
  const [open, setOpen] = useState<boolean>(false);
  // Active tab for categorized results
  const [activeTab, setActiveTab] = useState<SearchCategory>("courts");
  // Search results from database
  const [results, setResults] = useState<SearchResults>({
    courts: [],
    venues: [],
    forums: [],
  });
  // Loading state for search
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch search results from database when query changes
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length === 0) {
      setResults({ courts: [], venues: [], forums: [] });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await fetchSearchResults(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults({ courts: [], venues: [], forums: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      // Open search with Cmd/Ctrl + K
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
      // Close with Escape
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Handle changes in the search input
  // Handle input changes with proper search logic
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    // Show overlay when there is text
    setOpen(value.trim().length > 0);
  };

  return (
    <div className="relative">
      {/* Desktop search input */}
      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setOpen(query.trim().length > 0)}
          placeholder="Search courts, venues, or forum…"
          className="h-10 w-64 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-gray-600 dark:focus:bg-gray-900"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center space-x-1">
          <kbd className="hidden xs:inline-flex items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            ⌘
          </kbd>
          <kbd className="hidden xs:inline-flex items-center rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            K
          </kbd>
        </div>
      </div>

      {/* Mobile search trigger */}
      <button
        type="button"
        aria-label="Search"
        onClick={() => setOpen(true)}
        className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div className="hidden md:block absolute left-0 right-0 mt-2 z-40">
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {(["courts", "venues", "forums"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-gray-900 text-gray-900 dark:border-white dark:text-white"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Searching...
                </div>
              ) : results[activeTab].length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </div>
              ) : (
                <div className="py-2">
                  {results[activeTab].map((item, index) => (
                    <Link
                      href={item.href}
                      key={`${item.type}-${index}`}
                      className="block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900">
          {/* Search header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={handleInputChange}
              placeholder="Search courts, venues, or forum…"
              className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {(["courts", "venues", "forums"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-gray-900 text-gray-900 dark:border-white dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            ) : results[activeTab].length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No results found.
              </div>
            ) : (
              <div className="py-2">
                {results[activeTab].map((item, index) => (
                  <Link
                    href={item.href}
                    key={`${item.type}-${index}`}
                    className="block px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
