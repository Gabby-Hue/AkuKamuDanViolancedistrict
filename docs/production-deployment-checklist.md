# Production Deployment Checklist - Payment Status Fix

## 🚀 Pre-Deployment

### 1. Database Migration
- [ ] **Backup Production Database**
- [ ] **Run SQL Migration**: `docs/production-payment-fix.sql`
- [ ] **Verify Column Added**: Check `payment_completed_at` exists
- [ ] **Update Stuck Bookings**: Run the UPDATE query in migration script

### 2. Environment Variables
- [ ] **Verify MIDTRANS_SERVER_KEY** in production environment
- [ ] **Verify MIDTRANS_CLIENT_KEY** (NEXT_PUBLIC_) in production
- [ ] **Check webhook URL**: `https://yourdomain.com/api/payments/midtrans/webhook`

### 3. Midtrans Configuration
- [ ] **Login to Production Midtrans Dashboard**: https://dashboard.midtrans.com
- [ ] **Navigate to Settings > Webhooks**
- [ ] **Add/Update Webhook URL**: `https://yourdomain.com/api/payments/midtrans/webhook`
- [ ] **Enable all status notifications**:
  - ✅ Transaction Success
  - ✅ Transaction Failure
  - ✅ Transaction Challenge
  - ✅ Transaction Pending
  - ✅ Transaction Cancel
  - ✅ Transaction Expire

### 4. SSL Certificate
- [ ] **Verify HTTPS** (required by Midtrans)
- [ ] **Check SSL certificate validity**
- [ ] **Test webhook accessibility from external tools**

## 🔧 Code Changes to Deploy

### Fixed Files
1. **`lib/payments/midtrans.ts`**
   - ✅ Field name mapping: `payment_status`/`booking_status` (snake_case)

2. **`app/api/bookings/[id]/payment-status/route.ts`**
   - ✅ Fixed field name references
   - ✅ Manual status mapping logic

3. **`app/api/payments/midtrans/webhook/route.ts`**
   - ✅ Already correct (was using snake_case)

## 🧪 Testing Post-Deployment

### 1. Manual Testing
```bash
# Test manual status check (after authentication)
GET /api/bookings/{booking-id}/payment-status

# Test webhook (requires signature verification)
POST /api/payments/midtrans/webhook
```

### 2. End-to-End Testing
1. **Create new booking**
2. **Process payment via Midtrans**
3. **Wait for webhook callback** (should be immediate)
4. **Verify status update**: `pending/pending` → `confirmed/paid`
5. **Check database**: `payment_completed_at` should be populated

### 3. Automated Testing
- [ ] **Monitor webhook logs** for incoming callbacks
- [ ] **Check booking status** updates in database
- [ ] **Verify payment completion timestamps**

## 📊 Monitoring & Rollback

### Monitoring
- [ ] **Set up alerts** for webhook failures
- [ ] **Monitor database** for stuck bookings
- [ ] **Check payment success rates** after deployment

### Rollback Plan
If issues occur:
1. **Revert code** to previous version
2. **Database rollback**: `ALTER TABLE bookings DROP COLUMN payment_completed_at;`
3. **Disable Midtrans webhook** temporarily

## 🔐 Security Considerations
- [ ] **Never expose MIDTRANS_SERVER_KEY** to client-side
- [ ] **Verify webhook signature** validation is working
- [ ] **Monitor for suspicious webhook activity**
- [ ] **Rate limit** webhook endpoint if needed

## ✅ Success Criteria
- [ ] **New bookings** update status automatically after payment
- [ ] **Existing stuck bookings** are fixed by migration script
- [ ] **Webhook receives** callbacks from Midtrans
- [ ] **No payment errors** in production logs
- [ ] **Dashboard shows** correct booking status for users

---

**🎯 Expected Result**: Payment workflow will work end-to-end with automatic status updates after successful Midtrans payments!