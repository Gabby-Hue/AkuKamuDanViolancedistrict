# Analisis Pages CourtEase - Refactor Documentation

## Overview
Analisis lengkap semua pages dalam aplikasi CourtEase berdasarkan `refactor.md`. Dokumen ini mencakup struktur, query, dan pola data dari setiap kategori page.

---

## 🌐 Public Pages

### 1. **`app/page.tsx` - Landing Page**
- **Purpose**: Halaman utama dengan hero carousel, rekomendasi venue, dan highlight forum
- **Queries**:
  - `fetchCourtSummaries()` - Semua court untuk komponen NearestCourtSpotlight
  - `fetchForumThreads()` - Thread forum untuk RealtimeThreadHighlights
- **Data Pattern**: Parallel fetch dengan Promise.all()
- **Components**: HeroCarousel, SportsTabs, NearestCourtSpotlight, RealtimeThreadHighlights
- **Static Data**: Sports categories dan partner benefits (hardcoded)

### 2. **`app/explore/page.tsx` - Explore Page**
- **Purpose**: Halaman eksplorasi venue dan forum terintegrasi
- **Query**: `fetchExploreData()` - Combined courts dan threads data
- **Optimization**: `revalidate = 0` untuk real-time data
- **Component**: ExploreView (handle filtering dan search)

### 3. **`app/venues/page.tsx` - Venues Directory**
- **Purpose**: Direktori lengkap semua venue dengan filter
- **Query**: `fetchVenueSummaries()` - Data venue untuk directory
- **Features**: Focus functionality via search params
- **Component**: VenuesDirectory dengan sidebar tips

### 4. **`app/forum/page.tsx` - Forum Homepage**
- **Purpose**: Halaman utama forum dengan kategori dan threads
- **Queries**:
  - `fetchForumCategories()` - Kategori forum
  - `fetchForumThreads()` - Daftar thread
- **Pattern**: Parallel fetch untuk categories dan threads
- **Component**: ForumView

### 5. **`app/forum/[slug]/page.tsx` - Thread Detail**
- **Purpose**: Detail thread diskusi forum
- **Query**: `fetchForumThreadDetail(slug)` - Detail thread dengan replies
- **Error Handling**: notFound() jika thread tidak ada
- **Component**: ThreadDiscussion

### 6. **`app/venue-partner/page.tsx` - Partner Application**
- **Purpose**: Form aplikasi venue partner
- **Pattern**: Client-side form dengan server action
- **No Database Queries**: Pure client form dengan submitPartnerApplication action
- **Components**: PartnerApplicationForm dengan state management

### 7. **`app/court/[slug]/page.tsx` - Court Detail**
- **Purpose**: Halaman detail lapangan lengkap dengan booking, gallery, dan reviews
- **Query**: `fetchCourtDetail(slug)` - Detail court lengkap dengan images dan reviews
- **Features**:
  - Hero section dengan image gallery
  - Information grid (surface, capacity, facilities)
  - Photo gallery
  - Location map integration
  - Community reviews section
  - Booking sidebar dengan Midtrans integration
- **Authentication**: `getProfileWithRole()` untuk booking restrictions
- **Role-based Restrictions**: Admin dan venue_partner tidak bisa booking
- **Components**: HeroSection, InfoGrid, PhotoGallery, BookingSidebar, VenueLocationMap
- **Midtrans Integration**: Payment processing dengan client key configuration

---

## 🛡️ Admin Dashboard Pages

### 1. **`app/dashboard/admin/page.tsx` - Admin Overview**
- **Purpose**: Dashboard admin dengan statistik sistem
- **Query**: `fetchAdminDashboardData()` - Comprehensive admin metrics
- **Data Includes**:
  - Total venues, users, bookings, revenue
  - Monthly revenue trends
  - Venue growth data
  - Booking trends
  - Top venues dan pending applications
- **Error Handling**: Fallback data jika query gagal
- **Charts**: Revenue, venue growth, booking trends
- **Authentication**: `requireRole("admin")`

### 2. **`app/dashboard/admin/applications/page.tsx` - Applications Management**
- **Purpose**: Management aplikasi venue partner
- **Queries**:
  - `getAdminDashboardData()` - Dashboard metrics
  - Direct query ke `venue_partner_applications` table
