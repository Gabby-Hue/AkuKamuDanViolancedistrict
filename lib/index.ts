// Re-export commonly used utilities
export { cn } from "./utils";
export { calculateDistanceKm, formatDistance } from "./geo";

// Export truncateText utility locally
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Re-export API utilities
export * from "./api";

// Re-export Supabase utilities
export * from "./supabase";