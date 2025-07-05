-- Create the imagemanager bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imagemanager',
  'imagemanager',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Create policies for the imagemanager bucket
-- Policy to allow authenticated users to upload images
INSERT INTO storage.policies (name, bucket_id, operation, definition, role)
VALUES (
  'authenticated_can_upload',
  'imagemanager',
  'INSERT',
  'bucket_id = ''imagemanager'' AND auth.role() = ''authenticated''',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO UPDATE SET
  definition = 'bucket_id = ''imagemanager'' AND auth.role() = ''authenticated''';

-- Policy to allow public read access to images
INSERT INTO storage.policies (name, bucket_id, operation, definition, role)
VALUES (
  'public_can_view',
  'imagemanager',
  'SELECT',
  'bucket_id = ''imagemanager''',
  'public'
)
ON CONFLICT (name, bucket_id, operation, role) DO UPDATE SET
  definition = 'bucket_id = ''imagemanager''';

-- Policy to allow users to update their own uploaded images
INSERT INTO storage.policies (name, bucket_id, operation, definition, role)
VALUES (
  'users_can_update_own',
  'imagemanager',
  'UPDATE',
  'bucket_id = ''imagemanager'' AND auth.uid()::text = owner',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO UPDATE SET
  definition = 'bucket_id = ''imagemanager'' AND auth.uid()::text = owner';

-- Policy to allow users to delete their own uploaded images
INSERT INTO storage.policies (name, bucket_id, operation, definition, role)
VALUES (
  'users_can_delete_own',
  'imagemanager',
  'DELETE',
  'bucket_id = ''imagemanager'' AND auth.uid()::text = owner',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO UPDATE SET
  definition = 'bucket_id = ''imagemanager'' AND auth.uid()::text = owner';

-- Policy to allow admins to manage all images
INSERT INTO storage.policies (name, bucket_id, operation, definition, role)
VALUES (
  'admins_can_manage_all',
  'imagemanager',
  'ALL',
  'bucket_id = ''imagemanager'' AND auth.uid() IN (SELECT id FROM auth.users WHERE id IN (SELECT id FROM public.profiles WHERE role = ''admin''))',
  'authenticated'
)
ON CONFLICT (name, bucket_id, operation, role) DO UPDATE SET
  definition = 'bucket_id = ''imagemanager'' AND auth.uid() IN (SELECT id FROM auth.users WHERE id IN (SELECT id FROM public.profiles WHERE role = ''admin''))';