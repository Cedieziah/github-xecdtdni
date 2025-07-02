/*
  # Certification Details System for Course Catalog

  This migration creates a comprehensive certification details system that extends
  the existing certifications table with structured examination information.

  ## Features
  1. One-to-one relationship with certifications table
  2. JSONB storage for flexible examination data
  3. Structured topics and evaluation criteria
  4. Performance optimized with proper indexes
  5. Data integrity through constraints

  ## Tables Created
  - certification_details: Detailed examination information for each certification

  ## Security
  - Row Level Security enabled
  - Policies for admin management and public viewing
*/

-- Create the certification_details table
CREATE TABLE IF NOT EXISTS certification_details (
  -- Primary key that also serves as foreign key to certifications
  certification_id uuid PRIMARY KEY REFERENCES certifications(id) ON DELETE CASCADE,
  
  -- Examination structure and requirements
  examination_details jsonb NOT NULL DEFAULT '{}',
  
  -- Course topics and learning objectives
  topics jsonb NOT NULL DEFAULT '[]',
  
  -- Evaluation criteria and assessment methods
  evaluation_criteria jsonb NOT NULL DEFAULT '{}',
  
  -- Prerequisites and requirements
  prerequisites jsonb NOT NULL DEFAULT '[]',
  
  -- Learning outcomes and competencies
  learning_outcomes jsonb NOT NULL DEFAULT '[]',
  
  -- Additional metadata
  metadata jsonb NOT NULL DEFAULT '{}',
  
  -- Audit fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  updated_by uuid REFERENCES profiles(id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_certification_details_examination 
  ON certification_details USING gin (examination_details);

CREATE INDEX IF NOT EXISTS idx_certification_details_topics 
  ON certification_details USING gin (topics);

CREATE INDEX IF NOT EXISTS idx_certification_details_criteria 
  ON certification_details USING gin (evaluation_criteria);

CREATE INDEX IF NOT EXISTS idx_certification_details_created_at 
  ON certification_details (created_at);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_certification_details_lookup 
  ON certification_details (certification_id, created_at);

-- Add constraints to ensure data integrity
ALTER TABLE certification_details 
  ADD CONSTRAINT check_examination_details_not_empty 
  CHECK (jsonb_typeof(examination_details) = 'object');

ALTER TABLE certification_details 
  ADD CONSTRAINT check_topics_is_array 
  CHECK (jsonb_typeof(topics) = 'array');

ALTER TABLE certification_details 
  ADD CONSTRAINT check_evaluation_criteria_not_empty 
  CHECK (jsonb_typeof(evaluation_criteria) = 'object');

ALTER TABLE certification_details 
  ADD CONSTRAINT check_prerequisites_is_array 
  CHECK (jsonb_typeof(prerequisites) = 'array');

ALTER TABLE certification_details 
  ADD CONSTRAINT check_learning_outcomes_is_array 
  CHECK (jsonb_typeof(learning_outcomes) = 'array');

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_certification_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_certification_details_updated_at
  BEFORE UPDATE ON certification_details
  FOR EACH ROW
  EXECUTE FUNCTION update_certification_details_updated_at();

-- Enable Row Level Security
ALTER TABLE certification_details ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy for admins to manage all certification details
CREATE POLICY "Admins can manage certification details"
  ON certification_details
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

-- Policy for public to view certification details for active certifications
CREATE POLICY "Public can view active certification details"
  ON certification_details
  FOR SELECT
  TO public
  USING (
    certification_id IN (
      SELECT id FROM certifications WHERE is_active = true
    )
  );

-- Create a view for easy retrieval of certifications with their details
CREATE OR REPLACE VIEW certifications_with_details AS
SELECT 
  c.*,
  cd.examination_details,
  cd.topics,
  cd.evaluation_criteria,
  cd.prerequisites,
  cd.learning_outcomes,
  cd.metadata as details_metadata,
  cd.created_at as details_created_at,
  cd.updated_at as details_updated_at
FROM certifications c
LEFT JOIN certification_details cd ON c.id = cd.certification_id
WHERE c.is_active = true;

-- Grant appropriate permissions on the view
GRANT SELECT ON certifications_with_details TO authenticated;
GRANT SELECT ON certifications_with_details TO anon;

-- Insert example data to demonstrate the structure

-- Example 1: CompTIA Security+ Certification Details
INSERT INTO certification_details (
  certification_id,
  examination_details,
  topics,
  evaluation_criteria,
  prerequisites,
  learning_outcomes,
  metadata
) VALUES (
  -- Replace with actual certification ID from your certifications table
  (SELECT id FROM certifications WHERE name ILIKE '%Security%' LIMIT 1),
  
  -- Examination details
  '{
    "format": "Multiple choice and performance-based questions",
    "question_types": ["multiple_choice", "drag_and_drop", "simulation"],
    "time_limit_minutes": 165,
    "passing_score_percentage": 750,
    "score_range": {
      "minimum": 100,
      "maximum": 900
    },
    "retake_policy": {
      "waiting_period_days": 14,
      "maximum_attempts": 3
    },
    "certification_validity": {
      "duration_years": 3,
      "renewal_required": true
    }
  }',
  
  -- Topics covered
  '[
    {
      "domain": "Threats, Attacks and Vulnerabilities",
      "weight_percentage": 24,
      "subtopics": [
        "Types of attacks",
        "Threat actors and vectors",
        "Vulnerabilities",
        "Vulnerability scanning",
        "Threat intelligence"
      ]
    },
    {
      "domain": "Architecture and Design",
      "weight_percentage": 21,
      "subtopics": [
        "Enterprise security architecture",
        "Virtualization and cloud security",
        "Secure application development",
        "Authentication and authorization"
      ]
    },
    {
      "domain": "Implementation",
      "weight_percentage": 25,
      "subtopics": [
        "Secure protocols",
        "Host and application security",
        "Secure network designs",
        "Wireless security"
      ]
    },
    {
      "domain": "Operations and Incident Response",
      "weight_percentage": 16,
      "subtopics": [
        "Security tools",
        "Incident response",
        "Investigations",
        "Logging and monitoring"
      ]
    },
    {
      "domain": "Governance, Risk and Compliance",
      "weight_percentage": 14,
      "subtopics": [
        "Risk management",
        "Regulations and frameworks",
        "Organizational security policies",
        "Business continuity"
      ]
    }
  ]',
  
  -- Evaluation criteria
  '{
    "assessment_methods": [
      {
        "type": "Multiple Choice Questions",
        "description": "Traditional multiple choice with single correct answer",
        "weight": 60
      },
      {
        "type": "Multiple Response Questions", 
        "description": "Multiple choice with multiple correct answers",
        "weight": 25
      },
      {
        "type": "Performance-Based Questions",
        "description": "Hands-on simulations and drag-and-drop exercises",
        "weight": 15
      }
    ],
    "scoring_method": "Scaled scoring from 100-900",
    "competency_levels": {
      "entry_level": "Basic understanding of security concepts",
      "intermediate": "Practical application of security principles",
      "advanced": "Complex problem-solving and analysis"
    }
  }',
  
  -- Prerequisites
  '[
    {
      "type": "experience",
      "description": "2+ years of IT administration experience with security focus",
      "required": false,
      "recommended": true
    },
    {
      "type": "knowledge",
      "description": "Basic understanding of networking concepts",
      "required": true,
      "recommended": true
    },
    {
      "type": "certification",
      "description": "CompTIA Network+ or equivalent knowledge",
      "required": false,
      "recommended": true
    }
  ]',
  
  -- Learning outcomes
  '[
    "Assess the security posture of an enterprise environment",
    "Recommend and implement appropriate security solutions",
    "Monitor and secure hybrid environments",
    "Operate with an awareness of applicable laws and policies",
    "Identify, analyze, and respond to security events and incidents"
  ]',
  
  -- Metadata
  '{
    "difficulty_level": "intermediate",
    "industry_recognition": "High",
    "career_paths": ["Security Analyst", "Security Engineer", "Security Consultant"],
    "vendor": "CompTIA",
    "last_updated": "2024-01-15",
    "version": "SY0-701"
  }'
) ON CONFLICT (certification_id) DO NOTHING;

