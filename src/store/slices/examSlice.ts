import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Certification, Question, ExamSession, ExamAnswer, Certificate } from '../../types';
import { supabase } from '../../lib/supabase';
import { validateQuestionsForCertification } from '../../utils/questionValidator';

interface ExamState {
  certifications: Certification[];
  currentCertification: Certification | null;
  currentSession: ExamSession | null;
  questions: Question[];
  sessionQuestions: Question[];
  answers: Record<string, string[]>;
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  examStarted: boolean;
  currentQuestionIndex: number;
  timeRemaining: number;
}

const initialState: ExamState = {
  certifications: [],
  currentCertification: null,
  currentSession: null,
  questions: [],
  sessionQuestions: [],
  answers: {},
  certificates: [],
  loading: false,
  error: null,
  examStarted: false,
  currentQuestionIndex: 0,
  timeRemaining: 0,
};

export const fetchCertifications = createAsyncThunk(
  'exam/fetchCertifications',
  async () => {
    console.log('🔍 Fetching certifications...');
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching certifications:', error);
      throw error;
    }
    
    console.log('✅ Fetched certifications:', data?.length || 0);
    return data;
  }
);

export const fetchCertificationById = createAsyncThunk(
  'exam/fetchCertificationById',
  async (certificationId: string) => {
    const { data, error } = await supabase
      .from('certifications')
      .select(`
        *,
        questions (
          *,
          answer_options (*)
        )
      `)
      .eq('id', certificationId)
      .single();
    
    if (error) throw error;
    return data;
  }
);

// Helper function to shuffle array using Fisher-Yates algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to randomly select questions
const selectRandomQuestions = (questions: Question[], count: number): Question[] => {
  if (questions.length <= count) {
    return shuffleArray(questions);
  }
  
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
};

export const startExamSession = createAsyncThunk(
  'exam/startExamSession',
  async ({ certificationId, userId }: { certificationId: string; userId: string }) => {
    console.log('🚀 Starting exam session for certification:', certificationId, 'user:', userId);
    
    try {
      // First, get the certification details
      const { data: certification, error: certError } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', certificationId)
        .eq('is_active', true)
        .single();
      
      if (certError) {
        console.error('❌ Certification error:', certError);
        throw new Error(`Certification not found: ${certError.message}`);
      }

      if (!certification) {
        throw new Error('Certification not found or not active');
      }

      console.log('✅ Found certification:', certification.name);

      // Use the validation utility to check questions
      console.log('🔍 Validating questions for certification...');
      const validationResult = await validateQuestionsForCertification(certificationId);

      if (!validationResult.isValid) {
        const errorMessage = `Cannot start exam for "${certification.name}". Issues found:\n${validationResult.issues.join('\n')}`;
        console.error('❌ Question validation failed:', validationResult.issues);
        throw new Error(errorMessage);
      }

      const validQuestions = validationResult.validQuestions;
      console.log('✅ Valid questions found:', validQuestions.length);

      // Check if we have enough questions
      const questionsNeeded = Math.min(certification.total_questions, validQuestions.length);
      if (validQuestions.length < certification.total_questions) {
        console.warn(`⚠️ Only ${validQuestions.length} questions available, but ${certification.total_questions} requested. Using ${questionsNeeded} questions.`);
      }

      // Randomly select questions based on certification's total_questions setting
      const selectedQuestions = selectRandomQuestions(validQuestions, questionsNeeded);

      console.log('🎯 Selected questions for exam:', selectedQuestions.length);

      // Create exam session
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .insert({
          user_id: userId,
          certification_id: certificationId,
          status: 'in_progress',
          time_remaining: certification.duration * 60, // Convert minutes to seconds
        })
        .select()
        .single();
      
      if (sessionError) {
        console.error('❌ Session creation error:', sessionError);
        throw new Error(`Failed to create exam session: ${sessionError.message}`);
      }

      console.log('✅ Created exam session:', session.id);

      // Create exam questions with randomized order
      const examQuestions = selectedQuestions.map((question, index) => ({
        exam_session_id: session.id,
        question_id: question.id,
        order_num: index + 1,
      }));

      const { error: examQuestionsError } = await supabase
        .from('exam_questions')
        .insert(examQuestions);
      
      if (examQuestionsError) {
        console.error('❌ Exam questions creation error:', examQuestionsError);
        // Clean up session if exam questions creation failed
        await supabase.from('exam_sessions').delete().eq('id', session.id);
        throw new Error(`Failed to create exam questions: ${examQuestionsError.message}`);
      }

      console.log('🎉 Successfully created exam with', selectedQuestions.length, 'questions');

      return { 
        session: {
          ...session,
          time_remaining: certification.duration * 60
        }, 
        questions: selectedQuestions,
        certification 
      };
    } catch (error: any) {
      console.error('💥 Exam creation failed:', error);
      throw error;
    }
  }
);

