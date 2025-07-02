/*
  # Update certification_details table structure

  1. Changes
    - Update topics JSONB structure to store exam coverage data
    - Update evaluation_criteria JSONB structure for examination evaluation
    - Maintain backward compatibility with existing data
*/

-- First, ensure the certification_details table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'certification_details'
  ) THEN
    RAISE EXCEPTION 'certification_details table does not exist';
  END IF;
END $$;

-- Add comment to clarify the updated structure
COMMENT ON COLUMN certification_details.topics IS 'JSONB array of exam coverage items with domains, descriptions, key concepts, depth of understanding, and evaluation criteria';

COMMENT ON COLUMN certification_details.evaluation_criteria IS 'JSONB containing assessment methods, scoring guidelines, and performance indicators';

-- Create a function to update the certification_details_updated_at timestamp
CREATE OR REPLACE FUNCTION update_certification_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_certification_details_updated_at'
  ) THEN
    CREATE TRIGGER trigger_update_certification_details_updated_at
    BEFORE UPDATE ON certification_details
    FOR EACH ROW
    EXECUTE FUNCTION update_certification_details_updated_at();
  END IF;
END $$;

-- Update the certifications_with_details view to better reflect the new structure
CREATE OR REPLACE VIEW certifications_with_details AS
SELECT 
  c.id,
  c.name,
  c.description,
  c.provider,
  c.access_code,
  c.duration,
  c.passing_score,
  c.total_questions,
  c.is_active,
  c.created_at,
  c.updated_at,
  c.created_by,
  cd.examination_details,
  cd.topics,
  cd.evaluation_criteria,
  cd.prerequisites,
  cd.learning_outcomes,
  cd.metadata as details_metadata,
  cd.created_at as details_created_at,
  cd.updated_at as details_updated_at
FROM 
  certifications c
LEFT JOIN 
  certification_details cd ON c.id = cd.certification_id;

-- Add RLS policies to ensure proper access
ALTER TABLE certification_details ENABLE ROW LEVEL SECURITY;

-- Ensure policies exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certification_details' AND policyname = 'Admins can manage certification details'
  ) THEN
    CREATE POLICY "Admins can manage certification details"
    ON certification_details
    FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'))
    WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'certification_details' AND policyname = 'Public can view active certification details'
  ) THEN
    CREATE POLICY "Public can view active certification details"
    ON certification_details
    FOR SELECT
    TO public
    USING (certification_id IN (SELECT id FROM certifications WHERE is_active = true));
  END IF;
END $$;