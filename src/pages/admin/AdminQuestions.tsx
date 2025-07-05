import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  HelpCircle,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  RefreshCw,
  Award
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion, fetchCertifications } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import QuestionForm from '../../components/admin/QuestionForm';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { Question } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { ensureStorageBucket } from '../../utils/imageUpload';

const AdminQuestions: React.FC = () => {
  const dispatch = useDispatch();
  const { questions, certifications, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertification, setSelectedCertification] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchQuestions());
    dispatch(fetchCertifications());
    
    // Ensure storage bucket is set up
    const setupStorage = async () => {
      try {
        await ensureStorageBucket();
      } catch (error) {
        console.error('Error setting up storage:', error);
      }
    };
    
    setupStorage();
  }, [dispatch]);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCertification = selectedCertification === 'all' || question.certification_id === selectedCertification;
    const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty.toString() === selectedDifficulty;
    return matchesSearch && matchesCertification && matchesDifficulty;
  });

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = async (id: string) => {
    setShowDeleteConfirmation(id);
  };
  
  const confirmDeleteQuestion = async () => {
    if (!showDeleteConfirmation) return;
    
    try {
      await dispatch(deleteQuestion(showDeleteConfirmation));
      toast.success('Question deleted successfully');
      setShowDeleteConfirmation(null);
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleSubmitQuestion = async (questionData: Partial<Question>) => {
    try {
      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion.id, ...questionData }));
        toast.success('Question updated successfully');
      } else {
        await dispatch(createQuestion(questionData));
        toast.success('Question created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save question');
    }
  };

  const handleCloseModal = () => {
    setShowUnsavedChangesModal(true);
  };
  
  const handleConfirmCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    setShowUnsavedChangesModal(false);
  };
  
  const handleContinueEditing = () => {
    setShowUnsavedChangesModal(false);
  };

  const handleDebugCertification = async (certificationId: string) => {
    try {
      // Get certification details
      const { data: certification, error: certError } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', certificationId)
        .single();

      if (certError) throw certError;

      // Get all questions for this certification
      const { data: allQuestions, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          answer_options (*)
        `)
        .eq('certification_id', certificationId);

      if (questionsError) throw questionsError;

      // Get only active questions
      const activeQuestions = allQuestions?.filter(q => q.is_active) || [];

      // Get questions with valid answer options
      const validQuestions = activeQuestions.filter(q => 
        q.answer_options && 
        q.answer_options.length >= 2 &&
        q.answer_options.some(opt => opt.is_correct)
      );

      const debugData = {
        certification,
        totalQuestions: allQuestions?.length || 0,
        activeQuestions: activeQuestions.length,
        validQuestions: validQuestions.length,
        requiredQuestions: certification.total_questions,
        issues: [],
        questionDetails: allQuestions?.map(q => ({
          id: q.id,
          text: q.question_text.substring(0, 50) + '...',
          isActive: q.is_active,
          points: q.points || 1,
          optionCount: q.answer_options?.length || 0,
          hasCorrectAnswer: q.answer_options?.some(opt => opt.is_correct) || false,
          issues: []
        }))
      };

      // Identify issues
      if (debugData.totalQuestions === 0) {
        debugData.issues.push('No questions found for this certification');
      }
      if (debugData.activeQuestions === 0) {
        debugData.issues.push('No active questions found');
      }
      if (debugData.validQuestions === 0) {
        debugData.issues.push('No questions with valid answer options found');
      }
      if (debugData.validQuestions < debugData.requiredQuestions) {
        debugData.issues.push(`Only ${debugData.validQuestions} valid questions available, but ${debugData.requiredQuestions} required`);
      }

      // Add issues to question details
      debugData.questionDetails?.forEach(q => {
        if (!q.isActive) q.issues.push('Question is inactive');
        if (q.optionCount < 2) q.issues.push('Less than 2 answer options');
        if (!q.hasCorrectAnswer) q.issues.push('No correct answer marked');
      });

      setDebugInfo(debugData);
      setShowDebug(true);
    } catch (error: any) {
      toast.error('Failed to debug certification: ' + error.message);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-robotic-green';
      case 2: return 'text-robotic-blue';
      case 3: return 'text-primary-orange';
      case 4: return 'text-robotic-purple';
      case 5: return 'text-red-500';
      default: return 'text-primary-gray';
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

  const getQuestionStatus = (question: Question) => {
    const issues = [];
    if (!question.is_active) issues.push('Inactive');
    if (!question.answer_options || question.answer_options.length < 2) issues.push('Missing options');
    if (!question.answer_options?.some(opt => opt.is_correct)) issues.push('No correct answer');
    
    return issues.length === 0 ? 'Valid' : issues.join(', ');
  };

  const isQuestionValid = (question: Question) => {
    return question.is_active && 
           question.answer_options && 
           question.answer_options.length >= 2 && 
           question.answer_options.some(opt => opt.is_correct);
  };

  const getTotalPoints = () => {
    return filteredQuestions.reduce((total, question) => total + (question.points || 1), 0);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Questions Management
            </h1>
            <p className="text-primary-gray">
              Create and manage exam questions with point values
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => dispatch(fetchQuestions())}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button variant="primary" onClick={handleCreateQuestion}>
              <Plus size={20} />
              Create Question
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <HelpCircle size={24} className="text-robotic-blue" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{questions.length}</p>
            <p className="text-primary-gray text-sm">Total Questions</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-robotic-green" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {questions.filter(q => isQuestionValid(q)).length}
            </p>
            <p className="text-primary-gray text-sm">Valid Questions</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <XCircle size={24} className="text-primary-orange" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {questions.filter(q => !q.is_active).length}
            </p>
            <p className="text-primary-gray text-sm">Inactive Questions</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {questions.filter(q => !isQuestionValid(q)).length}
            </p>
            <p className="text-primary-gray text-sm">Issues Found</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-robotic-purple" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{getTotalPoints()}</p>
            <p className="text-primary-gray text-sm">Total Points</p>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCertification}
                onChange={(e) => setSelectedCertification(e.target.value)}
                className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
              >
                <option value="all">All Certifications</option>
                {certifications.map(cert => (
                  <option key={cert.id} value={cert.id}>{cert.name}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
              >
                <option value="all">All Difficulties</option>
                <option value="1">Beginner</option>
                <option value="2">Easy</option>
                <option value="3">Medium</option>
                <option value="4">Hard</option>
                <option value="5">Expert</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Certification Debug Section */}
        {certifications.length > 0 && (
          <Card>
            <h3 className="text-lg font-bold text-primary-white mb-4">Debug Certification</h3>
            <p className="text-primary-gray text-sm mb-4">
              Check why a certification might not have valid questions for exams
            </p>
            <div className="flex gap-4">
              <select
                className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
                onChange={(e) => e.target.value && handleDebugCertification(e.target.value)}
                defaultValue=""
              >
                <option value="">Select certification to debug</option>
                {certifications.map(cert => (
                  <option key={cert.id} value={cert.id}>{cert.name}</option>
                ))}
              </select>
            </div>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => {
            const isValid = isQuestionValid(question);
            const status = getQuestionStatus(question);
            const certification = certifications.find(c => c.id === question.certification_id);
            
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!isValid ? 'border-red-500/30' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isValid ? 'bg-primary-orange/20' : 'bg-red-500/20'
                        }`}>
                          {isValid ? (
                            <HelpCircle size={20} className="text-primary-orange" />
                          ) : (
                            <AlertTriangle size={20} className="text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                              {getDifficultyLabel(question.difficulty)}
                            </span>
                            <span className="text-primary-gray text-sm">•</span>
                            <span className="text-primary-gray text-sm capitalize">
                              {question.question_type.replace('_', ' ')}
                            </span>
                            <span className="text-primary-gray text-sm">•</span>
                            <span className="text-robotic-purple text-sm font-medium">
                              {question.points || 1} {(question.points || 1) === 1 ? 'point' : 'points'}
                            </span>
                            <span className="text-primary-gray text-sm">•</span>
                            <span className="text-primary-gray text-sm">
                              {certification?.name || 'Unknown Certification'}
                            </span>
                            {!isValid && (
                              <>
                                <span className="text-primary-gray text-sm">•</span>
                                <span className="text-red-400 text-sm">{status}</span>
                              </>
                            )}
                          </div>
                          <p className="text-primary-white font-medium line-clamp-2">
                            {question.question_text}
                          </p>
                        </div>
                      </div>

                      {question.answer_options && question.answer_options.length > 0 && (
                        <div className="ml-13 space-y-2">
                          {question.answer_options.map((option, idx) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${option.is_correct ? 'bg-robotic-green' : 'bg-primary-gray'}`} />
                              <span className={`text-sm ${option.is_correct ? 'text-robotic-green' : 'text-primary-gray'}`}>
                                {option.option_text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {(!question.answer_options || question.answer_options.length === 0) && (
                        <div className="ml-13">
                          <p className="text-red-400 text-sm">⚠️ No answer options found</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1">
                        {isValid ? (
                          <CheckCircle size={16} className="text-robotic-green" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <Card className="text-center py-12">
            <HelpCircle size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No questions found
            </h3>
            <p className="text-primary-gray mb-6">
              {searchTerm || selectedCertification !== 'all' || selectedDifficulty !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first question to get started'
              }
            </p>
            {!searchTerm && selectedCertification === 'all' && selectedDifficulty === 'all' && (
              <Button variant="primary" onClick={handleCreateQuestion}>
                <Plus size={20} />
                Create Question
              </Button>
            )}
          </Card>
        )}

        {/* Question Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingQuestion ? 'Edit Question' : 'Create Question'}
          size="xl"
        >
          <QuestionForm
            question={editingQuestion}
            certifications={certifications}
            onSubmit={handleSubmitQuestion}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Debug Modal */}
        <Modal
          isOpen={showDebug}
          onClose={() => setShowDebug(false)}
          title="Certification Debug Information"
          size="lg"
        >
          {debugInfo && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-primary-white mb-2">
                  {debugInfo.certification.name}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-gray/10 p-3 rounded">
                    <p className="text-primary-gray text-sm">Total Questions</p>
                    <p className="text-primary-white font-bold">{debugInfo.totalQuestions}</p>
                  </div>
                  <div className="bg-primary-gray/10 p-3 rounded">
                    <p className="text-primary-gray text-sm">Active Questions</p>
                    <p className="text-primary-white font-bold">{debugInfo.activeQuestions}</p>
                  </div>
                  <div className="bg-primary-gray/10 p-3 rounded">
                    <p className="text-primary-gray text-sm">Valid Questions</p>
                    <p className="text-primary-white font-bold">{debugInfo.validQuestions}</p>
                  </div>
                  <div className="bg-primary-gray/10 p-3 rounded">
                    <p className="text-primary-gray text-sm">Required Questions</p>
                    <p className="text-primary-white font-bold">{debugInfo.requiredQuestions}</p>
                  </div>
                </div>
              </div>

              {debugInfo.issues.length > 0 && (
                <div>
                  <h4 className="text-md font-bold text-red-400 mb-2">Issues Found:</h4>
                  <ul className="space-y-1">
                    {debugInfo.issues.map((issue: string, index: number) => (
                      <li key={index} className="text-red-400 text-sm">• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-md font-bold text-primary-white mb-2">Question Details:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {debugInfo.questionDetails?.map((q: any, index: number) => (
                    <div key={index} className={`p-2 rounded text-sm ${
                      q.issues.length === 0 ? 'bg-robotic-green/10' : 'bg-red-500/10'
                    }`}>
                      <p className="text-primary-white font-medium">{q.text}</p>
                      <p className="text-primary-gray">
                        Active: {q.isActive ? 'Yes' : 'No'} | 
                        Points: {q.points} | 
                        Options: {q.optionCount} | 
                        Has Correct: {q.hasCorrectAnswer ? 'Yes' : 'No'}
                      </p>
                      {q.issues.length > 0 && (
                        <p className="text-red-400">Issues: {q.issues.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal>
        
        {/* Unsaved Changes Confirmation Modal */}
        <ConfirmationModal
          isOpen={showUnsavedChangesModal}
          onClose={handleContinueEditing}
          onConfirm={handleConfirmCloseModal}
          title="Unsaved Changes"
          message="You have unsaved changes. Are you sure you want to discard them?"
          confirmText="Discard Changes"
          cancelText="Continue Editing"
          type="danger"
        />
        
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirmation !== null}
          onClose={() => setShowDeleteConfirmation(null)}
          onConfirm={confirmDeleteQuestion}
          title="Delete Question"
          message="Are you sure you want to delete this question? This action cannot be undone."
          confirmText="Delete Question"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default AdminQuestions;