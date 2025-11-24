import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig, validateSupabaseConfig } from "./config";

validateSupabaseConfig();

export function createClient() {
  try {
    const client = createBrowserClient(
      supabaseConfig.url!,
      supabaseConfig.anonKey!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      }
    );

    return client;
  } catch (error) {
    console.error("Failed to create Supabase browser client:", error);
    throw new Error("Failed to initialize database connection");
  }
}
