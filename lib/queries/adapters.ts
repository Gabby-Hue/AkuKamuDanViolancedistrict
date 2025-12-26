import type {
  Court,
  CourtSummary,
  ForumThread,
  ForumThreadSummary,
} from "@/lib/queries/types";

export function toCourtSummary(court: Court): CourtSummary {
  return {
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface ?? null,
    pricePerHour: court.pricePerHour,
    capacity: court.capacity ?? null,
    facilities: court.facilities,
    description: court.description ?? null,
    venueName: court.venueName,
    venueCity: court.venueCity ?? null,
    venueLatitude: court.venueLatitude ?? null,
    venueLongitude: court.venueLongitude ?? null,
    primaryImageUrl: court.primaryImageUrl ?? null,
    averageRating: court.averageRating,
    reviewCount: court.reviewCount,
  };
}

export function toForumThreadSummary(
  thread: ForumThread,
): ForumThreadSummary {
  return {
    id: thread.id,
    slug: thread.slug,
    title: thread.title,
    excerpt: thread.excerpt ?? null,
    reply_count: thread.replyCount,
    created_at: thread.createdAt,
    tags: thread.tags,
    category: thread.category ?? null,
    author_name: thread.author ?? null,
    latestReplyBody: null,
    latestReplyAt: null,
    reviewCourt: null,
  };
}
