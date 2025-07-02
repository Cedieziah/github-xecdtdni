import React, { useState, useEffect, useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, AlertTriangle, CheckCircle, Info, BookOpen, Target } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Certification } from '../../types';

interface CertificationDetailsFormProps {
  certification?: Certification | null;
  initialFormData?: CertificationFormData;
  onSubmit: (data: CertificationFormData) => void;
  onCancel: () => void;
  onChange?: (data: CertificationFormData) => void;
  isSubmitting?: boolean;
}

export interface CertificationFormData {
  // Main certification fields
  name: string;
  description: string;
  provider: string;
  access_code: string;
  duration: number;
  passing_score: number;
  total_questions: number;
  is_active: boolean;
  
  // Certification details fields
  exam_coverage: Array<{
    coverage_field: string;
    description: string;
    key_concepts: string[];
    depth_of_understanding: string;
    evaluation_criteria: string;
  }>;
  examination_evaluation: Array<{
    coverage_item: string;
    scoring_guidelines: string;
    performance_indicators: string[];
    minimum_requirements: string;
    passing_threshold: string;
  }>;
  target_audience: string[];
}

// Default form data to avoid recreating it on each render
const defaultFormData: CertificationFormData = {
  name: '',
  description: '',
  provider: '',
  access_code: '',
  duration: 60,
  passing_score: 70,
  total_questions: 10,
  is_active: true,
  exam_coverage: [
    {
      coverage_field: '',
      description: '',
      key_concepts: [''],
      depth_of_understanding: '',
      evaluation_criteria: ''
    }
  ],
  examination_evaluation: [
    {
      coverage_item: '',
      scoring_guidelines: '',
      performance_indicators: [''],
      minimum_requirements: '',
      passing_threshold: ''
    }
  ],
  target_audience: ['']
};

