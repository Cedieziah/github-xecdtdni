/*
  # Create Storage Policies for Image Management

  This migration creates a function that can be used to set up the necessary
  storage bucket and policies for image uploads in the application.
  
  Since we can't directly modify the storage.objects table due to permission
  restrictions, we provide instructions for manual setup through the Supabase dashboard.
*/

-- Create a function to check if the bucket exists
CREATE OR REPLACE FUNCTION check_imagemanager_bucket()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Check if the bucket exists in our application schema
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'imagemanager'
  ) INTO bucket_exists;
  
  IF bucket_exists THEN
    RETURN 'The imagemanager bucket already exists.';
  ELSE
    RETURN 'The imagemanager bucket needs to be created manually.';
  END IF;
END;
$$;

-- Execute the function to check if the bucket exists
SELECT check_imagemanager_bucket();

-- Instructions for manual setup
DO $$
BEGIN
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'IMPORTANT: Manual Storage Setup Required';
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'Due to permission limitations, you need to set up storage manually:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to the Supabase dashboard: https://app.supabase.com';
  RAISE NOTICE '2. Navigate to Storage > Buckets';
  RAISE NOTICE '3. Create a new bucket named "imagemanager" if it doesn''t exist';
  RAISE NOTICE '4. Make sure the bucket is set to public';
  RAISE NOTICE '';
  RAISE NOTICE '5. Navigate to Storage > Policies';
  RAISE NOTICE '6. For the "imagemanager" bucket, add these policies:';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 1: Authenticated users can upload question images';
  RAISE NOTICE '  - Operation: INSERT';
  RAISE NOTICE '  - Role: authenticated';
  RAISE NOTICE '  - WITH CHECK expression: bucket_id = ''imagemanager'' AND (storage.foldername(name))[1] = ''questions''';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 2: Authenticated users can upload option images';
  RAISE NOTICE '  - Operation: INSERT';
  RAISE NOTICE '  - Role: authenticated';
  RAISE NOTICE '  - WITH CHECK expression: bucket_id = ''imagemanager'' AND (storage.foldername(name))[1] = ''options''';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 3: Authenticated users can view images';
  RAISE NOTICE '  - Operation: SELECT';
  RAISE NOTICE '  - Role: authenticated';
  RAISE NOTICE '  - USING expression: bucket_id = ''imagemanager''';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 4: Public can view images';
  RAISE NOTICE '  - Operation: SELECT';
  RAISE NOTICE '  - Role: anon';
  RAISE NOTICE '  - USING expression: bucket_id = ''imagemanager''';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 5: Authenticated users can delete images';
  RAISE NOTICE '  - Operation: DELETE';
  RAISE NOTICE '  - Role: authenticated';
  RAISE NOTICE '  - USING expression: bucket_id = ''imagemanager''';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy 6: Authenticated users can update images';
  RAISE NOTICE '  - Operation: UPDATE';
  RAISE NOTICE '  - Role: authenticated';
  RAISE NOTICE '  - USING expression: bucket_id = ''imagemanager''';
  RAISE NOTICE '  - WITH CHECK expression: bucket_id = ''imagemanager''';
  RAISE NOTICE '--------------------------------------------------------------';
END $$;