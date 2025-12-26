import { ExploreView } from "@/components/explore/explore-view";
import { PublicQueries } from "@/lib/queries/public";
import { toCourtSummary, toForumThreadSummary } from "@/lib/queries/adapters";
import type { CourtSummary } from "@/lib/queries/types";

export const revalidate = 0;

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
  const adaptedCourts: CourtSummary[] = courts.map(toCourtSummary);
  const adaptedThreads = threads.map(toForumThreadSummary);

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
