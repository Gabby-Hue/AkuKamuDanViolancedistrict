// Query Classes Index - Unified Export Point
// Optimal imports for all query classes

export { AdminQueries } from './admin';
export { UserQueries } from './user';
export { VenueQueries } from './venue';
export { PublicQueries } from './public';

// Export all types for convenience
export type {
  // Core Entity Types
  Court,
  CourtDetail,
  CourtImage,
  CourtReview,
  Venue,
  Booking,
  BookingDetail,
  ForumThread,
  ForumCategory,
  VenuePartnerApplication,

  // Dashboard Types
  AdminDashboardStats,
  AdminDashboardData,
  UserDashboardData,
  VenueDashboardData,

  // Explore Data Types
  ExploreData,

  // Query Options Types
  CourtQueryOptions,
  BookingQueryOptions,
  ForumQueryOptions,

  // Response Types
  QueryResponse,
  PaginatedResponse,

  // Enums
  SportType,
  BookingStatus,
  PaymentStatus,
  UserRole,
  SurfaceType
} from './types';