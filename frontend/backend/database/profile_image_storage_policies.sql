-- Storage policies for profile image uploads

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