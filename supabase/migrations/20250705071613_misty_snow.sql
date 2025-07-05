/*
  # Setup Storage Bucket and RLS Policies

  1. Storage Setup
    - Create `imagemanager` bucket if it doesn't exist
    - Set bucket to public for read access
    - Enable RLS on the bucket

  2. Security Policies
    - Allow authenticated users to upload images
    - Allow public read access to images
    - Allow users to delete their own uploaded images
*/

-- Create the imagemanager bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagemanager',
  'imagemanager',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Enable RLS on the bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagemanager' AND
  auth.role() = 'authenticated'
);

-- Policy to allow public read access to images
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'imagemanager');

-- Policy to allow users to update their own uploaded images
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'imagemanager' AND auth.uid()::text = owner)
WITH CHECK (bucket_id = 'imagemanager' AND auth.uid()::text = owner);

-- Policy to allow users to delete their own uploaded images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'imagemanager' AND auth.uid()::text = owner);

-- Policy to allow admins to manage all images
CREATE POLICY "Admins can manage all images"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'imagemanager' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
)
WITH CHECK (
  bucket_id = 'imagemanager' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
);