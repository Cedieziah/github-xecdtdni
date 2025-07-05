/*
  # Create Storage Policies for Image Upload

  1. Storage Policies
    - Allow authenticated users to upload images to questions folder
    - Allow authenticated users to upload images to options folder  
    - Allow authenticated users to view images
    - Allow public users to view images
    - Allow authenticated users to delete images
    - Allow authenticated users to update images

  2. Security
    - Enable RLS on storage.objects (should already be enabled)
    - Add policies for proper access control
*/

-- Ensure RLS is enabled on storage.objects (it should be by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload question images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload option images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;

-- Allow authenticated users to upload images to questions folder
CREATE POLICY "Authenticated users can upload question images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagemanager' AND 
  (storage.foldername(name))[1] = 'questions'
);

-- Allow authenticated users to upload images to options folder
CREATE POLICY "Authenticated users can upload option images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'imagemanager' AND 
  (storage.foldername(name))[1] = 'options'
);

-- Allow authenticated users to view images
CREATE POLICY "Authenticated users can view images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'imagemanager');

-- Allow public (anon) users to view images
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'imagemanager');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'imagemanager');

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'imagemanager')
WITH CHECK (bucket_id = 'imagemanager');

-- Create the imagemanager bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagemanager', 'imagemanager', true)
ON CONFLICT (id) DO NOTHING;