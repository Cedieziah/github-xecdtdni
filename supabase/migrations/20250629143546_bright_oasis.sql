/*
  # Fix RLS policies for exam_sessions table

  1. Security Updates
    - Drop existing restrictive UPDATE policy that prevents status changes
    - Create new UPDATE policy allowing users to update their own sessions regardless of status
    - Ensure SELECT policy allows users to view all their own sessions (not just in-progress ones)
    - Add admin policies for complete management access

  2. Changes Made
    - Updated UPDATE policy to allow status transitions from 'in_progress' to 'passed'/'failed'
    - Updated SELECT policy to allow viewing completed sessions for results page
    - Maintained security by ensuring users can only access their own sessions
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can update own in-progress exam sessions" ON exam_sessions;
DROP POLICY IF EXISTS "Users can view own exam sessions" ON exam_sessions;

-- Create comprehensive SELECT policy for users to view all their own sessions
CREATE POLICY "Users can view own exam sessions"
  ON exam_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create UPDATE policy that allows users to update their own sessions regardless of status
CREATE POLICY "Users can update own exam sessions"
  ON exam_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure INSERT policy exists for creating new sessions
DROP POLICY IF EXISTS "Users can create own exam sessions" ON exam_sessions;
CREATE POLICY "Users can create own exam sessions"
  ON exam_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ensure admin policy exists for complete management
DROP POLICY IF EXISTS "Admins can manage all exam sessions" ON exam_sessions;
CREATE POLICY "Admins can manage all exam sessions"
  ON exam_sessions
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'::user_role
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'::user_role
    )
  );