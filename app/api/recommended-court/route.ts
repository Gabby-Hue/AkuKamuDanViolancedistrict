import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_RECOMMENDATIONS = 5;

const FALLBACK_RECOMMENDATIONS: CourtSummaryRow[] = [
  {
    id: "fallback-1",
    slug: "sunrise-sports-hub",
    name: "Sunrise Sports Hub",
    venue_name: "Arena Sunrise",
    venue_city: "Jakarta",
    price_per_hour: 180_000,
    average_rating: 4.8,
  },
  {
    id: "fallback-2",
    slug: "lagoon-futsal-prime",
    name: "Lagoon Futsal Prime",
    venue_name: "Lagoon Dome",
    venue_city: "Bandung",
    price_per_hour: 150_000,
    average_rating: 4.7,
  },
  {
    id: "fallback-3",
    slug: "nusa-badminton-club",
    name: "Nusa Badminton Club",
    venue_name: "Gor Nusa Indah",
    venue_city: "Surabaya",
    price_per_hour: 120_000,
    average_rating: 4.6,
  },
];

type CourtSummaryRow = {
  id: string;
  slug: string;
  name: string;
  venue_name: string;
  venue_city: string | null;
  price_per_hour: number | null;
  average_rating: number | null;
};

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_summaries")
    .select(
      "id, slug, name, venue_name, venue_city, price_per_hour, average_rating",
    )
    .order("average_rating", { ascending: false })
    .limit(MAX_RECOMMENDATIONS)
    .returns<CourtSummaryRow[]>();

  if (error) {
    console.error("Failed to fetch recommended courts", error.message);
  }

  const rows = !error ? (data ?? []) : [];
  const source = rows.length > 0 ? rows : FALLBACK_RECOMMENDATIONS;

  const recommendations = source.map((court) => ({
    id: court.id,
    slug: court.slug,
    name: court.name,
    venueName: court.venue_name,
    venueCity: court.venue_city,
    pricePerHour: court.price_per_hour,
    averageRating: court.average_rating,
  }));

  return NextResponse.json({ data: recommendations });
}
