# Midtrans Webhook Setup Guide

## Masalah yang Diperbaiki

Sebelumnya, setelah pembayaran Midtrans berhasil, status booking dan payment tidak terupdate karena **webhook endpoint tidak ada**. Sekarang sudah diperbaiki dengan membuat endpoint webhook.

## 1. Endpoint Webhook yang Baru

### URL Webhook
```
POST https://yourdomain.com/api/payments/midtrans/webhook
```

### Fitur Webhook
- ✅ Verifikasi signature keamanan Midtrans
- ✅ Update otomatis booking status dan payment status
- ✅ Handle semua status transaksi Midtrans
- ✅ Log lengkap untuk debugging
- ✅ Graceful error handling

## 2. Konfigurasi di Midtrans Dashboard

### Langkah-langkah Setup

1. **Login ke Midtrans Dashboard**
   Buka: https://dashboard.sandbox.midtrans.com (development) atau https://dashboard.midtrans.com (production)

2. **Navigate ke Settings > Webhooks**
   Pilih menu `Settings` lalu `Webhooks` di sidebar.

3. **Add Webhook URL**
   - **Environment**: Pilih sesuai environment (Sandbox/Production)
   - **Webhook URL**: `https://yourdomain.com/api/payments/midtrans/webhook`
   - **Status Notifications**: Pilih semua status untuk testing:
     - ✅ Transaction Success
     - ✅ Transaction Failure
     - ✅ Transaction Challenge
     - ✅ Transaction Pending
     - ✅ Transaction Cancel
     - ✅ Transaction Expire

4. **Save Configuration**

### Testing Webhook

Coba test dengan webhook tester tools:

```bash
# Test webhook manually (jika perlu)
curl -X POST https://yourdomain.com/api/payments/midtrans/webhook \
  -H "Content-Type: application/json" \
  -H "x-callback-signature: test_signature" \
  -d '{
    "transaction_status": "settlement",
    "order_id": "BOOK-123456789-123",
    "status_code": "200",
    "gross_amount": "50000"
  }'
```

## 3. Status Mapping

Midtrans → Application Status:

| Midtrans Status | Payment Status | Booking Status | Deskripsi |
|-----------------|----------------|----------------|-----------|
| `settlement` | `paid` | `confirmed` | Pembayaran berhasil ✅ |
| `capture` (fraud=accept) | `paid` | `confirmed` | Kartu kredit berhasil ✅ |
| `capture` (fraud=challenge) | `waiting_confirmation` | `pending` | Perlu verifikasi |
| `authorize` | `waiting_confirmation` | `pending` | Otorisasi pending |
| `pending` | `pending` | `pending` | Menunggu pembayaran |
| `expire/expired` | `cancelled` | `cancelled` | Pembayaran kadaluarsa ❌ |
| `deny/cancel/failure` | `cancelled` | `cancelled` | Pembayaran gagal ❌ |
| `refund/chargeback` | `refunded` | `cancelled` | Pengembalian dana ↩️ |

## 4. Environment Variables

Pastikan environment variables terkonfigurasi dengan benar:

```env
# Server-side (hanya di server backend)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxx

# Client-side (bisa diakses dari browser)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxx

# Optional: override URLs (default: sandbox)
# MIDTRANS_SNAP_BASE_URL=https://app.sandbox.midtrans.com
# MIDTRANS_API_BASE_URL=https://api.sandbox.midtrans.com
```

**🔐 Security Note**: `MIDTRANS_SERVER_KEY` tidak boleh ada `NEXT_PUBLIC_` prefix karena ini adalah secret key.

## 5. Testing Workflow

### Scenario 1: Pembayaran Berhasil

1. **User buat booking** → Status: `pending/pending`
2. **User bayar via Midtrans** → Popup pembayaran muncul
3. **Pembayaran berhasil** → Midtrans callback webhook
4. **Webhook memproses** → Status update: `confirmed/paid`
5. **User refresh dashboard** → Status sudah terupdate

### Scenario 2: Pembayaran Kadaluarsa

1. **User buat booking** → Status: `pending/pending`
2. **User tidak bayar** → Menunggu > 30 menit
3. **Scheduler check-expired** → Cek status ke Midtrans
4. **Update lokal** → Status: `cancelled/cancelled`
5. **Email notification** → User diberitahu booking dibatalkan

## 6. Debugging Tools

### Manual Status Check
```bash
# Check status booking tertentu
GET /api/bookings/{bookingId}/payment-status

# Jalankan scheduler untuk cek booking kadaluarsa
POST /api/payments/check-expired
```

### Monitoring Logs
Cek log di:
- Server logs untuk webhook processing
- Midtrans dashboard untuk transaction status
- Database `bookings` table untuk status changes

### Error Handling
- **Invalid signature**: Webhook ditolak, HTTP 401
- **Missing order_id**: Webhook ditolak, HTTP 400
- **Booking not found**: Log error, HTTP 200 (agar Midtrans tidak retry)
- **Database error**: Log error, HTTP 200 (agar Midtrans tidak retry)

## 7. Production Checklist

### ✅ Pre-deployment
- [ ] Update webhook URL ke production domain
- [ ] Test webhook dengan production credentials
- [ ] Set up SSL certificate (required oleh Midtrans)
- [ ] Verify server timing & timezone

### ✅ Security
- [ ] Confirm `MIDTRANS_SERVER_KEY` tidak exposed ke client
- [ ] Test webhook signature validation
- [ ] Set up rate limiting untuk endpoint webhook
- [ ] Monitor untuk suspicious webhook activity

### ✅ Monitoring
- [ ] Set up monitoring untuk webhook failures
- [ ] Alert jika webhook tidak menerima callback > 5 menit
- [ ] Dashboard untuk tracking payment success rates
- [ ] Automated testing untuk payment workflow

## 8. Common Issues & Solutions

### Issue: Webhook tidak tertrigger
**Cause**: URL salah atau tidak terdaftar di Midtrans
**Solution**:
- Verify webhook URL di Midtrans dashboard
- Pastikan URL accessible dari internet (bukan localhost)
- Test dengan manual webhook request

### Issue: Status tidak terupdate
**Cause**: Webhook signature mismatch atau booking tidak ditemukan
**Solution**:
- Check server logs untuk error details
- Verify `payment_reference` match dengan `order_id` dari Midtrans
- Test manual status check via `/api/bookings/{id}/payment-status`

### Issue: Pembayaran berhasil tapi status masih pending
**Cause**: Webhook terlambat atau gagal
**Solution**:
- Jalankan manual scheduler: `POST /api/payments/check-expired`
- Check status via: `GET /api/bookings/{id}/payment-status`
- Monitor Midtrans transaction status di dashboard

---

**🎯 Result**: Sekarang booking workflow sudah lengkap dengan webhook automation. Status akan terupdate otomatis setelah pembayaran berhasil!