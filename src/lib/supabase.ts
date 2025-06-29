import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions with proper redirect URL handling
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      // This ensures the confirmation email uses the correct URL
      emailRedirectTo: `${window.location.origin}/auth/confirm`
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Password reset with proper redirect
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  return { data, error };
};

// Database helper functions
export const getCertifications = async () => {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getCertificationWithQuestions = async (certificationId: string) => {
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
  
  return { data, error };
};

export const createExamSession = async (userId: string, certificationId: string) => {
  const { data, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: userId,
      certification_id: certificationId,
      status: 'in_progress'
    })
    .select()
    .single();
  
  return { data, error };
};

export const getUserCertificates = async (userId: string) => {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      certifications (name, provider)
    `)
    .eq('user_id', userId)
    .eq('revoked', false)
    .order('issued_date', { ascending: false });
  
  return { data, error };
};