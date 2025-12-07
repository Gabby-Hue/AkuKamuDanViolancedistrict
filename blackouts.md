Now let me complete the Supabase queries task and move to checking database dependencies:

● Now let me check the database schema for blackout table dependencies. From the database.sql file I read earlier, I can see:

  1. The court_blackouts table (lines 145-188)
  2. Two ENUM types related to blackout: blackout_scope and blackout_frequency (lines 88-89)
  3. A trigger for the table (lines 186-188)

  Let me analyze what other tables might reference the court_blackouts table:

● Now let me provide the safe SQL commands to drop the blackout table and its dependencies. Based on the database schema, I need to:

  1. Drop the trigger first
  2. Drop the table
  3. Drop the ENUM types

● Perfect! Saya telah berhasil menghapus seluruh ekosistem blackout dari codebase Anda. Berikut adalah ringkasan yang telah dilakukan:

  ✅ Yang Telah Dihapus:

  1. Frontend Pages & Components

  - app/dashboard/venue/blackout/page.tsx (halaman blackout utama)
  - Semua referensi navigation menu "Blackout Schedule" dari:
    - app/dashboard/venue/settings/page.tsx
    - app/dashboard/venue/courts/client-wrapper.tsx
    - app/dashboard/venue/client-wrapper.tsx
    - app/dashboard/venue/bookings/client-bookings-wrapper.tsx
    - app/dashboard/venue/courts/add/client-form-wrapper.tsx
    - app/dashboard/venue/courts/edit/[id]/client-edit-form-wrapper.tsx
    - app/dashboard/venue/courts/[id]/images/client-images-wrapper.tsx

  2. Backend & API

  - lib/supabase/queries/venue-blackouts.ts (file query blackout)
  - Type CourtBlackoutRow dari lib/api/types.ts
  - Import dan referensi blackout dari lib/api/index.ts

  3. Supabase Queries & Functions

  - Semua fungsi terkait blackout dari lib/supabase/queries/venue-courts.ts:
    - Query court_blackouts
    - Mapping blackout data
    - Maintenance blackout creation
    - Blackout deletion pada saat hapus court
  - Semua fungsi terkait blackout dari lib/supabase/queries/bookings.ts:
    - Type CourtBlackout
    - Query blackouts
    - Mapping blackout ke courts
  - Referensi blackout dari components/delete-court-dialog.tsx

  4. Interface & Types

  - Field blackouts: CourtBlackout[] dari interface VenueCourtDetail
  - Field blackouts dari interface VenueDashboardData
  - Type definition CourtBlackout
  - Import CourtBlackoutRow

  🗄️ SQL Commands untuk Menghapus Table di Supabase

  Untuk menghapus table blackout di database Supabase dengan aman, jalankan SQL berikut secara berurutan:

  -- 1. Drop trigger terlebih dahulu
  DROP TRIGGER IF EXISTS set_court_blackouts_updated_at ON public.court_blackouts;

  -- 2. Drop table court_blackouts
  DROP TABLE IF EXISTS public.court_blackouts;

  -- 3. Drop ENUM types (setelah table dihapus)
  DROP TYPE IF EXISTS public.blackout_scope;
  DROP TYPE IF EXISTS public.blackout_frequency;

  -- 4. Drop indexes yang mungkin tersisa (opsional, biasanya ikut terhapus saat table dihapus)
  DROP INDEX IF EXISTS public.court_blackouts_court_id_idx;
  DROP INDEX IF EXISTS public.court_blackouts_date_idx;

  ⚠️ Penting!

  1. Backup Data: Sebelum menjalankan SQL commands, pastikan untuk backup data court_blackouts jika ada data penting
  2. Cascading: Table court_blackouts memiliki foreign key ke courts dan profiles, tapi menggunakan ON DELETE CASCADE dan ON DELETE SET
   NULL, jadi aman untuk dihapus
  3. No Dependencies: Tidak ada table lain yang depends pada court_blackouts, jadi penghapusan aman

  ✨ Hasil Akhir

  Sekarang aplikasi Anda sudah bersih dari ekosistem blackout dan tidak akan ada error terkait blackout lagi. Fungsi lain seperti
  booking, court management, dan venue settings akan tetap berjalan normal.
