"use client";

import { useEffect, useState } from "react";

import { ForumThreadComposer } from "@/components/forum/forum-thread-composer";
import { ForumThreadList } from "@/components/forum/forum-thread-list";
import type { ForumCategory, ForumThreadSummary } from "@/lib/supabase/queries/forum";

type ForumViewProps = {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
};

export function ForumView({ categories, threads }: ForumViewProps) {
  const [liveThreads, setLiveThreads] = useState(threads);

  useEffect(() => {
    setLiveThreads(threads);
  }, [threads]);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-strong">
          Forum
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
          Komunitas CourtEase
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Diskusi strategi, cari sparring partner, dan bagikan review venue
          untuk bantu ribuan atlet komunitas lainnya. Semua thread terhubung ke
          Supabase dan akan muncul secara real-time ketika ada balasan baru.
        </p>
      </header>

      <ForumThreadComposer
        categories={categories}
        onThreadCreated={(thread) => {
          setLiveThreads((prev) => [thread, ...prev]);
        }}
      />

      <ForumThreadList categories={categories} threads={liveThreads} />
    </div>
  );
}
