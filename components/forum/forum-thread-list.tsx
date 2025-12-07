"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MapPin } from "lucide-react";

import type { ForumCategory, ForumThreadSummary } from "@/lib/queries/types";
import { cn } from "@/lib/utils";
import { truncateText } from "@/lib/strings";

const sortOptions = [
  { id: "latest", label: "Latest" },
  { id: "popular", label: "Popular" },
];

type ForumThreadListProps = {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
};

export function ForumThreadList({ categories, threads }: ForumThreadListProps) {
  const [activeSort, setActiveSort] = useState<string>("latest");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const liveThreads = threads; // Use threads directly since realtime hook was removed

  const categoryOptions = useMemo(() => {
    const unique = new Map<string, ForumCategory>();
    categories.forEach((category) => {
      if (!unique.has(category.slug)) {
        unique.set(category.slug, category);
      }
    });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [categories]);

  const filteredThreads = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    const threadsWithSort = liveThreads.filter((thread) => {
      const matchesCategory =
        activeCategory === "all" || thread.category?.slug === activeCategory;
      const matchesSearch =
        !normalizedQuery ||
        thread.title.toLowerCase().includes(normalizedQuery) ||
        (thread.excerpt ?? "").toLowerCase().includes(normalizedQuery) ||
        thread.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesSearch;
    });

    if (activeSort === "popular") {
      return [...threadsWithSort].sort((a, b) => b.reply_count - a.reply_count);
    }

    return [...threadsWithSort].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [liveThreads, activeCategory, activeSort, search]);

  const trendingThreads = useMemo(() => {
    return [...liveThreads]
      .sort((a, b) => b.reply_count - a.reply_count)
      .slice(0, 3);
  }, [liveThreads]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Filter diskusi
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pilih kategori atau urutkan thread. Default menampilkan posting
                terbaru dari komunitas.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 p-1 dark:border-slate-700/70 dark:bg-slate-900/70">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setActiveSort(option.id)}
                  className={cn(
                    "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition",
                    activeSort === option.id
                      ? "bg-brand text-white shadow"
                      : "text-slate-500 hover:text-brand dark:text-slate-400",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[0.6fr_1fr]">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Kategori
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition",
                    activeCategory === "all"
                      ? "border-brand bg-brand/10 text-brand dark:border-brand dark:text-brand-muted"
                      : "border-slate-200 text-slate-500 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-400",
                  )}
                >
                  Semua
                </button>
                {categoryOptions.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.slug)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      activeCategory === category.slug
                        ? "border-brand bg-brand/10 text-brand dark:border-brand dark:text-brand-muted"
                        : "border-slate-200 text-slate-500 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-400",
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                Cari thread
              </label>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari judul, kata kunci, atau tag..."
                className="w-full rounded-full border border-slate-200/70 bg-white/90 px-4 py-2 text-sm text-slate-600 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/50 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:border-brand"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredThreads.map((thread) => (
            <article
              key={thread.id}
              className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/70 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-brand dark:text-brand-muted">
                  {thread.category?.name ?? "Umum"}
                </span>
                <span>
                  {new Date(thread.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <Link
                href={`/forum/${thread.slug}`}
                className="mt-2 block text-lg font-semibold text-slate-900 transition hover:text-brand dark:text-white dark:hover:text-brand-muted"
              >
                {thread.title}
              </Link>
              {thread.excerpt && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {thread.excerpt}
                </p>
              )}
              {thread.reviewCourt && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-strong/10 px-3 py-1 text-[11px] font-semibold text-brand-strong dark:bg-brand/15 dark:text-brand">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Review lapangan: {thread.reviewCourt.name}</span>
                </div>
              )}
              {thread.latestReplyBody && (
                <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                  Balasan terbaru: “{truncateText(thread.latestReplyBody, 120)}”
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span>{thread.author_name ?? "Member CourtEase"}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>{thread.reply_count} balasan</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {thread.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand dark:bg-brand/10 dark:text-brand-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
          {!filteredThreads.length && (
            <div className="rounded-3xl border border-dashed border-slate-200/70 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
              Belum ada thread yang cocok dengan filter saat ini. Coba ubah
              kategori atau kata kunci pencarian.
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Thread terpanas
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {trendingThreads.map((thread) => (
              <li
                key={thread.id}
                className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 transition hover:border-brand/70 dark:border-slate-700/60 dark:bg-slate-900/60"
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-brand">
                  <span>{thread.category?.name ?? "Forum"}</span>
                  <span className="text-slate-400">
                    {new Date(thread.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <Link
                  href={`/forum/${thread.slug}`}
                  className="mt-1 block font-semibold text-slate-900 transition hover:text-brand dark:text-white dark:hover:text-brand-muted"
                >
                  {thread.title}
                </Link>
                {thread.excerpt && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {thread.excerpt}
                  </p>
                )}
                {thread.latestReplyBody && (
                  <p className="text-[11px] italic text-slate-500 dark:text-slate-400">
                    {truncateText(thread.latestReplyBody, 90)}
                  </p>
                )}
                <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {thread.reply_count} balasan
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-2xl border border-brand/40 bg-white/90 p-5 text-sm shadow-sm shadow-brand/15 dark:border-brand/30 dark:bg-slate-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand">
            Etika komunitas
          </p>
          <p className="font-semibold text-slate-900 dark:text-white">
            Bangun diskusi yang hangat
          </p>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            <li>
              • Ceritakan pengalaman pribadi secara detail agar mudah dipahami.
            </li>
            <li>
              • Gunakan tag yang relevan supaya member lain cepat menemukan
              topikmu.
            </li>
            <li>
              • Jangan lupa kembali dan update hasilnya agar thread tetap hidup.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
