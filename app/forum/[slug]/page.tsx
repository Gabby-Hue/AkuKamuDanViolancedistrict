import { notFound } from "next/navigation";

import { ThreadDiscussion } from "@/components/forum/thread-discussion";
import { PublicQueries } from "@/lib/queries/public";

export default async function ForumThreadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const thread = await PublicQueries.getForumThreadDetail(slug);

  if (!thread) {
    notFound();
  }

  return <ThreadDiscussion thread={thread} />;
}
