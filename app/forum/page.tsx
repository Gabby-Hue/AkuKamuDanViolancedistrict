import { ForumView } from "@/components/forum/forum-view";
import {
  fetchForumCategories,
  fetchForumThreads,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function ForumPage() {
  const [categories, threads] = await Promise.all([
    fetchForumCategories(),
    fetchForumThreads(),
  ]);

  return <ForumView categories={categories} threads={threads} />;
}