-- Example 2: Python Programming Certification Details
INSERT INTO certification_details (
  certification_id,
  examination_details,
  topics,
  evaluation_criteria,
  prerequisites,
  learning_outcomes,
  metadata
) VALUES (
  -- Replace with actual certification ID
  (SELECT id FROM certifications WHERE name ILIKE '%Python%' LIMIT 1),
  
  -- Examination details
  '{
    "format": "Practical coding exercises and multiple choice questions",
    "question_types": ["coding_exercise", "multiple_choice", "code_review"],
    "time_limit_minutes": 120,
    "passing_score_percentage": 70,
    "score_range": {
      "minimum": 0,
      "maximum": 100
    },
    "retake_policy": {
      "waiting_period_days": 7,
      "maximum_attempts": 5
    },
    "certification_validity": {
      "duration_years": 2,
      "renewal_required": false
    }
  }',
  
  -- Topics covered
  '[
    {
      "domain": "Python Fundamentals",
      "weight_percentage": 30,
      "subtopics": [
        "Data types and variables",
        "Control structures",
        "Functions and modules",
        "Error handling"
      ]
    },
    {
      "domain": "Data Structures and Algorithms",
      "weight_percentage": 25,
      "subtopics": [
        "Lists, tuples, dictionaries",
        "String manipulation",
        "File I/O operations",
        "Basic algorithms"
      ]
    },
    {
      "domain": "Object-Oriented Programming",
      "weight_percentage": 20,
      "subtopics": [
        "Classes and objects",
        "Inheritance and polymorphism",
        "Encapsulation",
        "Design patterns"
      ]
    },
    {
      "domain": "Libraries and Frameworks",
      "weight_percentage": 15,
      "subtopics": [
        "Standard library modules",
        "Third-party packages",
        "Package management",
        "Virtual environments"
      ]
    },
    {
      "domain": "Best Practices",
      "weight_percentage": 10,
      "subtopics": [
        "Code style and PEP 8",
        "Testing and debugging",
        "Documentation",
        "Version control"
      ]
    }
  ]',
  
  -- Evaluation criteria
  '{
    "assessment_methods": [
      {
        "type": "Coding Exercises",
        "description": "Write Python code to solve specific problems",
        "weight": 50
      },
      {
        "type": "Code Review Questions",
        "description": "Analyze and debug existing Python code",
        "weight": 30
      },
      {
        "type": "Multiple Choice Questions",
        "description": "Theoretical knowledge of Python concepts",
        "weight": 20
      }
    ],
    "scoring_method": "Percentage-based scoring",
    "competency_levels": {
      "beginner": "Basic syntax and simple programs",
      "intermediate": "Complex data structures and OOP",
      "advanced": "Advanced libraries and optimization"
    }
  }',
  
  -- Prerequisites
  '[
    {
      "type": "experience",
      "description": "Basic programming experience in any language",
      "required": false,
      "recommended": true
    },
    {
      "type": "knowledge",
      "description": "Understanding of basic computer science concepts",
      "required": true,
      "recommended": true
    }
  ]',
  
  -- Learning outcomes
  '[
    "Write efficient and readable Python code",
    "Implement object-oriented programming principles",
    "Use Python standard library effectively",
    "Debug and test Python applications",
    "Apply best practices for Python development"
  ]',
  
  -- Metadata
  '{
    "difficulty_level": "beginner_to_intermediate",
    "industry_recognition": "Medium",
    "career_paths": ["Python Developer", "Data Analyst", "Backend Developer"],
    "vendor": "Python Institute",
    "last_updated": "2024-01-10",
    "version": "3.12"
  }'
) ON CONFLICT (certification_id) DO NOTHING;

