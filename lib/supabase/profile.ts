import { createClient } from "@/lib/supabase/server";

export type AuthenticatedProfile = {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
};

// Note: This function should only be used in Server Components
// For Client Components, use getAuthenticatedProfileClient from profile-client.ts instead
export async function getAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
  const supabase = await createClient();

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
    full_name: fullName,
  };
}