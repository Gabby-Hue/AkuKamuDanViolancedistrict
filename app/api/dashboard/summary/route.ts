import { NextResponse } from "next/server";
import {
  fetchAdminMetrics,
  fetchCourtSummaries,
  fetchForumThreads,
} from "@/lib/supabase/queries";

export async function GET() {
  const [metrics, courts, threads] = await Promise.all([
    fetchAdminMetrics(),
    fetchCourtSummaries(),
    fetchForumThreads(),
  ]);

  return NextResponse.json({
    data: {
      totals: metrics,
      venues: courts,
      threads,
    },
  });
}
