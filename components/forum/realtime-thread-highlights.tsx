"use client";

import Link from "next/link";

import type { ForumThreadSummary } from "@/lib/supabase/queries/forum";
import { truncateText } from "@/lib/strings";

import { useRealtimeThreadSummaries } from "@/components/forum/use-realtime-thread-summaries";

type RealtimeThreadHighlightsProps = {
  threads: ForumThreadSummary[];
  limit: number;
};

export function RealtimeThreadHighlights({
  threads,
  limit,
}: RealtimeThreadHighlightsProps) {
  const liveThreads = useRealtimeThreadSummaries(threads);
  const visible = liveThreads.slice(0, limit);

  if (!visible.length) {
    return (
      <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
        <li className="rounded-2xl border border-dashed border-brand/30 bg-white/90 p-6 text-center text-xs text-slate-600 dark:border-brand/40 dark:bg-brand/20 dark:text-brand-contrast/80">
          Diskusi komunitas akan muncul otomatis setelah data forum tersedia di
          Supabase.
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
      {visible.map((thread) => (
        <li
          key={thread.id}
          className="rounded-2xl border border-brand/25 bg-white/90 p-4 shadow-sm shadow-brand/10 transition hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-brand/30 dark:border-brand/40 dark:bg-brand/20"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full bg-brand/10 px-3 py-1 font-semibold text-brand dark:bg-brand/25 dark:text-brand-contrast">
              {thread.category?.name ?? "Umum"}
            </span>
            <span>
              {new Date(thread.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <Link
            href={`/forum/${thread.slug}`}
            className="mt-2 block text-sm font-semibold text-slate-900 transition hover:text-brand-strong dark:text-white dark:hover:text-brand-contrast"
          >
            {thread.title}
          </Link>
          {thread.excerpt && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {thread.excerpt}
            </p>
          )}
          {thread.latestReplyBody && (
            <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
              Balasan terbaru: “{truncateText(thread.latestReplyBody, 90)}”
            </p>
          )}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{thread.author_name ?? "Member CourtEase"}</span>
            <span>{thread.reply_count} balasan</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