export const fetchExamSession = createAsyncThunk(
  'exam/fetchExamSession',
  async ({ sessionId, userId }: { sessionId: string; userId: string }) => {
    console.log('🔄 Fetching exam session:', sessionId);
    
    try {
      // Get exam session
      const { data: session, error: sessionError } = await supabase
        .from('exam_sessions')
        .select(`
          *,
          certifications (*)
        `)
        .eq('id', sessionId)
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .single();
      
      if (sessionError) {
        console.error('❌ Session fetch error:', sessionError);
        throw new Error(`Exam session not found: ${sessionError.message}`);
      }

      console.log('✅ Found exam session');

      // Get questions for this session in the correct order
      const { data: examQuestions, error: examQuestionsError } = await supabase
        .from('exam_questions')
        .select(`
          *,
          questions (
            *,
            answer_options (*)
          )
        `)
        .eq('exam_session_id', sessionId)
        .order('order_num', { ascending: true });
      
      if (examQuestionsError) {
        console.error('❌ Exam questions fetch error:', examQuestionsError);
        throw new Error(`Failed to load exam questions: ${examQuestionsError.message}`);
      }

      // Extract questions in the correct order
      const questions = examQuestions?.map(eq => eq.questions).filter(Boolean) || [];

      console.log('📝 Loaded questions for session:', questions.length);

      if (questions.length === 0) {
        throw new Error('No questions found for this exam session');
      }

      // Validate that all questions have proper answer options
      const invalidQuestions = questions.filter(q => 
        !q.answer_options || 
        q.answer_options.length < 2 || 
        !q.answer_options.some(opt => opt.is_correct)
      );

      if (invalidQuestions.length > 0) {
        console.error('❌ Invalid questions found in session:', invalidQuestions.length);
        throw new Error(`Some questions in this exam session are invalid. Please contact the administrator.`);
      }

      // Get existing answers
      const { data: answers, error: answersError } = await supabase
        .from('exam_answers')
        .select('*')
        .eq('exam_session_id', sessionId);
      
      if (answersError) {
        console.error('❌ Answers fetch error:', answersError);
        throw new Error(`Failed to load exam answers: ${answersError.message}`);
      }

      // Convert answers to the format expected by the UI
      const answersMap: Record<string, string[]> = {};
      answers?.forEach(answer => {
        answersMap[answer.question_id] = answer.selected_options;
      });

      console.log('✅ Exam session loaded successfully');

      return { 
        session, 
        questions, 
        answers: answersMap,
        certification: session.certifications 
      };
    } catch (error: any) {
      console.error('💥 Failed to fetch exam session:', error);
      throw error;
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'exam/submitAnswer',
  async ({ 
    sessionId, 
    questionId, 
    selectedOptions 
  }: { 
    sessionId: string; 
    questionId: string; 
    selectedOptions: string[] 
  }) => {
    const { data, error } = await supabase
      .from('exam_answers')
      .upsert({
        exam_session_id: sessionId,
        question_id: questionId,
        selected_options: selectedOptions,
      })
      .select()
      .single();
    
    if (error) throw error;
    return { questionId, selectedOptions, data };
  }
);

export const updateExamTimer = createAsyncThunk(
  'exam/updateExamTimer',
  async ({ sessionId, timeRemaining }: { sessionId: string; timeRemaining: number }) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .update({ time_remaining: timeRemaining })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
);

export const completeExamSession = createAsyncThunk(
  'exam/completeExamSession',
  async ({ sessionId }: { sessionId: string }) => {
    console.log('🏁 Completing exam session:', sessionId);
    
    try {
      // Get all answers for this session with question details including points
      const { data: answers, error: answersError } = await supabase
        .from('exam_answers')
        .select(`
          *,
          questions (
            *,
            answer_options (*)
          )
        `)
        .eq('exam_session_id', sessionId);
      
      if (answersError) {
        console.error('❌ Error fetching answers:', answersError);
        throw new Error(`Failed to load exam answers: ${answersError.message}`);
      }

      // Calculate score based on points
      let totalPoints = 0;
      let earnedPoints = 0;

      console.log('📊 Calculating score with points system...');

      answers?.forEach(answer => {
        const question = answer.questions;
        if (question && question.answer_options) {
          const questionPoints = question.points || 1;
          totalPoints += questionPoints;

          const correctOptions = question.answer_options
            .filter(opt => opt.is_correct)
            .map(opt => opt.id);
          
          const selectedOptions = answer.selected_options;
          
          // Check if answer is correct (all correct options selected, no incorrect ones)
          const isCorrect = correctOptions.length === selectedOptions.length &&
                           correctOptions.every(id => selectedOptions.includes(id));
          
          if (isCorrect) {
            earnedPoints += questionPoints;
          }

          // Update the answer with correctness
          supabase
            .from('exam_answers')
            .update({ is_correct: isCorrect })
            .eq('id', answer.id)
            .then();
        }
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      console.log('📈 Final score:', score, '% (', earnedPoints, '/', totalPoints, 'points)');

      // Get certification to check passing score
      const { data: session, error: sessionFetchError } = await supabase
        .from('exam_sessions')
        .select(`
          *,
          certifications (passing_score)
        `)
        .eq('id', sessionId)
        .single();
      
      if (sessionFetchError) {
        console.error('❌ Error fetching session:', sessionFetchError);
        throw new Error(`Failed to load exam session: ${sessionFetchError.message}`);
      }

      const passed = score >= (session.certifications?.passing_score || 70);
      console.log('🎯 Exam result:', passed ? 'PASSED' : 'FAILED', `(${score}% >= ${session.certifications?.passing_score}%)`);

      // Update exam session
      const { data: updatedSession, error: updateError } = await supabase
        .from('exam_sessions')
        .update({
          status: passed ? 'passed' : 'failed',
          score,
          passed,
          end_time: new Date().toISOString(),
          time_remaining: 0
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating session:', updateError);
        throw new Error(`Failed to update exam session: ${updateError.message}`);
      }

      // If passed, generate certificate
      let certificate = null;
      if (passed) {
        console.log('🏆 Generating certificate...');
        
        const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const verificationHash = `${sessionId}-${Date.now()}-${Math.random().toString(36)}`;

        const { data: cert, error: certError } = await supabase
          .from('certificates')
          .insert({
            certificate_number: certificateNumber,
            user_id: session.user_id,
            certification_id: session.certification_id,
            exam_session_id: sessionId,
            verification_hash: verificationHash,
            issued_date: new Date().toISOString()
          })
          .select()
          .single();
        
        if (certError) {
          console.error('❌ Error creating certificate:', certError);
        } else {
          certificate = cert;
          console.log('✅ Certificate generated:', certificateNumber);
        }
      }

      console.log('🎉 Exam completion successful');

      return { session: updatedSession, certificate, score, passed };
    } catch (error: any) {
      console.error('💥 Exam completion failed:', error);
      throw error;
    }
  }
);

export const fetchUserCertificates = createAsyncThunk(
  'exam/fetchUserCertificates',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        certifications (name, provider),
        profiles (full_name)
      `)
      .eq('user_id', userId)
      .eq('revoked', false)
      .order('issued_date', { ascending: false });
    
    if (error) throw error;
    return data;
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },
    setAnswer: (state, action: PayloadAction<{ questionId: string; selectedOptions: string[] }>) => {
      state.answers[action.payload.questionId] = action.payload.selectedOptions;
    },
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    startExamTimer: (state, action: PayloadAction<number>) => {
      state.examStarted = true;
      state.timeRemaining = action.payload;
    },
    resetExamState: (state) => {
      state.currentCertification = null;
      state.currentSession = null;
      state.sessionQuestions = [];
      state.examStarted = false;
      state.currentQuestionIndex = 0;
      state.timeRemaining = 0;
      state.answers = {};
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(fetchCertificationById.fulfilled, (state, action) => {
        state.currentCertification = action.payload;
        state.questions = action.payload.questions || [];
      })
      .addCase(startExamSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload.session;
        state.sessionQuestions = action.payload.questions;
        state.currentCertification = action.payload.certification;
        state.examStarted = true;
        state.timeRemaining = action.payload.session.time_remaining || 0;
        state.currentQuestionIndex = 0;
        state.answers = {};
      })
      .addCase(startExamSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start exam session';
      })
      .addCase(fetchExamSession.fulfilled, (state, action) => {
        state.currentSession = action.payload.session;
        state.sessionQuestions = action.payload.questions;
        state.currentCertification = action.payload.certification;
        state.answers = action.payload.answers;
        state.examStarted = true;
        state.timeRemaining = action.payload.session.time_remaining || 0;
      })
      .addCase(submitAnswer.fulfilled, (state, action) => {
        state.answers[action.payload.questionId] = action.payload.selectedOptions;
      })
      .addCase(updateExamTimer.fulfilled, (state, action) => {
        if (state.currentSession) {
          state.currentSession.time_remaining = action.payload.time_remaining;
        }
        state.timeRemaining = action.payload.time_remaining;
      })
      .addCase(completeExamSession.fulfilled, (state, action) => {
        state.currentSession = action.payload.session;
        state.examStarted = false;
      })
      .addCase(fetchUserCertificates.fulfilled, (state, action) => {
        state.certificates = action.payload;
      });
  },
});

export const {
  setCurrentQuestion,
  setAnswer,
  setTimeRemaining,
  startExamTimer,
  resetExamState,
  clearError,
} = examSlice.actions;

export default examSlice.reducer;