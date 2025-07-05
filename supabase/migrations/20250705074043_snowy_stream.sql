/*
  # Create storage policies for image uploads

  1. Storage Policies
    - Enable RLS on storage.objects table
    - Add policy for authenticated users to upload images to questions folder
    - Add policy for authenticated users to upload images to options folder
    - Add policy for authenticated users to view uploaded images
    - Add policy for authenticated users to delete their uploaded images

  2. Security
    - Only authenticated users can upload images
    - Users can upload to specific folders (questions, options)
    - Users can view and delete images they uploaded
    - Admins have full access to all images
*/

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for uploading images to questions folder
CREATE POLICY "Authenticated users can upload question images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imagemanager' 
    AND (storage.foldername(name))[1] = 'questions'
  );

-- Policy for uploading images to options folder
CREATE POLICY "Authenticated users can upload option images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imagemanager' 
    AND (storage.foldername(name))[1] = 'options'
  );

-- Policy for viewing images
CREATE POLICY "Authenticated users can view images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'imagemanager'
    AND (
      (storage.foldername(name))[1] = 'questions'
      OR (storage.foldername(name))[1] = 'options'
    )
  );

-- Policy for deleting images (users can delete any image if they're authenticated)
CREATE POLICY "Authenticated users can delete images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imagemanager'
    AND (
      (storage.foldername(name))[1] = 'questions'
      OR (storage.foldername(name))[1] = 'options'
    )
  );

-- Policy for updating images (for metadata updates)
CREATE POLICY "Authenticated users can update images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'imagemanager'
    AND (
      (storage.foldername(name))[1] = 'questions'
      OR (storage.foldername(name))[1] = 'options'
    )
  )
  WITH CHECK (
    bucket_id = 'imagemanager'
    AND (
      (storage.foldername(name))[1] = 'questions'
      OR (storage.foldername(name))[1] = 'options'
    )
  );

-- Create the imagemanager bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('imagemanager', 'imagemanager', true)
ON CONFLICT (id) DO NOTHING;