import { createClient } from "@/lib/supabase/server";

export type AuthenticatedProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export async function getAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error("Failed to load authenticated user", authError.message);
  }

  if (!user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile details", profileError.message);
  }

  const fullName =
    (profile?.full_name as string | null) ??
    (typeof user.user_metadata?.full_name === "string"
      ? (user.user_metadata.full_name as string)
      : null);

  const avatarUrl =
    (profile?.avatar_url as string | null) ??
    (typeof user.user_metadata?.avatar_url === "string"
      ? (user.user_metadata.avatar_url as string)
      : null);

  return {
    id: user.id,
    email: user.email ?? "",
    fullName,
    avatarUrl,
  };
}
