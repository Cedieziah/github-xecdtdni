/*
  # Fix Questions RLS Policy for Exam Creation

  1. Security Changes
    - Add new RLS policy to allow users to view active questions when starting exams
    - This allows the exam creation process to fetch questions before creating exam sessions
    - Maintains security by only showing active questions from active certifications

  2. Policy Details
    - Users can view active questions from active certifications (needed for exam creation)
    - Existing policies remain unchanged for security during active exams
*/

-- Add policy to allow users to view active questions from active certifications
-- This is needed for the exam creation process
CREATE POLICY "Users can view active questions for exam creation"
  ON questions
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND certification_id IN (
      SELECT id FROM certifications 
      WHERE is_active = true
    )
  );