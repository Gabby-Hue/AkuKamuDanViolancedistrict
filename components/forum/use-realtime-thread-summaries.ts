"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { ForumThreadSummary } from "@/lib/supabase/queries/forum";

type ForumReplyPayload = {
  thread_id: string;
  body: string;
  created_at: string;
};

type ForumThreadPayload = {
  id: string;
  title?: string | null;
  excerpt?: string | null;
  reply_count?: number | null;
};

export function useRealtimeThreadSummaries(
  initialThreads: ForumThreadSummary[],
): ForumThreadSummary[] {
  const [threads, setThreads] = useState<ForumThreadSummary[]>(initialThreads);

  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("forum-thread-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "forum_replies" },
        (payload) => {
          const reply = payload.new as ForumReplyPayload;
          setThreads((prev) => {
            const index = prev.findIndex(
              (thread) => thread.id === reply.thread_id,
            );
            if (index === -1) {
              return prev;
            }
            const next = [...prev];
            const current = next[index];
            next[index] = {
              ...current,
              reply_count: current.reply_count + 1,
              latestReplyBody: reply.body ?? current.latestReplyBody,
              latestReplyAt: reply.created_at ?? current.latestReplyAt,
            };
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "forum_threads" },
        (payload) => {
          const updated = payload.new as ForumThreadPayload;
          setThreads((prev) => {
            const index = prev.findIndex((thread) => thread.id === updated.id);
            if (index === -1) {
              return prev;
            }
            const next = [...prev];
            const current = next[index];
            next[index] = {
              ...current,
              title: updated.title ?? current.title,
              excerpt:
                typeof updated.excerpt === "string"
                  ? updated.excerpt
                  : current.excerpt,
              reply_count:
                typeof updated.reply_count === "number"
                  ? updated.reply_count
                  : current.reply_count,
            };
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return threads;
}
