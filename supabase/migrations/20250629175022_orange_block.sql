/*
  # Add Image Support to Questions and Answer Options

  1. New Columns
    - Add `question_image_url` column to questions table (TEXT, nullable)
    - Add `option_image_url` column to answer_options table (TEXT, nullable)

  2. Changes
    - Both columns are optional (nullable)
    - Will store URLs to images in Supabase storage
*/

-- Add image URL column to questions table
ALTER TABLE questions 
ADD COLUMN question_image_url TEXT;

-- Add image URL column to answer_options table
ALTER TABLE answer_options 
ADD COLUMN option_image_url TEXT;