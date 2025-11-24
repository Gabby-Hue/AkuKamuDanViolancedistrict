import type { SupabaseClient } from "@supabase/supabase-js";
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
  author_avatar_url: string | null;
};

export type ForumThreadDetail = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  excerpt: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  view_count: number;
  like_count: number;
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  category: ForumCategory | null;
  reviewCourt: {
    id: string;
    slug: string;
    name: string;
  } | null;
  replies: ForumReply[];
};

export async function getForumThreads(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ threads: ForumThreadSummary[]; hasMore: boolean }> {
  const supabase = await createClient();
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("forum_threads")
    .select(`
      id,
      slug,
      title,
      excerpt,
      reply_count,
      created_at,
      tags,
      category:forum_categories(id, slug, name),
      author:profiles(full_name, avatar_url),
      latest_reply_body,
      latest_reply_at,
      review_court:courts(id, slug, name)
    `)
    .eq("is_pinned", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.category) {
    query = query.eq("category_slug", options.category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch forum threads:", error?.message);
    return { threads: [], hasMore: false };
  }

  const threads = (data ?? []).map((thread) => ({
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt ?? null,
    reply_count: thread.reply_count ?? 0,
    created_at: thread.created_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    category: Array.isArray(thread.category) ? thread.category[0] : thread.category,
    author_name: (thread.author as any)?.full_name ?? null,
    latestReplyBody: thread.latest_reply_body ?? null,
    latestReplyAt: thread.latest_reply_at ?? null,
    reviewCourt: Array.isArray(thread.review_court) ? thread.review_court[0] : thread.review_court,
  }));

  return {
    threads,
    hasMore: threads.length === limit,
  };
}

export async function getForumThreadBySlug(
  slug: string
): Promise<ForumThreadDetail | null> {
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .select(`
      *,
      category:forum_categories(id, slug, name),
      author:profiles(id, full_name, avatar_url),
      review_court:courts(id, slug, name)
    `)
    .eq("slug", slug)
    .single();

  if (error || !thread) {
    console.error("Failed to fetch forum thread:", error?.message);
    return null;
  }

  const { data: replies } = await supabase
    .from("forum_replies")
    .select(`
      id,
      body,
      created_at,
      author:profiles(full_name, avatar_url)
    `)
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true });

  await supabase
    .from("forum_threads")
    .update({ view_count: (thread.view_count ?? 0) + 1 })
    .eq("id", thread.id);

  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    body: thread.body,
    excerpt: thread.excerpt,
    created_at: thread.created_at,
    updated_at: thread.updated_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    view_count: thread.view_count ?? 0,
    like_count: thread.like_count ?? 0,
    author: {
      id: thread.author.id,
      full_name: thread.author.full_name,
      avatar_url: thread.author.avatar_url,
    },
    category: thread.category,
    reviewCourt: thread.review_court,
    replies: (replies ?? []).map((reply) => ({
      id: reply.id,
      body: reply.body,
      created_at: reply.created_at,
      author_name: (reply.author as any)?.full_name ?? null,
      author_avatar_url: (reply.author as any)?.avatar_url ?? null,
    })),
  };
}

export async function createForumThread(data: {
  title: string;
  body: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  reviewCourtId?: string;
  authorId: string;
}): Promise<ForumThreadDetail | null> {
  const supabase = await createClient();

  const slug = generateSlug(data.title);
  const excerpt = data.excerpt ?? generateExcerpt(data.body);

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .insert({
      slug,
      title: data.title,
      body: data.body,
      excerpt,
      category_id: data.categoryId ?? null,
      tags: data.tags ?? [],
      review_court_id: data.reviewCourtId ?? null,
      author_id: data.authorId,
    })
    .select(`
      *,
      category:forum_categories(id, slug, name),
      author:profiles(id, full_name, avatar_url),
      review_court:courts(id, slug, name)
    `)
    .single();

  if (error || !thread) {
    console.error("Failed to create forum thread:", error?.message);
    return null;
  }

  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    body: thread.body,
    excerpt: thread.excerpt,
    created_at: thread.created_at,
    updated_at: thread.updated_at,
    tags: Array.isArray(thread.tags) ? thread.tags : [],
    view_count: thread.view_count ?? 0,
    like_count: thread.like_count ?? 0,
    author: {
      id: thread.author.id,
      full_name: thread.author.full_name,
      avatar_url: thread.author.avatar_url,
    },
    category: thread.category,
    reviewCourt: thread.review_court,
    replies: [],
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

function generateExcerpt(body: string, length: number = 200): string {
  const clean = body.replace(/[#*`\[\]]/g, "").trim();
  return clean.length > length ? clean.substring(0, length) + "..." : clean;
}