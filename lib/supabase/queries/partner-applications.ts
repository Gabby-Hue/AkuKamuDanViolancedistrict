import { createClient } from "@/lib/supabase/server";

export type PartnerApplication = {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  facility_types: string[];
  facility_count: number | null;
  existing_system: string | null;
  notes: string | null;
  status: string;
  handled_by: string | null;
  decision_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

type PartnerApplicationRow = {
  id: string;
  organization_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  city: string | null;
  facility_types: string[] | null;
  facility_count: number | null;
  existing_system: string | null;
  notes: string | null;
  status: string;
  handled_by: string | null;
  decision_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function mapPartnerApplicationRow(
  row: PartnerApplicationRow,
): PartnerApplication {
  return {
    id: row.id,
    organization_name: row.organization_name,
    contact_name: row.contact_name,
    contact_email: row.contact_email,
    contact_phone: row.contact_phone ?? null,
    city: row.city ?? null,
    facility_types: Array.isArray(row.facility_types) ? row.facility_types : [],
    facility_count: row.facility_count ?? null,
    existing_system: row.existing_system ?? null,
    notes: row.notes ?? null,
    status: row.status,
    handled_by: row.handled_by ?? null,
    decision_note: row.decision_note ?? null,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at ?? null,
  };
}

export async function getPartnerApplications(
  limit = 10,
): Promise<PartnerApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venue_partner_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch partner applications", error.message);
    return [];
  }

  return ((data ?? []) as PartnerApplicationRow[]).map(
    mapPartnerApplicationRow,
  );
}