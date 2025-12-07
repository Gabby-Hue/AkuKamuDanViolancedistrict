# Rekomendasi Lib Queries Structure

## 📁 Struktur Direktori Proposal

```
lib/
├── queries/
│   ├── index.ts              # Export semua queries
│   ├── types.ts              # Type definitions
│   ├── public.ts             # Public pages queries
│   ├── dashboard.ts          # Dashboard queries (optimized)
│   ├── admin.ts              # Admin specific queries
│   ├── venue.ts              # Venue partner queries
│   ├── user.ts               # User specific queries
│   └── shared.ts             # Shared utility queries
├── services/
│   ├── booking.service.ts    # Booking operations
│   ├── payment.service.ts    # Payment operations
│   └── notification.service.ts # Notifications
└── utils/
    ├── cache.ts              # Caching utilities
    ├── validation.ts         # Data validation
    └── formatting.ts         # Data formatting
```

---

## 📋 Rekomendasi File Queries

### **lib/queries/types.ts**

```typescript
// Core Types
export interface Court {
  id: string;
  slug: string;
  name: string;
  sport: SportType;
  surface: SurfaceType;
  pricePerHour: number;
  capacity: number;
  facilities: string[];
  description: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueLatitude: number;
  venueLongitude: number;
  averageRating: number;
  reviewCount: number;
  primaryImageUrl: string;
  images: CourtImage[];
  reviews: CourtReview[];
}

export interface CourtDetail extends Court {
  venueContactPhone: string;
  venueContactEmail: string;
  venueAddress: string;
  totalBookings: number;
  todayBookings: number;
  todayRevenue: number;
  totalRevenue: number;
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
  author: string;
  createdAt: string;
  bookingId?: string;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerProfileId: string;
  venueStatus: 'active' | 'inactive';
  totalCourts: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
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
  court?: Court;
  customer?: Profile;
}

export interface ForumThread {
  id: string;
  slug: string;
  title: string;
  body?: string;
  categoryId?: string;
  authorId: string;
  author: string;
  replyCount: number;
  tags: string[];
  createdAt: string;
  category?: ForumCategory;
}

// Enums
export type SportType = 'futsal' | 'basket' | 'volley' | 'badminton' | 'tennis' | 'padel';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'cancelled';
export type UserRole = 'user' | 'venue_partner' | 'admin';
```

### **lib/queries/public.ts**

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Court, Venue, ForumThread, ForumCategory } from './types';

