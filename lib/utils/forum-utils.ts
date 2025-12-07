import type { ForumReply } from "@/lib/queries/types";

export function sortReplies(replies: ForumReply[]) {
  return [...replies].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}