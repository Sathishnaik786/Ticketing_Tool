# Supabase Storage Setup for Profile Images

## Step 1: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to your project
3. Go to **Storage** > **Buckets**
4. Click **New bucket**
5. Fill in the details:
   - **Bucket ID**: `profile-images`
   - **Public**: ✅ Check this box
   - **Description**: Profile images storage

## Step 2: Apply Security Policies

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Allow user to upload only to their own folder
CREATE POLICY "Users upload own profile image"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow user to update their own image
CREATE POLICY "Users update own profile image"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'profile-images'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow public read access
CREATE POLICY "Public read profile images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'profile-images');
```

## Step 3: Add Database Column

Run this SQL command in your Supabase SQL Editor:

```sql
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_image TEXT;
```

## Step 4: Update RLS Policies

Make sure your employees table has proper RLS policies for profile updates:

```sql
-- Ensure authenticated users can update their own profile
CREATE POLICY "Users can update own profile" ON employees
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

Your profile image upload functionality is now ready to use!