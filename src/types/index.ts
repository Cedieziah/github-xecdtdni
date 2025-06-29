export interface User {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  provider: string;
  access_code: string | null;
  duration: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface QuestionCategory {
  id: string;
  certification_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Question {
  id: string;
  certification_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_answer' | 'true_false';
  difficulty: number;
  points: number;
  explanation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  question_image_url?: string | null;
  answer_options?: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
  option_image_url?: string | null;
}

export interface ExamSession {
  id: string;
  user_id: string;
  certification_id: string;
  start_time: string;
  end_time: string | null;
  time_remaining: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'passed';
  score: number | null;
  passed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_session_id: string;
  question_id: string;
  order_num: number;
  created_at: string;
}

export interface ExamAnswer {
  id: string;
  exam_session_id: string;
  question_id: string;
  selected_options: string[];
  is_correct: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  certification_id: string;
  exam_session_id: string;
  issued_date: string;
  expiry_date: string | null;
  verification_hash: string;
  revoked: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
  };
  certification?: {
    name: string;
    provider: string;
  };
}

// Course catalog types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  certification_type: string;
  duration: number; // in hours
  skill_level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  currency: string;
  start_date: string;
  end_date?: string;
  instructor: string;
  learning_outcomes: string[];
  prerequisites: string[];
  modules: CourseModule[];
  featured: boolean;
  image_url?: string;
  rating: number;
  total_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url?: string;
  order: number;
}

export interface CourseFilters {
  category?: string;
  certification_type?: string;
  skill_level?: string;
  duration_min?: number;
  duration_max?: number;
  price_min?: number;
  price_max?: number;
  featured?: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'course' | 'category' | 'instructor';
  count?: number;
}