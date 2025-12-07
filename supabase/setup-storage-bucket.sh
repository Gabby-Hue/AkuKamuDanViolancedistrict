#!/bin/bash

# =====================================================
# SUPABASE STORAGE BUCKET SETUP SCRIPT
# =====================================================

# Variables (update these with your actual values)
PROJECT_REF="[YOUR-PROJECT-REF]"
BUCKET_NAME="court-images"
PUBLIC_BUCKET=true
FILE_SIZE_LIMIT=5242880  # 5MB in bytes

echo "🔧 Setting up Supabase Storage for Court Images..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/reference/cli"
    exit 1
fi

# Check if user is logged in
echo "📋 Checking Supabase login status..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

# Create storage bucket
echo "📦 Creating storage bucket: $BUCKET_NAME"
supabase storage buckets create \
  --bucket "$BUCKET_NAME" \
  --public $PUBLIC_BUCKET \
  --file-size-limit $FILE_SIZE_LIMIT

echo "✅ Storage bucket created successfully!"

# Set up RLS policies
echo "🔐 Setting up Row Level Security policies..."
supabase db push --file supabase/setup-court-images-storage.sql

echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update the [YOUR-PROJECT-REF] placeholder in the SQL functions"
echo "2. Test the setup by uploading an image"
echo "3. Update your client wrapper to use the new API endpoints"
echo ""
echo "📁 Storage bucket structure:"
echo "   court-images/{venue_id}/{court_id}/{filename}"
echo ""
echo "🔗 Public URL format:"
echo "   https://$PROJECT_REF.supabase.co/storage/v1/object/public/$BUCKET_NAME/{path}"