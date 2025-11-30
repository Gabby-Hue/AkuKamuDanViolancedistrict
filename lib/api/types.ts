export type CreateBookingRequest = {
  courtId: string;
  startTime: string;
  endTime: string;
  notes?: string;
};

export type CreateBookingResponse = {
  bookingId: string;
  payment: {
    token: string;
    redirectUrl: string | null;
    expiresAt: string;
  };
};

export type ApiSuccess<T = any> = {
  data: T;
};

export type ApiError = {
  error: string;
  code?: string;
};

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Basic row types (will be refined when Database type is available)
export type CourtRow = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  amenities: string[];
  description: string | null;
  venue_id: string;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VenueRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type BookingRow = {
  id: string;
  user_id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  payment_status: string;
  notes: string | null;
  checked_in_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  court?: {
    name: string;
    sport: string;
  } | null;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
};

export type CourtSummaryRow = {
  id: string;
  slug: string;
  name: string;
  sport: string;
  surface: string | null;
  price_per_hour: number;
  capacity: number | null;
  amenities: string[];
  description: string | null;
  venue_name: string;
  venue_city: string | null;
  venue_district: string | null;
  venue_latitude: number | null;
  venue_longitude: number | null;
  primary_image_url: string | null;
  average_rating: number | null;
  review_count: number | null;
};

export type CourtImageRow = {
  id: string;
  court_id: string;
  image_url: string;
  caption: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CourtBlackoutRow = {
  id: string;
  court_id: string;
  title: string | null;
  notes: string | null;
  scope: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  repeat_day_of_week: number | null;
  created_at: string;
  updated_at: string;
};

// Helper types for Supabase queries
export type CourtWithVenue = CourtRow & {
  venue: {
    name: string;
    city: string | null;
  } | null;
};

export type BookingWithCourt = BookingRow & {
  court: {
    name: string;
    sport: string;
  } | null;
};

export type SportType =
  | "futsal"
  | "basketball"
  | "soccer"
  | "volleyball"
  | "badminton"
  | "tennis"
  | "padel";

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
