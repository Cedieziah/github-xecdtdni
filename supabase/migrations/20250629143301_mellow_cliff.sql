/*
  # Fix exam_questions RLS policy for user exam creation

  1. Security Changes
    - Add INSERT policy for exam_questions table to allow users to create questions for their own exam sessions
    - This allows the exam creation process to work properly while maintaining security

  The policy ensures users can only insert exam questions for exam sessions they own.
*/

-- Add INSERT policy for users to create exam questions for their own sessions
CREATE POLICY "Users can create questions for own exam sessions"
  ON exam_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    exam_session_id IN (
      SELECT id 
      FROM exam_sessions 
      WHERE user_id = auth.uid() AND status = 'in_progress'
    )
  );