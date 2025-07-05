import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';
import { ensureStorageBucket } from '../../utils/imageUpload';
import ConfirmationModal from '../ui/ConfirmationModal';
import { Question, Certification, AnswerOption } from '../../types';
import toast from 'react-hot-toast';

interface QuestionFormProps {
  question?: Question | null;
  certifications: Certification[];
  onSubmit: (data: Partial<Question>) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  certifications,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    certification_id: '',
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'multiple_answer' | 'true_false',
    difficulty: 1,
    points: 1,
    explanation: '',
    is_active: true,
    question_image_url: null as string | null
  });

  const [answerOptions, setAnswerOptions] = useState<Partial<AnswerOption>[]>([
    { option_text: '', is_correct: false, option_image_url: null },
    { option_text: '', is_correct: false, option_image_url: null }
  ]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // Store original form data for comparison
  
  // Ensure storage bucket is set up when component mounts
  useEffect(() => {
    const setupStorage = async () => {
      try {
        const bucketReady = await ensureStorageBucket();
        if (!bucketReady) {
          toast.error('Storage setup failed. Image uploads may not work.');
        }
      } catch (error) {
        console.error('Error setting up storage:', error);
      }
    };
    
    setupStorage();
  }, []);
  
  const originalFormData = useRef({
    formData: { ...formData },
    answerOptions: [...answerOptions]
  });

  useEffect(() => {
    if (question) {
      const newFormData = {
        certification_id: question.certification_id,
        question_text: question.question_text,
        question_type: question.question_type,
        difficulty: question.difficulty,
        points: question.points || 1,
        explanation: question.explanation || '',
        is_active: question.is_active,
        question_image_url: question.question_image_url || null
      };
      
      setFormData(newFormData);

      if (question.answer_options && question.answer_options.length > 0) {
        const newAnswerOptions = question.answer_options.map(opt => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          option_image_url: opt.option_image_url || null
        }));
        setAnswerOptions(newAnswerOptions);
      }
      
      // Store original values for change detection
      originalFormData.current = {
        formData: { ...newFormData },
        answerOptions: question.answer_options ? 
          question.answer_options.map(opt => ({
            option_text: opt.option_text,
            is_correct: opt.is_correct,
            option_image_url: opt.option_image_url || null
          })) : 
          [...answerOptions]
      };
    }
  }, [question]);

  // Auto-generate True/False options when question type changes
  useEffect(() => {
    if (formData.question_type === 'true_false') {
      setAnswerOptions([
        { option_text: 'True', is_correct: false, option_image_url: null },
        { option_text: 'False', is_correct: false, option_image_url: null }
      ]);
    } else if (formData.question_type !== 'true_false' && answerOptions.length === 2 && 
               answerOptions[0]?.option_text === 'True' && answerOptions[1]?.option_text === 'False') {
      // Reset to empty options if switching away from true/false
      setAnswerOptions([
        { option_text: '', is_correct: false, option_image_url: null },
        { option_text: '', is_correct: false, option_image_url: null }
      ]);
    }
    
    // Mark that changes have been made
    checkForChanges();
  }, [formData.question_type]);

  // Check if form has unsaved changes
  const checkForChanges = () => {
    const original = originalFormData.current;
    
    // Compare form data
    const formDataChanged = Object.keys(formData).some(key => {
      return formData[key as keyof typeof formData] !== original.formData[key as keyof typeof original.formData];
    });
    
    // Compare answer options
    let optionsChanged = answerOptions.length !== original.answerOptions.length;
    
    if (!optionsChanged) {
      optionsChanged = answerOptions.some((option, index) => {
        const originalOption = original.answerOptions[index];
        return (
          option.option_text !== originalOption.option_text ||
          option.is_correct !== originalOption.is_correct ||
          option.option_image_url !== originalOption.option_image_url
        );
      });
    }
    
    setHasChanges(formDataChanged || optionsChanged);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.certification_id) {
      newErrors.certification_id = 'Please select a certification';
    }

    if (!formData.question_text.trim()) {
      newErrors.question_text = 'Question text is required';
    }

    if (formData.points < 1) {
      newErrors.points = 'Points must be at least 1';
    }

    // Validate answer options
    const validOptions = answerOptions.filter(opt => opt.option_text && opt.option_text.trim());
    if (validOptions.length < 2) {
      newErrors.answer_options = 'At least 2 answer options are required';
    }

    const hasCorrectAnswer = validOptions.some(opt => opt.is_correct);
    if (!hasCorrectAnswer) {
      newErrors.correct_answer = 'At least one option must be marked as correct';
    }

    // For multiple choice, only one option should be correct
    if (formData.question_type === 'multiple_choice') {
      const correctCount = validOptions.filter(opt => opt.is_correct).length;
      if (correctCount > 1) {
        newErrors.correct_answer = 'Multiple choice questions should have only one correct answer';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Ensure we preserve image URLs when filtering valid options
    const validOptions = answerOptions
      .filter(opt => opt.option_text && opt.option_text.trim())
      .map(opt => ({
        ...opt,
        option_text: opt.option_text.trim(),
        option_image_url: opt.option_image_url || null
      }));

    onSubmit({
      ...formData,
      answer_options: validOptions
    });
    
    // Reset change tracking after successful submission
    setHasChanges(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check for changes
    checkForChanges();
  };

  const handleQuestionImageUpload = (imageUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      question_image_url: imageUrl
    }));
    
    // Check for changes
    checkForChanges();
  };

  const handleOptionChange = (index: number, field: 'option_text' | 'is_correct', value: string | boolean) => {
    setAnswerOptions(prev => {
      const newOptions = prev.map((opt, i) => {
        if (i === index) {
          return { ...opt, [field]: value };
        }
        
        // For multiple choice, uncheck other options when one is checked
        if (field === 'is_correct' && value === true && formData.question_type === 'multiple_choice') {
          return { ...opt, is_correct: false };
        }
        
        return opt;
      });
      
      return newOptions;
    });

    // Clear related errors
    if (errors.answer_options || errors.correct_answer) {
      setErrors(prev => ({ 
        ...prev, 
        answer_options: '', 
        correct_answer: '' 
      }));
    }
    
    // Check for changes
    checkForChanges();
  };

  const handleOptionImageUpload = (index: number, imageUrl: string | null) => {
    setAnswerOptions(prev => prev.map((opt, i) => 
      i === index ? { 
        ...opt, 
        option_image_url: imageUrl,
        // Ensure this change is detected for existing options
        ...(opt.id ? { id: opt.id } : {})
      } : opt
    ));
    
    // Check for changes
    checkForChanges();
  };

  const addOption = () => {
    if (answerOptions.length < 6) { // Limit to 6 options max
      setAnswerOptions(prev => [...prev, { option_text: '', is_correct: false, option_image_url: null }]);
      
      // Mark as changed
      checkForChanges();
    }
  };

  const removeOption = (index: number) => {
    if (answerOptions.length > 2 && formData.question_type !== 'true_false') {
      setAnswerOptions(prev => prev.filter((_, i) => i !== index));
      
      // Mark as changed
      checkForChanges();
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Beginner';
      case 2: return 'Easy';
      case 3: return 'Medium';
      case 4: return 'Hard';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };
  
  const handleRequestCancel = () => {
    if (hasChanges) {
      setShowUnsavedChangesModal(true);
    } else {
      onCancel();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedChangesModal(false);
    onCancel();
  };

  const handleContinueEditing = () => {
    setShowUnsavedChangesModal(false);
  };

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary-white mb-2">
              Certification *
            </label>
            <select
              name="certification_id"
              value={formData.certification_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-primary-black border rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
                errors.certification_id ? 'border-red-500' : 'border-primary-gray'
              }`}
              required
            >
              <option value="">Select a certification</option>
              {certifications.filter(cert => cert.is_active).map(cert => (
                <option key={cert.id} value={cert.id}>{cert.name}</option>
              ))}
            </select>
            {errors.certification_id && (
              <p className="text-red-500 text-sm mt-1">{errors.certification_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-white mb-2">
              Question Type *
            </label>
            <select
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
              required
            >
              <option value="multiple_choice">Multiple Choice (Single Answer)</option>
              <option value="multiple_answer">Multiple Answer (Multiple Correct)</option>
              <option value="true_false">True/False</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-white mb-2">
            Question Text *
          </label>
          <textarea
            name="question_text"
            value={formData.question_text}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 bg-primary-black border rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent ${
              errors.question_text ? 'border-red-500' : 'border-primary-gray'
            }`}
            placeholder="Enter your question here..."
            required
          />
          {errors.question_text && (
            <p className="text-red-500 text-sm mt-1">{errors.question_text}</p>
          )}
        </div>

        {/* Question Image Upload */}
        <div>
          <label className="block text-sm font-medium text-primary-white mb-2">
            Question Image (Optional)
          </label>
          <ImageUpload
            currentImageUrl={formData.question_image_url || undefined}
            onImageUpload={handleQuestionImageUpload}
            folder="questions"
            placeholder="Add image to question"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-primary-white mb-2">
              Difficulty: {getDifficultyLabel(formData.difficulty)}
            </label>
            <input
              type="range"
              name="difficulty"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full h-2 bg-primary-gray rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-primary-gray mt-1">
              <span>Beginner</span>
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
              <span>Expert</span>
            </div>
          </div>

          <div>
            <Input
              label="Points *"
              name="points"
              type="number"
              min="1"
              max="100"
              value={formData.points}
              onChange={handleChange}
              error={errors.points}
              placeholder="Points for this question"
              required
            />
            <p className="text-primary-gray text-xs mt-1">
              Points determine the weight of this question in the final score
            </p>
          </div>
        </div>

        {/* Answer Options */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-primary-white">
              Answer Options *
            </label>
            {formData.question_type !== 'true_false' && answerOptions.length < 6 && (
              <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                <Plus size={16} />
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {answerOptions.map((option, index) => (
              <div key={index} className="border border-primary-gray/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <input
                      type={formData.question_type === 'multiple_answer' ? 'checkbox' : 'radio'}
                      name={formData.question_type === 'multiple_answer' ? `correct_${index}` : 'correct'}
                      checked={option.is_correct}
                      onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                      className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                    />
                    <span className="ml-2 text-sm text-primary-gray">
                      {option.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <Input
                    value={option.option_text || ''}
                    onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    disabled={formData.question_type === 'true_false'}
                  />
                  {answerOptions.length > 2 && formData.question_type !== 'true_false' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                {/* Option Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-primary-gray mb-2">
                    <ImageIcon size={14} className="inline mr-1" />
                    Option Image (Optional)
                  </label>
                  <ImageUpload
                    currentImageUrl={option.option_image_url || undefined}
                    onImageUpload={(imageUrl) => handleOptionImageUpload(index, imageUrl)}
                    folder="options"
                    placeholder={`Add image to option ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {(errors.answer_options || errors.correct_answer) && (
            <p className="text-red-500 text-sm mt-2">
              {errors.answer_options || errors.correct_answer}
            </p>
          )}

          {formData.question_type === 'multiple_choice' && (
            <p className="text-primary-gray text-sm mt-2">
              ℹ️ For multiple choice questions, select only one correct answer.
            </p>
          )}
          {formData.question_type === 'multiple_answer' && (
            <p className="text-primary-gray text-sm mt-2">
              ℹ️ For multiple answer questions, you can select multiple correct answers.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-primary-white mb-2">
            Explanation (Optional)
          </label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
            placeholder="Explain why this is the correct answer..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
          />
          <label htmlFor="is_active" className="text-primary-white">
            Active (include in exams)
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-primary-gray/30">
          <Button variant="ghost" onClick={handleRequestCancel} type="button">
            <X size={16} />
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <Save size={16} />
            {question ? 'Update' : 'Create'} Question
          </Button>
        </div>
      </motion.form>
      
      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUnsavedChangesModal}
        onClose={handleContinueEditing}
        onConfirm={handleDiscardChanges}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmText="Discard Changes"
        cancelText="Continue Editing"
        type="danger"
      />
    </>
  );
};

export default QuestionForm;