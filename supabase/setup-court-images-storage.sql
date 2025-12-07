-- =====================================================
-- COURT IMAGES STORAGE SETUP
-- =====================================================

-- 1. Create storage bucket for court images
-- Note: This needs to be run in Supabase Dashboard or via Supabase CLI
-- Bucket name: "court-images"

-- 2. Add primary_image_url column to courts table
ALTER TABLE courts
ADD COLUMN IF NOT EXISTS primary_image_url TEXT,
ADD COLUMN IF NOT EXISTS court_images_url_array TEXT[] DEFAULT '{}';

-- 3. Create RLS policies for the bucket
-- These policies control access to the court-images storage bucket

-- Policy: Allow venue partners to upload images to their own venue courts
CREATE POLICY "Venue partners can upload court images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'court-images' AND
  auth.role() = 'authenticated' AND
  -- Extract venue_id from path: {venue_id}/{court_id}/{filename}
  -- Fixed: Cast text to UUID for comparison
  (split_part(name, '/', 1))::uuid IN (
    SELECT venues.id
    FROM venues
    WHERE venues.owner_profile_id = auth.uid()
  )
);

-- Policy: Allow venue partners to view images from their own venue courts
CREATE POLICY "Venue partners can view court images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'court-images' AND
  auth.role() = 'authenticated' AND
  -- Fixed: Cast text to UUID for comparison
  (split_part(name, '/', 1))::uuid IN (
    SELECT venues.id
    FROM venues
    WHERE venues.owner_profile_id = auth.uid()
  )
);

-- Policy: Allow venue partners to update images in their own venue courts
CREATE POLICY "Venue partners can update court images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'court-images' AND
  auth.role() = 'authenticated' AND
  -- Fixed: Cast text to UUID for comparison
  (split_part(name, '/', 1))::uuid IN (
    SELECT venues.id
    FROM venues
    WHERE venues.owner_profile_id = auth.uid()
  )
);

-- Policy: Allow venue partners to delete images from their own venue courts
CREATE POLICY "Venue partners can delete court images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'court-images' AND
  auth.role() = 'authenticated' AND
  -- Fixed: Cast text to UUID for comparison
  (split_part(name, '/', 1))::uuid IN (
    SELECT venues.id
    FROM venues
    WHERE venues.owner_profile_id = auth.uid()
  )
);

-- 4. Allow public access to view images (for customers and public viewing)
CREATE POLICY "Public can view court images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'court-images' AND
  -- This allows anyone to view the images (read-only)
  true
);

-- 5. Create function to update court when primary image changes
CREATE OR REPLACE FUNCTION update_court_primary_image()
RETURNS TRIGGER AS $$ BEGIN
  -- When a new file is uploaded, if there's no primary image, set this as primary
  IF TG_OP = 'INSERT' THEN
    -- Check if court has no primary image
    -- Fixed: Cast text to UUID for comparison
    PERFORM 1 FROM courts WHERE id = (split_part(NEW.name, '/', 2))::uuid AND primary_image_url IS NULL;
    IF FOUND THEN
      -- Set this image as primary
      -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
      UPDATE courts
      SET primary_image_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/' || NEW.bucket_id || '/' || NEW.name
      WHERE id = (split_part(NEW.name, '/', 2))::uuid;
    END IF;
    RETURN NEW;
  END IF;

  -- When a file is deleted and it was the primary image, try to set another one as primary
  IF TG_OP = 'DELETE' THEN
    -- Check if this was the primary image
    -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
    PERFORM 1 FROM courts WHERE primary_image_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/' || OLD.bucket_id || '/' || OLD.name;
    IF FOUND THEN
      -- Try to set another image as primary, or null if no more images
      DECLARE
        new_primary_url TEXT;
        -- Fixed: Cast text to UUID
        court_id UUID := (split_part(OLD.name, '/', 2))::uuid;
        venue_id UUID := (split_part(OLD.name, '/', 1))::uuid;
      BEGIN
        -- Try to get the first remaining image
        -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
        SELECT 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/' || bucket_id || '/' || name
        INTO new_primary_url
        FROM storage.objects
        WHERE bucket_id = 'court-images'
        AND name LIKE venue_id::text || '/' || court_id::text || '/%'
        ORDER BY created_at ASC
        LIMIT 1;

        -- Update court with new primary or null
        UPDATE courts
        SET primary_image_url = new_primary_url
        WHERE id = court_id;
      END;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
 $$ LANGUAGE plpgsql;

-- 6. Create triggers for automatic primary image management
DROP TRIGGER IF EXISTS on_court_image_change ON storage.objects;
CREATE TRIGGER on_court_image_change
AFTER INSERT OR DELETE ON storage.objects
FOR EACH ROW
EXECUTE FUNCTION update_court_primary_image();

-- 7. Create helper function to get court images URLs
CREATE OR REPLACE FUNCTION get_court_images(court_uuid UUID)
RETURNS TABLE(image_url TEXT, is_primary BOOLEAN) AS $$ BEGIN
  RETURN QUERY
  -- Note: Replace [YOUR-PROJECT-REF] with your actual project reference
  SELECT
    'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/' || s.bucket_id || '/' || s.name as image_url,
    c.primary_image_url = 'https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/' || s.bucket_id || '/' || s.name as is_primary
  FROM storage.objects s
  -- Fixed: Cast text to UUID for comparison
  JOIN courts c ON (split_part(s.name, '/', 2))::uuid = c.id
  WHERE s.bucket_id = 'court-images'
  AND (split_part(s.name, '/', 2))::uuid = court_uuid
  ORDER BY s.created_at ASC;
END;
 $$ LANGUAGE plpgsql;

 -- Step-by-Step Implementation Guide
 -- Step 1: Create the Storage Bucket
 -- Go to your Supabase Dashboard
 -- Navigate to the Storage section
 -- Click "New bucket"
 -- Set the name to "court-images"
 -- Make it a public bucket (for public viewing)
 -- Set file size limit to 5MB (recommended)
 -- Set allowed MIME types: image/jpeg, image/jpg, image/png, image/webp
 -- Step 2: Update the Project Reference
 -- Before running the SQL, replace all instances of [YOUR-PROJECT-REF] with your actual project reference:

 -- Go to Supabase Dashboard > Settings > API
 -- Find your project reference (it looks like abcdefgh123456)
 -- Replace [YOUR-PROJECT-REF] in the SQL script with this value
 -- Step 3: Run the SQL Script
 -- Open the Supabase SQL Editor
 -- Copy and paste the fixed SQL script above
 -- Execute the script
 -- Step 4: Test the Implementation
 -- Create a test court record
 -- Upload an image to the storage bucket with the correct path format: {venue_id}/{court_id}/{filename}
 -- Check if the primary_image_url is set correctly in the courts table
 -- Verify the image is publicly accessible using the URL format
 -- Expected URL Format
 -- Images should be accessible at:

 -- https://[YOUR-PROJECT-REF].supabase.co/storage/v1/object/public/court-images/venue-uuid/court-uuid/image.jpg

 -- Troubleshooting
 -- If you encounter any errors:
 -- UUID/Text Comparison Errors: Make sure all UUID comparisons include explicit type casting with ::uuid
 -- Permission Errors: Verify that RLS is enabled on the storage.objects table
 -- Trigger Errors: Check that the trigger function is correctly defined and that the trigger is properly attached
 -- Bucket Not Found: Ensure you've created the "court-images" bucket in the Supabase Dashboard
