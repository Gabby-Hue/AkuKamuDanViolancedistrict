export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { VenueQueries } from "@/lib/queries/venue";
import ClientFormWrapper from "./client-form-wrapper";

export default async function AddCourtPage() {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();

  // Get venue dashboard data using the new query system
  const venueDashboardData = await VenueQueries.getVenueDashboardData(
    profile.id,
  );

  // Transform venues array for the client component
  const venues = [
    {
      id: venueDashboardData.venue.id,
      name: venueDashboardData.venue.name,
      city: venueDashboardData.venue.city || "",
    },
  ];

  return (
    <ClientFormWrapper profile={profile} identity={identity} venues={venues} />
  );
}