// Public queries untuk public pages
export class PublicQueries {
  /**
   * Get semua courts yang aktif dengan basic info
   * Used: Landing page, explore page
   */
  static async getActiveCourts(options?: {
    sport?: SportType;
    city?: string;
    limit?: number;
    offset?: number;
  }): Promise<Court[]> {
    const supabase = await createClient();

    let query = supabase
      .from('active_courts')
      .select('*')
      .order('average_rating', { ascending: false });

    if (options?.sport) {
      query = query.eq('sport', options.sport);
    }

    if (options?.city) {
      query = query.ilike('venue_city', `%${options.city}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active courts:', error);
      return [];
    }

    return this.transformCourts(data || []);
  }

  /**
   * Get detail court berdasarkan slug
   * Used: Court detail page
   */
  static async getCourtDetail(slug: string): Promise<Court | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('active_courts')
      .select(`
        *,
        venue:venues(
          contact_phone,
          contact_email,
          address
        ),
        reviews:court_reviews(
          id,
          rating,
          comment,
          created_at,
          profile:profiles(full_name)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching court detail:', error);
      return null;
    }

    return this.transformCourtDetail(data);
  }

  /**
   * Get semua venues
   * Used: Venues directory page
   */
  static async getVenues(options?: {
    city?: string;
    limit?: number;
  }): Promise<Venue[]> {
    const supabase = await createClient();

    let query = supabase
      .from('venue_stats')
      .select('*')
      .eq('total_courts', 'gt', 0)
      .order('total_bookings', { ascending: false });

    if (options?.city) {
      query = query.ilike('venue_city', `%${options.city}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching venues:', error);
      return [];
    }

    return this.transformVenues(data || []);
  }

  /**
   * Get forum threads untuk public
   * Used: Landing page, forum pages
   */
  static async getForumThreads(options?: {
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ForumThread[]> {
    const supabase = await createClient();

    let query = supabase
      .from('forum_threads_with_authors')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching forum threads:', error);
      return [];
    }

    return this.transformForumThreads(data || []);
  }

  /**
   * Get forum categories
   * Used: Forum pages
   */
  static async getForumCategories(): Promise<ForumCategory[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching forum categories:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get explore data (courts + threads)
   * Used: Explore page
   */
  static async getExploreData(): Promise<{
    courts: Court[];
    threads: ForumThread[];
    totalReplies: number;
  }> {
    const [courts, threads, totalReplies] = await Promise.all([
      this.getActiveCourts({ limit: 20 }),
      this.getForumThreads({ limit: 10 }),
      this.getTotalForumReplies()
    ]);

    return {
      courts,
      threads,
      totalReplies
    };
  }

  // Private transformation methods
  private static transformCourts(data: any[]): Court[] {
    return data.map(court => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: court.price_per_hour,
      capacity: court.capacity,
      facilities: court.facilities || [],
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
      totalRevenue: Number(court.total_revenue || 0)
    }));
  }

  private static transformCourtDetail(data: any): Court {
    const court = data;
    const venue = court.venue;

    return {
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: court.price_per_hour,
      capacity: court.capacity,
      facilities: court.facilities || [],
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
      reviews: (court.reviews || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        author: review.profile?.full_name || 'Anonymous',
        createdAt: review.created_at,
        bookingId: review.booking_id
      })),
      // Additional detail fields
      venueContactPhone: venue?.contact_phone,
      venueContactEmail: venue?.contact_email,
      venueAddress: venue?.address,
      totalBookings: Number(court.total_bookings || 0),
      todayBookings: Number(court.today_bookings || 0),
      totalRevenue: Number(court.total_revenue || 0)
    };
  }

  private static transformVenues(data: any[]): Venue[] {
    return data.map(venue => ({
      id: venue.venue_id,
      slug: venue.slug || `${venue.venue_name.toLowerCase().replace(/\s+/g, '-')}`,
      name: venue.venue_name,
      city: venue.venue_city || '',
      latitude: venue.venue_latitude,
      longitude: venue.venue_longitude,
      ownerProfileId: '',
      venueStatus: 'active',
      totalCourts: Number(venue.total_courts || 0),
      totalBookings: Number(venue.total_bookings || 0),
      totalRevenue: Number(venue.total_revenue || 0),
      averageRating: Number(venue.average_rating || 0)
    }));
  }

  private static transformForumThreads(data: any[]): ForumThread[] {
    return data.map(thread => ({
      id: thread.id,
      slug: thread.slug,
      title: thread.title,
      body: thread.body,
      categoryId: thread.category_id,
      authorId: thread.author_profile_id,
      author: thread.author_name || 'Anonymous',
      replyCount: Number(thread.reply_count || 0),
      tags: thread.tags || [],
      createdAt: thread.created_at,
      category: thread.forum_categories ? {
        id: thread.forum_categories.id,
        slug: thread.forum_categories.slug,
        name: thread.forum_categories.name
      } : undefined
    }));
  }

  private static async getTotalForumReplies(): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('forum_replies')
      .select('*', { count: 'exact', head: true });

    return count || 0;
  }
}
```

### **lib/queries/dashboard.ts**

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Venue, Court, Booking } from './types';

// Dashboard queries untuk semua role
export class DashboardQueries {
  /**
   * Get venue data untuk venue dashboard
   * Used: All venue dashboard pages (consolidated query)
   */
  static async getVenueDashboardData(userId: string): Promise<{
    venues: Venue[];
    currentVenue: Venue | null;
    courts: Court[];
  }> {
    const supabase = await createClient();

    // Get venues for this user
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .eq('owner_profile_id', userId)
      .eq('venue_status', 'active');

    if (venuesError || !venues) {
      console.error('Error fetching venues:', venuesError);
      return { venues: [], currentVenue: null, courts: [] };
    }

    // Transform venues
    const transformedVenues = venues.map(venue => ({
      id: venue.id,
      slug: venue.slug,
      name: venue.name,
      city: venue.city || '',
      latitude: venue.latitude,
      longitude: venue.longitude,
      ownerProfileId: venue.owner_profile_id || '',
      venueStatus: venue.venue_status as 'active' | 'inactive',
      totalCourts: 0, // Will be filled below
      totalBookings: 0, // Will be filled below
      totalRevenue: 0, // Will be filled below
      averageRating: 0 // Will be filled below
    }));

    // Get courts for all venues
    const venueIds = venues.map(v => v.id);
    const { data: courts, error: courtsError } = await supabase
      .from('active_courts')
      .select('*')
      .in('venue_id', venueIds);

    if (courtsError) {
      console.error('Error fetching courts:', courtsError);
      return { venues: transformedVenues, currentVenue: transformedVenues[0] || null, courts: [] };
    }

    // Transform courts
    const transformedCourts = courts.map(court => ({
      id: court.id,
      slug: court.slug,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      pricePerHour: court.price_per_hour,
      capacity: court.capacity,
      facilities: court.facilities || [],
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
      totalRevenue: Number(court.total_revenue || 0)
    }));

    // Update venue stats from courts
    const venueStats = courts.reduce((acc, court) => {
      if (!acc[court.venue_id]) {
        acc[court.venue_id] = {
          totalCourts: 0,
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          ratingCount: 0
        };
      }

      acc[court.venue_id].totalCourts++;
      acc[court.venue_id].totalBookings += Number(court.total_bookings || 0);
      acc[court.venue_id].totalRevenue += Number(court.total_revenue || 0);
      acc[court.venue_id].averageRating += Number(court.average_rating || 0);
      if (court.review_count > 0) {
        acc[court.venue_id].ratingCount++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Apply stats to venues
    transformedVenues.forEach(venue => {
      const stats = venueStats[venue.id];
      if (stats) {
        venue.totalCourts = stats.totalCourts;
        venue.totalBookings = stats.totalBookings;
        venue.totalRevenue = stats.totalRevenue;
        venue.averageRating = stats.ratingCount > 0
          ? stats.averageRating / stats.ratingCount
          : 0;
      }
    });

    return {
      venues: transformedVenues,
      currentVenue: transformedVenues[0] || null,
      courts: transformedCourts
    };
  }

  /**
   * Get user booking summary
   * Used: User dashboard
   */
  static async getUserBookingSummary(userId: string): Promise<{
    totalBookings: number;
    activeBookings: Booking[];
    pendingPayments: Booking[];
    recentBookings: Booking[];
  }> {
    const supabase = await createClient();

    const { data: bookings, error } = await supabase
      .from('bookings_with_courts')
      .select(`
        *,
        court:active_courts(name, venue_name)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !bookings) {
      console.error('Error fetching user bookings:', error);
      return {
        totalBookings: 0,
        activeBookings: [],
        pendingPayments: [],
        recentBookings: []
      };
    }

    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      courtId: booking.court_id,
      profileId: booking.profile_id,
      startTime: booking.start_time,
      endTime: booking.end_time,
      status: booking.status,
      paymentStatus: booking.payment_status,
      priceTotal: Number(booking.price_total || 0),
      notes: booking.notes,
      court: booking.court ? {
        id: booking.court_id,
        name: booking.court.name,
        venueName: booking.court.venue_name
      } : undefined
    }));

    const activeBookings = transformedBookings.filter(
      b => ['confirmed', 'checked_in'].includes(b.status)
    );

    const pendingPayments = transformedBookings.filter(
      b => b.paymentStatus === 'pending'
    );

    const recentBookings = transformedBookings.slice(0, 5);

    return {
      totalBookings: transformedBookings.length,
      activeBookings,
      pendingPayments,
      recentBookings
    };
  }
}
```

### **lib/queries/admin.ts**

```typescript
import { createClient } from '@/lib/supabase/server';
import type { Venue, Booking, ForumThread } from './types';

// Admin specific queries
export class AdminQueries {
  /**
   * Get admin dashboard data
   * Used: Admin dashboard
   */
  static async getAdminDashboardData(): Promise<{
    stats: {
      totalVenues: number;
      totalUsers: number;
      totalBookings: number;
      totalRevenue: number;
      todayBookings: number;
      todayRevenue: number;
      pendingApplications: number;
    };
    topVenues: Array<{
      venueId: string;
      venueName: string;
      city: string;
      bookings: number;
      revenue: number;
    }>;
    pendingApplications: any[];
    charts: {
      monthlyRevenue: Array<{ month: string; revenue: number }>;
      venueGrowth: Array<{ month: string; totalVenues: number }>;
      bookingTrends: Array<{ date: string; bookings: number }>;
    };
  }> {
    const supabase = await createClient();

    // Parallel queries for performance
    const [
      venuesResult,
      usersResult,
      bookingsResult,
      applicationsResult,
      monthlyRevenueResult,
      venueGrowthResult,
      bookingTrendsResult
    ] = await Promise.all([
      // Total venues
      supabase.from('venues').select('id, count', { count: 'exact' }),
      // Total users
      supabase.from('profiles').select('id, count', { count: 'exact' }),
      // Total bookings
      supabase.from('bookings').select('price_total, start_time, status'),
      // Pending applications
      supabase
        .from('venue_partner_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10),
      // Monthly revenue
      supabase.rpc('get_monthly_revenue'),
      // Venue growth
      supabase.rpc('get_venue_growth'),
      // Booking trends
      supabase.rpc('get_booking_trends')
    ]);

    // Process data...
    const totalRevenue = bookingsResult.data?.reduce(
      (sum, b) => sum + Number(b.price_total || 0), 0
    ) || 0;

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookingsResult.data?.filter(
      b => b.start_time.startsWith(today) && b.status !== 'cancelled'
    ).length || 0;

    const todayRevenue = bookingsResult.data?.filter(
      b => b.start_time.startsWith(today) && b.status !== 'cancelled'
    ).reduce((sum, b) => sum + Number(b.price_total || 0), 0) || 0;

    return {
      stats: {
        totalVenues: venuesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalBookings: bookingsResult.data?.length || 0,
        totalRevenue,
        todayBookings,
        todayRevenue,
        pendingApplications: applicationsResult.data?.length || 0
      },
      topVenues: [], // Process from venue_stats view
      pendingApplications: applicationsResult.data || [],
      charts: {
        monthlyRevenue: monthlyRevenueResult.data || [],
        venueGrowth: venueGrowthResult.data || [],
        bookingTrends: bookingTrendsResult.data || []
      }
    };
  }
}
```

### **lib/queries/index.ts**

```typescript
// Main export file
export * from './types';
export * from './public';
export * from './dashboard';
export * from './admin';

// Backward compatibility exports
export { PublicQueries as fetchCourtSummaries } from './public';
export { DashboardQueries } from './dashboard';
export { AdminQueries } from './admin';
```

---

## 🔥 Keunggulan Structure Ini

### **1. Modular & Scalable**
- Setiap role punya dedicated query class
- Type safety dengan comprehensive interfaces
- Mudah untuk maintain dan extend

### **2. Performance Optimized**
- Parallel queries dimana mungkin
- Efficient data transformation
- Reduced over-fetching

### **3. Developer Experience**
- Clear separation of concerns
- Consistent API patterns
- Comprehensive TypeScript support

### **4. Caching Ready**
- Methods mudah untuk implementasi cache
- Flexible query options
- Built-in error handling

---

## 📝 Implementation Plan

### **Phase 1: Setup**
1. Buat structure direktori baru
2. Define semua types
3. Implement basic query classes

### **Phase 2: Migration**
1. Replace existing queries satu per satu
2. Update page imports
3. Test functionality

### **Phase 3: Optimization**
1. Implement caching
2. Add query monitoring
3. Performance tuning

---

## 🚀 Usage Examples

```typescript
// Sebelum: Multiple scattered queries
const courts = await fetchCourtSummaries();
const threads = await fetchForumThreads();

// Sesudah: Clean API
import { PublicQueries } from '@/lib/queries';
const { courts, threads } = await PublicQueries.getExploreData();

// Dashboard
import { DashboardQueries } from '@/lib/queries';
const venueData = await DashboardQueries.getVenueDashboardData(userId);
```

---

*Rekomendasi structure siap untuk implementasi!*
