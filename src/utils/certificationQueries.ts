import { supabase } from '../lib/supabase';
import { CertificationFormData } from '../components/admin/CertificationDetailsForm';

/**
 * Fetches a certification with its detailed information
 */
export const fetchCertificationWithDetails = async (certificationId: string) => {
  try {
    console.log('Fetching certification details for ID:', certificationId);
    
    const { data, error } = await supabase
      .from('certifications_with_details')
      .select('*')
      .eq('id', certificationId)
      .single();
    
    if (error) {
      console.error('Error fetching certification details:', error);
      throw error;
    }

    console.log('Successfully fetched certification details');
    
    // Format the data for frontend consumption
    return {
      ...data,
      // Ensure topics is treated as exam coverage
      examCoverage: data.topics || [],
      // Ensure evaluation_criteria.assessment_methods is treated as examination evaluation
      examinationEvaluation: data.evaluation_criteria?.assessment_methods || [],
      // Get target audience from metadata
      targetAudience: data.details_metadata?.target_audience || []
    };
  } catch (error: any) {
    console.error('Failed to fetch certification details:', error);
    throw new Error(`Failed to fetch certification details: ${error.message}`);
  }
};

/**
 * Maps form data to database structure for certification details
 */
export const mapFormDataToDatabaseStructure = (formData: CertificationFormData, userId: string) => {
  return {
    // Main certification fields
    certification: {
      name: formData.name,
      description: formData.description,
      provider: formData.provider,
      access_code: formData.access_code || null,
      duration: formData.duration,
      passing_score: formData.passing_score,
      total_questions: formData.total_questions,
      is_active: formData.is_active,
      created_by: userId
    },
    
    // Certification details
    details: {
      examination_details: {
        format: "Comprehensive examination",
        evaluation_components: formData.examination_evaluation,
        time_limit_minutes: formData.duration,
        passing_score_percentage: formData.passing_score
      },
      topics: formData.exam_coverage.map(coverage => ({
        domain: coverage.coverage_field,
        description: coverage.description,
        key_concepts: coverage.key_concepts,
        depth_of_understanding: coverage.depth_of_understanding,
        evaluation_criteria: coverage.evaluation_criteria
      })),
      evaluation_criteria: {
        assessment_methods: formData.examination_evaluation.map(evaluationItem => ({
          coverage_item: evaluationItem.coverage_item,
          scoring_guidelines: evaluationItem.scoring_guidelines,
          performance_indicators: evaluationItem.performance_indicators,
          minimum_requirements: evaluationItem.minimum_requirements,
          passing_threshold: evaluationItem.passing_threshold
        })),
        scoring_method: "Comprehensive evaluation based on coverage areas",
        pass_requirements: {
          minimum_score: formData.passing_score,
          completion_criteria: ["Complete all questions within time limit", "Meet minimum requirements for each coverage area"]
        }
      },
      prerequisites: formData.exam_coverage.map(coverage => ({
        type: "coverage",
        description: `${coverage.coverage_field}: ${coverage.description}`,
        required: true,
        recommended: false
      })),
      learning_outcomes: formData.examination_evaluation.map(evaluationItem => 
        `Demonstrate competency in ${evaluationItem.coverage_item} according to specified criteria`
      ),
      metadata: {
        target_audience: formData.target_audience,
        exam_coverage: formData.exam_coverage,
        examination_evaluation: formData.examination_evaluation
      },
      created_by: userId
    }
  };
};

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
          key_concepts: topic.key_concepts || [''],
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
          performance_indicators: method.performance_indicators || [''],
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
    target_audience: details_metadata?.target_audience?.length > 0
      ? details_metadata.target_audience
      : ['']
  };

  return formData;
};