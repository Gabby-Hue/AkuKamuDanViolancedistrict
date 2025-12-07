import { ExploreView } from "@/components/explore/explore-view";
import { PublicQueries } from "@/lib/queries/public";
import type { Court, ForumThread } from "@/lib/queries/types";

export const revalidate = 0;

// Adapter function to transform Court to CourtSummary interface
function adaptCourtToSummary(court: Court) {
  return {
    id: court.id,
    slug: court.slug,
    name: court.name,
    sport: court.sport,
    surface: court.surface || null,
    pricePerHour: court.pricePerHour,
    capacity: court.capacity || null,
    facilities: court.facilities,
    description: court.description || null,
    venueName: court.venueName,
    venueCity: court.venueCity || null,
    venueLatitude: court.venueLatitude || null,
    venueLongitude: court.venueLongitude || null,
    primaryImageUrl: court.primaryImageUrl || null,
    averageRating: court.averageRating,
    reviewCount: court.reviewCount,
  };
}

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
    latestReplyAt: null, // Would need additional data fetching
    reviewCourt: null, // Would need additional data fetching
  };
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  // Get sport filter from URL parameters
  const params = await searchParams;
  const sportFilter = params.sport;

  // Fetch ALL courts and threads (no server-side filtering)
  const [courts, threads] = await Promise.all([
    PublicQueries.getActiveCourts({
      limit: 100,
    }), // Get ALL courts for client-side filtering
    PublicQueries.getForumThreads({ limit: 20 }), // Get recent forum threads
  ]);

  // Transform data to match component expectations
  const adaptedCourts = courts.map(adaptCourtToSummary);
  const adaptedThreads = threads.map(adaptThreadToSummary);

  // Calculate total replies from threads
  const totalReplies = threads.reduce(
    (sum, thread) => sum + thread.replyCount,
    0,
  );

  return (
    <ExploreView
      courts={adaptedCourts}
      threads={adaptedThreads}
      totalReplies={totalReplies}
      selectedSport={sportFilter}
    />
  );
}
