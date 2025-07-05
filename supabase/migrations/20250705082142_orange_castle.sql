/*
  # Fix Image Persistence in Question Options

  1. Security
    - Ensure proper RLS policies for storage.objects table
    - Allow authenticated users to upload, view, update, and delete images
    - Allow public users to view images

  2. Changes
    - Create imagemanager bucket if it doesn't exist
    - Set appropriate permissions and size limits
    - Create all necessary RLS policies
*/

-- Create the imagemanager bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagemanager',
  'imagemanager',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the imagemanager bucket
-- Policy for uploads (INSERT)
CREATE POLICY "Allow authenticated uploads to imagemanager"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'imagemanager');

-- Policy for reading (SELECT)
CREATE POLICY "Allow public read access to imagemanager"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'imagemanager');

-- Policy for deleting (DELETE)
CREATE POLICY "Allow authenticated delete from imagemanager"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'imagemanager');

-- Policy for updating (UPDATE)
CREATE POLICY "Allow authenticated update to imagemanager"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'imagemanager')
WITH CHECK (bucket_id = 'imagemanager');

-- Add a notice with instructions
DO $$
BEGIN
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'STORAGE SETUP COMPLETE';
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'The imagemanager bucket has been created with the following policies:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Authenticated users can upload images';
  RAISE NOTICE '2. Public users can view images';
  RAISE NOTICE '3. Authenticated users can delete images';
  RAISE NOTICE '4. Authenticated users can update images';
  RAISE NOTICE '';
  RAISE NOTICE 'If you still encounter issues with image uploads, please check:';
  RAISE NOTICE '1. The Supabase dashboard for any policy conflicts';
  RAISE NOTICE '2. Browser console for detailed error messages';
  RAISE NOTICE '3. Network requests for any 403 or 404 errors';
  RAISE NOTICE '--------------------------------------------------------------';
END $$;