import { supabase } from '../lib/supabase';

export interface QuestionValidationResult {
  question_id: string;
  question_text: string;
  certification_name: string;
  issue_description: string;
}

export const validateQuestionsForCertification = async (certificationId: string) => {
  try {
    // Get all questions for this certification with their answer options
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select(`
        *,
        answer_options (*),
        certifications (name)
      `)
      .eq('certification_id', certificationId)
      .eq('is_active', true);

    if (questionsError) {
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);
    }

    if (!questions || questions.length === 0) {
      return {
        isValid: false,
        issues: ['No active questions found for this certification'],
        validQuestions: [],
        totalQuestions: 0
      };
    }

    const validationResults = questions.map(question => {
      const issues: string[] = [];
      
      // Check if question has answer options
      if (!question.answer_options || question.answer_options.length === 0) {
        issues.push('No answer options found');
      } else {
        // Check minimum number of options
        if (question.answer_options.length < 2) {
          issues.push('Less than 2 answer options');
        }

        // Check if at least one option is marked as correct
        const correctOptions = question.answer_options.filter(opt => opt.is_correct);
        if (correctOptions.length === 0) {
          issues.push('No correct answer marked');
        }

        // For multiple choice, ensure only one correct answer
        if (question.question_type === 'multiple_choice' && correctOptions.length > 1) {
          issues.push('Multiple choice should have only one correct answer');
        }

        // Check for empty option text
        const emptyOptions = question.answer_options.filter(opt => !opt.option_text || opt.option_text.trim() === '');
        if (emptyOptions.length > 0) {
          issues.push('Some answer options have empty text');
        }
      }

      return {
        question,
        issues,
        isValid: issues.length === 0
      };
    });

    const validQuestions = validationResults.filter(result => result.isValid).map(result => result.question);
    const allIssues = validationResults
      .filter(result => !result.isValid)
      .flatMap(result => result.issues.map(issue => `${result.question.question_text.substring(0, 50)}...: ${issue}`));

    return {
      isValid: validQuestions.length > 0,
      issues: allIssues,
      validQuestions,
      totalQuestions: questions.length,
      validationResults
    };

  } catch (error: any) {
    console.error('Question validation error:', error);
    return {
      isValid: false,
      issues: [error.message || 'Failed to validate questions'],
      validQuestions: [],
      totalQuestions: 0
    };
  }
};

export const getQuestionValidationSummary = async () => {
  try {
    const { data, error } = await supabase.rpc('validate_question_completeness');
    
    if (error) {
      console.error('Validation function error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get validation summary:', error);
    return null;
  }
};