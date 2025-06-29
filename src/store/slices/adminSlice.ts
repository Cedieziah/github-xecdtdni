import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Certification, Question, User, Certificate } from '../../types';
import { supabase } from '../../lib/supabase';

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

// Certifications
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
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return id;
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

// Users
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
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
      .addCase(updateCertification.fulfilled, (state, action) => {
        const index = state.certifications.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.certifications[index] = action.payload;
        }
      })
      .addCase(deleteCertification.fulfilled, (state, action) => {
        state.certifications = state.certifications.filter(c => c.id !== action.payload);
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
      
      // Users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
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