- **Data Processing**: Transform application data untuk client component
- **Filtering**: Status-based filtering (pending/accepted/rejected)
- **Component**: ApplicationsClient (client-side table management)
- **Authentication**: `requireRole("admin")`

### 3. **`app/dashboard/admin/settings/page.tsx` - Admin Settings**
- **Purpose**: Pengaturan admin profile dan keamanan
- **Pattern**: Static data tanpa database queries
- **Components**: Tabs-based UI (Profile/Security/Activity)
- **Data**: Hardcoded admin information dan activity logs
- **Authentication**: `requireRole("admin")` (implisit via sidebar)

---

## 👤 User Dashboard Pages

### 1. **`app/dashboard/user/page.tsx` - User Dashboard**
- **Purpose**: Dashboard user dengan booking summary
- **Queries**:
  - `bookingService.getUserBookings()` - Booking history user
  - `fetchCourtSummaries()` - Recommended courts
- **Filtering**: Active bookings dan pending payments
- **Authentication**: `requireRole(["user", "admin"])`
- **Components**: Stats cards, booking lists, recommendation cards

### 2. **`app/dashboard/user/bookings/[id]/page.tsx` - Booking Detail**
- **Purpose**: Detail booking dengan payment status dan review
- **Queries**:
  - `bookingService.getBookingDetail()` - Detail booking lengkap
  - `getBookingReview()` - Review data untuk booking
  - `fetchCourtDetail()` - Court details dengan images
- **Pattern**: Parallel fetch dengan Promise.all()
- **Features**: Payment status checking, review submission, ticket generation
- **Authentication**: `requireRole(["user", "admin"])`
- **Server Actions**: Review form submission

---

## 🏢 Venue Dashboard Pages

### 1. **`app/dashboard/venue/page.tsx` - Venue Overview**
- **Purpose**: Dashboard venue partner dengan stats dan revenue
- **Queries**:
  - `fetchVenueDashboardData()` - Venue data dan basic stats
  - `fetchVenueRevenueData()` - Revenue analytics
  - `fetchVenueStats()` - Enhanced statistics dari view
- **Pattern**: Parallel fetching untuk optimal performance
- **Authentication**: `requireRole("venue_partner")`
- **Component**: VenueDashboardView (handle complex chart rendering)

### 2. **`app/dashboard/venue/bookings/page.tsx` - Booking Management**
- **Purpose**: Management booking venue
- **Query**: `fetchVenueDashboardData()` - Venue list untuk filtering
- **Pattern**: Delegates kompleks UI ke client component
- **Component**: VenueBookingsClient (real-time booking management)
- **Authentication**: `requireRole("venue_partner")`

### 3. **`app/dashboard/venue/courts/page.tsx` - Court Management**
- **Purpose**: Manajemen lapangan venue
- **Query**: `fetchVenueDashboardData()` - Basic venue data
- **Pattern**: Simple data passing ke client wrapper
- **Component**: CourtsClientWrapper
- **Authentication**: `requireRole("venue_partner")`

### 4. **`app/dashboard/venue/courts/add/page.tsx` - Add Court**
- **Purpose**: Form tambah lapangan baru
- **Query**: `fetchVenueDashboardData()` - Untuk venue selection
- **Component**: ClientFormWrapper (handle form complexity)
- **Authentication**: `requireRole("venue_partner")`
- **Form**: Court creation dengan image upload

### 5. **`app/dashboard/venue/courts/edit/[id]/page.tsx` - Edit Court**
- **Purpose**: Form edit lapangan existing
- **Query**: `fetchVenueDashboardData()` - Venue validation
- **Component**: ClientEditFormWrapper
- **Authentication**: `requireRole("venue_partner")`
- **Features**: Court updates dengan redirect protection

### 6. **`app/dashboard/venue/settings/page.tsx` - Venue Settings**
- **Purpose**: Pengaturan profile venue
- **Query**: `fetchVenueDashboardData()` - Build navigation
- **Component**: VenueSettingsForm dengan full sidebar layout
- **Authentication**: `requireRole("venue_partner")`
- **Data Flow**: Navigation construction dari venue data

