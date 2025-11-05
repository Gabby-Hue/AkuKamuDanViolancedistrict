import { NextResponse } from "next/server";
import { fetchForumThreads } from "@/lib/supabase/queries";

export async function GET() {
  const threads = await fetchForumThreads();
  return NextResponse.json({ data: threads });
}
