"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { MapPin } from "lucide-react";

import { ThreadReplies } from "@/components/forum/thread-replies";
import type { ForumThreadDetail } from "@/lib/supabase/queries/forum";

export function ThreadDiscussion({ thread }: { thread: ForumThreadDetail }) {
  const [liveReplyCount, setLiveReplyCount] = useState(
    () => thread.replies.length || thread.reply_count,
  );

  useEffect(() => {
    setLiveReplyCount(thread.replies.length || thread.reply_count);
  }, [thread.replies, thread.reply_count]);

  const createdAt = new Date(thread.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
      <nav className="text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/forum"
          className="font-semibold uppercase tracking-[0.3em] text-brand-strong transition hover:text-brand"
        >
          Forum
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700 dark:text-slate-200">
          {thread.title}
        </span>
      </nav>

      <article className="space-y-6 rounded-3xl border border-[#E5E7EB] bg-white/95 p-8 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-strong/10 px-3 py-1 font-semibold uppercase tracking-[0.3em] text-brand-strong dark:bg-brand-strong/20 dark:text-brand">
            {thread.category?.name ?? "Forum"}
          </div>
          <span>Dibuat {createdAt}</span>
        </div>
        {thread.reviewCourt && (
          <Link
            href={`/court/${thread.reviewCourt.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-brand-strong/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-strong transition hover:bg-brand/10 dark:bg-brand/20 dark:text-brand"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Review lapangan: {thread.reviewCourt.name}</span>
          </Link>
        )}

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {thread.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>Oleh {thread.author_name ?? "Member CourtEase"}</span>
            <span className="hidden text-slate-300 dark:text-slate-600 sm:inline">
              •
            </span>
            <span>{liveReplyCount} balasan</span>
          </div>
          {thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand">
              {thread.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand/10 px-3 py-1 text-brand dark:bg-brand/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {thread.body && (
          <div className="space-y-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {thread.body.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}
      </article>

      <ThreadReplies
        threadId={thread.id}
        initialReplies={thread.replies}
        onTotalChange={setLiveReplyCount}
      />
    </div>
  );
}
