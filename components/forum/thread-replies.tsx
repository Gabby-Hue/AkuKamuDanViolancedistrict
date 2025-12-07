"use client";

import { ThreadReplyForm } from "@/components/forum/thread-reply-form";
import { Button } from "@/components/ui/button";
import { sortReplies } from "@/lib/utils/forum-utils";
import { refreshForumThread } from "./forum-actions";
import type { ForumReply } from "@/lib/queries/types";

type ThreadRepliesProps = {
  threadId: string;
  initialReplies: ForumReply[];
  onTotalChange?: (count: number) => void;
};

export function ThreadReplies({
  threadId,
  initialReplies,
  onTotalChange,
}: ThreadRepliesProps) {
  const sortedReplies = sortReplies(initialReplies);

  // Report total to parent
  if (onTotalChange) {
    onTotalChange(sortedReplies.length);
  }

  const handleReplyCreated = async (reply: ForumReply) => {
    // Revalidate the forum thread path to refresh server-side data
    await refreshForumThread();
  };

  const replyNames = Array.from(
    new Set(
      sortedReplies
        .map((reply) => reply.authorName ?? "Member CourtEase")
        .filter(Boolean),
    ),
  );

  const totalReplies = sortedReplies.length;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[#E5E7EB] bg-white/95 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Balasan ({totalReplies})
            </h2>
          </div>
          {replyNames.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold uppercase tracking-[0.3em] text-brand-strong">
                Dibalas oleh
              </span>
              {replyNames.map((name, index) => (
                <span key={index}>{name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {sortedReplies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 transition-colors hover:bg-slate-100/50 dark:border-slate-700/60 dark:bg-slate-800/30 dark:hover:bg-slate-700/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {reply.authorName}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(reply.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {reply.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalReplies === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Belum ada balasan. Jadilah yang pertama!
            </p>
          </div>
        )}
      </div>

      <ThreadReplyForm threadId={threadId} onReplyCreated={handleReplyCreated} />
    </section>
  );
}