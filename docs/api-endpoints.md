# CourtEase API Endpoints Documentation

Berikut adalah daftar API endpoint yang telah dibuat untuk sistem booking CourtEase:

## 1. Booking Detail API
**Endpoint:** `GET /api/bookings/[id]`

**Deskripsi:** Mendapatkan detail booking spesifik untuk user yang sedang login.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "start_time": "2025-01-15T10:00:00Z",
    "end_time": "2025-01-15T11:00:00Z",
    "status": "confirmed",
    "payment_status": "paid",
    "price_total": 100000,
    "court": {
      "id": "court-uuid",
      "name": "Lapangan Futsal A",
      "sport": "futsal",
      "venue_name": "Venue Name"
    },
    "profile": {
      "id": "profile-uuid",
      "full_name": "User Name",
      "email": "user@example.com"
    }
  }
}
```

## 2. User Bookings API
**Endpoint:** `GET /api/bookings`

**Deskripsi:** Mendapatkan daftar semua booking milik user.

**Query Parameters:**
- `status` (optional): Filter booking status (pending, confirmed, completed, cancelled)
- `limit` (optional): Jumlah data per page (default: 10)
- `offset` (optional): Offset untuk pagination (default: 0)
- `upcoming` (optional): true untuk mendapatkan booking yang akan datang

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 25,
      "hasMore": true
    }
  }
}
```

## 3. Create New Booking
**Endpoint:** `POST /api/bookings`

**Deskripsi:** Membuat booking baru.

**Request Body:**
```json
{
  "court_id": "court-uuid",
  "start_time": "2025-01-15T10:00:00Z",
  "end_time": "2025-01-15T11:00:00Z",
  "notes": "Optional notes"
}
```

## 4. Cancel Booking
**Endpoint:** `POST /api/bookings/[id]/cancel`

**Deskripsi:** Membatalkan booking (minimal 2 jam sebelum waktu mulai).

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking_id": "booking-uuid",
    "status": "cancelled",
    "refund_info": "Refund policy applies according to payment provider terms"
  }
}
```

## 5. Update Booking Status
**Endpoint:** `PUT /api/bookings/[id]/status`

**Deskripsi:** Update status booking (confirmed, checked_in).

**Request Body:**
```json
{
  "status": "checked_in"
}
```

## 6. User Dashboard API
**Endpoint:** `GET /api/dashboard`

**Deskripsi:** Mendapatkan data dashboard user termasuk upcoming bookings dan recommended courts.

## 7. Booking Review (Sudah Ada)
**Endpoint:** `POST /api/bookings/[id]/review`

**Deskripsi:** Submit review untuk booking yang sudah selesai (sudah ada implementasi).

## 8. Comprehensive Booking System API
**Endpoint:** `GET /api/booking-system`

**Deskripsi:** Mendapatkan keseluruhan data booking system untuk user (dashboard, stats, recent bookings).

**Query Parameters:**
- `type` (optional): "user" (default) atau "venue" untuk venue partner

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "profile-uuid",
      "fullName": "User Name",
      "email": "user@example.com",
      "role": "user"
    },
    "dashboard": {
      "bookings": [...],
      "recommendedCourts": [...]
    },
    "stats": {
      "total": 10,
      "upcoming": 2,
      "completed": 6,
      "cancelled": 2,
      "totalSpent": 600000,
      "averageRating": 4.5
    },
    "recentBookings": [...],
    "upcomingBookings": [...],
    "completedBookings": [...]
  }
}
```

**Health Check:** `POST /api/booking-system`

**Deskripsi:** Health check untuk memastikan semua sistem booking berfungsi dengan baik.

## Authentication

Semua endpoint memerlukan authentication. User harus login terlebih dahulu. API akan secara otomatis mendeteksi user yang sedang login melalui Supabase auth.

## Error Handling

API mengembalikan response dengan format:
- `401`: Unauthorized (user tidak login)
- `404`: Not Found (booking tidak ditemukan atau bukan milik user)
- `400`: Bad Request (request tidak valid)
- `409`: Conflict (konflik seperti booking double)
- `500`: Internal Server Error

## Status Flow

Booking Status Flow:
1. `pending` → `confirmed` (setelah payment)
2. `confirmed` → `checked_in` (saat check-in)
3. `checked_in` → `completed` (selesai)
4. Semua status → `cancelled` (jika dibatalkan)

## Usage Examples

### Mendapatkan detail booking
```javascript
const response = await fetch('/api/bookings/booking-uuid', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});
const data = await response.json();
```

### Membuat booking baru
```javascript
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    court_id: 'court-uuid',
    start_time: '2025-01-15T10:00:00Z',
    end_time: '2025-01-15T11:00:00Z',
    notes: 'Booking notes'
  })
});
```

### Membatalkan booking
```javascript
const response = await fetch('/api/bookings/booking-uuid/cancel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
});
```

### Check-in booking
```javascript
const response = await fetch('/api/bookings/booking-uuid/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'checked_in'
  })
});
```