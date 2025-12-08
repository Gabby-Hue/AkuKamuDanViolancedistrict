// Public Page Queries - Optimized & No Duplication
// Pages: page.tsx, explore/page.tsx, venues/page.tsx, forum/*, venue-partner/*, court/[slug]/*

import { createClient } from "@/lib/supabase/server";
import type {
  Court,
  CourtDetail,
  Venue,
  ForumThread,
  ForumReply,
  ForumCategory,
  VenuePartnerApplication,
  ReviewData,
  CourtQueryOptions,
  ForumQueryOptions,
  ExploreData,
} from "./types";

export class PublicQueries {
  /**
   * Get active courts with filtering options
   * Used: Landing page, explore page, venues page
   */
  static async getActiveCourts(
    options: CourtQueryOptions = {},
  ): Promise<Court[]> {
    const supabase = await createClient();

    let query = supabase.from("active_courts").select("*");

    // Apply filters
    if (options.sport) {
      query = query.eq("sport", options.sport);
    }

    if (options.city) {
      query = query.ilike("venue_city", `%${options.city}%`);
    }

    if (options.minRating) {
      query = query.gte("average_rating", options.minRating);
    }

    if (options.maxPrice) {
      query = query.lte("price_per_hour", options.maxPrice);
    }

    // Apply sorting
    const sortField =
      options.sortBy === "rating"
        ? "average_rating"
        : options.sortBy === "price"
          ? "price_per_hour"
          : options.sortBy === "bookings"
            ? "total_bookings"
            : "name";

    query = query.order(sortField, {
      ascending: options.sortOrder === "asc",
    });

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching active courts:", error);
      return [];
    }