---

## 📊 Query Patterns Analysis

### **Common Query Functions**

1. **`fetchCourtSummaries()`**
   - Used: Landing page, user dashboard
   - Purpose: Get court data dengan basic info
   - Tables: `courts` + `venues` join

2. **`fetchVenueDashboardData()`**
   - Used: ALL venue dashboard pages
   - Purpose: Basic venue data untuk dashboard
   - Pattern: konsisten across venue pages

3. **`fetchForumThreads()`**
   - Used: Landing page, forum homepage
   - Purpose: Forum thread data
   - Tables: `forum_threads` + profiles join

4. **`bookingService.getUserBookings()`**
   - Used: User dashboard
   - Purpose: User booking history
   - Service layer abstraction

### **Database View Usage**
- `court_summaries_with_stats` - Enhanced court data dengan statistics
- `booking_summary_data` - Aggregated booking metrics
- `court_review_summary` - Review aggregates

### **Service Layer vs Direct Queries**
- **Service Layer**: `bookingService` untuk user booking operations
- **Direct Queries**: Admin dashboard menggunakan direct Supabase queries
- **Mixed Pattern**: Venue pages menggunakan keduanya

---

## 🔐 Authentication Patterns

### **Role-Based Access**
```typescript
// Admin only
requireRole("admin")

// User + Admin
requireRole(["user", "admin"])

// Venue Partner only
requireRole("venue_partner")
```

### **Profile fetching**
- `requireRole()` untuk validation
- `getAuthenticatedProfile()` untuk user data
- Role-based navigation rendering

---

## 🚨 Issues Identified

### **Missing Pages**
1. **`app/courts/[slug]/page.tsx`** - Court detail page tidak exists
   - Impact: Tidak ada detail view untuk individual courts
   - Suggestion: Buat dynamic route untuk court details

### **Query Optimization Opportunities**
1. **Repeated Queries**: `fetchVenueDashboardData()` di semua venue pages
   - Could be cached or optimized
2. **Parallel Fetching**: Some pages masih sequential, bisa di-optimalkan
3. **Data Over-fetching**: Beberapa pages fetch lebih banyak data daripada needed

### **Architecture Inconsistencies**
1. **Mixed Patterns**: Service layer vs direct queries tidak konsisten
2. **Client Delegation**: Too much logic di client components
3. **Static Data**: Admin settings menggunakan hardcoded data

---

## 📋 Refactor Recommendations

### **High Priority**
1. **Create Court Detail Page**: Implement `/app/courts/[slug]/page.tsx`
2. **Standardize Query Patterns**: Choose service layer vs direct queries
3. **Optimize Repeated Queries**: Cache atau optimize venue dashboard data

### **Medium Priority**
1. **Reduce Client Complexity**: Pindahkan lebih banyak logic ke server components
2. **Improve Error Handling**: Standardize error patterns across pages
3. **Data Pagination**: Implement pagination untuk large datasets

### **Low Priority**
1. **Static Data Management**: Move hardcoded data ke database atau config
2. **Component Standardization**: Create reusable dashboard components
3. **Performance Optimization**: Implement better loading states

---

## 🏗️ Proposed Architecture

### **Query Layer Standardization**
```
lib/
├── queries/
│   ├── public.ts          # Public page queries
│   ├── dashboard.ts       # Dashboard queries (all roles)
│   ├── admin.ts          # Admin-specific queries
│   └── venue.ts          # Venue-specific queries
└── services/
    ├── booking.service.ts # Booking operations
    ├── venue.service.ts   # Venue operations
    └── user.service.ts    # User operations
```

### **Page Structure Standardization**
```typescript
export default async function Page({ params, searchParams }) {
  // 1. Authentication & Authorization
  const user = await requireRole(["admin", "user", "venue_partner"]);

  // 2. Data fetching (parallel when possible)
  const [data1, data2] = await Promise.all([
    fetchData1(params),
    fetchData2(searchParams)
  ]);

  // 3. Error handling
  if (!data1) notFound();

  // 4. Component rendering
  return <Component data={{ data1, data2 }} />;
}
```

---

*Generated: 2025-12-05*
*Analysis based on current codebase structure and refactor.md requirements*