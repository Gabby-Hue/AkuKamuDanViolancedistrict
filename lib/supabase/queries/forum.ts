import { createClient } from "@/lib/supabase/server";

export type ForumCategory = {
  id: string;
  slug: string;
  name: string;
};

export type ForumThreadSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reply_count: number;
  created_at: string;
  tags: string[];
  category: ForumCategory | null;
  author_name: string | null;
  latestReplyBody: string | null;
  latestReplyAt: string | null;
  reviewCourt: {
    id: string;
    slug: string;
    name: string;
  } | null;
};

export type ForumReply = {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
};

export type ForumThreadDetail = ForumThreadSummary & {
  body: string | null;
  replies: ForumReply[];
};

type ForumThreadRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reply_count: number | null;
  created_at: string;
  tags: string[] | null;
  body?: string | null;
  category: {
    id: string;
    slug: string;
    name: string;
  } | null;
  author: {
    full_name: string | null;
  } | null;
};

type ForumReplyDetailRow = {
  id: string;
  body: string;
  created_at: string;
  author: { full_name: string | null } | null;
};

type LatestThreadReplyRow = {
  thread_id: string;
  latest_reply_body: string | null;
  latest_reply_created_at: string | null;
};

type ReviewThreadLinkRow = {
  forum_thread_id: string;
  court:
    | { id: string; slug: string; name: string }
    | Array<{ id: string; slug: string; name: string }>
    | null;
};

async function attachLatestReplyMetadata(
  supabase: Awaited<ReturnType<typeof createClient>>,
  threads: ForumThreadSummary[],
): Promise<ForumThreadSummary[]> {
  const threadIds = threads.map((thread) => thread.id);
  if (!threadIds.length) {
    return threads;
  }

  const { data, error } = await supabase
    .from("forum_thread_latest_activity")
    .select("thread_id, latest_reply_body, latest_reply_created_at")
    .in("thread_id", threadIds);

  if (error) {
    console.error("Failed to fetch latest forum replies", error.message);
    return threads;
  }

  const latestMap = new Map<string, LatestThreadReplyRow>();
  ((data ?? []) as LatestThreadReplyRow[]).forEach((row) => {
    latestMap.set(row.thread_id, row);
  });

  return threads.map((thread) => {
    const latest = latestMap.get(thread.id);
    return {
      ...thread,
      latestReplyBody: latest?.latest_reply_body ?? null,
      latestReplyAt: latest?.latest_reply_created_at ?? null,
    };
  });
}

export async function fetchForumCategories(): Promise<ForumCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_categories")
    .select("id, slug, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch forum categories", error.message);
    return [];
  }

  return data ?? [];
}

export async function fetchForumThreads(): Promise<ForumThreadSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_threads")
    .select(
      `id, slug, title, excerpt, reply_count, created_at, tags,
       category:forum_categories(id, slug, name),
       author:profiles(full_name)`,
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to fetch forum threads", error.message);
    return [];
  }

  const threadRows = (data ?? []) as unknown as ForumThreadRow[];
  const threadIds = threadRows.map((thread) => thread.id);
  const reviewMap = new Map<
    string,
    { id: string; slug: string; name: string }
  >();

  if (threadIds.length) {
    const { data: reviewRefs, error: reviewError } = await supabase
      .from("court_reviews")
      .select("forum_thread_id, court:courts(id, slug, name)")
      .in("forum_thread_id", threadIds);

    if (reviewError) {
      console.error("Failed to fetch review thread links", reviewError.message);
    } else {
      ((reviewRefs ?? []) as ReviewThreadLinkRow[]).forEach((row) => {
        const courtRecord = Array.isArray(row.court) ? row.court[0] : row.court;
        if (courtRecord) {
          reviewMap.set(row.forum_thread_id, {
            id: courtRecord.id,
            slug: courtRecord.slug,
            name: courtRecord.name,
          });
        }
      });
    }
  }

  const threadSummaries = threadRows.map((thread) => ({
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt ?? null,
    reply_count: Number(thread.reply_count ?? 0),
    created_at: thread.created_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    category: thread.category
      ? {
          id: thread.category.id,
          slug: thread.category.slug,
          name: thread.category.name,
        }
      : null,
    author_name: thread.author?.full_name ?? null,
    latestReplyBody: null,
    latestReplyAt: null,
    reviewCourt: reviewMap.get(thread.id) ?? null,
  }));

  return attachLatestReplyMetadata(supabase, threadSummaries);
}

export async function fetchForumThreadDetail(
  slug: string,
): Promise<ForumThreadDetail | null> {
  const supabase = await createClient();

  const { data: threadRowData, error } = await supabase
    .from("forum_threads")
    .select(
      `id, slug, title, body, excerpt, reply_count, created_at, tags,
       category:forum_categories(id, slug, name),
       author:profiles(full_name)`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch forum thread detail", error.message);
    return null;
  }

  const threadRow = (threadRowData ?? null) as ForumThreadRow | null;

  if (!threadRow) {
    return null;
  }

  let reviewCourt: { id: string; slug: string; name: string } | null = null;
  const { data: reviewDetail, error: reviewDetailError } = await supabase
    .from("court_reviews")
    .select("court:courts(id, slug, name)")
    .eq("forum_thread_id", threadRow.id)
    .maybeSingle();

  if (reviewDetailError) {
    console.error("Failed to fetch review context", reviewDetailError.message);
  } else if (reviewDetail) {
    const row = reviewDetail as ReviewThreadLinkRow;
    const courtRecord = Array.isArray(row.court) ? row.court[0] : row.court;
    if (courtRecord) {
      reviewCourt = {
        id: courtRecord.id,
        slug: courtRecord.slug,
        name: courtRecord.name,
      };
    }
  }

  const { data: repliesData, error: repliesError } = await supabase
    .from("forum_replies")
    .select(`id, body, created_at, author:profiles(full_name)`)
    .eq("thread_id", threadRow.id)
    .order("created_at", { ascending: true });

  if (repliesError) {
    console.error("Failed to fetch replies", repliesError.message);
  }

  const replyRows = (repliesData ?? []) as unknown as ForumReplyDetailRow[];
  const replies = replyRows.map((reply) => ({
    id: reply.id,
    body: reply.body,
    created_at: reply.created_at,
    author_name: reply.author?.full_name ?? null,
  }));

  const latestReply = replies.length ? replies[replies.length - 1] : null;

  return {
    id: threadRow.id,
    slug: threadRow.slug,
    title: threadRow.title,
    body: threadRow.body ?? null,
    excerpt: threadRow.excerpt ?? null,
    reply_count: Number(threadRow.reply_count ?? 0),
    created_at: threadRow.created_at,
    tags: Array.isArray(threadRow.tags) ? threadRow.tags : [],
    category: threadRow.category
      ? {
          id: threadRow.category.id,
          slug: threadRow.category.slug,
          name: threadRow.category.name,
        }
      : null,
    author_name: threadRow.author?.full_name ?? null,
    latestReplyBody: latestReply?.body ?? null,
    latestReplyAt: latestReply?.created_at ?? null,
    replies,
    reviewCourt,
  };
}
