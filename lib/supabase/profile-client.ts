import { createClient } from "@/lib/supabase/client";
import type { AuthenticatedProfile } from "./profile";

export async function getAuthenticatedProfileClient(): Promise<AuthenticatedProfile | null> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Failed to load authenticated user", authError?.message || "No user found");
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile details", profileError.message);
    return null;
  }

  const fullName =
    (profile?.full_name as string | null) ??
    (typeof profile?.full_name === "string"
      ? (profile.full_name as string)
      : null);

  const phone =
    (profile?.phone as string | null) ??
    (typeof profile?.phone === "string" ? (profile.phone as string) : null);

  return {
    id: user.id,
    email: user.email ?? "",
    phone: user.phone ?? null,
    fullName,
  };
}