/*
  # Configure storage policies for image uploads

  1. Storage Policies
    - Enable RLS on storage.objects table
    - Add policy for authenticated users to upload images to imagemanager bucket
    - Add policy for public read access to images
    - Add policy for authenticated users to delete their own uploads

  2. Security
    - Restrict uploads to authenticated users only
    - Allow public read access for displaying images
    - Allow users to delete images they uploaded
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload images to imagemanager bucket
CREATE POLICY "Allow authenticated uploads to imagemanager"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imagemanager' 
    AND auth.uid() IS NOT NULL
  );

-- Policy to allow public read access to images in imagemanager bucket
CREATE POLICY "Allow public read access to imagemanager"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'imagemanager');

-- Policy to allow authenticated users to delete images they uploaded
CREATE POLICY "Allow authenticated users to delete own uploads"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imagemanager' 
    AND auth.uid() IS NOT NULL
  );

-- Policy to allow authenticated users to update images they uploaded
CREATE POLICY "Allow authenticated users to update own uploads"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'imagemanager' 
    AND auth.uid() IS NOT NULL
  )
  WITH CHECK (
    bucket_id = 'imagemanager' 
    AND auth.uid() IS NOT NULL
  );

-- Ensure the imagemanager bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagemanager', 'imagemanager', true)
ON CONFLICT (id) DO NOTHING;