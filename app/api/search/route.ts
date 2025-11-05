import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_RESULTS = 15;

// ---- Types untuk hasil query Supabase (minim tapi ketat) ----
type CourtSummary = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  venue_name: string;
  venue_city: string | null;
};

type VenueRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
};

type ForumCategoryObj = { name?: string | null };
type ForumCategory = ForumCategoryObj | ForumCategoryObj[] | null | undefined;

type ForumThreadRow = {
  id: string;
  slug: string;
  title: string;
  // Supabase bisa kembalikan relasi sebagai object atau array tergantung relasi
  category: ForumCategory;
};

// Helper aman tanpa any
function getCategoryName(cat: ForumCategory): string | null {
  if (Array.isArray(cat)) {
    return cat[0]?.name ?? null ?? null;
  }
  return cat?.name ?? null ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ data: [] });
  }

  const supabase = await createClient();

  const escapeLike = (value: string) =>
    value.replace(/[\\%_]/g, (char) => `\\${char}`);
  const ilike = `%${escapeLike(query)}%`;

  const [courtsRes, venuesRes, threadsRes] = await Promise.all([
    supabase
      .from("court_summaries")
      .select("id, slug, name, sport, venue_name, venue_city")
      .or(
        [
          `name.ilike.${ilike}`,
          `sport.ilike.${ilike}`,
          `venue_name.ilike.${ilike}`,
          `venue_city.ilike.${ilike}`,
        ].join(","),
      )
      .limit(5)
      .returns<CourtSummary[]>(),

    supabase
      .from("venues")
      .select("id, slug, name, city")
      .or([`name.ilike.${ilike}`, `city.ilike.${ilike}`].join(","))
      .limit(5)
      .returns<VenueRow[]>(),

    supabase
      .from("forum_threads")
      .select("id, slug, title, category:forum_categories(name)")
      .ilike("title", ilike)
      .limit(5)
      .returns<ForumThreadRow[]>(),
  ]);

  const results: Array<{
    type: "court" | "venue" | "forum";
    title: string;
    description: string;
    href: string;
  }> = [];

  if (!courtsRes.error) {
    for (const court of courtsRes.data ?? []) {
      results.push({
        type: "court",
        title: court.name,
        description: `${court.sport} • ${court.venue_name}${
          court.venue_city ? ` • ${court.venue_city}` : ""
        }`,
        href: `/court/${court.slug}`,
      });
    }
  }

  if (!venuesRes.error) {
    for (const venue of venuesRes.data ?? []) {
      results.push({
        type: "venue",
        title: venue.name,
        description: venue.city ? `Venue • ${venue.city}` : "Venue",
        href: `/venues/${venue.slug}`,
      });
    }
  }

  if (!threadsRes.error) {
    for (const thread of threadsRes.data ?? []) {
      const categoryName = getCategoryName(thread.category);
      results.push({
        type: "forum",
        title: thread.title,
        description: categoryName ? `Forum • ${categoryName}` : "Forum",
        href: `/forum/${thread.slug}`,
      });
    }
  }

  const uniqueResults = results.slice(0, MAX_RESULTS);
  return NextResponse.json({ data: uniqueResults });
}
