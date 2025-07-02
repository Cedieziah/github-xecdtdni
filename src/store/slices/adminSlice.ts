import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Certification, Question, User, Certificate } from '../../types';
import { supabase } from '../../lib/supabase';
import { CertificationFormData } from '../../components/admin/CertificationDetailsForm';

interface AdminState {
  certifications: Certification[];
  questions: Question[];
  users: User[];
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  certifications: [],
  questions: [],
  users: [],
  certificates: [],
  loading: false,
  error: null,
};

// Enhanced certification creation with details
export const createCertificationWithDetails = createAsyncThunk(
  'admin/createCertificationWithDetails',
  async (formData: CertificationFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      // Create main certification record
      const { data: certification, error: certError } = await supabase
        .from('certifications')
        .insert({
          name: formData.name,
          description: formData.description,
          provider: formData.provider,
          access_code: formData.access_code || null,
          duration: formData.duration,
          passing_score: formData.passing_score,
          total_questions: formData.total_questions,
          is_active: formData.is_active,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (certError) throw certError;

      // Create certification details record
      const { error: detailsError } = await supabase
        .from('certification_details')
        .insert({
          certification_id: certification.id,
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
          created_by: user?.id
        });
      
      if (detailsError) {
        // If details creation fails, clean up the certification
        await supabase.from('certifications').delete().eq('id', certification.id);
        throw detailsError;
      }

      return certification;
    } catch (error: any) {
      console.error('Error creating certification with details:', error);
      throw new Error(`Failed to create certification: ${error.message}`);
    }
  }
);

// Enhanced certification update with details
export const updateCertificationWithDetails = createAsyncThunk(
  'admin/updateCertificationWithDetails',
  async ({ id, formData }: { id: string; formData: CertificationFormData }) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    try {
      // Update main certification record
      const { data: certification, error: certError } = await supabase
        .from('certifications')
        .update({
          name: formData.name,
          description: formData.description,
          provider: formData.provider,
          access_code: formData.access_code || null,
          duration: formData.duration,
          passing_score: formData.passing_score,
          total_questions: formData.total_questions,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (certError) throw certError;

      // Update or create certification details record
      const { error: detailsError } = await supabase
        .from('certification_details')
        .upsert({
          certification_id: id,
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
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        });
      
      if (detailsError) throw detailsError;

      return certification;
    } catch (error: any) {
      console.error('Error updating certification with details:', error);
      throw new Error(`Failed to update certification: ${error.message}`);
    }
  }
);

// Fetch certification with details
export const fetchCertificationWithDetails = createAsyncThunk(
  'admin/fetchCertificationWithDetails',
  async (certificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('certifications_with_details')
        .select('*')
        .eq('id', certificationId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching certification details:', error);
      throw new Error(`Failed to fetch certification details: ${error.message}`);
    }
  }
);

// Existing thunks...
export const fetchCertifications = createAsyncThunk(
  'admin/fetchCertifications',
  async () => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const createCertification = createAsyncThunk(
  'admin/createCertification',
  async (certificationData: Partial<Certification>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('certifications')
      .insert({
        ...certificationData,
        created_by: user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const updateCertification = createAsyncThunk(
  'admin/updateCertification',
  async (certificationData: Partial<Certification> & { id: string }) => {
    const { id, ...updateData } = certificationData;
    const { data, error } = await supabase
      .from('certifications')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const deleteCertification = createAsyncThunk(
  'admin/deleteCertification',
  async (id: string) => {
    try {
      console.log('🗑️ Starting cascading delete for certification:', id);

      // Step 1: Get all exam sessions for this certification
      const { data: examSessions, error: examSessionsError } = await supabase
        .from('exam_sessions')
        .select('id')
        .eq('certification_id', id);

      if (examSessionsError) throw examSessionsError;

      const examSessionIds = examSessions?.map(session => session.id) || [];
      console.log('📋 Found exam sessions to delete:', examSessionIds.length);

      // Step 2: Delete exam answers for all exam sessions
      if (examSessionIds.length > 0) {
        const { error: examAnswersError } = await supabase
          .from('exam_answers')
          .delete()
          .in('exam_session_id', examSessionIds);

        if (examAnswersError) throw examAnswersError;
        console.log('✅ Deleted exam answers');

        // Step 3: Delete exam questions for all exam sessions
        const { error: examQuestionsError } = await supabase
          .from('exam_questions')
          .delete()
          .in('exam_session_id', examSessionIds);

        if (examQuestionsError) throw examQuestionsError;
        console.log('✅ Deleted exam questions');

        // Step 4: Delete certificates linked to exam sessions
        const { error: certificatesError } = await supabase
          .from('certificates')
          .delete()
          .in('exam_session_id', examSessionIds);

        if (certificatesError) throw certificatesError;
        console.log('✅ Deleted certificates');

        // Step 5: Delete exam sessions
        const { error: examSessionsDeleteError } = await supabase
          .from('exam_sessions')
          .delete()
          .in('id', examSessionIds);

        if (examSessionsDeleteError) throw examSessionsDeleteError;
        console.log('✅ Deleted exam sessions');
      }

      // Step 6: Get all questions for this certification
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('certification_id', id);

      if (questionsError) throw questionsError;

      const questionIds = questions?.map(question => question.id) || [];
      console.log('❓ Found questions to delete:', questionIds.length);

      // Step 7: Delete answer options for all questions
      if (questionIds.length > 0) {
        const { error: answerOptionsError } = await supabase
          .from('answer_options')
          .delete()
          .in('question_id', questionIds);

        if (answerOptionsError) throw answerOptionsError;
        console.log('✅ Deleted answer options');

        // Step 8: Delete questions
        const { error: questionsDeleteError } = await supabase
          .from('questions')
          .delete()
          .in('id', questionIds);

        if (questionsDeleteError) throw questionsDeleteError;
        console.log('✅ Deleted questions');
      }

      // Step 9: Delete question categories
      const { error: categoriesError } = await supabase
        .from('question_categories')
        .delete()
        .eq('certification_id', id);

      if (categoriesError) throw categoriesError;
      console.log('✅ Deleted question categories');

      // Step 10: Delete certification details
      const { error: detailsError } = await supabase
        .from('certification_details')
        .delete()
        .eq('certification_id', id);

      if (detailsError) throw detailsError;
      console.log('✅ Deleted certification details');

      // Step 11: Finally delete the certification itself
      const { error: certificationError } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (certificationError) throw certificationError;
      console.log('✅ Deleted certification');

      console.log('🎉 Cascading delete completed successfully');
      return id;
    } catch (error: any) {
      console.error('❌ Error during cascading delete:', error);
      throw new Error(`Failed to delete certification: ${error.message}`);
    }
  }
);

// Questions
export const fetchQuestions = createAsyncThunk(
  'admin/fetchQuestions',
  async () => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        answer_options (*),
        certifications (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const createQuestion = createAsyncThunk(
  'admin/createQuestion',
  async (questionData: Partial<Question>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { answer_options, ...questionFields } = questionData;
    
    // Validate required fields
    if (!questionFields.certification_id) {
      throw new Error('Certification is required');
    }
    if (!questionFields.question_text) {
      throw new Error('Question text is required');
    }
    if (!answer_options || answer_options.length < 2) {
      throw new Error('At least 2 answer options are required');
    }

    // Check if at least one option is marked as correct
    const hasCorrectAnswer = answer_options.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      throw new Error('At least one answer option must be marked as correct');
    }
    
    // Create question first
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .insert({
        ...questionFields,
        created_by: user?.id,
        is_active: questionFields.is_active !== false // Default to true
      })
      .select()
      .single();
    
    if (questionError) throw questionError;

    // Create answer options
    const optionsToInsert = answer_options
      .filter(option => option.option_text && option.option_text.trim())
      .map(option => ({
        question_id: question.id,
        option_text: option.option_text.trim(),
        is_correct: option.is_correct || false
      }));

    if (optionsToInsert.length < 2) {
      // Clean up the question if we don't have enough options
      await supabase.from('questions').delete().eq('id', question.id);
      throw new Error('At least 2 valid answer options are required');
    }

    const { data: options, error: optionsError } = await supabase
      .from('answer_options')
      .insert(optionsToInsert)
      .select();
    
    if (optionsError) {
      // Clean up the question if options creation failed
      await supabase.from('questions').delete().eq('id', question.id);
      throw optionsError;
    }
    
    return { ...question, answer_options: options };
  }
);

export const updateQuestion = createAsyncThunk(
  'admin/updateQuestion',
  async (questionData: Partial<Question> & { id: string }) => {
    const { id, answer_options, ...questionFields } = questionData;
    
    // Validate if answer_options are provided
    if (answer_options) {
      const validOptions = answer_options.filter(opt => opt.option_text && opt.option_text.trim());
      if (validOptions.length < 2) {
        throw new Error('At least 2 valid answer options are required');
      }
      
      const hasCorrectAnswer = validOptions.some(opt => opt.is_correct);
      if (!hasCorrectAnswer) {
        throw new Error('At least one answer option must be marked as correct');
      }
    }
    
    // Update question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .update({
        ...questionFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (questionError) throw questionError;

    // Update answer options if provided
    if (answer_options) {
      // Delete existing options
      await supabase
        .from('answer_options')
        .delete()
        .eq('question_id', id);

      // Insert new options
      const validOptions = answer_options.filter(opt => opt.option_text && opt.option_text.trim());
      if (validOptions.length > 0) {
        const optionsToInsert = validOptions.map(option => ({
          question_id: id,
          option_text: option.option_text.trim(),
          is_correct: option.is_correct || false
        }));

        const { data: options, error: optionsError } = await supabase
          .from('answer_options')
          .insert(optionsToInsert)
          .select();
        
        if (optionsError) throw optionsError;
        
        return { ...question, answer_options: options };
      }
    }
    
    return question;
  }
);

export const deleteQuestion = createAsyncThunk(
  'admin/deleteQuestion',
  async (id: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
  }
);

// Enhanced Users fetch with comprehensive error handling and logging
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    console.log('🔍 Fetching users from profiles table...');
    
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('✅ Successfully fetched users:', {
        count: data?.length || 0,
        totalCount: count,
        sampleUser: data?.[0] ? {
          id: data[0].id,
          email: data[0].email,
          role: data[0].role,
          hasName: !!data[0].full_name
        } : null
      });

      // Validate user data integrity
      const usersWithIssues = data?.filter(user => 
        !user.email || !user.username || !user.role
      ) || [];

      if (usersWithIssues.length > 0) {
        console.warn('⚠️ Found users with missing data:', usersWithIssues.length);
      }

      return data || [];
    } catch (error: any) {
      console.error('💥 Failed to fetch users:', error);
      throw error;
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
    console.log('🔄 Updating user role:', { userId, role });
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }

    console.log('✅ User role updated successfully');
    return data;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string) => {
    console.log('🗑️ Deleting user:', userId);
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }

    console.log('✅ User deleted successfully');
    return userId;
  }
);

// Certificates
export const fetchCertificates = createAsyncThunk(
  'admin/fetchCertificates',
  async () => {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        profiles!certificates_user_id_fkey (full_name, email),
        certifications!certificates_certification_id_fkey (name, provider)
      `)
      .order('issued_date', { ascending: false });
    
    if (error) throw error;
    return data.map(cert => ({
      ...cert,
      user: cert.profiles,
      certification: cert.certifications
    }));
  }
);

export const revokeCertificate = createAsyncThunk(
  'admin/revokeCertificate',
  async (certificateId: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .update({ 
        revoked: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', certificateId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Certifications
      .addCase(fetchCertifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertifications.fulfilled, (state, action) => {
        state.loading = false;
        state.certifications = action.payload;
      })
      .addCase(fetchCertifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch certifications';
      })
      .addCase(createCertification.fulfilled, (state, action) => {
        state.certifications.unshift(action.payload);
      })
      .addCase(createCertificationWithDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCertificationWithDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.certifications.unshift(action.payload);
      })
      .addCase(createCertificationWithDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create certification';
      })
      .addCase(updateCertification.fulfilled, (state, action) => {
        const index = state.certifications.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.certifications[index] = action.payload;
        }
      })
      .addCase(updateCertificationWithDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCertificationWithDetails.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.certifications.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.certifications[index] = action.payload;
        }
      })
      .addCase(updateCertificationWithDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update certification';
      })
      .addCase(deleteCertification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCertification.fulfilled, (state, action) => {
        state.loading = false;
        state.certifications = state.certifications.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCertification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete certification';
      })
      
      // Questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch questions';
      })
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.questions.unshift(action.payload);
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create question';
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const index = state.questions.findIndex(q => q.id === action.payload.id);
        if (index !== -1) {
          state.questions[index] = action.payload;
        }
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.questions = state.questions.filter(q => q.id !== action.payload);
      })
      
      // Users - Enhanced with better error handling
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        console.log('📊 Users loaded into Redux state:', action.payload.length);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
        console.error('❌ Users fetch failed in Redux:', action.error.message);
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u.id !== action.payload);
      })
      
      // Certificates
      .addCase(fetchCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
      })
      .addCase(revokeCertificate.fulfilled, (state, action) => {
        const index = state.certificates.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.certificates[index] = action.payload;
        }
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;