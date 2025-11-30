# CourtEase Service Layer Architecture

## 🏗️ **Arsitektur Layering yang Sudah Direfactor:**

```
Frontend/Client (React Components)
    ↓
API Layer (app/api/*.ts) - HTTP Logic + Simple CRUD
    ↓
Service Layer (lib/services/*.ts) - Business Logic
    ↓
Data Access Layer (lib/supabase/queries/*.ts) - Complex Queries
    ↓
Database (PostgreSQL via Supabase)
```

## 📁 **File Structure Baru:**

### **1. Service Layer (`lib/services/`)**
- **`booking.service.ts`** - Complex booking business logic
  - Payment sync with Midtrans
  - Booking validation & status management
  - Time conflict checking
  - Data transformation

### **2. API Layer (`app/api/`)**
- **`/api/bookings/[id]/route.ts`** - Booking detail (GET)
- **`/api/bookings/route.ts`** - User bookings (GET + POST)
- **`/api/bookings/[id]/cancel/route.ts`** - Cancel booking (POST)
- **`/api/bookings/[id]/status/route.ts`** - Update status (PUT)
- **`/api/dashboard/route.ts`** - User dashboard (GET)
- **`/api/booking-system/route.ts`** - Comprehensive system data

### **3. Data Access Layer (`lib/supabase/queries/`)**
- **Complex queries yang dipertahankan:**
  - `fetchUserDashboardData()` - Dashboard aggregation
  - `fetchVenueDashboardData()` - Venue analytics
  - `fetchCourtSummaries()` - Complex court data
  - `fetchAdminDashboardData()` - Admin analytics
  - `fetchExploreData()` - Explore page data

## 🎯 **Pemisahan Tanggung Jawab:**

### **✅ Service Layer (Complex Business Logic):**
1. **Payment Integration** - Midtrans sync, status normalization
2. **Business Rules** - Cancellation policies, check-in timing
3. **Data Validation** - Time conflicts, booking rules
4. **Data Transformation** - Complex mapping & aggregation
5. **Reusable Logic** - Dipakai di multiple places

### **✅ API Layer (HTTP + Simple CRUD):**
1. **Authentication & Authorization** - User validation
2. **Request Validation** - Input validation & sanitization
3. **HTTP Response Format** - Consistent JSON responses
4. **Error Handling** - Proper HTTP status codes
5. **Simple Database Operations** - Basic CRUD operations

### **✅ Data Access Layer (Complex Queries):**
1. **Complex Joins** - Multi-table queries
2. **Aggregations** - Dashboard data, analytics
3. **Performance Optimization** - Efficient query patterns
4. **Data Mapping** - Row to object transformation

## 🔄 **Status Flow yang Diimplementasikan:**

### **Booking Status Flow:**
```
pending → confirmed → checked_in → completed
    ↓         ↓           ↓
  cancelled  cancelled   cancelled
```

### **Payment Status Flow:**
```
pending → waiting_confirmation → paid
    ↓              ↓
  cancelled        expired
```

## 📊 **Database Schema Compliance:**

### **✅ Sudah Match dengan `docs/database.sql`:**

#### **Enums:**
```sql
booking_status: pending, confirmed, checked_in, completed, cancelled
payment_status: pending, waiting_confirmation, paid, expired, cancelled
sport_types: futsal, basket, basketball, soccer, volleyball, badminton, tennis, padel
surface_types: vinyl, rubber, parquet, wood, synthetic, cement, turf, grass, hard_court, clay
```

#### **Tables:**
- `bookings` - Booking data dengan foreign keys
- `courts` - Court information dengan relationship ke venues
- `venues` - Venue data untuk venue partners
- `profiles` - User profiles dengan roles
- `court_reviews` - Review system
- `forum_*` - Forum system tables

#### **Views:**
- `court_booking_slots` - Available booking slots
- `court_review_summary` - Aggregated review data

## 🔧 **Usage Examples:**

### **1. API Layer (Simple CRUD):**
```typescript
// app/api/bookings/[id]/route.ts
import { bookingService } from "@/lib/services/booking.service";

export async function GET(request, { params }) {
  const bookingDetail = await bookingService.getBookingDetail(
    params.id,
    profile.id
  );
  // API layer handles HTTP response formatting
}
```

### **2. Service Layer (Business Logic):**
```typescript
// lib/services/booking.service.ts
async getBookingDetail(bookingId: string, profileId: string) {
  // Complex business logic
  const synced = await this.syncPaymentStatusWithMidtrans(booking);
  const review = await this.getBookingReview(bookingId);
  // Return transformed data
}
```

### **3. Server Components (Direct Service Usage):**
```typescript
// app/components/UserDashboard.tsx
import { bookingService } from "@/lib/services/booking.service";

export default async function UserDashboard() {
  const bookings = await bookingService.getUserBookings(profile.id);
  // Render component
}
```

## 🎉 **Benefits dari Refactoring:**

1. **🔧 Maintainability** - Business logic terpusat
2. **🔄 Reusability** - Service bisa dipakai dimana saja
3. **🧪 Testability** - Service mudah diunit test
4. **📏 Consistency** - Business rules enforced everywhere
5. **🚀 Performance** - Optimized queries
6. **🛡️ Type Safety** - Strong TypeScript types
7. **📚 Documentation** - Clear separation of concerns

## 🚀 **Next Steps:**

1. **✅ Completed:** Service layer creation
2. **✅ Completed:** API endpoint refactoring
3. **✅ Completed:** Database schema compliance
4. **🔄 Testing:** Validate all functionality works
5. **📚 Documentation:** Update API docs
6. **🧪 Unit Tests:** Create service layer tests

## 📞 **Migration Guide:**

### **For Developers:**
1. **Import services:** `import { bookingService } from "@/lib/services"`
2. **Use in API:** API layer calls service methods
3. **Use in components:** Server components use services directly
4. **Use queries:** Complex queries still available from queries layer

### **Backward Compatibility:**
- Legacy query exports still available
- Existing API endpoints unchanged
- Gradual migration possible

This architecture provides a solid foundation for the CourtEase booking system with proper separation of concerns and business logic encapsulation! 🎯