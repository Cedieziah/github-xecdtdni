import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  Star,
  Clock,
  Users,
  Award,
  BookOpen,
  Calendar,
  DollarSign,
  ChevronDown,
  X,
  SlidersHorizontal,
  ArrowRight,
  Play,
  CheckCircle,
  Loader
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Course, CourseFilters, SearchSuggestion } from '../types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const CourseCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price' | 'rating' | 'duration'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [certificationTypes, setCertificationTypes] = useState<string[]>(['All']);
  const coursesPerPage = 9;

  // Fetch certifications from Supabase and convert to course format
  useEffect(() => {
    const fetchCertifications = async () => {
      setLoading(true);
      try {
        // Fetch certifications
        const { data: certifications, error } = await supabase
          .from('certifications')
          .select(`
            *,
            certification_details (*)
          `)
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        // Extract unique categories and certification types
        const uniqueProviders = new Set<string>();
        certifications?.forEach(cert => {
          if (cert.provider) {
            uniqueProviders.add(cert.provider);
          }
        });

        // Set categories and certification types
        setCategories(['All', ...Array.from(uniqueProviders)]);
        setCertificationTypes(['All']);

        // Convert certifications to course format
        const formattedCourses: Course[] = certifications?.map(cert => {
          // Get details from certification_details if available
          const details = cert.certification_details || {};
          const metadata = details.metadata || {};
          
          return {
            id: cert.id,
            title: cert.name,
            description: cert.description,
            category: cert.provider || 'Uncategorized',
            certification_type: 'Professional',
            duration: cert.duration || 60, // Duration in minutes
            skill_level: metadata.difficulty_level || 'intermediate',
            price: 35000, // Default price
            currency: 'PHP',
            start_date: new Date().toISOString().split('T')[0], // Today's date
            instructor: 'Expert Instructor',
            learning_outcomes: details.learning_outcomes || [
              "Complete certification exam successfully",
              "Gain industry-recognized credentials",
              "Demonstrate professional competence"
            ],
            prerequisites: details.prerequisites?.map((p: any) => p.description) || ['Basic knowledge in the field'],
            modules: [],
            featured: Math.random() > 0.7, // Randomly mark some as featured
            image_url: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg`,
            rating: (4 + Math.random()).toFixed(1),
            total_students: Math.floor(Math.random() * 2000) + 500,
            is_active: cert.is_active,
            created_at: cert.created_at,
            updated_at: cert.updated_at
          };
        }) || [];

        setCourses(formattedCourses);
      } catch (error: any) {
        console.error('Error fetching certifications:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          course.title.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower) ||
          course.instructor.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'All') {
        if (course.category !== filters.category) return false;
      }

      // Certification type filter
      if (filters.certification_type && filters.certification_type !== 'All') {
        if (course.certification_type !== filters.certification_type) return false;
      }

      // Skill level filter
      if (filters.skill_level && filters.skill_level !== 'All') {
        if (course.skill_level !== filters.skill_level.toLowerCase()) return false;
      }

      // Duration filter
      if (filters.duration_min && course.duration < filters.duration_min) return false;
      if (filters.duration_max && course.duration > filters.duration_max) return false;

      // Price filter
      if (filters.price_min && course.price < filters.price_min) return false;
      if (filters.price_max && course.price > filters.price_max) return false;

      return true;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return parseFloat(b.rating) - parseFloat(a.rating);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, filters, sortBy, courses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    
    const suggestions: SearchSuggestion[] = [];
    
    // Add course title suggestions
    courses.forEach(course => {
      if (course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.push({
          id: `course-${course.id}`,
          text: course.title,
          type: 'course'
        });
      }
    });
    
    // Add category suggestions
    categories.filter(cat => cat !== 'All').forEach(category => {
      if (category.toLowerCase().includes(searchTerm.toLowerCase())) {
        const count = courses.filter(c => c.category === category).length;
        suggestions.push({
          id: `category-${category}`,
          text: category,
          type: 'category',
          count
        });
      }
    });
    
    // Add instructor suggestions
    const instructors = [...new Set(courses.map(c => c.instructor))];
    instructors.forEach(instructor => {
      if (instructor.toLowerCase().includes(searchTerm.toLowerCase())) {
        suggestions.push({
          id: `instructor-${instructor}`,
          text: instructor,
          type: 'instructor'
        });
      }
    });
    
    return suggestions.slice(0, 5);
  }, [searchTerm, courses, categories]);

  const handleEnrollNow = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: currency === 'PHP' ? 'PHP' : 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-robotic-green bg-robotic-green/20';
      case 'intermediate': return 'text-primary-orange bg-primary-orange/20';
      case 'advanced': return 'text-red-400 bg-red-400/20';
      default: return 'text-primary-gray bg-primary-gray/20';
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-primary-white mb-4">
            Course Catalog
          </h1>
          <p className="text-lg text-primary-white/70 max-w-3xl mx-auto">
            Discover our comprehensive collection of technology courses designed to advance your career
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-primary-black/50 border-primary-gray/30">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray" />
                <input
                  type="text"
                  placeholder="Search courses, categories, or instructors..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-3 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                />
              </div>

              {/* Search Suggestions */}
              <AnimatePresence>
                {showSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-primary-black border border-primary-gray/30 rounded-lg shadow-xl z-50"
                  >
                    {searchSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setSearchTerm(suggestion.text);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-primary-gray/20 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-primary-white">{suggestion.text}</span>
                          <div className="flex items-center gap-2">
                            {suggestion.count && (
                              <span className="text-xs text-primary-gray">
                                {suggestion.count} courses
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              suggestion.type === 'course' ? 'bg-robotic-blue/20 text-robotic-blue' :
                              suggestion.type === 'category' ? 'bg-robotic-green/20 text-robotic-green' :
                              'bg-robotic-purple/20 text-robotic-purple'
                            }`}>
                              {suggestion.type}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <select
                  value={filters.category || 'All'}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value === 'All' ? undefined : e.target.value }))}
                  className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Certification Type Filter */}
                <select
                  value={filters.certification_type || 'All'}
                  onChange={(e) => setFilters(prev => ({ ...prev, certification_type: e.target.value === 'All' ? undefined : e.target.value }))}
                  className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                >
                  {certificationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Skill Level Filter */}
                <select
                  value={filters.skill_level || 'All'}
                  onChange={(e) => setFilters(prev => ({ ...prev, skill_level: e.target.value === 'All' ? undefined : e.target.value }))}
                  className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>

                {/* Advanced Filters Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`${showFilters ? 'bg-primary-orange/20 text-primary-orange' : ''}`}
                >
                  <SlidersHorizontal size={16} />
                  More Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X size={16} />
                    Clear All
                  </Button>
                )}

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                  <option value="duration">Duration</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-primary-gray rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`!rounded-none ${viewMode === 'grid' ? 'bg-primary-orange text-white' : ''}`}
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`!rounded-none ${viewMode === 'list' ? 'bg-primary-orange text-white' : ''}`}
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-primary-gray/30 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Duration (hours)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.duration_min || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, duration_min: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.duration_max || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, duration_max: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Price Range (PHP)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.price_min || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, price_min: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.price_max || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, price_max: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.featured || false}
                          onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked || undefined }))}
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                        />
                        <span className="text-primary-white text-sm">Featured courses only</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-primary-white/70">
            {loading ? 'Loading courses...' : `Showing ${paginatedCourses.length} of ${filteredCourses.length} courses`}
          </p>
          {totalPages > 0 && (
            <div className="text-sm text-primary-white/70">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader size={40} className="text-primary-orange animate-spin mx-auto mb-4" />
              <p className="text-primary-white">Loading courses...</p>
            </div>
          </div>
        )}

        {/* Course Grid/List */}
        {!loading && (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-6'
          }`}>
            {paginatedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full bg-primary-black/50 border-primary-gray/30 hover:border-primary-orange/50 transition-all duration-300 ${
                  course.featured ? 'ring-2 ring-primary-orange/50' : ''
                } ${viewMode === 'list' ? 'flex flex-col lg:flex-row' : ''}`}>
                  {course.featured && (
                    <div className="bg-primary-orange text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      MOST POPULAR
                    </div>
                  )}

                  {/* Course Image */}
                  {course.image_url && (
                    <div className={`${viewMode === 'list' ? 'lg:w-64 lg:flex-shrink-0' : ''} mb-4 lg:mb-0`}>
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className={`w-full object-cover rounded-lg ${
                          viewMode === 'list' ? 'h-48 lg:h-full' : 'h-48'
                        }`}
                        onError={(e) => {
                          // Fallback image if the random one fails to load
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg';
                        }}
                      />
                    </div>
                  )}

                  <div className={`${viewMode === 'list' ? 'lg:ml-6 flex-1' : ''} flex flex-col h-full`}>
                    {/* Category and Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-robotic-blue bg-robotic-blue/20 px-2 py-1 rounded">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-primary-white">{course.rating}</span>
                        <span className="text-xs text-primary-gray">({course.total_students})</span>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl font-bold text-primary-white mb-2">{course.title}</h3>
                    <p className="text-primary-white/70 text-sm mb-4 flex-1 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-primary-orange" />
                        <span className="text-sm text-primary-white">{course.duration}m</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-robotic-blue" />
                        <span className={`text-xs px-2 py-1 rounded capitalize ${getSkillLevelColor(course.skill_level)}`}>
                          {course.skill_level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-robotic-green" />
                        <span className="text-sm text-primary-white">{course.total_students} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-robotic-purple" />
                        <span className="text-sm text-primary-white">
                          {new Date(course.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-primary-white mb-2">Learning Outcomes:</h4>
                      <ul className="space-y-1">
                        {course.learning_outcomes.slice(0, 3).map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle size={12} className="text-robotic-green mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-primary-white/70">{outcome}</span>
                          </li>
                        ))}
                        {course.learning_outcomes.length > 3 && (
                          <li className="text-xs text-primary-orange">
                            +{course.learning_outcomes.length - 3} more outcomes
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Price and Enroll */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-2xl font-bold text-primary-orange">
                        {formatPrice(course.price, course.currency)}
                      </div>
                      <Button 
                        variant={course.featured ? "primary" : "secondary"} 
                        onClick={() => handleEnrollNow(course.id)}
                      >
                        View Details
                        <ArrowRight size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCourses.length === 0 && (
          <Card className="text-center py-12 bg-primary-black/50 border-primary-gray/30">
            <BookOpen size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No courses found
            </h3>
            <p className="text-primary-gray mb-6">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CourseCatalogPage;