"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ThreadReplyForm } from "@/components/forum/thread-reply-form";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ForumReply } from "@/lib/supabase/queries/forum";

function sortReplies(replies: ForumReply[]) {
  return [...replies].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

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
  const [replies, setReplies] = useState<ForumReply[]>(
    sortReplies(initialReplies),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const sorted = sortReplies(initialReplies);
    setReplies(sorted);
  }, [initialReplies]);

  useEffect(() => {
    onTotalChange?.(replies.length);
  }, [replies.length, onTotalChange]);

  const refreshReplies = useCallback(async () => {
    const supabase = createClient();
    setIsSyncing(true);
    type ReplyRow = {
      id: string;
      body: string;
      created_at: string;
      author: { full_name: string | null } | null;
    };

    const { data, error } = await supabase
      .from("forum_replies")
      .select("id, body, created_at, author:profiles(full_name)")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    const rows = (Array.isArray(data) ? data : []) as unknown as ReplyRow[];

    if (!error) {
      const mapped = rows.map<ForumReply>((reply) => ({
        id: reply.id,
        body: reply.body,
        created_at: reply.created_at,
        author_name: reply.author?.full_name ?? null,
      }));
      setReplies(mapped);
    }
    setIsSyncing(false);
  }, [threadId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`forum-thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_replies",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          refreshReplies();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, refreshReplies]);

  const replyNames = useMemo(() => {
    return Array.from(
      new Set(
        replies
          .map((reply) => reply.author_name ?? "Member CourtEase")
          .filter(Boolean),
      ),
    );
  }, [replies]);

  const totalReplies = replies.length;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[#E5E7EB] bg-white/95 p-6 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Balasan ({totalReplies})
            </h2>
            {isSyncing && (
              <p className="text-xs text-brand-strong">
                Menyinkronkan balasan terbaru…
              </p>
            )}
          </div>
          {replyNames.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
              <span className="font-semibold uppercase tracking-[0.3em] text-brand-strong">
                Dibalas oleh
              </span>
              {replyNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-[#E5E7EB] px-3 py-1 text-slate-600 dark:bg-slate-800/80 dark:text-slate-200"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        <ul className="mt-6 space-y-4">
          {replies.map((reply) => (
            <li
              key={reply.id}
              className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-5 dark:border-slate-700/70 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {reply.author_name ?? "Member CourtEase"}
                </span>
                <span>
                  {new Date(reply.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                {reply.body}
              </p>
            </li>
          ))}
          {!replies.length && (
            <li className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white/80 p-6 text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400">
              Belum ada balasan. Jadi yang pertama memberi masukan untuk thread
              ini!
            </li>
          )}
        </ul>
        <div className="mt-6 text-right">
          <Button
            type="button"
            variant="outline"
            className="border-brand/60 text-brand-strong transition hover:border-brand hover:bg-brand-strong/10 dark:border-brand/60 dark:text-brand"
            onClick={refreshReplies}
            disabled={isSyncing}
          >
            Segarkan balasan
          </Button>
        </div>
      </div>

      <ThreadReplyForm
        threadId={threadId}
        onReplyCreated={(reply) => {
          setReplies((prev) => sortReplies([...prev, reply]));
        }}
      />
    </section>
  );
}
