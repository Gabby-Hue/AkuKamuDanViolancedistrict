import { NextResponse } from "next/server";
import { fetchCourtSummaries } from "@/lib/supabase/queries";

export async function GET() {
  const courts = await fetchCourtSummaries();
  return NextResponse.json({ data: courts });
}
