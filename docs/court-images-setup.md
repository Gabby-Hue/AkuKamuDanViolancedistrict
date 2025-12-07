# Court Images Storage Setup

This guide walks you through setting up court image storage using Supabase Storage.

## 📋 Overview

- **Storage Bucket**: `court-images` in Supabase Storage
- **API Endpoints**: Ready for upload, delete, and management
- **Database Schema**: `courts` table with `primary_image_url` column
- **RLS Policies**: Secure access control for venue partners

## 🚀 Quick Setup

### Option 1: Supabase Dashboard (Recommended)

1. **Create Storage Bucket**
   - Go to Supabase Dashboard → Storage
   - Click "New bucket"
   - Name: `court-images`
   - Public bucket: ✅ Yes
   - File size limit: 5MB
   - Allowed file types: `image/jpeg, image/jpg, image/png, image/webp`

2. **Run SQL Setup**
   - Go to SQL Editor
   - Run the script: `supabase/setup-court-images-storage.sql`

3. **Update Project Reference**
   - Find your project ref: Settings → API
   - Replace `[YOUR-PROJECT-REF]` in the SQL functions

### Option 2: Using Supabase CLI

```bash
# Install CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Run setup script
chmod +x supabase/setup-storage-bucket.sh
./supabase/setup-storage-bucket.sh
```

## 📁 Storage Structure

```
court-images/
├── {venue_id}/
│   ├── {court_id}/
│   │   ├── 1640995200_abc123.jpg
│   │   ├── 1640995300_def456.png
│   │   └── 1640995400_ghi789.webp
│   └── {court_id_2}/
│       └── ...
└── {venue_id_2}/
    └── ...
```

## 🔐 Security Features

- **RLS Policies**: Only venue partners can upload/manage their venue's images
- **Public Access**: Images are publicly viewable (for customers)
- **File Validation**: Only image files allowed (JPG, PNG, WebP)
- **Size Limits**: Maximum 5MB per image
- **Ownership**: Path-based ownership verification

## 📡 API Endpoints

All endpoints are located at `/api/dashboard/venue/courts/[id]/images/`:

### GET `/api/dashboard/venue/courts/[id]/images`
List all images for a court
```javascript
const response = await fetch(`/api/dashboard/venue/courts/${courtId}/images`);
const { images, primaryImage } = await response.json();
```

### POST `/api/dashboard/venue/courts/[id]/images/upload`
Upload a new image
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('isPrimary', 'true');

const response = await fetch(`/api/dashboard/venue/courts/${courtId}/images/upload`, {
  method: 'POST',
  body: formData
});
```

### DELETE `/api/dashboard/venue/courts/[id]/images/[image_id]`
Delete an image
```javascript
const response = await fetch(`/api/dashboard/venue/courts/${courtId}/images/${imageId}`, {
  method: 'DELETE'
});
```

### PATCH `/api/dashboard/venue/courts/[id]/images/[image_id]`
Set image as primary
```javascript
const response = await fetch(`/api/dashboard/venue/courts/${courtId}/images/${imageId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ isPrimary: true })
});
```

## 🗄️ Database Schema Changes

### Courts Table
```sql
ALTER TABLE courts
ADD COLUMN primary_image_url TEXT,
ADD COLUMN court_images_url_array TEXT[] DEFAULT '{}';
```

### New Functions
- `get_court_images(court_uuid)` - Get all images for a court
- `update_court_primary_image()` - Trigger for automatic primary image management

## 🖼️ Image Management Features

### Automatic Primary Image
- First uploaded image automatically becomes primary
- When primary is deleted, next image becomes primary
- Can manually set any image as primary

### File Naming Convention
```
{timestamp}_{randomId}.{extension}
Example: 1640995200_abc123.jpg
```

### Public URL Format
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/court-images/{venue_id}/{court_id}/{filename}
```

## 🧪 Testing

1. **Test Upload**:
```javascript
// Create test file
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

// Upload
const formData = new FormData();
formData.append('image', file);
formData.append('isPrimary', 'true');

const result = await fetch('/api/dashboard/venue/courts/[court-id]/images/upload', {
  method: 'POST',
  body: formData
});
```

2. **Test List**:
```javascript
const images = await fetch('/api/dashboard/venue/courts/[court-id]/images');
console.log(await images.json());
```

3. **Verify Public Access**:
```javascript
// Try to access image URL directly
const imageUrl = "https://[PROJECT_REF].supabase.co/storage/v1/object/public/court-images/.../image.jpg";
const img = new Image();
img.src = imageUrl;
```

## 🔧 Troubleshooting

### Common Issues

1. **"Bucket not found"**
   - Run the storage creation script
   - Check bucket name matches exactly

2. **"Permission denied"**
   - Verify RLS policies are applied
   - Check user is authenticated venue partner

3. **"File too large"**
   - Default limit is 5MB
   - Update in bucket settings if needed

4. **"Invalid file type"**
   - Only JPG, PNG, WebP allowed
   - Check file MIME type

### Debugging

```javascript
// Check storage bucket exists
const { data, error } = supabase.storage.getBucket('court-images');
console.log('Bucket data:', data, 'Error:', error);

// List files in bucket
const { data, error } = supabase.storage
  .from('court-images')
  .list('venue-uuid/court-uuid');
console.log('Files:', data, 'Error:', error);
```

## 📱 Integration with Frontend

After setup, update your venue courts client wrapper to:
1. Add image upload component with drag & drop
2. Display image gallery with preview
3. Add primary image selector
4. Show upload progress and error handling

## 🔄 Next Steps

1. ✅ Complete storage setup
2. ✅ Update client wrapper
3. ✅ Add image components
4. ✅ Test full upload/delete workflow
5. ✅ Add image optimization (optional)

---

Need help? Check the [Supabase Storage docs](https://supabase.com/docs/guides/storage) or open an issue.