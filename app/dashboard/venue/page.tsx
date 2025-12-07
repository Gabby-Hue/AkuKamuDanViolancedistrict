import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import VenueDashboardView from "./venue-dashboard-view";
import { VenueQueries } from "@/lib/queries/venue";

export default async function Page() {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();

  // Get real venue dashboard data using the new query system
  const venueDashboardData = await VenueQueries.getVenueDashboardData(profile.id);

  // Transform venues array for the view component
  const venues = [{
    id: venueDashboardData.venue.id,
    name: venueDashboardData.venue.name,
    city: venueDashboardData.venue.city || "",
      }];

  return (
    <VenueDashboardView
      profile={profile}
      identity={identity}
      venues={venues}
      revenueData={null}
      venueStats={venueDashboardData}
    />
  );
}
