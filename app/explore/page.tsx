import { ExploreView } from "@/components/explore/explore-view";
import { fetchExploreData } from "@/lib/supabase/queries";

export const revalidate = 0;

type ExplorePageProps = {
  searchParams?: {
    sport?: string;
  };
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const data = await fetchExploreData();
  const initialSport =
    typeof searchParams?.sport === "string"
      ? decodeURIComponent(searchParams.sport)
      : undefined;

  return (
    <ExploreView
      courts={data.courts}
      initialSport={initialSport}
      threads={data.threads}
      totalReplies={data.totalReplies}
    />
  );
}
