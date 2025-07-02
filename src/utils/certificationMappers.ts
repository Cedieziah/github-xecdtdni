import { CertificationFormData } from '../components/admin/CertificationDetailsForm';

/**
 * Maps database structure to form data for editing
 */
export const mapDatabaseToFormData = (certificationData: any): CertificationFormData => {
  // Extract data from the certification and its details
  const {
    name,
    description,
    provider,
    access_code,
    duration,
    passing_score,
    total_questions,
    is_active,
    topics = [],
    evaluation_criteria = {},
    details_metadata = {}
  } = certificationData;

  // Default form data structure
  const formData: CertificationFormData = {
    name: name || '',
    description: description || '',
    provider: provider || '',
    access_code: access_code || '',
    duration: duration || 60,
    passing_score: passing_score || 70,
    total_questions: total_questions || 10,
    is_active: is_active !== false,
    
    // Map topics to exam coverage
    exam_coverage: topics.length > 0 
      ? topics.map((topic: any) => ({
          coverage_field: topic.domain || '',
          description: topic.description || '',
          key_concepts: Array.isArray(topic.key_concepts) ? topic.key_concepts : [''],
          depth_of_understanding: topic.depth_of_understanding || '',
          evaluation_criteria: topic.evaluation_criteria || ''
        }))
      : [{
          coverage_field: '',
          description: '',
          key_concepts: [''],
          depth_of_understanding: '',
          evaluation_criteria: ''
        }],
    
    // Map assessment_methods to examination evaluation
    examination_evaluation: evaluation_criteria?.assessment_methods?.length > 0
      ? evaluation_criteria.assessment_methods.map((method: any) => ({
          coverage_item: method.coverage_item || '',
          scoring_guidelines: method.scoring_guidelines || '',
          performance_indicators: Array.isArray(method.performance_indicators) ? method.performance_indicators : [''],
          minimum_requirements: method.minimum_requirements || '',
          passing_threshold: method.passing_threshold || ''
        }))
      : [{
          coverage_item: '',
          scoring_guidelines: '',
          performance_indicators: [''],
          minimum_requirements: '',
          passing_threshold: ''
        }],
    
    // Get target audience from metadata or details
    target_audience: Array.isArray(details_metadata?.target_audience) && details_metadata?.target_audience?.length > 0
      ? details_metadata.target_audience
      : ['']
  };

  return formData;
};

/**
 * Creates a deep copy of an object to avoid reference issues
 */
export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};