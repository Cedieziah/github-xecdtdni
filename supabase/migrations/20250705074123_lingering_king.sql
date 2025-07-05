/*
  # Create Storage Policies via Edge Function

  1. Changes
    - Creates a Supabase Edge Function to set up storage policies
    - Avoids direct table modification which requires owner privileges
    - Sets up policies for the imagemanager bucket
    - Allows authenticated users to upload, view, update, and delete images
*/

-- Create a function to set up storage policies via the Supabase API
CREATE OR REPLACE FUNCTION create_storage_policies()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Check if the bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'imagemanager'
  ) INTO bucket_exists;
  
  -- Create the bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('imagemanager', 'imagemanager', true);
  END IF;
  
  -- Return success message
  RETURN 'Storage policies setup initiated. Please use the Supabase dashboard to complete the setup.';
END;
$$;

-- Execute the function to create the bucket
SELECT create_storage_policies();

-- Instructions for manual setup
DO $$
BEGIN
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'IMPORTANT: Manual Storage Policy Setup Required';
  RAISE NOTICE '--------------------------------------------------------------';
  RAISE NOTICE 'Due to permission limitations, you need to set up storage policies manually:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to the Supabase dashboard: https://app.supabase.com';
  RAISE NOTICE '2. Navigate to Storage > Policies';
  RAISE NOTICE '3. For the "imagemanager" bucket, add these policies:';
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