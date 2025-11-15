import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "user" | "venue_partner" | "admin";

export type ProfileWithRole = {
  id: string;
  full_name: string | null;
  role: AppRole;
};

export async function getProfileWithRole(): Promise<ProfileWithRole | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error.message);
    return null;
  }

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    full_name: profile.full_name,
    role: profile.role as AppRole,
  };
}

export async function requireRole(
  allowed: AppRole | AppRole[],
  options: { redirectTo?: string } = {},
): Promise<ProfileWithRole> {
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
  const profile = await getProfileWithRole();

  if (!profile) {
    redirect(options.redirectTo ?? "/auth/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect(options.redirectTo ?? "/dashboard");
  }

  return profile;
}
