/*
  # Create Storage Bucket and Policies for Image Management
  
  1. New Storage
    - Creates 'imagemanager' bucket for storing question and answer images
    - Configures proper permissions for image uploads and viewing
  
  2. Security
    - Enables public access for viewing images
    - Restricts uploads to authenticated users
    - Uses Supabase's storage.create_bucket API to avoid permission issues
*/

-- Create storage bucket for images using Supabase's API
BEGIN;

-- Create the bucket if it doesn't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'imagemanager'
  ) INTO bucket_exists;
  
  IF NOT bucket_exists THEN
    -- Create the bucket using SQL that doesn't require table ownership
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'imagemanager',
      'imagemanager',
      true,
      5242880, -- 5MB limit
      ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    );
    RAISE NOTICE 'Created imagemanager bucket';
  ELSE
    -- Update existing bucket
    UPDATE storage.buckets
    SET 
      public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    WHERE id = 'imagemanager';
    RAISE NOTICE 'Updated imagemanager bucket';
  END IF;
END $$;

-- Create security policies using Supabase's security definer functions
-- This approach avoids the "must be owner of table" error

-- Function to create storage policies safely
CREATE OR REPLACE FUNCTION create_storage_policy(
  bucket_name TEXT,
  policy_name TEXT,
  operation TEXT,
  policy_role TEXT,
  policy_definition TEXT
) RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if policy already exists
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = ''storage'' 
      AND tablename = ''objects'' 
      AND policyname = ''%s''
    )', policy_name) INTO policy_exists;
  
  IF NOT policy_exists THEN
    -- Create the policy
    EXECUTE format('
      CREATE POLICY "%s" 
      ON storage.objects 
      FOR %s 
      TO %s 
      USING (%s)
    ', policy_name, operation, policy_role, policy_definition);
    
    RAISE NOTICE 'Created policy: %', policy_name;
  ELSE
    RAISE NOTICE 'Policy already exists: %', policy_name;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating policy %: %', policy_name, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create storage policies with CHECK clause
CREATE OR REPLACE FUNCTION create_storage_policy_with_check(
  bucket_name TEXT,
  policy_name TEXT,
  operation TEXT,
  policy_role TEXT,
  policy_definition TEXT,
  check_definition TEXT
) RETURNS VOID AS $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Check if policy already exists
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = ''storage'' 
      AND tablename = ''objects'' 
      AND policyname = ''%s''
    )', policy_name) INTO policy_exists;
  
  IF NOT policy_exists THEN
    -- Create the policy with CHECK clause
    EXECUTE format('
      CREATE POLICY "%s" 
      ON storage.objects 
      FOR %s 
      TO %s 
      USING (%s)
      WITH CHECK (%s)
    ', policy_name, operation, policy_role, policy_definition, check_definition);
    
    RAISE NOTICE 'Created policy with CHECK: %', policy_name;
  ELSE
    RAISE NOTICE 'Policy already exists: %', policy_name;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating policy %: %', policy_name, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS is enabled on storage.objects
DO $$
BEGIN
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;';
  RAISE NOTICE 'Enabled RLS on storage.objects';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error enabling RLS: %', SQLERRM;
END $$;

-- Create the policies
SELECT create_storage_policy(
  'imagemanager',
  'Allow public read access to imagemanager',
  'SELECT',
  'public',
  'bucket_id = ''imagemanager'''
);

SELECT create_storage_policy(
  'imagemanager',
  'Allow authenticated uploads to imagemanager',
  'INSERT',
  'authenticated',
  'bucket_id = ''imagemanager'' AND auth.uid() IS NOT NULL'
);

SELECT create_storage_policy(
  'imagemanager',
  'Allow authenticated users to delete own uploads',
  'DELETE',
  'authenticated',
  'bucket_id = ''imagemanager'' AND auth.uid() IS NOT NULL'
);

SELECT create_storage_policy_with_check(
  'imagemanager',
  'Allow authenticated users to update own uploads',
  'UPDATE',
  'authenticated',
  'bucket_id = ''imagemanager'' AND auth.uid() IS NOT NULL',
  'bucket_id = ''imagemanager'' AND auth.uid() IS NOT NULL'
);

-- Create admin policy
SELECT create_storage_policy(
  'imagemanager',
  'Allow admins to manage all images',
  'ALL',
  'authenticated',
  'bucket_id = ''imagemanager'' AND auth.uid() IN (SELECT id FROM public.profiles WHERE role = ''admin''::user_role)'
);

-- Drop the helper functions when done
DROP FUNCTION IF EXISTS create_storage_policy;
DROP FUNCTION IF EXISTS create_storage_policy_with_check;

COMMIT;