// Service Layer Exports
// Berisi service layer yang menghandle business logic kompleks

// Booking Service - COMPLEX business logic
export {
  bookingService,
  type Booking,
  type BookingDetail,
  type CreateBookingData,
  type UpdateBookingStatusData,
  type Profile,
  type Court,
  type Venue,
} from "./booking.service";

// Status utilities
export {
  normalizeBookingStatus,
  normalizePaymentStatus,
  type BookingStatus,
  type PaymentStatus,
} from "@/lib/supabase/status";

// Export legacy query exports untuk backward compatibility
// --- LEGACY: Use service layer instead of direct queries ---
export {
  // Complex queries yang masih relevan dipertahankan
  fetchUserDashboardData,
  fetchVenueDashboardData,
  fetchCourtSummaries,
  fetchCourtDetail,
  fetchExploreData,
  fetchAdminDashboardData,
  fetchAdminMetrics,
  fetchPartnerApplications,
  fetchForumCategories,
  fetchForumThreads,
  fetchForumThreadDetail,
  fetchVenueRevenueData,

  // Types untuk backward compatibility
  type CourtSummary,
  type CourtDetail,
  type VenueSummary,
  type UserDashboardData,
  type VenueDashboardData,
  type VenueBooking,
  type VenueBookingMetrics,
  type AdminMetrics,
  type AdminDashboardData,
  type ForumCategory,
  type ForumThreadSummary,
  type ForumThreadDetail,
  type ForumReply,
  type VenueRevenueData,
} from "@/lib/supabase/queries";

// Note: Queries yang sederhana sudah dipindah ke API layer
// API layer langsung menggunakan Supabase client untuk operasi CRUD sederhana