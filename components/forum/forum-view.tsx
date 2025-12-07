"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Users, TrendingUp, Hash } from "lucide-react";
import { ForumThreadComposer } from "@/components/forum/forum-thread-composer";
import { ForumThreadList } from "@/components/forum/forum-thread-list";
import { Badge } from "@/components/ui/badge";
import type { ForumCategory, ForumThreadSummary } from "@/lib/queries/types";

type ForumViewProps = {
  categories: ForumCategory[];
  threads: ForumThreadSummary[];
};

export function ForumView({ categories, threads }: ForumViewProps) {
  const [liveThreads, setLiveThreads] = useState(threads);

  useEffect(() => {
    setLiveThreads(threads);
  }, [threads]);

  const totalReplies = threads.reduce(
    (sum, thread) => sum + thread.reply_count,
    0,
  );
  const activeCategories = categories.filter((cat) =>
    threads.some((thread) => thread.category?.id === cat.id),
  ).length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Komunitas Forum
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <ForumThreadComposer
            categories={categories}
            onThreadCreated={(thread) => {
              setLiveThreads((prev) => [thread, ...prev]);
            }}
          />

          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-6 py-3 text-sm font-medium text-brand dark:bg-brand/20 dark:text-brand-contrast">
              {liveThreads.length} diskusi sedang berlangsung
            </div>
          </div>

          <ForumThreadList categories={categories} threads={liveThreads} />
        </div>
      </div>
    </div>
  );
}
