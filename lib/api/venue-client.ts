import type { VenueCourtDetail, VenueCourtMetrics } from "@/lib/supabase/queries/venue-courts";

export interface VenueInfoResponse {
  profile: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  };
  venue: {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    district: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    facility_types: string[];
    facility_count: number | null;
    website: string | null;
    business_license_url: string | null;
    venue_status: string;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  courts?: VenueCourtDetail[];
  venues?: Array<{
    id: string;
    name: string;
    city: string | null;
    district: string | null;
  }>;
  message?: string;
}

export interface VenueCourtsResponse {
  courts: VenueCourtDetail[];
  metrics: VenueCourtMetrics | null;
  venues: Array<{
    id: string;
    name: string;
    city: string | null;
    district: string | null;
  }>;
}

export interface CreateCourtRequest {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour?: number;
  capacity?: number;
  facilities?: string[];
  description?: string;
}

export interface UpdateCourtRequest {
  name?: string;
  sport?: string;
  surface?: string;
  pricePerHour?: number;
  capacity?: number;
  facilities?: string[];
  description?: string;
  isActive?: boolean;
}

export interface UpdateVenueRequest {
  name?: string;
  city?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  facilityTypes?: string[];
  facilityCount?: number;
  website?: string;
  businessLicenseUrl?: string;
}

class VenueApiClient {
  private baseUrl = "/api/dashboard/venue";

  // Venue Information
  async getVenueInfo(): Promise<VenueInfoResponse> {
    const response = await fetch(`/api/dashboard/venue/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengambil informasi venue");
    }

    const result = await response.json();
    return result.data;
  }

  async updateVenueInfo(data: UpdateVenueRequest): Promise<{ message: string; venue: any }> {
    const response = await fetch(`/api/dashboard/venue/info`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal memperbarui informasi venue");
    }

    const result = await response.json();
    return result.data;
  }

  // Venue Settings
  async getVenueSettings(): Promise<VenueInfoResponse> {
    const response = await fetch(`/api/dashboard/venue/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengambil pengaturan venue");
    }

    const result = await response.json();
    return result.data;
  }

  async updateProfileSettings(data: { fullName?: string; phone?: string }): Promise<{ message: string; profile: any }> {
    const response = await fetch(`/api/dashboard/venue/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal memperbarui pengaturan profil");
    }

    const result = await response.json();
    return result.data;
  }

  // Courts Management
  async getVenueCourts(): Promise<VenueCourtsResponse> {
    const response = await fetch(`/api/dashboard/venue/courts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengambil data lapangan");
    }

    const result = await response.json();
    return result.data;
  }

  async getCourtDetails(courtId: string): Promise<VenueCourtDetail> {
    const response = await fetch(`/api/dashboard/venue/courts/${courtId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengambil detail lapangan");
    }

    const result = await response.json();
    return result.data;
  }

  async createCourt(data: CreateCourtRequest): Promise<{ message: string; courtId: string; venueId: string }> {
    const response = await fetch(`/api/dashboard/venue/courts/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal membuat lapangan");
    }

    const result = await response.json();
    return result.data;
  }

  async updateCourt(courtId: string, data: UpdateCourtRequest): Promise<{ message: string }> {
    const response = await fetch(`/api/dashboard/venue/courts/${courtId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal memperbarui lapangan");
    }

    const result = await response.json();
    return result.data;
  }

  async deleteCourt(courtId: string): Promise<{ message: string }> {
    const response = await fetch(`/api/dashboard/venue/courts/${courtId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal menghapus lapangan");
    }

    const result = await response.json();
    return result.data;
  }

  async toggleCourtAvailability(courtId: string, isActive: boolean, reason?: string): Promise<{ message: string; isActive: boolean }> {
    const response = await fetch(`/api/dashboard/venue/courts/${courtId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive, reason }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal mengubah status ketersediaan lapangan");
    }

    const result = await response.json();
    return result.data;
  }
}

export const venueApi = new VenueApiClient();