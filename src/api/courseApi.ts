import { supabase } from '../lib/supabase';
import { Course, CourseFilters } from '../types';

export interface CourseApiParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: CourseFilters;
  sortBy?: 'featured' | 'price' | 'rating' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface CourseApiResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Fetch courses with pagination, search, and filters
 */
export const fetchCourses = async (params: CourseApiParams = {}): Promise<CourseApiResponse> => {
  const {
    page = 1,
    limit = 12,
    search = '',
    filters = {},
    sortBy = 'featured',
    sortOrder = 'desc'
  } = params;

  try {
    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%,instructor.ilike.%${search}%`);
    }

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.certification_type) {
      query = query.eq('certification_type', filters.certification_type);
    }

    if (filters.skill_level) {
      query = query.eq('skill_level', filters.skill_level);
    }

    if (filters.duration_min) {
      query = query.gte('duration', filters.duration_min);
    }

    if (filters.duration_max) {
      query = query.lte('duration', filters.duration_max);
    }

    if (filters.price_min) {
      query = query.gte('price', filters.price_min);
    }

    if (filters.price_max) {
      query = query.lte('price', filters.price_max);
    }

    if (filters.featured) {
      query = query.eq('featured', true);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    switch (sortBy) {
      case 'price':
        query = query.order('price', { ascending });
        break;
      case 'rating':
        query = query.order('rating', { ascending });
        break;
      case 'duration':
        query = query.order('duration', { ascending });
        break;
      case 'featured':
      default:
        query = query.order('featured', { ascending: false })
                   .order('rating', { ascending: false });
        break;
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      courses: data || [],
      total,
      page,
      totalPages,
      hasMore
    };

  } catch (error: any) {
    console.error('Course API error:', error);
    throw error;
  }
};

/**
 * Fetch a single course by ID
 */
export const fetchCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Course not found
      }
      throw new Error(`Failed to fetch course: ${error.message}`);
    }

    return data;

  } catch (error: any) {
    console.error('Course fetch error:', error);
    throw error;
  }
};

/**
 * Get course categories for filter options
 */
export const fetchCourseCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('category')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    // Extract unique categories
    const categories = [...new Set(data?.map(course => course.category) || [])];
    return categories.sort();

  } catch (error: any) {
    console.error('Categories fetch error:', error);
    return [];
  }
};

/**
 * Get certification types for filter options
 */
export const fetchCertificationTypes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('certification_type')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch certification types: ${error.message}`);
    }

    // Extract unique certification types
    const types = [...new Set(data?.map(course => course.certification_type) || [])];
    return types.sort();

  } catch (error: any) {
    console.error('Certification types fetch error:', error);
    return [];
  }
};

/**
 * Search suggestions for autocomplete
 */
export const fetchSearchSuggestions = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Search in course titles, categories, and instructors
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('title, category, instructor')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,category.ilike.%${query}%,instructor.ilike.%${query}%`)
      .limit(10);

    if (coursesError) {
      throw coursesError;
    }

    const suggestions: any[] = [];

    // Add course title suggestions
    courses?.forEach(course => {
      if (course.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: `course-${course.title}`,
          text: course.title,
          type: 'course'
        });
      }
    });

    // Add unique category suggestions
    const categories = [...new Set(courses?.map(c => c.category) || [])];
    categories.forEach(category => {
      if (category.toLowerCase().includes(query.toLowerCase())) {
        const count = courses?.filter(c => c.category === category).length || 0;
        suggestions.push({
          id: `category-${category}`,
          text: category,
          type: 'category',
          count
        });
      }
    });

    // Add unique instructor suggestions
    const instructors = [...new Set(courses?.map(c => c.instructor) || [])];
    instructors.forEach(instructor => {
      if (instructor.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push({
          id: `instructor-${instructor}`,
          text: instructor,
          type: 'instructor'
        });
      }
    });

    // Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
      index === self.findIndex(s => s.text === suggestion.text && s.type === suggestion.type)
    );

    return uniqueSuggestions.slice(0, 8);

  } catch (error: any) {
    console.error('Search suggestions error:', error);
    return [];
  }
};

/**
 * Cache management for improved performance
 */
class CourseCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const courseCache = new CourseCache();