-- Create a function to get certification details with formatted output
CREATE OR REPLACE FUNCTION get_certification_details(cert_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'certification', to_jsonb(c.*),
    'details', to_jsonb(cd.*) - 'certification_id'
  )
  INTO result
  FROM certifications c
  LEFT JOIN certification_details cd ON c.id = cd.certification_id
  WHERE c.id = cert_id;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_certification_details(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_certification_details(uuid) TO anon;

-- Create a function to search certifications by topic
CREATE OR REPLACE FUNCTION search_certifications_by_topic(search_term text)
RETURNS TABLE (
  certification_id uuid,
  certification_name text,
  matching_topics jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    cd.topics
  FROM certifications c
  JOIN certification_details cd ON c.id = cd.certification_id
  WHERE c.is_active = true
    AND cd.topics::text ILIKE '%' || search_term || '%';
END;
$$;

-- Grant execute permission on the search function
GRANT EXECUTE ON FUNCTION search_certifications_by_topic(text) TO authenticated;
GRANT EXECUTE ON FUNCTION search_certifications_by_topic(text) TO anon;

-- Add helpful comments
COMMENT ON TABLE certification_details IS 'Detailed examination information for certifications including topics, criteria, and requirements';
COMMENT ON COLUMN certification_details.examination_details IS 'JSONB containing exam format, timing, scoring, and retake policies';
COMMENT ON COLUMN certification_details.topics IS 'JSONB array of exam domains/topics with weights and subtopics';
COMMENT ON COLUMN certification_details.evaluation_criteria IS 'JSONB containing assessment methods and scoring criteria';
COMMENT ON COLUMN certification_details.prerequisites IS 'JSONB array of required and recommended prerequisites';
COMMENT ON COLUMN certification_details.learning_outcomes IS 'JSONB array of expected learning outcomes and competencies';
COMMENT ON COLUMN certification_details.metadata IS 'JSONB containing additional metadata like difficulty, vendor info, etc.';

-- Create indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_certification_details_difficulty 
  ON certification_details USING gin ((metadata->'difficulty_level'));

CREATE INDEX IF NOT EXISTS idx_certification_details_vendor 
  ON certification_details USING gin ((metadata->'vendor'));

-- Final verification query to check the setup
DO $$
BEGIN
  RAISE NOTICE 'Certification details system created successfully!';
  RAISE NOTICE 'Tables created: certification_details';
  RAISE NOTICE 'Views created: certifications_with_details';
  RAISE NOTICE 'Functions created: get_certification_details, search_certifications_by_topic';
  RAISE NOTICE 'RLS policies: Enabled with admin management and public viewing';
END $$;