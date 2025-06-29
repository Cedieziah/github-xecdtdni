import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  FileText,
  Edit,
  ArrowLeft
} from 'lucide-react';
import { RootState } from '../store';
import { 
  startExamSession, 
  fetchExamSession,
  submitAnswer, 
  updateExamTimer,
  completeExamSession,
  setCurrentQuestion,
  setAnswer,
  setTimeRemaining,
  resetExamState
} from '../store/slices/examSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ExamPage: React.FC = () => {
  const { certificationId, sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { 
    currentSession, 
    sessionQuestions, 
    currentCertification,
    answers,
    currentQuestionIndex, 
    timeRemaining,
    loading,
    error 
  } = useSelector((state: RootState) => state.exam);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (!currentSession || timeRemaining <= 0 || examCompleted) return;

    const timer = setInterval(() => {
      const newTime = timeRemaining - 1;
      dispatch(setTimeRemaining(newTime));
      
      // Update server every 30 seconds
      if (newTime % 30 === 0) {
        dispatch(updateExamTimer({ 
          sessionId: currentSession.id, 
          timeRemaining: newTime 
        }));
      }
      
      // Auto-submit when time runs out
      if (newTime <= 0) {
        handleCompleteExam();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, currentSession, examCompleted, dispatch]);

  // Initialize exam
  useEffect(() => {
    if (!user) return;

    if (sessionId) {
      // Resume existing session
      dispatch(fetchExamSession({ sessionId, userId: user.id }));
    } else if (certificationId) {
      // Start new session
      dispatch(startExamSession({ certificationId, userId: user.id }));
    }

    return () => {
      dispatch(resetExamState());
    };
  }, [certificationId, sessionId, user, dispatch]);

  // Anti-cheating measures
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentSession && !examCompleted) {
        setTabSwitchCount(prev => prev + 1);
        setShowWarning(true);
        
        if (tabSwitchCount >= 2) {
          alert('Multiple tab switches detected. Your exam will be submitted automatically.');
          handleCompleteExam();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent common cheating shortcuts
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }

      // Keyboard navigation
      if (!showReview) {
        if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
          dispatch(setCurrentQuestion(currentQuestionIndex - 1));
        } else if (e.key === 'ArrowRight' && currentQuestionIndex < sessionQuestions.length - 1) {
          dispatch(setCurrentQuestion(currentQuestionIndex + 1));
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    if (currentSession && !examCompleted) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      
      // Request fullscreen
      if (!isFullscreen) {
        document.documentElement.requestFullscreen?.();
        setIsFullscreen(true);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentSession, examCompleted, tabSwitchCount, isFullscreen, showReview, currentQuestionIndex, sessionQuestions.length, dispatch]);

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const totalQuestions = sessionQuestions.length;

  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuestion || examCompleted) return;

    const currentAnswers = answers[currentQuestion.id] || [];
    let newAnswers: string[];

    if (currentQuestion.question_type === 'multiple_answer') {
      // Multiple answer: toggle selection
      if (currentAnswers.includes(optionId)) {
        newAnswers = currentAnswers.filter(id => id !== optionId);
      } else {
        newAnswers = [...currentAnswers, optionId];
      }
    } else {
      // Single answer: replace selection
      newAnswers = [optionId];
    }

    dispatch(setAnswer({ questionId: currentQuestion.id, selectedOptions: newAnswers }));
    
    // Submit answer to server
    if (currentSession) {
      dispatch(submitAnswer({
        sessionId: currentSession.id,
        questionId: currentQuestion.id,
        selectedOptions: newAnswers
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestion(currentQuestionIndex - 1));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      dispatch(setCurrentQuestion(currentQuestionIndex + 1));
    }
  };

  const handleQuestionNavigation = (index: number) => {
    if (showReview) {
      setEditingQuestion(sessionQuestions[index].id);
      setShowReview(false);
    }
    dispatch(setCurrentQuestion(index));
  };

  const handleReviewAnswers = () => {
    setShowReview(true);
  };

  const handleBackToExam = () => {
    setShowReview(false);
    setEditingQuestion(null);
  };

  const handleEditQuestion = (questionId: string) => {
    const questionIndex = sessionQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      dispatch(setCurrentQuestion(questionIndex));
      setShowReview(false);
      setEditingQuestion(questionId);
    }
  };

  const handleCompleteExam = useCallback(async () => {
    if (!currentSession || examCompleted) return;

    setExamCompleted(true);
    
    try {
      const result = await dispatch(completeExamSession({ sessionId: currentSession.id }));
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      // Navigate to results
      navigate(`/app/exam-results/${currentSession.id}`);
    } catch (error) {
      console.error('Error completing exam:', error);
      setExamCompleted(false);
    }
  }, [currentSession, examCompleted, dispatch, navigate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeRemaining <= 300) return 'text-red-500'; // Last 5 minutes
    if (timeRemaining <= 900) return 'text-primary-orange'; // Last 15 minutes
    return 'text-robotic-green';
  };

  const getProgressPercentage = () => {
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / totalQuestions) * 100;
  };

  const getQuestionStatus = (questionId: string, index: number) => {
    const hasAnswer = answers[questionId] && answers[questionId].length > 0;
    const isViewed = index <= currentQuestionIndex || showReview;
    
    if (hasAnswer) return 'answered';
    if (isViewed) return 'viewed';
    return 'unvisited';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-robotic-green text-white';
      case 'viewed': return 'bg-yellow-500 text-black';
      case 'unvisited': return 'bg-primary-gray text-primary-white';
      default: return 'bg-primary-gray text-primary-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-primary-white mt-4">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <Card className="max-w-md text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-white mb-2">Error Loading Exam</h2>
          <p className="text-primary-gray mb-4">{error}</p>
          <Button onClick={() => navigate('/app/certifications')}>
            Back to Certifications
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentSession || !currentQuestion) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <Card className="max-w-md text-center">
          <AlertTriangle size={48} className="text-primary-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-white mb-2">Exam Not Found</h2>
          <p className="text-primary-gray mb-4">The exam session could not be found or has expired.</p>
          <Button onClick={() => navigate('/app/certifications')}>
            Back to Certifications
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <Card className="max-w-md">
              <div className="text-center">
                <AlertTriangle size={48} className="text-primary-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-primary-white mb-2">Warning</h3>
                <p className="text-primary-gray mb-4">
                  Tab switching detected! Please stay on this page during the exam.
                  {tabSwitchCount >= 1 && ` (${tabSwitchCount}/3 warnings)`}
                </p>
                <Button onClick={() => setShowWarning(false)}>
                  Continue Exam
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam Header */}
      <div className="bg-primary-black border-b border-primary-gray/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-white">
              {currentCertification?.name}
            </h1>
            <p className="text-primary-gray text-sm">
              {showReview ? 'Review Your Answers' : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-primary-gray/30 rounded-full">
                <div 
                  className="h-full bg-primary-orange rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <span className="text-primary-gray text-sm">
                {Object.keys(answers).length}/{totalQuestions}
              </span>
            </div>
            
            {/* Timer */}
            <div className={`flex items-center gap-2 ${getTimeColor()}`}>
              <Clock size={20} />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!showReview ? (
                <Button 
                  variant="secondary" 
                  onClick={handleReviewAnswers}
                  disabled={examCompleted}
                >
                  <FileText size={16} />
                  Review Answers
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={handleBackToExam}
                >
                  <ArrowLeft size={16} />
                  Back to Exam
                </Button>
              )}
              
              <Button 
                variant="danger" 
                onClick={handleCompleteExam}
                disabled={examCompleted}
              >
                <Flag size={16} />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Examination Area (Left Panel - 80%) */}
        <div className="flex-1 p-6 overflow-y-auto">
          {showReview ? (
            /* Review Mode */
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="bg-primary-orange/10 border-primary-orange/30">
                <div className="flex items-center gap-3 mb-4">
                  <FileText size={24} className="text-primary-orange" />
                  <div>
                    <h2 className="text-xl font-bold text-primary-white">Review Your Answers</h2>
                    <p className="text-primary-gray">
                      Review all questions and your selected answers before final submission
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-robotic-green">
                      {Object.keys(answers).length}
                    </div>
                    <div className="text-sm text-primary-gray">Answered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-500">
                      {totalQuestions - Object.keys(answers).length}
                    </div>
                    <div className="text-sm text-primary-gray">Unanswered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-orange">
                      {Math.round(getProgressPercentage())}%
                    </div>
                    <div className="text-sm text-primary-gray">Complete</div>
                  </div>
                </div>
              </Card>

              {/* Questions Review List */}
              <div className="space-y-4">
                {sessionQuestions.map((question, index) => {
                  const questionAnswers = answers[question.id] || [];
                  const hasAnswer = questionAnswers.length > 0;
                  
                  return (
                    <Card key={question.id} className={`${hasAnswer ? 'border-robotic-green/30' : 'border-yellow-500/30'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            hasAnswer ? 'bg-robotic-green text-white' : 'bg-yellow-500 text-black'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-primary-white">
                              Question {index + 1}
                            </h3>
                            <p className="text-sm text-primary-gray">
                              {hasAnswer ? 'Answered' : 'Not answered'} • {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question.id)}
                        >
                          <Edit size={16} />
                          Edit
                        </Button>
                      </div>

                      <div className="mb-4">
                        <p className="text-primary-white font-medium mb-3">
                          {question.question_text}
                        </p>
                        
                        {question.question_image_url && (
                          <img
                            src={question.question_image_url}
                            alt="Question illustration"
                            className="max-w-full h-auto rounded-lg border border-primary-gray/30 mb-3"
                            style={{ maxHeight: '200px' }}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        {question.answer_options?.map((option, optionIndex) => {
                          const isSelected = questionAnswers.includes(option.id);
                          const optionLetter = String.fromCharCode(65 + optionIndex);
                          
                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-lg border ${
                                isSelected
                                  ? 'border-primary-orange bg-primary-orange/10'
                                  : 'border-primary-gray/30'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                                  isSelected
                                    ? 'border-primary-orange bg-primary-orange text-white'
                                    : 'border-primary-gray text-primary-gray'
                                }`}>
                                  {question.question_type === 'multiple_answer' ? (
                                    isSelected ? '✓' : ''
                                  ) : (
                                    optionLetter
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className={`${isSelected ? 'text-primary-white font-medium' : 'text-primary-gray'}`}>
                                    {option.option_text}
                                  </span>
                                  {option.option_image_url && (
                                    <img
                                      src={option.option_image_url}
                                      alt="Option illustration"
                                      className="mt-2 max-w-full h-auto rounded-lg border border-primary-gray/30"
                                      style={{ maxHeight: '150px' }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {!hasAnswer && (
                        <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                          <p className="text-yellow-400 text-sm font-medium">
                            ⚠️ This question has not been answered yet
                          </p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Final Submit Button */}
              <Card className="bg-red-500/10 border-red-500/30 text-center">
                <h3 className="text-xl font-bold text-primary-white mb-2">
                  Ready to Submit?
                </h3>
                <p className="text-primary-gray mb-6">
                  Once you submit, you cannot make any changes to your answers.
                  Make sure you have reviewed all questions.
                </p>
                <Button 
                  variant="danger" 
                  size="lg"
                  onClick={handleCompleteExam}
                  disabled={examCompleted}
                >
                  <Flag size={20} />
                  Submit Final Exam
                </Button>
              </Card>
            </div>
          ) : (
            /* Exam Mode */
            <Card className="max-w-4xl mx-auto">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Question Header */}
                <div className="mb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      editingQuestion === currentQuestion.id ? 'bg-primary-orange/20 border-2 border-primary-orange' : 'bg-primary-orange/20'
                    }`}>
                      <span className="text-primary-orange font-bold text-lg">
                        {currentQuestionIndex + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary-white mb-2">
                        {currentQuestion.question_text}
                      </h2>
                      
                      {/* Question Image */}
                      {currentQuestion.question_image_url && (
                        <div className="mb-4">
                          <img
                            src={currentQuestion.question_image_url}
                            alt="Question illustration"
                            className="max-w-full h-auto rounded-lg border border-primary-gray/30"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-primary-gray">
                        <span>Difficulty: Level {currentQuestion.difficulty}</span>
                        <span>•</span>
                        <span>Points: {currentQuestion.points || 1}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {currentQuestion.question_type.replace('_', ' ')}
                        </span>
                        {currentQuestion.question_type === 'multiple_answer' && (
                          <>
                            <span>•</span>
                            <span className="text-primary-orange">Select all that apply</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.answer_options?.map((option, index) => {
                    const isSelected = answers[currentQuestion.id]?.includes(option.id) || false;
                    const optionLetter = String.fromCharCode(65 + index);
                    
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleAnswerSelect(option.id)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          isSelected
                            ? 'border-primary-orange bg-primary-orange/10'
                            : 'border-primary-gray/30 hover:border-primary-orange/50 bg-primary-gray/5'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-primary-orange bg-primary-orange text-white'
                              : 'border-primary-gray text-primary-gray'
                          }`}>
                            {currentQuestion.question_type === 'multiple_answer' ? (
                              isSelected ? <CheckCircle size={16} /> : <div className="w-4 h-4 border border-current rounded" />
                            ) : (
                              <span className="text-sm font-bold">{optionLetter}</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <span className={`${isSelected ? 'text-primary-white' : 'text-primary-gray'}`}>
                              {option.option_text}
                            </span>
                            
                            {/* Option Image */}
                            {option.option_image_url && (
                              <div className="mt-3">
                                <img
                                  src={option.option_image_url}
                                  alt="Option illustration"
                                  className="max-w-full h-auto rounded-lg border border-primary-gray/30"
                                  style={{ maxHeight: '200px' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-primary-gray text-sm">
                      Use arrow keys or click question numbers to navigate
                    </p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.div>
            </Card>
          )}
        </div>

        {/* Navigation Panel (Right Panel - 20%) */}
        <div className="w-80 bg-primary-black border-l border-primary-gray/30 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Current Question Indicator */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-primary-white mb-2">
                {showReview ? 'All Questions' : 'Question Navigation'}
              </h3>
              {!showReview && (
                <p className="text-primary-gray text-sm">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
              )}
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
              {sessionQuestions.map((question, index) => {
                const status = getQuestionStatus(question.id, index);
                const isActive = index === currentQuestionIndex && !showReview;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`
                      w-12 h-12 rounded-lg text-sm font-bold transition-all duration-200
                      ${getStatusColor(status)}
                      ${isActive ? 'ring-2 ring-primary-orange scale-110' : 'hover:scale-105'}
                    `}
                    title={`Question ${index + 1} - ${status}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-sm">
              <h4 className="font-semibold text-primary-white">Legend:</h4>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-robotic-green rounded"></div>
                <span className="text-primary-gray">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-primary-gray">Viewed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary-gray rounded"></div>
                <span className="text-primary-gray">Not visited</span>
              </div>
            </div>

            {/* Progress Summary */}
            <Card className="bg-primary-gray/10">
              <h4 className="font-semibold text-primary-white mb-3">Progress Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-primary-gray">Answered:</span>
                  <span className="text-robotic-green font-medium">
                    {Object.keys(answers).length}/{totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-gray">Remaining:</span>
                  <span className="text-yellow-500 font-medium">
                    {totalQuestions - Object.keys(answers).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary-gray">Progress:</span>
                  <span className="text-primary-orange font-medium">
                    {Math.round(getProgressPercentage())}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-2">
              {!showReview && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReviewAnswers}
                  className="w-full"
                >
                  <FileText size={16} />
                  Review All Answers
                </Button>
              )}
              
              <Button
                variant="danger"
                size="sm"
                onClick={handleCompleteExam}
                disabled={examCompleted}
                className="w-full"
              >
                <Flag size={16} />
                Submit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;