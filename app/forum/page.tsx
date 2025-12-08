export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ForumView } from "@/components/forum/forum-view";
import { PublicQueries } from "@/lib/queries/public";
import type { ForumThread, ForumCategory, ForumThreadSummary } from "@/lib/queries/types";

// Adapter function to transform ForumThread to ForumThreadSummary interface
function adaptThreadToSummary(thread: ForumThread) {
  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt || null,
    reply_count: thread.replyCount,
    created_at: thread.createdAt,
    tags: thread.tags,
    category: thread.category || null,
    author_name: thread.author || null,
    latestReplyBody: null, // Would need additional data fetching
    latestReplyAt: null,   // Would need additional data fetching
    reviewCourt: null,     // Would need additional data fetching
  };
}

export default async function ForumPage() {
  const [categories, threads] = await Promise.all([
    PublicQueries.getForumCategories(),
    PublicQueries.getForumThreads({ limit: 50 }),
  ]);

  // Transform threads to match component expectations
  const adaptedThreads = threads.map(adaptThreadToSummary);

  return <ForumView categories={categories} threads={adaptedThreads} />;
}
