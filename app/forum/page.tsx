export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { ForumView } from "@/components/forum/forum-view";
import { PublicQueries } from "@/lib/queries/public";
import { toForumThreadSummary } from "@/lib/queries/adapters";
import type { ForumCategory, ForumThreadSummary } from "@/lib/queries/types";

export default async function ForumPage() {
  const [categories, threads] = await Promise.all([
    PublicQueries.getForumCategories(),
    PublicQueries.getForumThreads({ limit: 50 }),
  ]);

  // Transform threads to match component expectations
  const adaptedThreads = threads.map(toForumThreadSummary);

  return <ForumView categories={categories} threads={adaptedThreads} />;
}
