import { createClient } from "@/lib/supabase/server";
import type {
  CourtBlackoutRow,
  CourtRow,
  VenueRow
} from "@/lib/api/types";

export type VenueBlackout = {
  id: string;
  courtId: string;
  courtName: string;
  courtSport: string;
  title: string;
  notes: string | null;
  scope: "time_range" | "full_day";
  frequency: "once" | "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  repeatDayOfWeek: number | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  venueId: string;
  venueName: string;
};

export type VenueBlackoutMetrics = {
  totalBlackouts: number;
  activeBlackouts: number;
  upcomingBlackouts: number;
  affectedCourts: number;
  mostAffectedCourt: string;
  totalAffectedHours: number;
  totalCourts: number;
};

export async function getVenueBlackouts(
  venueId: string,
  filters?: {
    courtId?: string;
    dateFrom?: string;
    dateTo?: string;
    frequency?: string[];
    isActive?: boolean;
  }
): Promise<VenueBlackout[]> {
  const supabase = await createClient();

  let query = supabase
    .from("court_blackouts")
    .select(`
      id,
      court_id,
      title,
      notes,
      scope,
      frequency,
      start_date,
      end_date,
      start_time,
      end_time,
      repeat_day_of_week,
      created_by,
      created_at,
      updated_at,
      court:courts(name, sport, venue_id),
      venue:venues(name)
    `)
    .eq("court.venue_id", venueId)
    .order("start_date", { ascending: true });

  if (filters?.courtId) {
    query = query.eq("court_id", filters.courtId);
  }

  if (filters?.dateFrom) {
    query = query.gte("start_date", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("end_date", filters.dateTo);
  }

  if (filters?.frequency && filters.frequency.length > 0) {
    query = query.in("frequency", filters.frequency);
  }

  if (filters?.isActive !== undefined) {
    const today = new Date().toISOString().split('T')[0];
    if (filters.isActive) {
      query = query.lte("start_date", today).gte("end_date", today);
    } else {
      query = query.or(`start_date.gt.${today},end_date.lt.${today}`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch venue blackouts:", error);
    return [];
  }

  return (data ?? []).map((blackout: any) => ({
    id: blackout.id,
    courtId: blackout.court_id,
    courtName: blackout.court?.name || "Unknown Court",
    courtSport: blackout.court?.sport || "Unknown",
    title: blackout.title,
    notes: blackout.notes,
    scope: blackout.scope as "time_range" | "full_day",
    frequency: blackout.frequency as "once" | "daily" | "weekly" | "monthly",
    startDate: blackout.start_date,
    endDate: blackout.end_date,
    startTime: blackout.start_time,
    endTime: blackout.end_time,
    repeatDayOfWeek: blackout.repeat_day_of_week,
    createdBy: blackout.created_by,
    createdAt: blackout.created_at,
    updatedAt: blackout.updated_at,
    venueId: blackout.court?.venue_id || venueId,
    venueName: blackout.venue?.name || "Unknown Venue",
  }));
}

export async function getVenueBlackoutMetrics(
  venueId: string
): Promise<VenueBlackoutMetrics> {
  const supabase = await createClient();

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [totalResult, activeResult, upcomingResult, courtsResult] = await Promise.all([
    // Total blackouts
    supabase
      .from("court_blackouts")
      .select("id, court_id, scope, start_date, end_date, start_time, end_time")
      .eq("court.venue_id", venueId),

    // Active blackouts (ongoing today)
    supabase
      .from("court_blackouts")
      .select("id, court_id, scope, start_date, end_date, start_time, end_time")
      .eq("court.venue_id", venueId)
      .lte("start_date", today)
      .gte("end_date", today),

    // Upcoming blackouts (next 30 days)
    supabase
      .from("court_blackouts")
      .select("id, court_id, scope, start_date, end_date, start_time, end_time")
      .eq("court.venue_id", venueId)
      .gt("start_date", today)
      .lte("start_date", thirtyDaysFromNow.toISOString().split('T')[0])
      .order("start_date", { ascending: true })
      .limit(10),

    // Venue courts
    supabase
      .from("courts")
      .select("id, name")
      .eq("venue_id", venueId)
      .eq("is_active", true),
  ]);

  const totalBlackouts = (totalResult.data ?? []).length;
  const activeBlackouts = (activeResult.data ?? []).length;
  const upcomingBlackouts = (upcomingResult.data ?? []).length;
  const affectedCourts = new Set(
    (totalResult.data ?? []).map((b: any) => b.court_id)
  ).size;

  // Calculate most affected court
  const courtBlackoutCounts = new Map<string, number>();
  (totalResult.data ?? []).forEach((blackout: any) => {
    const current = courtBlackoutCounts.get(blackout.court_id) ?? 0;
    courtBlackoutCounts.set(blackout.court_id, current + 1);
  });

  const courts = courtsResult.data ?? [];
  const mostAffectedCourtId = Array.from(courtBlackoutCounts.entries())
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  const mostAffectedCourt = courts.find((c: any) => c.id === mostAffectedCourtId)?.name || "None";

  // Calculate total affected hours (simplified calculation)
  const totalAffectedHours = (activeResult.data ?? []).reduce((sum: number, blackout: any) => {
    if (blackout.scope === 'full_day') {
      return sum + 24; // Full day = 24 hours
    } else if (blackout.start_time && blackout.end_time) {
      const start = new Date(`2000-01-01T${blackout.start_time}`);
      const end = new Date(`2000-01-01T${blackout.end_time}`);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }
    return sum;
  }, 0);

  return {
    totalBlackouts,
    activeBlackouts,
    upcomingBlackouts,
    affectedCourts,
    mostAffectedCourt,
    totalAffectedHours,
    totalCourts: courts.length,
  };
}

export async function createCourtBlackout(
  venueId: string,
  blackoutData: {
    courtId: string;
    title: string;
    notes?: string;
    scope: "time_range" | "full_day";
    frequency: "once" | "daily" | "weekly" | "monthly";
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    repeatDayOfWeek?: number;
  },
  createdBy?: string
): Promise<{ success: boolean; blackoutId?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("court_blackouts")
    .insert({
      court_id: blackoutData.courtId,
      title: blackoutData.title,
      notes: blackoutData.notes || null,
      scope: blackoutData.scope,
      frequency: blackoutData.frequency,
      start_date: blackoutData.startDate,
      end_date: blackoutData.endDate,
      start_time: blackoutData.startTime || null,
      end_time: blackoutData.endTime || null,
      repeat_day_of_week: blackoutData.repeatDayOfWeek || null,
      created_by: createdBy || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create court blackout:", error);
    return { success: false, error: error.message };
  }

  return { success: true, blackoutId: data.id };
}

export async function updateCourtBlackout(
  blackoutId: string,
  blackoutData: {
    title?: string;
    notes?: string;
    scope?: "time_range" | "full_day";
    frequency?: "once" | "daily" | "weekly" | "monthly";
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    repeatDayOfWeek?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (blackoutData.title !== undefined) updateData.title = blackoutData.title;
  if (blackoutData.notes !== undefined) updateData.notes = blackoutData.notes;
  if (blackoutData.scope !== undefined) updateData.scope = blackoutData.scope;
  if (blackoutData.frequency !== undefined) updateData.frequency = blackoutData.frequency;
  if (blackoutData.startDate !== undefined) updateData.start_date = blackoutData.startDate;
  if (blackoutData.endDate !== undefined) updateData.end_date = blackoutData.endDate;
  if (blackoutData.startTime !== undefined) updateData.start_time = blackoutData.startTime;
  if (blackoutData.endTime !== undefined) updateData.end_time = blackoutData.endTime;
  if (blackoutData.repeatDayOfWeek !== undefined) updateData.repeat_day_of_week = blackoutData.repeatDayOfWeek;

  const { error } = await supabase
    .from("court_blackouts")
    .update(updateData)
    .eq("id", blackoutId);

  if (error) {
    console.error("Failed to update court blackout:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCourtBlackout(
  blackoutId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("court_blackouts")
    .delete()
    .eq("id", blackoutId);

  if (error) {
    console.error("Failed to delete court blackout:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getVenueCourtsForBlackout(
  venueId: string
): Promise<Array<{
  id: string;
  name: string;
  sport: string;
}>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courts")
    .select("id, name, sport")
    .eq("venue_id", venueId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to fetch venue courts for blackout:", error);
    return [];
  }

  return (data ?? []).map((court: any) => ({
    id: court.id,
    name: court.name,
    sport: court.sport,
  }));
}