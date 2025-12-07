import { notFound } from "next/navigation";

import { ThreadDiscussion } from "@/components/forum/thread-discussion";
import { PublicQueries } from "@/lib/queries/public";
import type { ForumReply } from "@/lib/queries/types";

export default async function ForumThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [thread, replies] = await Promise.all([
    PublicQueries.getForumThreadDetail(slug),
    PublicQueries.getForumRepliesBySlug(slug), // We'll create this method
  ]);

  if (!thread) {
    notFound();
  }

  return <ThreadDiscussion thread={thread} replies={replies} />;
}
