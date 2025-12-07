import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { VenueQueries } from "@/lib/queries/venue";
import ClientImagesWrapper from "./client-images-wrapper";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourtImagesPage({ params }: PageProps) {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();
  const { id: courtId } = await params;

  // Get venue dashboard data using the new query system
  const venueDashboardData = await VenueQueries.getVenueDashboardData(
    profile.id,
  );

  if (!venueDashboardData.venue.id) {
    throw new Error("Venue tidak ditemukan");
  }

  // Transform venues array for the client component
  const venues = [
    {
      id: venueDashboardData.venue.id,
      name: venueDashboardData.venue.name,
      city: venueDashboardData.venue.city || "",
    },
  ];

  return (
    <ClientImagesWrapper
      profile={profile}
      identity={identity}
      venues={venues}
      courtId={courtId}
    />
  );
}
