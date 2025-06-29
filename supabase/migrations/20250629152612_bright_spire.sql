/*
  # Add Points System to Questions

  1. New Columns
    - Add `points` column to questions table with default value of 1
    - Points represent the weight/value of each question in scoring

  2. Changes
    - Add points column with integer type
    - Set default value to 1 point per question
    - Add check constraint to ensure points are positive
    - Update existing questions to have 1 point each
*/

-- Add points column to questions table
ALTER TABLE questions 
ADD COLUMN points integer DEFAULT 1 NOT NULL;

-- Add check constraint to ensure points are positive
ALTER TABLE questions 
ADD CONSTRAINT questions_points_positive CHECK (points > 0);

-- Update any existing questions to have 1 point (default)
UPDATE questions SET points = 1 WHERE points IS NULL;