# Query Integration Guide

Panduan lengkap untuk mengintegrasikan query classes ke dalam halaman Next.js App Router.

## 📋 Daftar Isi

1. [Pattern Dasar](#pattern-dasar)
2. [Contoh Integrasi per Tipe Halaman](#contoh-integrasi-per-tipe-halaman)
3. [Best Practices](#best-practices)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)

---

## 🔧 Pattern Dasar

### Import Pattern
```typescript
// Import query classes
import {
  PublicQueries,
  UserQueries,
  VenueQueries,
  AdminQueries
} from '@/lib/queries';

// Import types jika needed
import type {
  Court,
  Booking,
  UserDashboardData,
  AdminDashboardData
} from '@/lib/queries';
```

### Basic Usage Pattern
```typescript
export default async function Page() {
  // Untuk halaman public
  const courts = await PublicQueries.getActiveCourts({ limit: 10 });

  // Untuk halaman user (dengan authentication)
  const profile = await requireRole(["user", "admin"]);
  const userDashboard = await UserQueries.getUserDashboardData(profile.id);

  // Parallel queries untuk optimal performance
  const [data1, data2, data3] = await Promise.all([
    PublicQueries.getActiveCourts(),
    PublicQueries.getForumThreads(),
    PublicQueries.getVenues()
  ]);

  return <Component data={data} />;
}
```

---

## 📄 Contoh Integrasi per Tipe Halaman

### 1. Public Pages (Landing, Explore, dll)

#### Landing Page (`app/page.tsx`)
```typescript
import { PublicQueries } from '@/lib/queries';
import Link from "next/link";
import { HeroCarousel } from "@/components/landing/hero-carousel";

export default async function Home() {
  // Parallel fetch untuk optimal performance
  const [courts, threads] = await Promise.all([
    PublicQueries.getActiveCourts({ limit: 6 }),
    PublicQueries.getForumThreads({ limit: 4 })
  ]);

  return (
    <main>
      <HeroCarousel />

      {/* Venue Section */}
      <section>
        <h2>Rekomendasi Venue</h2>
        <div className="grid">
          {courts.map(court => (
            <CourtCard key={court.id} court={court} />
          ))}
        </div>
        <Link href="/venues">Lihat semua →</Link>
      </section>

      {/* Forum Section */}
      <section>
        <h2>Diskusi Komunitas</h2>
        <div className="space-y-4">
          {threads.map(thread => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
        <Link href="/forum">Masuk forum →</Link>
      </section>
    </main>
  );
}
```

#### Explore Page (`app/explore/page.tsx`)
```typescript
import { PublicQueries } from '@/lib/queries';
import { CourtFilters, CourtGrid } from '@/components/explore';

export default async function ExplorePage({
  searchParams
}: {
  searchParams: { sport?: string; city?: string; sort?: string }
}) {
  // Extract query options dari searchParams
  const options: CourtQueryOptions = {
    sport: searchParams.sport as SportType,
    city: searchParams.city,
    sortBy: searchParams.sortBy as 'rating' | 'price' | 'name',
    limit: 20
  };

  const courts = await PublicQueries.getActiveCourts(options);

  return (
    <div>
      <CourtFilters />
      <CourtGrid courts={courts} />
    </div>
  );
}
```

#### Court Detail Page (`app/court/[slug]/page.tsx`)
```typescript
import { PublicQueries } from '@/lib/queries';
import { CourtBooking, CourtGallery, CourtReviews } from '@/components/court';

export default async function CourtPage({ params }: { params: { slug: string } }) {
  const court = await PublicQueries.getCourtDetail(params.slug);

  if (!court) {
    notFound();
  }

  return (
    <div>
      <CourtHeader court={court} />
      <CourtGallery images={court.images} />
      <CourtBooking court={court} />
      <CourtReviews reviews={court.reviews} />
    </div>
  );
}
```

### 2. User Dashboard Pages

#### User Dashboard (`app/dashboard/user/page.tsx`)
```typescript
import { UserQueries, PublicQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function UserDashboardPage() {
  const profile = await requireRole(["user", "admin"]);

  // Parallel fetch user data
  const [dashboardData, recommendations] = await Promise.all([
    UserQueries.getUserDashboardData(profile.id),
    UserQueries.getRecommendedCourts(profile.id, 6)
  ]);

  return (
    <div>
      <WelcomeHeader name={profile.full_name} />

      {/* Stats Cards */}
      <StatsGrid stats={dashboardData.stats} />

      {/* Active Bookings */}
      <BookingsSection
        title="Booking Aktif"
        bookings={dashboardData.activeBookings}
      />

      {/* Recommendations */}
      <RecommendationsSection courts={recommendations} />
    </div>
  );
}
```

#### Booking Detail Page (`app/dashboard/user/bookings/[id]/page.tsx`)
```typescript
import { UserQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const profile = await requireRole(["user", "admin"]);

  const booking = await UserQueries.getBookingDetail(params.id, profile.id);

  if (!booking) {
    notFound();
  }

  // Check if user can review this booking
  const canReview = await UserQueries.canUserReviewBooking(params.id, profile.id);

  return (
    <div>
      <BookingHeader booking={booking} />
      <BookingDetails booking={booking} />
      <PaymentStatus booking={booking} />
      {canReview && <ReviewForm bookingId={booking.id} />}
    </div>
  );
}
```

### 3. Venue Dashboard Pages

#### Venue Dashboard (`app/dashboard/venue/page.tsx`)
```typescript
import { VenueQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function VenueDashboardPage() {
  const profile = await requireRole(["venue_partner", "admin"]);

  const dashboardData = await VenueQueries.getVenueDashboardData(profile.id);

  return (
    <div>
      <VenueHeader venue={dashboardData.venue} />

      {/* Venue Stats */}
      <StatsGrid stats={dashboardData.stats} />

      {/* Top Courts */}
      <TopCourtsSection courts={dashboardData.topCourts} />

      {/* Recent Bookings */}
      <RecentBookings venueId={dashboardData.venue.id} />
    </div>
  );
}
```

#### Venue Bookings Page (`app/dashboard/venue/bookings/page.tsx`)
```typescript
import { VenueQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function VenueBookingsPage({
  searchParams
}: {
  searchParams: { status?: string; date?: string }
}) {
  const profile = await requireRole(["venue_partner", "admin"]);

  // Get venue ID from user (assuming single venue per partner for simplicity)
  const dashboardData = await VenueQueries.getVenueDashboardData(profile.id);
  const venueId = dashboardData.venue.id;

  // Filter options
  const options: BookingQueryOptions = {
    status: searchParams.status as BookingStatus,
    startDate: searchParams.date,
    limit: 50
  };

  const bookings = await VenueQueries.getVenueBookings(profile.id, venueId, options);

  return (
    <div>
      <BookingFilters />
      <BookingsTable bookings={bookings} />
    </div>
  );
}
```

### 4. Admin Dashboard Pages

#### Admin Dashboard (`app/dashboard/admin/page.tsx`)
```typescript
import { AdminQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function AdminDashboardPage() {
  const profile = await requireRole("admin");

  const dashboardData = await AdminQueries.getAdminDashboardData();

  return (
    <div>
      <AdminHeader />

      {/* System Stats */}
      <StatsGrid stats={dashboardData.stats} />

      {/* Charts */}
      <div className="grid">
        <RevenueChart data={dashboardData.charts.monthlyRevenue} />
        <VenueGrowthChart data={dashboardData.charts.venueGrowth} />
        <BookingTrendsChart data={dashboardData.charts.bookingTrends} />
      </div>

      {/* Bottom Sections */}
      <div className="grid">
        <TopVenuesSection venues={dashboardData.topVenues} />
        <PendingApplicationsSection applications={dashboardData.pendingApplications} />
      </div>
    </div>
  );
}
```

#### Applications Page (`app/dashboard/admin/applications/page.tsx`)
```typescript
import { AdminQueries } from '@/lib/queries';
import { requireRole } from '@/lib/supabase/roles';

export default async function ApplicationsPage({
  searchParams
}: {
  searchParams: { status?: string; page?: string }
}) {
  const profile = await requireRole("admin");

  const options = {
    status: searchParams.status as 'pending' | 'accepted' | 'rejected',
    limit: 20,
    offset: (parseInt(searchParams.page || '1') - 1) * 20
  };

  const applications = await AdminQueries.getVenuePartnerApplications(options);

  return (
    <div>
      <ApplicationsHeader />
      <ApplicationFilters currentStatus={options.status} />
      <ApplicationsGrid
        applications={applications.allApplications}
        pendingCount={applications.pending.length}
      />
      <Pagination
        currentPage={parseInt(searchParams.page || '1')}
        hasMore={applications.allApplications.length === options.limit}
      />
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Parallel Query Execution
```typescript
// ❌ BAD: Sequential queries
const courts = await PublicQueries.getActiveCourts();
const threads = await PublicQueries.getForumThreads();
const venues = await PublicQueries.getVenues();

// ✅ GOOD: Parallel queries
const [courts, threads, venues] = await Promise.all([
  PublicQueries.getActiveCourts(),
  PublicQueries.getForumThreads(),
  PublicQueries.getVenues()
]);
```

### 2. Error Boundaries
```typescript
export default async function Page() {
  let dashboardData;
  try {
    dashboardData = await AdminQueries.getAdminDashboardData();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    // Provide fallback data
    dashboardData = getFallbackDashboardData();
  }

  return <Component data={dashboardData} />;
}
```

### 3. Role-Based Access
```typescript
export default async function AdminPage() {
  // Always verify role first
  const profile = await requireRole("admin");

  // Then fetch data
  const data = await AdminQueries.getSomeData();

  return <Component data={data} />;
}
```

### 4. Data Validation
```typescript
export default async function CourtPage({ params }: { params: { slug: string } }) {
  const court = await PublicQueries.getCourtDetail(params.slug);

  // Always validate data exists
  if (!court) {
    notFound();
  }

  return <Component court={court} />;
}
```

### 5. Pagination Pattern
```typescript
export default async function BookingsPage({
  searchParams
}: {
  searchParams: { page?: string; limit?: string }
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '20');

  const bookings = await SomeQueries.getBookings({
    limit,
    offset: (page - 1) * limit
  });

  return (
    <div>
      <BookingsList bookings={bookings} />
      <Pagination currentPage={page} limit={limit} />
    </div>
  );
}
```

---

## 🚨 Error Handling

### Global Error Handler Pattern
```typescript
// lib/query-utils.ts
export async function safeQuery<T>(
  query: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("Query failed:", error);
    return fallback as T;
  }
}

// Usage
export default async function Page() {
  const [courts, threads] = await Promise.all([
    safeQuery(() => PublicQueries.getActiveCourts(), []),
    safeQuery(() => PublicQueries.getForumThreads(), [])
  ]);

  return <Component courts={courts} threads={threads} />;
}
```

### Type-Safe Error Handling
```typescript
export default async function Page() {
  let dashboardData: AdminDashboardData;

  try {
    dashboardData = await AdminQueries.getAdminDashboardData();
  } catch (error) {
    dashboardData = {
      stats: { totalVenues: 0, totalUsers: 0, /* ... */ },
      charts: { monthlyRevenue: [], venueGrowth: [], /* ... */ },
      topVenues: [],
      pendingApplications: []
    };
  }

  return <Component data={dashboardData} />;
}
```

---

## ⚡ Performance Optimization

### 1. Selective Data Fetching
```typescript
// ❌ BAD: Fetch all data
const allBookings = await UserQueries.getUserBookings(userId);

// ✅ GOOD: Fetch only what's needed
const recentBookings = await UserQueries.getUserBookings(userId, {
  limit: 10,
  status: 'active'
});
```

### 2. Caching Strategy
```typescript
// lib/with-cache.ts
export async function withCache<T>(
  key: string,
  query: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  // Implementation depends on your caching solution
  // Could be Redis, Upstash, or Next.js built-in cache
}

// Usage
export default async function Page() {
  const courts = await withCache(
    "active-courts-homepage",
    () => PublicQueries.getActiveCourts({ limit: 10 })
  );

  return <Component courts={courts} />;
}
```

### 3. Data Transformation
```typescript
// Transform data di query level, not di component level
const transformedData = await SomeQueries.getTransformedData();

// Daripada
const rawData = await SomeQueries.getRawData();
const transformedData = transformData(rawData); // ❌ Di component
```

### 4. Lazy Loading Pattern
```typescript
// Untuk data yang tidak kritis di initial load
export default async function Page() {
  const criticalData = await PublicQueries.getCriticalData();

  return (
    <div>
      <CriticalComponent data={criticalData} />
      <Suspense fallback={<Loading />}>
        <NonCriticalComponent /> {/* Fetch data di dalam component */}
      </Suspense>
    </div>
  );
}
```

---

## 📝 Migration Strategy

### Step 1: Replace Old Queries
```typescript
// Before
import { fetchCourtSummaries } from "@/lib/supabase/queries/courts";
const courts = await fetchCourtSummaries();

// After
import { PublicQueries } from '@/lib/queries';
const courts = await PublicQueries.getActiveCourts();
```

### Step 2: Update Types
```typescript
// Before
import type { CourtSummary } from "@/lib/supabase/queries/courts";

// After
import type { Court } from '@/lib/queries';
```

### Step 3: Batch Migrations
1. Start with public pages (easiest)
2. Move to user dashboards
3. Update venue dashboards
4. Finish with admin dashboards

### Step 4: Test & Verify
- Check data consistency
- Verify performance improvements
- Test error scenarios
- Validate type safety

---

## 🔗 Quick Reference

| Page Type | Query Class | Common Methods |
|-----------|-------------|----------------|
| Landing | `PublicQueries` | `getActiveCourts()`, `getForumThreads()` |
| Explore | `PublicQueries` | `getActiveCourts(options)` |
| Court Detail | `PublicQueries` | `getCourtDetail(slug)` |
| User Dashboard | `UserQueries` | `getUserDashboardData(userId)` |
| Booking Detail | `UserQueries` | `getBookingDetail(id, userId)` |
| Venue Dashboard | `VenueQueries` | `getVenueDashboardData(userId)` |
| Admin Dashboard | `AdminQueries` | `getAdminDashboardData()` |
| Applications | `AdminQueries` | `getVenuePartnerApplications(options)` |

---

## 🎯 Final Tips

1. **Always validate data** before rendering
2. **Use parallel queries** whenever possible
3. **Handle errors gracefully** with fallbacks
4. **Optimize query options** (limit, filters, sorting)
5. **Cache expensive queries** appropriately
6. **Maintain type safety** throughout the stack
7. **Test error scenarios** and edge cases
8. **Monitor performance** after migration

Dengan mengikuti panduan ini, kamu bisa mengintegrasikan query classes dengan efisien dan menjaga performa aplikasi tetap optimal.