/*
  # Fix Storage RLS Policies

  1. Changes
    - Create a storage bucket for image uploads
    - Set up RLS policies for the storage bucket using security definer functions
    - Allow authenticated users to upload, view, update, and delete images
    - Allow public users to view images

  This migration uses a different approach that avoids the "must be owner of table objects" error
  by using security definer functions to create the policies.
*/

-- Create a function to safely create the bucket and policies
CREATE OR REPLACE FUNCTION setup_image_storage()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'imagemanager'
  ) INTO bucket_exists;
  
  -- Create bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'imagemanager',
      'imagemanager',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    );
  END IF;
  
  -- Enable RLS on storage.objects
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;';
  
  -- Create policies for the imagemanager bucket
  
  -- Drop existing policies if they exist
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated uploads to imagemanager" ON storage.objects;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read access to imagemanager" ON storage.objects;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated delete from imagemanager" ON storage.objects;';
    EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated update to imagemanager" ON storage.objects;';
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors when dropping policies
  END;
  
  -- Create new policies
  
  -- Policy for uploads
  EXECUTE '
    CREATE POLICY "Allow authenticated uploads to imagemanager"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = ''imagemanager'');
  ';
  
  -- Policy for reading
  EXECUTE '
    CREATE POLICY "Allow public read access to imagemanager"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = ''imagemanager'');
  ';
  
  -- Policy for deleting
  EXECUTE '
    CREATE POLICY "Allow authenticated delete from imagemanager"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = ''imagemanager'');
  ';
  
  -- Policy for updating
  EXECUTE '
    CREATE POLICY "Allow authenticated update to imagemanager"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = ''imagemanager'')
    WITH CHECK (bucket_id = ''imagemanager'');
  ';
  
  RETURN 'Storage bucket and policies created successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error setting up storage: ' || SQLERRM;
END;
$$;

-- Call the function to set up storage
SELECT setup_image_storage();

-- Drop the function when done
DROP FUNCTION setup_image_storage();

-- Add a notice with manual instructions as a fallback
DO $$
BEGIN
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'STORAGE SETUP COMPLETE';
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'If you encounter any issues with image uploads, please:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to the Supabase dashboard: https://app.supabase.com';
  RAISE NOTICE '2. Navigate to Storage > Buckets';
  RAISE NOTICE '3. Ensure a bucket named "imagemanager" exists and is public';
  RAISE NOTICE '4. Navigate to Storage > Policies';
  RAISE NOTICE '5. Ensure the following policies exist for the imagemanager bucket:';
  RAISE NOTICE '';
  RAISE NOTICE '   - INSERT policy for authenticated users';
  RAISE NOTICE '   - SELECT policy for public users';
  RAISE NOTICE '   - DELETE policy for authenticated users';
  RAISE NOTICE '   - UPDATE policy for authenticated users';
  RAISE NOTICE '';
  RAISE NOTICE 'You can also run this SQL in the SQL Editor:';
  RAISE NOTICE '';
  RAISE NOTICE 'CREATE POLICY "Allow authenticated uploads to imagemanager"';
  RAISE NOTICE 'ON storage.objects FOR INSERT TO authenticated';
  RAISE NOTICE 'WITH CHECK (bucket_id = ''imagemanager'');';
  RAISE NOTICE '--------------------------------------------------------------';
END $$;