const CertificationDetailsForm: React.FC<CertificationDetailsFormProps> = ({
  certification,
  initialFormData,
  onSubmit,
  onCancel,
  onChange,
  isSubmitting = false
}) => {
  // Use useRef to avoid recreating the initial state on every render
  const initialFormState = useRef<CertificationFormData>(
    initialFormData || {
      ...defaultFormData,
      ...(certification ? {
        name: certification.name,
        description: certification.description,
        provider: certification.provider,
        access_code: certification.access_code || '',
        duration: certification.duration,
        passing_score: certification.passing_score,
        total_questions: certification.total_questions,
        is_active: certification.is_active
      } : {})
    }
  ).current;

  const [formData, setFormData] = useState<CertificationFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'coverage' | 'evaluation'>('basic');
  const [isFormInitialized, setIsFormInitialized] = useState(!!initialFormData);

  // Initialize form with certification data or initialFormData only once
  useEffect(() => {
    if (initialFormData && !isFormInitialized) {
      setFormData(initialFormData);
      setIsFormInitialized(true);
    }
  }, [initialFormData, isFormInitialized]);

  // Notify parent component of changes, but debounce to prevent too many updates
  useEffect(() => {
    if (onChange && isFormInitialized) {
      const timer = setTimeout(() => {
        onChange(formData);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [formData, onChange, isFormInitialized]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'Certification name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.provider.trim()) {
      newErrors.provider = 'Provider is required';
    }
    if (formData.duration < 1) {
      newErrors.duration = 'Duration must be at least 1 minute';
    }
    if (formData.passing_score < 1 || formData.passing_score > 100) {
      newErrors.passing_score = 'Passing score must be between 1 and 100';
    }
    if (formData.total_questions < 1) {
      newErrors.total_questions = 'Total questions must be at least 1';
    }

    // Coverage validation
    const validCoverage = formData.exam_coverage.filter(c => 
      c.coverage_field.trim() && c.description.trim()
    );
    if (validCoverage.length === 0) {
      newErrors.exam_coverage = 'At least one exam coverage item is required';
    }

    // Evaluation validation
    const validEvaluation = formData.examination_evaluation.filter(e => 
      e.coverage_item.trim() && e.scoring_guidelines.trim()
    );
    if (validEvaluation.length === 0) {
      newErrors.examination_evaluation = 'At least one examination evaluation item is required';
    }

    const validTargetAudience = formData.target_audience.filter(a => a.trim());
    if (validTargetAudience.length === 0) {
      newErrors.target_audience = 'Target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up arrays by removing empty entries
    const cleanedData = {
      ...formData,
      exam_coverage: formData.exam_coverage.filter(c => 
        c.coverage_field.trim() && c.description.trim()
      ).map(c => ({
        ...c,
        key_concepts: c.key_concepts.filter(concept => concept.trim())
      })),
      examination_evaluation: formData.examination_evaluation.filter(e => 
        e.coverage_item.trim() && e.scoring_guidelines.trim()
      ).map(e => ({
        ...e,
        performance_indicators: e.performance_indicators.filter(indicator => indicator.trim())
      })),
      target_audience: formData.target_audience.filter(a => a.trim())
    };

    onSubmit(cleanedData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addArrayItem = (field: keyof CertificationFormData, defaultValue: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultValue]
    }));
  };

  const removeArrayItem = (field: keyof CertificationFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof CertificationFormData, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => i === index ? value : item)
    }));
  };

  const updateNestedArrayItem = (
    field: keyof CertificationFormData, 
    index: number, 
    nestedField: string, 
    nestedIndex: number, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index 
          ? {
              ...item,
              [nestedField]: item[nestedField].map((nestedItem: any, ni: number) => 
                ni === nestedIndex ? value : nestedItem
              )
            }
          : item
      )
    }));
  };

  const addNestedArrayItem = (
    field: keyof CertificationFormData, 
    index: number, 
    nestedField: string, 
    defaultValue: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index 
          ? { ...item, [nestedField]: [...item[nestedField], defaultValue] }
          : item
      )
    }));
  };

  const removeNestedArrayItem = (
    field: keyof CertificationFormData, 
    index: number, 
    nestedField: string, 
    nestedIndex: number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item, i) => 
        i === index 
          ? { 
              ...item, 
              [nestedField]: item[nestedField].filter((_: any, ni: number) => ni !== nestedIndex) 
            }
          : item
      )
    }));
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'coverage', label: 'Exam Coverage', icon: BookOpen },
    { id: 'evaluation', label: 'Evaluation Criteria', icon: Target }
  ];

  // Don't render until we have initial data to prevent flickering
  if (!isFormInitialized && initialFormData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-white">Preparing form...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Tab Navigation */}
      <div className="border-b border-primary-gray/30">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-orange text-primary-orange'
                    : 'border-transparent text-primary-gray hover:text-primary-white hover:border-primary-gray'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
          key="basic-tab"
        >
          <h3 className="text-xl font-bold text-primary-white">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Certification Name *"
              name="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., JavaScript Fundamentals"
              error={errors.name}
              required
            />
            <Input
              label="Provider *"
              name="provider"
              value={formData.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              placeholder="e.g., TechCorp Academy"
              error={errors.provider}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-white mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 bg-primary-black border rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-primary-gray'
              }`}
              placeholder="Describe what this certification covers..."
              required
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Access Code (Optional)"
              name="access_code"
              value={formData.access_code}
              onChange={(e) => handleChange('access_code', e.target.value)}
              placeholder="Leave empty for public access"
            />
            <Input
              label="Duration (minutes) *"
              name="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)}
              min="1"
              error={errors.duration}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Passing Score (%) *"
              name="passing_score"
              type="number"
              value={formData.passing_score}
              onChange={(e) => handleChange('passing_score', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              error={errors.passing_score}
              required
            />
            <Input
              label="Total Questions *"
              name="total_questions"
              type="number"
              value={formData.total_questions}
              onChange={(e) => handleChange('total_questions', parseInt(e.target.value) || 0)}
              min="1"
              error={errors.total_questions}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
            />
            <label htmlFor="is_active" className="text-primary-white">
              Active (visible to candidates)
            </label>
          </div>

          {/* Target Audience */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-primary-white">
                Target Audience *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addArrayItem('target_audience', '')}
              >
                <Plus size={16} />
                Add Audience
              </Button>
            </div>
            <div className="space-y-3">
              {formData.target_audience.map((audience, index) => (
                <div key={`audience-${index}`} className="flex gap-2">
                  <Input
                    value={audience}
                    onChange={(e) => updateArrayItem('target_audience', index, e.target.value)}
                    placeholder="e.g., Software developers, IT professionals..."
                    className="flex-1"
                  />
                  {formData.target_audience.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('target_audience', index)}
                      className="hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {errors.target_audience && (
              <p className="text-red-500 text-sm mt-1">{errors.target_audience}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Exam Coverage Tab */}
      {activeTab === 'coverage' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
          key="coverage-tab"
        >
          <div>
            <h3 className="text-xl font-bold text-primary-white mb-2">Comprehensive Exam Coverage</h3>
            <p className="text-primary-gray text-sm mb-6">
              Define specific topics and skills that will be tested in this certification exam.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-primary-white">
                Coverage Items *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addArrayItem('exam_coverage', {
                  coverage_field: '',
                  description: '',
                  key_concepts: [''],
                  depth_of_understanding: '',
                  evaluation_criteria: ''
                })}
              >
                <Plus size={16} />
                Add Coverage Item
              </Button>
            </div>

            <div className="space-y-6">
              {formData.exam_coverage.map((coverage, index) => (
                <div key={`coverage-${index}`} className="border border-primary-gray/30 rounded-lg p-6 bg-primary-gray/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-primary-white">
                      Coverage Item #{index + 1}
                    </h4>
                    {formData.exam_coverage.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('exam_coverage', index)}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Coverage Field */}
                    <Input
                      label="Coverage Field *"
                      value={coverage.coverage_field}
                      onChange={(e) => updateArrayItem('exam_coverage', index, {
                        ...coverage,
                        coverage_field: e.target.value
                      })}
                      placeholder="Enter specific topic/skill being tested (e.g., JavaScript Functions, Database Design)"
                    />

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Description *
                      </label>
                      <textarea
                        value={coverage.description}
                        onChange={(e) => updateArrayItem('exam_coverage', index, {
                          ...coverage,
                          description: e.target.value
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Provide detailed explanation of what this coverage entails and how it should be evaluated..."
                      />
                    </div>

                    {/* Key Concepts */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-primary-white">
                          Key Concepts
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addNestedArrayItem('exam_coverage', index, 'key_concepts', '')}
                        >
                          <Plus size={14} />
                          Add Concept
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {coverage.key_concepts.map((concept, conceptIndex) => (
                          <div key={`concept-${index}-${conceptIndex}`} className="flex gap-2">
                            <Input
                              value={concept}
                              onChange={(e) => updateNestedArrayItem('exam_coverage', index, 'key_concepts', conceptIndex, e.target.value)}
                              placeholder="Key concept that should be covered..."
                              className="flex-1"
                            />
                            {coverage.key_concepts.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNestedArrayItem('exam_coverage', index, 'key_concepts', conceptIndex)}
                                className="hover:bg-red-500/20 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Depth of Understanding */}
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Expected Depth of Understanding
                      </label>
                      <select
                        value={coverage.depth_of_understanding}
                        onChange={(e) => updateArrayItem('exam_coverage', index, {
                          ...coverage,
                          depth_of_understanding: e.target.value
                        })}
                        className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      >
                        <option value="">Select depth level...</option>
                        <option value="basic">Basic - Fundamental awareness and recognition</option>
                        <option value="intermediate">Intermediate - Practical application and understanding</option>
                        <option value="advanced">Advanced - Deep analysis and complex problem-solving</option>
                        <option value="expert">Expert - Innovation and teaching others</option>
                      </select>
                    </div>

                    {/* Evaluation Criteria */}
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Specific Evaluation Criteria
                      </label>
                      <textarea
                        value={coverage.evaluation_criteria}
                        onChange={(e) => updateArrayItem('exam_coverage', index, {
                          ...coverage,
                          evaluation_criteria: e.target.value
                        })}
                        rows={2}
                        className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Describe specific criteria for evaluating this coverage area..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.exam_coverage && (
              <p className="text-red-500 text-sm mt-1">{errors.exam_coverage}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Evaluation Criteria Tab */}
      {activeTab === 'evaluation' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
          key="evaluation-tab"
        >
          <div>
            <h3 className="text-xl font-bold text-primary-white mb-2">How to Evaluate Examination?</h3>
            <p className="text-primary-gray text-sm mb-6">
              Define detailed evaluation criteria, scoring guidelines, and performance indicators for each coverage area.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-primary-white">
                Evaluation Components *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addArrayItem('examination_evaluation', {
                  coverage_item: '',
                  scoring_guidelines: '',
                  performance_indicators: [''],
                  minimum_requirements: '',
                  passing_threshold: ''
                })}
              >
                <Plus size={16} />
                Add Evaluation Component
              </Button>
            </div>

            <div className="space-y-6">
              {formData.examination_evaluation.map((evaluation, index) => (
                <div key={`evaluation-${index}`} className="border border-primary-gray/30 rounded-lg p-6 bg-primary-gray/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-primary-white">
                      Evaluation Component #{index + 1}
                    </h4>
                    {formData.examination_evaluation.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('examination_evaluation', index)}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Coverage Item */}
                    <Input
                      label="Coverage Item *"
                      value={evaluation.coverage_item}
                      onChange={(e) => updateArrayItem('examination_evaluation', index, {
                        ...evaluation,
                        coverage_item: e.target.value
                      })}
                      placeholder="Which coverage area does this evaluation apply to?"
                    />

                    {/* Scoring Guidelines */}
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Scoring Guidelines *
                      </label>
                      <textarea
                        value={evaluation.scoring_guidelines}
                        onChange={(e) => updateArrayItem('examination_evaluation', index, {
                          ...evaluation,
                          scoring_guidelines: e.target.value
                        })}
                        rows={3}
                        className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="Specify detailed scoring guidelines for this component (e.g., point allocation, weighting, partial credit rules)..."
                      />
                    </div>

                    {/* Performance Indicators */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-primary-white">
                          Performance Indicators & Examples
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addNestedArrayItem('examination_evaluation', index, 'performance_indicators', '')}
                        >
                          <Plus size={14} />
                          Add Indicator
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {evaluation.performance_indicators.map((indicator, indicatorIndex) => (
                          <div key={`indicator-${index}-${indicatorIndex}`} className="flex gap-2">
                            <Input
                              value={indicator}
                              onChange={(e) => updateNestedArrayItem('examination_evaluation', index, 'performance_indicators', indicatorIndex, e.target.value)}
                              placeholder="Example of acceptable response or performance indicator..."
                              className="flex-1"
                            />
                            {evaluation.performance_indicators.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeNestedArrayItem('examination_evaluation', index, 'performance_indicators', indicatorIndex)}
                                className="hover:bg-red-500/20 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Minimum Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-primary-white mb-2">
                        Minimum Requirements
                      </label>
                      <textarea
                        value={evaluation.minimum_requirements}
                        onChange={(e) => updateArrayItem('examination_evaluation', index, {
                          ...evaluation,
                          minimum_requirements: e.target.value
                        })}
                        rows={2}
                        className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        placeholder="What are the minimum requirements for this component?"
                      />
                    </div>

                    {/* Passing Threshold */}
                    <Input
                      label="Passing Threshold"
                      value={evaluation.passing_threshold}
                      onChange={(e) => updateArrayItem('examination_evaluation', index, {
                        ...evaluation,
                        passing_threshold: e.target.value
                      })}
                      placeholder="e.g., 70% correct, 8 out of 10 points, etc."
                    />
                  </div>
                </div>
              ))}
            </div>
            {errors.examination_evaluation && (
              <p className="text-red-500 text-sm mt-1">{errors.examination_evaluation}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-primary-gray/30">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
          type="button"
        >
          <X size={16} />
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          <Save size={16} />
          {certification ? 'Update' : 'Create'} Certification
        </Button>
      </div>
    </motion.form>
  );
};

export default memo(CertificationDetailsForm);