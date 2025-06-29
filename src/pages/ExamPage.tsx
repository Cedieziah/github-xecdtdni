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
  EyeOff
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
  }, [currentSession, examCompleted, tabSwitchCount, isFullscreen]);

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
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary-white">
              {currentCertification?.name}
            </h1>
            <p className="text-primary-gray text-sm">
              Question {currentQuestionIndex + 1} of {totalQuestions}
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
            
            {/* Submit Button */}
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

      {/* Exam Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-8 h-8 bg-primary-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-orange font-bold text-sm">
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
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                
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
              
              <div className="flex items-center gap-2">
                {sessionQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => dispatch(setCurrentQuestion(index))}
                    className={`w-8 h-8 rounded-full text-sm font-bold transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-primary-orange text-white'
                        : answers[sessionQuestions[index]?.id]
                        ? 'bg-robotic-green text-white'
                        : 'bg-primary-gray/30 text-primary-gray hover:bg-primary-gray/50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
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
      </div>
    </div>
  );
};

export default ExamPage;