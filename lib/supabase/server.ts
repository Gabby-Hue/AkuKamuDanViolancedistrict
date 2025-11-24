import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseConfig, validateSupabaseConfig } from "./config";

validateSupabaseConfig();

export async function createClient() {
  try {
    const cookieStore = await cookies();

    return createServerClient(
      supabaseConfig.url!,
      supabaseConfig.anonKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  } catch (error) {
    console.error("Failed to create Supabase server client:", error);
    throw new Error("Failed to initialize database connection");
  }
}

export async function createAdminClient() {
  try {
    if (!supabaseConfig.serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured for admin operations");
    }

    const cookieStore = await cookies();

    return createServerClient(
      supabaseConfig.url!,
      supabaseConfig.serviceRoleKey!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error);
    throw new Error("Failed to initialize admin database connection");
  }
}
