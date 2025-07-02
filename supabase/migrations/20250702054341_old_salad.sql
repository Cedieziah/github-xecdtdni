/*
  # Fix Certification Details Display

  1. Updates the certifications_with_details view to ensure proper data structure
  2. Adds comments to clarify the updated structure
  3. Ensures proper handling of exam coverage and evaluation data
*/

-- Update the certifications_with_details view to properly handle the new structure
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

-- Add comment to clarify the updated structure
COMMENT ON VIEW certifications_with_details IS 'View that joins certifications with their details, where topics contains exam coverage data and evaluation_criteria.assessment_methods contains examination evaluation data';

-- Ensure the trigger for updating timestamps exists
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