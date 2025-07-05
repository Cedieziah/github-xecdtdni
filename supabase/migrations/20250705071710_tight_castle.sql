/*
  # Setup Storage for Image Management
  
  1. New Features
    - Create imagemanager storage bucket for question and answer option images
    - Configure proper security policies for image uploads and access
  
  2. Security
    - Allow authenticated users to upload images
    - Allow public read access to all images
    - Allow users to manage their own uploaded images
    - Grant admins full access to all images
*/

-- Create the imagemanager bucket using the storage API
SELECT storage.create_bucket('imagemanager', 'Public bucket for storing question and answer images');

-- Update bucket configuration
UPDATE storage.buckets
SET public = true,
    file_size_limit = 5242880, -- 5MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'imagemanager';

-- Create policies using the storage API functions
-- Policy to allow authenticated users to upload images
SELECT storage.create_policy(
  'imagemanager',
  'authenticated_can_upload',
  'INSERT',
  'authenticated',
  true
);

-- Policy to allow public read access to images
SELECT storage.create_policy(
  'imagemanager',
  'public_can_view',
  'SELECT',
  'public',
  true
);

-- Policy to allow users to update their own uploaded images
SELECT storage.create_policy(
  'imagemanager',
  'users_can_update_own',
  'UPDATE',
  'authenticated',
  'auth.uid()::text = owner'
);

-- Policy to allow users to delete their own uploaded images
SELECT storage.create_policy(
  'imagemanager',
  'users_can_delete_own',
  'DELETE',
  'authenticated',
  'auth.uid()::text = owner'
);

-- Policy to allow admins to manage all images
SELECT storage.create_policy(
  'imagemanager',
  'admins_can_manage_all',
  'ALL',
  'authenticated',
  'auth.uid() IN (SELECT id FROM profiles WHERE role = ''admin''::user_role)'
);