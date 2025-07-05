/*
  # Fix Storage RLS Policies for Image Uploads

  1. Storage Policies
    - Enable RLS on storage.objects table
    - Add policy for admins to upload images to imagemanager bucket
    - Add policy for admins to view/read images from imagemanager bucket
    - Add policy for public read access to images (if needed for display)

  2. Security
    - Restrict upload access to admin users only
    - Allow public read access for image display
    - Ensure proper bucket permissions
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admins can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;

-- Policy for admins to upload images to imagemanager bucket
CREATE POLICY "Admins can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagemanager' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
);

-- Policy for admins to view all images in imagemanager bucket
CREATE POLICY "Admins can view all images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'imagemanager'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
);

-- Policy for public read access to images (needed for displaying images)
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'imagemanager');

-- Policy for admins to delete images
CREATE POLICY "Admins can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'imagemanager'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'::user_role
  )
);

-- Ensure the imagemanager bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagemanager', 'imagemanager', true)
ON CONFLICT (id) DO UPDATE SET
  public = true;