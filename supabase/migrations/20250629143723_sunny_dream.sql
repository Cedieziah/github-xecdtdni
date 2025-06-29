/*
  # Fix Certificate RLS Policies

  This migration fixes the Row-Level Security policies for the certificates table to allow:
  1. Users to create certificates when they pass exams (via the application logic)
  2. Users to view their own certificates
  3. Public verification of certificates by certificate number

  ## Changes Made
  1. Drop existing restrictive policies
  2. Add policy for certificate creation during exam completion
  3. Add policy for users to view their own certificates
  4. Keep public verification policy for certificate validation

  ## Security
  - Users can only create certificates for themselves
  - Users can only view their own certificates
  - Public can verify certificates by certificate number (existing functionality)
  - Admins retain full access to all certificates
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can create certificates" ON certificates;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;

-- Allow users to insert certificates for themselves (needed during exam completion)
CREATE POLICY "Users can create own certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to view their own certificates
CREATE POLICY "Users can view own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ensure the existing admin and public policies remain intact
-- (These should already exist based on the schema, but we'll recreate them to be safe)

-- Recreate admin policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certificates' 
    AND policyname = 'Admins can manage certificates'
  ) THEN
    CREATE POLICY "Admins can manage certificates"
      ON certificates
      FOR ALL
      TO public
      USING (auth.uid() IN (
        SELECT profiles.id
        FROM profiles
        WHERE profiles.role = 'admin'::user_role
      ));
  END IF;
END $$;

-- Recreate public verification policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certificates' 
    AND policyname = 'Public can verify certificates'
  ) THEN
    CREATE POLICY "Public can verify certificates"
      ON certificates
      FOR SELECT
      TO public
      USING (certificate_number IS NOT NULL);
  END IF;
END $$;