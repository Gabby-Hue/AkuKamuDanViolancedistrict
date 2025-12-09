import type { SupabaseClient } from "@supabase/supabase-js";

export function handleSupabaseError(error: unknown, context: string = "operation") {
  const errorMessage = error && typeof error === 'object' && 'message' in error
    ? String(error.message)
    : "Unknown error occurred";
  const errorCode = error && typeof error === 'object' && 'code' in error
    ? String(error.code)
    : "UNKNOWN_ERROR";

  console.error(`Supabase error in ${context}:`, {
    message: errorMessage,
    code: errorCode,
    details: error && typeof error === 'object' && 'details' in error ? error.details : undefined,
    hint: error && typeof error === 'object' && 'hint' in error ? error.hint : undefined,
  });

  // Map common Supabase errors to user-friendly messages
  switch (errorCode) {
    case "PGRST116":
      return "Data tidak ditemukan";
    case "PGRST301":
      return "Tidak memiliki akses ke data ini";
    case "23505":
      return "Data sudah ada";
    case "23503":
      return "Data terkait tidak ditemukan";
    case "23514":
      return "Data tidak valid";
    case "42501":
      return "Tidak memiliki izin untuk melakukan operasi ini";
    case "28P01":
      return "Koneksi database gagal";
    default:
      return `Terjadi kesalahan: ${errorMessage}`;
  }
}

export function createSupabaseError(
  message: string,
  code?: string,
  originalError?: unknown
): Error & { code?: string; originalError?: unknown } {
  const error = new Error(message) as Error & { code?: string; originalError?: unknown };
  if (code) error.code = code;
  if (originalError) error.originalError = originalError;
  return error;
}

export function isValidSupabaseUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "https:" && urlObj.hostname.includes("supabase");
  } catch {
    return false;
  }
}

export function sanitizeSupabaseData<T extends Record<string, unknown>>(data: T): T {
  const sanitized = { ...data };

  // Remove potential sensitive fields
  delete sanitized.password;
  delete sanitized.password_hash;
  delete sanitized.email_confirmed_at;
  delete sanitized.phone_confirmed_at;
  delete sanitized.recovery_token;

  return sanitized;
}