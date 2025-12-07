Baik! Mari saya buatkan rencana komprehensif untuk refactoring ini:

  📋 Refactoring Plan: Direct Query Implementation

  Phase 1: Venue Dashboard Simplification

  1.1 Hapus Client Complexity

  - Remove client-wrapper.tsx yang hybrid
  - Remove useEffect, useState, API fetch logic
  - Remove manual refresh button complexity
  - Simplify ke pure server component

  1.2 Consolidate Data Fetching

  - Pindahkan semua logic dari API routes ke server component
  - Single data fetching layer menggunakan lib/supabase/queries/
  - Optimize queries dengan proper joins dan aggregations

  1.3 Simplify Component Structure

  - Convert client-wrapper.tsx → venue-dashboard-view.tsx (server component)
  - Remove React hooks dan client-side state
  - Pure data flow dari database ke UI

  Phase 2: Public Pages Direct Queries

  2.1 Explore Public Pages Pattern

  // Pages yang perlu di-analyze:
  - / (homepage) - Venue listing
  - /explore - Venue search/filter
  - /venues/[slug] - Venue detail page
  - /courts/[id] - Court detail page
  - /booking/[id] - Booking detail page

  2.2 Public Pages Strategy

  - Homepage: Featured venues, upcoming bookings
  - Explore: Search, filter, pagination dengan direct queries
  - Venue Detail: Courts, reviews, availability
  - Booking Flow: Real-time availability check

  2.3 Search & Optimization

  - Database-level filtering (bukan client-side)
  - Optimized queries dengan proper indexing
  - Server-side pagination

  Phase 3: API Routes Cleanup

  3.1 Keep Only Essential APIs

  // API routes yang PERTAHANKAN:
  - /api/bookings/* (CRUD operations)
  - /api/payments/* (payment processing)
  - /api/reviews/* (review management)
  - /api/auth/* (authentication)
  - /api/notifications/* (real-time features)

  // API routes yang HAPUS/Refactor:
  - /api/dashboard/venue/stats → direct query
  - /api/dashboard/venue/charts → direct query
  - /api/dashboard/admin/stats → direct query
  - /api/dashboard/admin/charts → direct query
  - /api/venues/* (listing) → direct query
  - /api/courts/* (listing) → direct query

  Phase 4: Performance Optimization

  4.1 Query Optimization

  - Implement query caching di server level
  - Optimize court_summaries_with_stats view
  - Add database indexes untuk frequent queries
  - Implement connection pooling

  4.2 Data Structure

  - Centralized logic di lib/supabase/queries/
  - Reusable query functions
  - Type-safe return types
  - Error handling patterns

  Phase 5: Benefits & Impact

  5.1 Performance Gains

  - ⚡ 50-70% faster page loads (no HTTP overhead)
  - 🔄 Auto refresh on every visit
  - 📊 Real-time data without manual refresh
  - 💾 Better caching dengan Next.js ISR

  5.2 Code Reduction

  - 🗑️ -30% code complexity
  - 🧹 Cleaner architecture
  - 🔧 Easier debugging
  - 📚 Better maintainability

  5.3 User Experience

  - 🚀 Instant data updates
  - 📱 Mobile-friendly (no client-side JS complexity)
  - 🔄 Always fresh data
  - ⚡ Faster navigation

  Implementation Strategy

  Step 1: Create New Query Functions

  - Extend lib/supabase/queries/ dengan public page queries
  - Create reusable dashboard aggregation functions
  - Optimize existing queries

  Step 2: Refactor Venue Dashboard

  - Simplify component structure
  - Remove client-side complexity
  - Test functionality preservation

  Step 3: Refactor Public Pages

  - Convert API-based pages to direct queries
  - Optimize search and filtering
  - Implement server-side features

  Step 4: Cleanup API Routes

  - Remove redundant dashboard APIs
  - Keep only operation-critical APIs
  - Update documentation

  Step 5: Performance Testing

  - Measure load time improvements
  - Verify data consistency
  - Test error handling

  Total estimated time: 2-3 hari untuk full implementation.

  Risk level: Low karena kita hanya memindahkan logic yang sudah ada, tidak ada perubahan business logic.

  Siap mulai implementasi? Saya akan mulai dengan Phase 1: Venue Dashboard simplification.
