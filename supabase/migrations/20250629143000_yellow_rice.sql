/*
  # Fix Answer Options Validation

  1. Data Integrity Check
    - Ensure all questions have proper answer options
    - Validate that answer options have correct answers marked
  
  2. Enhanced RLS Policies
    - Update policies to ensure answer options are properly accessible
    - Add debugging capabilities for question validation
*/

-- First, let's check and fix any questions that might have issues with answer options

-- Update any answer options that might have NULL is_correct values
UPDATE answer_options 
SET is_correct = false 
WHERE is_correct IS NULL;

-- Ensure the answer_options table has proper constraints
ALTER TABLE answer_options 
ALTER COLUMN is_correct SET NOT NULL,
ALTER COLUMN is_correct SET DEFAULT false;

-- Add a policy to allow users to view answer options during exam creation
-- This is needed when the system validates questions before creating an exam
CREATE POLICY "Users can view answer options for active questions" 
  ON answer_options 
  FOR SELECT 
  TO public 
  USING (
    question_id IN (
      SELECT id FROM questions 
      WHERE is_active = true 
      AND certification_id IN (
        SELECT id FROM certifications 
        WHERE is_active = true
      )
    )
  );

-- Create a function to validate question completeness
CREATE OR REPLACE FUNCTION validate_question_completeness()
RETURNS TABLE (
  question_id uuid,
  question_text text,
  certification_name text,
  issue_description text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    q.question_text,
    c.name as certification_name,
    CASE 
      WHEN NOT q.is_active THEN 'Question is inactive'
      WHEN (SELECT COUNT(*) FROM answer_options ao WHERE ao.question_id = q.id) < 2 
        THEN 'Less than 2 answer options'
      WHEN (SELECT COUNT(*) FROM answer_options ao WHERE ao.question_id = q.id AND ao.is_correct = true) = 0 
        THEN 'No correct answer marked'
      WHEN q.question_type = 'multiple_choice' AND (SELECT COUNT(*) FROM answer_options ao WHERE ao.question_id = q.id AND ao.is_correct = true) > 1 
        THEN 'Multiple choice should have only one correct answer'
      ELSE 'Valid'
    END as issue_description
  FROM questions q
  JOIN certifications c ON q.certification_id = c.id
  WHERE c.is_active = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION validate_question_completeness() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_question_completeness() TO anon;