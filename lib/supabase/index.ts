// Client exports
export { createClient } from "./client";

// Server exports
export { createClient as createServerClient, createAdminClient } from "./server";

// Config exports
export { supabaseConfig, validateSupabaseConfig } from "./config";

// Utility exports
export {
  handleSupabaseError,
  createSupabaseError,
  isValidSupabaseUrl,
  sanitizeSupabaseData,
} from "./utils";

// Query exports
export * from "./queries";

// Legacy exports (for backward compatibility)
// Database type export removed until types/supabase is available