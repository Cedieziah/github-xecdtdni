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
  CheckCircle
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Course, CourseFilters, SearchSuggestion } from '../types';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with actual API calls
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'CompTIA Security+',
    description: 'Comprehensive cybersecurity certification program covering network security, compliance, operational security, and threats.',
    category: 'Cybersecurity',
    certification_type: 'CompTIA',
    duration: 40,
    skill_level: 'intermediate',
    price: 35000,
    currency: 'PHP',
    start_date: '2025-02-15',
    instructor: 'Dr. Maria Santos',
    learning_outcomes: [
      'Industry-standard security certification',
      'Hands-on security tools training',
      'Career advancement opportunities',
      'Network security fundamentals'
    ],
    prerequisites: ['Basic networking knowledge', 'Computer fundamentals'],
    modules: [],
    featured: true,
    image_url: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg',
    rating: 4.8,
    total_students: 1250,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '2',
    title: 'PCB Design Fundamentals',
    description: 'Learn professional PCB design using industry-standard software and best practices for electronic circuit board development.',
    category: 'Electronics',
    certification_type: 'Professional',
    duration: 32,
    skill_level: 'beginner',
    price: 28000,
    currency: 'PHP',
    start_date: '2025-03-01',
    instructor: 'Eng. Carlos Rodriguez',
    learning_outcomes: [
      'Professional PCB design skills',
      'Industry software proficiency',
      'Project portfolio development',
      'Circuit analysis techniques'
    ],
    prerequisites: ['Basic electronics knowledge'],
    modules: [],
    featured: false,
    image_url: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg',
    rating: 4.6,
    total_students: 890,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '3',
    title: 'Robotics Programming',
    description: 'Master robot programming and automation systems for Industry 4.0 applications using modern programming languages.',
    category: 'Robotics',
    certification_type: 'Professional',
    duration: 48,
    skill_level: 'advanced',
    price: 42000,
    currency: 'PHP',
    start_date: '2025-02-22',
    instructor: 'Dr. Jennifer Lee',
    learning_outcomes: [
      'Robot programming expertise',
      'Automation system design',
      'Industry 4.0 readiness',
      'AI integration skills'
    ],
    prerequisites: ['Programming experience', 'Basic mathematics'],
    modules: [],
    featured: false,
    image_url: 'https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg',
    rating: 4.9,
    total_students: 567,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '4',
    title: 'Python for Data Science',
    description: 'Comprehensive Python programming course focused on data analysis, machine learning, and scientific computing.',
    category: 'Programming',
    certification_type: 'Python Institute',
    duration: 36,
    skill_level: 'intermediate',
    price: 32000,
    currency: 'PHP',
    start_date: '2025-03-15',
    instructor: 'Prof. Alex Chen',
    learning_outcomes: [
      'Python programming mastery',
      'Data analysis techniques',
      'Machine learning basics',
      'Scientific computing skills'
    ],
    prerequisites: ['Basic programming knowledge'],
    modules: [],
    featured: true,
    image_url: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
    rating: 4.7,
    total_students: 2100,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '5',
    title: 'Cloud Computing Essentials',
    description: 'Learn cloud computing fundamentals with hands-on experience in AWS, Azure, and Google Cloud platforms.',
    category: 'Cloud Computing',
    certification_type: 'AWS',
    duration: 44,
    skill_level: 'intermediate',
    price: 38000,
    currency: 'PHP',
    start_date: '2025-04-01',
    instructor: 'Eng. Sarah Johnson',
    learning_outcomes: [
      'Cloud architecture design',
      'Multi-platform expertise',
      'Cost optimization strategies',
      'Security best practices'
    ],
    prerequisites: ['Basic IT knowledge', 'Networking fundamentals'],
    modules: [],
    featured: false,
    image_url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
    rating: 4.5,
    total_students: 1450,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  },
  {
    id: '6',
    title: 'IoT Development Bootcamp',
    description: 'Build Internet of Things applications using Arduino, Raspberry Pi, and modern IoT platforms.',
    category: 'IoT',
    certification_type: 'Professional',
    duration: 40,
    skill_level: 'intermediate',
    price: 35000,
    currency: 'PHP',
    start_date: '2025-03-20',
    instructor: 'Dr. Michael Brown',
    learning_outcomes: [
      'IoT system development',
      'Sensor integration',
      'Cloud connectivity',
      'Mobile app development'
    ],
    prerequisites: ['Basic programming', 'Electronics fundamentals'],
    modules: [],
    featured: true,
    image_url: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
    rating: 4.6,
    total_students: 780,
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
  }
];

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'CompTIA Security+', type: 'course' },
  { id: '2', text: 'Cybersecurity', type: 'category', count: 5 },
  { id: '3', text: 'Python Programming', type: 'course' },
  { id: '4', text: 'Electronics', type: 'category', count: 8 },
  { id: '5', text: 'Dr. Maria Santos', type: 'instructor' },
];

const categories = ['All', 'Cybersecurity', 'Electronics', 'Robotics', 'Programming', 'Cloud Computing', 'IoT'];
const certificationTypes = ['All', 'CompTIA', 'Professional', 'Python Institute', 'AWS'];
const skillLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CourseCatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<CourseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price' | 'rating' | 'duration'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 9;

  // Filter and search logic
  const filteredCourses = useMemo(() => {
    let filtered = mockCourses.filter(course => {
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
          return b.rating - a.rating;
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm) return [];
    return mockSuggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm]);

  const handleEnrollNow = (courseId: string) => {
    navigate('/auth');
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
            Showing {paginatedCourses.length} of {filteredCourses.length} courses
          </p>
          <div className="text-sm text-primary-white/70">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Course Grid/List */}
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
                      <span className="text-sm text-primary-white">{course.duration}h</span>
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
                      Enroll Now
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
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