// Core Types for CourtEase Queries
// Generated: 2025-12-05
// Focus: No duplication, optimal performance

// Enums
export type SportType =
  | "futsal"
  | "basket"
  | "volley"
  | "badminton"
  | "tennis"
  | "padel";
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled";
export type PaymentStatus =
  | "pending"
  | "waiting_confirmation"
  | "paid"
  | "expired"
  | "cancelled";
export type UserRole = "user" | "venue_partner" | "admin";
export type SurfaceType =
  | "vinyl"
  | "rubber"
  | "parquet"
  | "wood"
  | "synthetic"
  | "cement"
  | "turf"
  | "grass"
  | "hard_court"
  | "clay";

// Core Entity Types
export interface Court {
  id: string;
  slug: string;
  name: string;
  sport: SportType;
  surface?: SurfaceType;
  pricePerHour: number;
  capacity?: number;
  facilities: string[];
  description?: string;
  venueId: string;
  venueName: string;
  venueCity?: string;
  venueDistrict?: string;
  venueAddress?: string;
  venueLatitude?: number;
  venueLongitude?: number;
  averageRating: number;
  reviewCount: number;
  primaryImageUrl?: string;
  images: CourtImage[];
  reviews: CourtReview[];
  totalBookings?: number;
  todayBookings?: number;
  totalRevenue?: number;
  todayRevenue?: number;
  isActive: boolean;
}

export interface CourtDetail extends Court {
  venueContactPhone?: string;
  venueContactEmail?: string;
  venueAddress?: string;
}

export interface CourtImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  metadata?: Record<string, any>;
}

export interface CourtReview {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  profile_id: string;
  profiles?: {
    full_name?: string;
  };
  // Legacy fields for compatibility
  author_name: string;
  createdAt?: string;
  bookingId?: string;
  booking_id?: string;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  ownerProfileId?: string;
  contactPhone?: string;
  contactEmail?: string;
  venueStatus: "active" | "inactive";
  totalCourts: number;
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  todayRevenue: number;
  averageRating: number;
  verifiedAt?: string;
}

export interface Booking {
  id: string;
  courtId: string;
  profileId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  priceTotal: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  checkedInAt?: string;
  completedAt?: string;
  paymentCompletedAt?: string;
  paymentExpiredAt?: string;
  paymentReference?: string;
  paymentToken?: string;
  paymentRedirectUrl?: string;
  reviewSubmittedAt?: string;
  review?: {
    id: string;
    rating: number;
    comment?: string;
    forumThreadId?: string;
  };
  court?: Court;
  customer?: {
    id: string;
    fullName?: string;
    email?: string;
  };
}

export interface BookingDetail extends Booking {
  venueName: string;
  courtName: string;
  sport: SportType;
  surface?: SurfaceType;
  duration: number;
}

export interface ForumThread {
  id: string;
  slug: string;
  title: string;
  body?: string;
  excerpt?: string;
  categoryId?: string;
  authorId: string;
  author: string;
  replyCount: number;
  tags: string[];
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
  category?: ForumCategory;
}

export interface ForumThreadSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  reply_count: number;
  created_at: string;
  tags: string[];
  category: ForumCategory | null;
  author_name: string | null;
  latestReplyBody: string | null;
  latestReplyAt: string | null;
  reviewCourt: any | null; // Add proper type later if needed
}

export interface ForumCategory {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  forumThreadId: string | null;
}

export interface VenuePartnerApplication {
  id: string;
  organizationName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  city?: string;
  existingSystem?: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  handledBy?: string;
  createdAt: string;
  reviewedAt?: string;
}

// Dashboard Types
export interface AdminDashboardStats {
  totalVenues: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  todayRevenue: number;
  pendingApplications: number;
  averageRating: number;
  totalCourts: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  charts: {
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    venueGrowth: Array<{ month: string; totalVenues: number }>;
    bookingTrends: Array<{ date: string; bookings: number }>;
    lastUpdated: string;
  };
  topVenues: Array<{
    venueId: string;
    venueName: string;
    city: string;
    bookings: number;
    revenue: number;
  }>;
  pendingApplications: VenuePartnerApplication[];
}

export interface UserDashboardData {
  stats: {
    totalBookings: number;
    activeBookings: number;
    pendingPayments: number;
    totalSpent: number;
  };
  recentBookings: Booking[];
  activeBookings: Booking[];
  pendingPayments: Booking[];
}

export interface VenueDashboardData {
  venue: Venue;
  courts: Court[];
  stats: {
    totalCourts: number;
    totalBookings: number;
    todayBookings: number;
    todayRevenue: number;
    totalRevenue: number;
    averageRating: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
  };
  topCourts: Court[];
}

// Explore Data Types
export interface ExploreData {
  courts: Court[];
  threads: ForumThread[];
  totalReplies: number;
}

// Query Options Types
export interface CourtQueryOptions {
  sport?: SportType;
  city?: string;
  limit?: number;
  offset?: number;
  minRating?: number;
  maxPrice?: number;
  sortBy?: "rating" | "price" | "name" | "bookings";
  sortOrder?: "asc" | "desc";
}

export interface BookingQueryOptions {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ForumQueryOptions {
  categoryId?: string;
  authorId?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  search?: string;
}

// Response Types
export interface QueryResponse<T> {
  data: T[];
  error?: string;
  count?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> extends QueryResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