    return this.transformCourts(data || []);
  }

  /**
   * Get court detail by slug with reviews and images
   * Used: court/[slug]/page.tsx
   */
  static async getCourtDetail(slug: string): Promise<CourtDetail | null> {
    const supabase = await createClient();

    // Get court details using court_summaries_with_stats view
    const { data: courtData, error: courtError } = await supabase
      .from("court_summaries_with_stats")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (courtError || !courtData) {
      console.error("Error fetching court detail:", courtError);
      return null;
    }

    // Get venue contact info separately
    const { data: venueData, error: venueError } = await supabase
      .from("venues")
      .select("contact_phone, contact_email, address")
      .eq("id", courtData.venue_id)
      .single();

    // Get court images using the function
    const { data: imagesData, error: imagesError } = await supabase.rpc(
      "get_court_images",
      { court_uuid: courtData.id },
    );

    const { data: reviewsData, error: reviewsError } = await supabase
      .from("court_reviews_with_authors") // <--- MENJADI INI
      .select("id, rating, comment, created_at, author_name") // <--- Lebih sederhana
      .eq("court_id", courtData.id)
      .order("created_at", { ascending: false })
      .limit(10);

    // Combine all data
    const combinedData = {
      ...courtData,
      venue: venueData || {},
      images: imagesData || [],
      reviews: reviewsData || [],
    };

    return this.transformCourtDetail(combinedData);
  }

  /**
   * Get venues with basic stats
   * Used: venues/page.tsx
   */
  static async getVenues(
    options: {
      city?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Venue[]> {
    const supabase = await createClient();

    let query = supabase
      .from("venue_stats")
      .select("*")
      .gt("total_courts", 0)
      .eq("venue_status", "active")
      .order("total_bookings", { ascending: false });

    if (options.city) {
      query = query.ilike("venue_city", `%${options.city}%`);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching venues:", error);
      return [];
    }

    return this.transformVenues(data || []);
  }

  /**
   * Get forum threads with filtering
   * Used: forum/page.tsx, landing page
   */
  static async getForumThreads(
    options: ForumQueryOptions = {},
  ): Promise<ForumThread[]> {
    const supabase = await createClient();

    let query = supabase
      .from("forum_threads_with_authors")
      .select("*")
      .order("created_at", { ascending: false });

    if (options.categoryId) {
      query = query.eq("category_id", options.categoryId);
    }

    if (options.authorId) {
      query = query.eq("author_profile_id", options.authorId);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.contains("tags", options.tags);
    }

    if (options.search) {
      query = query.or(
        `title.ilike.%${options.search}%,body.ilike.%${options.search}%`,
      );
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching forum threads:", error);
      return [];
    }

    return this.transformForumThreads(data || []);
  }

  /**
   * Get forum categories
   * Used: forum/page.tsx
   */
  static async getForumCategories(): Promise<ForumCategory[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("forum_categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching forum categories:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get forum thread detail by slug
   * Used: forum/[slug]/page.tsx
   */
  static async getForumThreadDetail(slug: string): Promise<ForumThread | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("forum_threads_with_authors")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching forum thread detail:", error);
      return null;
    }

    return this.transformForumThread(data);
  }

  /**
   * Get forum replies for a thread by slug
   * Used: forum thread detail page (server-side)
   */
  static async getForumRepliesBySlug(
    threadSlug: string,
  ): Promise<ForumReply[]> {
    const supabase = await createClient();

    // First get the thread ID from slug
    const { data: threadData, error: threadError } = await supabase
      .from("forum_threads")
      .select("id")
      .eq("slug", threadSlug)
      .single();

    if (threadError || !threadData) {
      console.error("Error fetching thread ID:", threadError);
      return [];
    }

    // Then get replies for that thread
    const { data, error } = await supabase
      .from("forum_replies")
      .select(
        `
        *,
        profiles!forum_replies_author_profile_id_fkey (
          full_name
        )
      `,
      )
      .eq("thread_id", threadData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forum replies:", error);
      return [];
    }

    return this.transformForumReplies(data || []);
  }

  /**
   * Get forum replies for a thread
   * Used: forum thread detail page (client-side)
   */
  static async getForumReplies(threadId: string): Promise<ForumReply[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("forum_replies")
      .select(
        `
        *,
        profiles!forum_replies_author_profile_id_fkey (
          full_name
        )
      `,
      )
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching forum replies:", error);
      return [];
    }

    return this.transformForumReplies(data || []);
  }

  /**
   * Get venue partner applications
   * Used: venue-partner/page.tsx
   */
  static async getVenuePartnerApplications(): Promise<
    VenuePartnerApplication[]
  > {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("venue_partner_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching venue partner applications:", error);
      return [];
    }

    return this.transformApplications(data || []);
  }

  /**
   * Get explore data (courts + threads + stats)
   * Used: explore/page.tsx
   */
  static async getExploreData(): Promise<ExploreData> {
    // Parallel queries for optimal performance
    const [courts, threads] = await Promise.all([
      this.getActiveCourts({ limit: 20 }),
      this.getForumThreads({ limit: 10 }),
    ]);

    const totalReplies = await this.getTotalForumReplies();

    return {
      courts,
      threads,
      totalReplies,
    };
  }

  // Private transformation methods
  private static transformCourts(data: any[]): Court[] {
    return data.map((court) => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour || 0),
      capacity: court.capacity,
      facilities: Array.isArray(court.facilities) ? court.facilities : [],
      description: court.description,
      venueId: court.venue_id,
      venueName: court.venue_name,
      venueCity: court.venue_city,
      venueLatitude: court.venue_latitude,
      venueLongitude: court.venue_longitude,
      averageRating: Number(court.average_rating || 0),
      reviewCount: Number(court.review_count || 0),
      primaryImageUrl: court.primary_image_url,
      images: court.images || [],
      reviews: court.reviews || [],
      totalBookings: Number(court.total_bookings || 0),
      todayBookings: Number(court.today_bookings || 0),
      totalRevenue: Number(court.total_revenue || 0),
      isActive: true, // From active_courts view
    }));
  }

  private static transformCourtDetail(data: any): CourtDetail {
    const court = data;
    const venue = court?.venue;

    // Transform images data from get_court_images function
    const images = (court.images || []).map((img: any) => ({
      id: img.id || Math.random().toString(),
      imageUrl: img.image_url,
      isPrimary: img.is_primary,
    }));

    return {
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: Number(court.price_per_hour || 0),
      capacity: court.capacity,
      facilities: Array.isArray(court.facilities) ? court.facilities : [],
      description: court.description,
      venueId: court.venue_id,
      venueName: court.venue_name,
      venueCity: court.venue_city,
      venueAddress: venue?.address,
      venueLatitude: court.venue_latitude,
      venueLongitude: court.venue_longitude,
      averageRating: Number(court.average_rating || 0),
      reviewCount: Number(court.review_count || 0),
      primaryImageUrl:
        court.primary_image_info?.image_url ||
        images.find((img: any) => img.isPrimary)?.imageUrl ||
        null,
      images: images,
      reviews: (court.reviews || []).map((review: any) => ({
        id: review.id,
        rating: Number(review.rating),
        comment: review.comment,
        // Gunakan author_name langsung dari view court_reviews_with_authors
        author_name: review.author_name || "Member CourtEase",
        createdAt: review.created_at,
        bookingId: review.booking_id,
      })),
      totalBookings: Number(court.total_bookings || 0),
      todayBookings: Number(court.today_bookings || 0),
      totalRevenue: Number(court.total_revenue || 0),
      isActive: true,
      // Additional detail fields from venue
      venueContactPhone: venue?.contact_phone,
      venueContactEmail: venue?.contact_email,
    };
  }

  private static transformVenues(data: any[]): Venue[] {
    return data.map((venue) => ({
      id: venue.venue_id,
      slug:
        venue.slug ||
        `${venue.venue_name.toLowerCase().replace(/\s+/g, "-")}-${venue.venue_id.slice(0, 6)}`,
      name: venue.venue_name,
      city: venue.venue_city,
      latitude: venue.venue_latitude,
      longitude: venue.venue_longitude,
      ownerProfileId: venue.owner_profile_id,
      venueStatus: venue.venue_status as "active" | "inactive",
      totalCourts: Number(venue.total_courts || 0),
      totalBookings: Number(venue.total_bookings || 0),
      todayBookings: Number(venue.today_bookings || 0),
      totalRevenue: Number(venue.total_revenue || 0),
      todayRevenue: Number(venue.today_revenue || 0),
      averageRating: Number(venue.average_rating || 0),
      verifiedAt: undefined, // Not in current view
      createdAt: venue.created_at,
    }));
  }

  private static transformForumThreads(data: any[]): ForumThread[] {
    return data.map((thread) => ({
      id: thread.id,
      slug: thread.slug,
      title: thread.title,
      body: thread.body,
      excerpt: thread.excerpt,
      categoryId: thread.category_id,
      authorId: thread.author_profile_id,
      author: thread.author_name || "Anonymous",
      replyCount: Number(thread.reply_count || 0),
      tags: Array.isArray(thread.tags) ? thread.tags : [],
      status: thread.status as "published" | "draft",
      createdAt: thread.created_at,
      updatedAt: thread.updated_at,
      category: thread.category_name
        ? {
            id: thread.category_id,
            slug: thread.category_slug,
            name: thread.category_name,
            createdAt: thread.category_created_at || new Date().toISOString(),
          }
        : undefined,
    }));
  }

  private static transformForumThread(data: any): ForumThread | null {
    if (!data) return null;

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      body: data.body,
      excerpt: data.excerpt,
      categoryId: data.category_id,
      authorId: data.author_profile_id,
      author: data.author_name || "Anonymous",
      replyCount: Number(data.reply_count || 0),
      tags: Array.isArray(data.tags) ? data.tags : [],
      status: data.status as "published" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      category: data.category_name
        ? {
            id: data.category_id,
            slug: data.category_slug,
            name: data.category_name,
            createdAt: data.category_created_at || new Date().toISOString(),
          }
        : undefined,
    };
  }

  private static transformForumReplies(data: any[]): ForumReply[] {
    return data.map((reply) => ({
      id: reply.id,
      threadId: reply.thread_id,
      authorId: reply.author_profile_id,
      authorName: reply.profiles?.full_name || "Anonymous",
      body: reply.body,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at,
    }));
  }

  private static transformApplications(data: any[]): VenuePartnerApplication[] {
    return data.map((app) => ({
      id: app.id,
      organizationName: app.organization_name,
      contactName: app.contact_name,
      contactEmail: app.contact_email,
      contactPhone: app.contact_phone,
      city: app.city,
      facilityTypes: Array.isArray(app.facility_types)
        ? app.facility_types
        : [],
      facilityCount: app.facility_count,
      existingSystem: app.existing_system,
      notes: app.notes,
      status: app.status as "pending" | "accepted" | "rejected",
      handledBy: app.handled_by,
      decisionNote: app.decision_note,
      createdAt: app.created_at,
      reviewedAt: app.reviewed_at,
    }));
  }

  /**
   * Get booking review data
   * Used: dashboard/user/bookings/[id]/page.tsx
   */
  static async getBookingReview(
    bookingId: string,
    profileId: string,
  ): Promise<ReviewData | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("court_reviews")
      .select("id, rating, comment, forum_thread_id")
      .eq("booking_id", bookingId)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error) {
      console.error("Failed to fetch booking review:", error.message);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      rating: Number(data.rating),
      comment: data.comment,
      forumThreadId: data.forum_thread_id,
    };
  }

  private static async getTotalForumReplies(): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("forum_replies")
      .select("*", { count: "exact", head: true });

    return count || 0;
  }
}
