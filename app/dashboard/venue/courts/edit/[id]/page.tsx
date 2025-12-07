import { requireRole } from "@/lib/supabase/roles";
import { getAuthenticatedProfile } from "@/lib/supabase/profile";
import { VenueQueries } from "@/lib/queries/venue";
import { redirect } from "next/navigation";
import ClientEditFormWrapper from "./client-edit-form-wrapper";

interface EditCourtPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCourtPage({ params }: EditCourtPageProps) {
  const profile = await requireRole("venue_partner");
  const identity = await getAuthenticatedProfile();

  // Get venue dashboard data using the new query system
  const venueDashboardData = await VenueQueries.getVenueDashboardData(profile.id);

  if (!profile || !venueDashboardData.venue.id) {
    redirect("/dashboard/venue");
  }

  const { id } = await params;

  // Transform venues array for the client component
  const venues = [{
    id: venueDashboardData.venue.id,
    name: venueDashboardData.venue.name,
    city: venueDashboardData.venue.city || "",
    district: venueDashboardData.venue.district
  }];

  return (
    <ClientEditFormWrapper
      profile={profile}
      identity={identity}
      venues={venues}
      courtId={id}
    />
  );
}