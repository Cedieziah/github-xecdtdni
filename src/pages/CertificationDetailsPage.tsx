import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Award, 
  Shield, 
  CheckCircle, 
  Book, 
  Users, 
  Target, 
  FileText,
  Download,
  Play,
  AlertTriangle,
  Loader,
  Lock,
  LogIn,
  UserPlus,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AccessCodeModal from '../components/ui/AccessCodeModal';
import toast from 'react-hot-toast';

const CertificationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [certification, setCertification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questionStats, setQuestionStats] = useState<any>(null);
  const [accessCodeModal, setAccessCodeModal] = useState<{
    isOpen: boolean;
    certification: any | null;
  }>({
    isOpen: false,
    certification: null
  });

  useEffect(() => {
    const fetchCertificationDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch certification with details
        const { data, error } = await supabase
          .from('certifications_with_details')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        setCertification(data);
        
        // Only fetch question stats if user is authenticated
        if (isAuthenticated) {
          await fetchQuestionStats(id);
        }
      } catch (err: any) {
        console.error('Error fetching certification details:', err);
        setError(err.message || 'Failed to load certification details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCertificationDetails();
  }, [id, isAuthenticated]);

  const fetchQuestionStats = async (certificationId: string) => {
    try {
      // Get all questions for this certification
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select(`
          *,
          answer_options (*)
        `)
        .eq('certification_id', certificationId);

      if (error) throw error;

      if (allQuestions) {
        const activeQuestions = allQuestions.filter(q => q.is_active);
        const validQuestions = activeQuestions.filter(q => 
          q.answer_options && 
          q.answer_options.length >= 2 &&
          q.answer_options.some(opt => opt.is_correct)
        );

        const stats = {
          totalQuestions: allQuestions.length,
          activeQuestions: activeQuestions.length,
          validQuestions: validQuestions.length,
          questionsNeeded: certification?.total_questions || 0,
          canTakeExam: validQuestions.length >= Math.min(certification?.total_questions || 0, 1),
          issues: []
        };

        // Identify issues
        if (allQuestions.length === 0) {
          stats.issues.push('No questions created');
        } else if (activeQuestions.length === 0) {
          stats.issues.push('No active questions');
        } else if (validQuestions.length === 0) {
          stats.issues.push('No valid questions with answer options');
        } else if (validQuestions.length < (certification?.total_questions || 0)) {
          stats.issues.push(`Only ${validQuestions.length} valid questions, need ${certification?.total_questions}`);
        }

        setQuestionStats(stats);
      }
    } catch (error) {
      console.error(`Error fetching stats for certification:`, error);
    }
  };

  const validateAccessCode = async (certification: any, accessCode: string): Promise<boolean> => {
    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (accessCode === certification.access_code) {
      return true;
    } else {
      return false;
    }
  };

  const handleStartExam = async () => {
    if (!certification) return;
    
    // Check if user is logged in
    if (!isAuthenticated) {
      toast.error('Please sign in to take the exam');
      navigate('/auth');
      return;
    }
    
    // Check if certification has valid questions
    if (!questionStats?.canTakeExam) {
      toast.error(
        `This certification is not ready for exams. Issues: ${questionStats?.issues.join(', ') || 'Unknown error'}`
      );
      return;
    }

    // Check if certification requires access code
    if (certification.access_code) {
      setAccessCodeModal({
        isOpen: true,
        certification
      });
      return;
    }

    // No access code required, proceed directly
    await proceedToExam();
  };

  const proceedToExam = async () => {
    if (!certification) return;
    
    // Show loading toast
    const loadingToast = toast.loading('Starting exam...');
    
    try {
      // Navigate to exam page
      navigate(`/app/exam/${certification.id}`);
      
      // Success toast
      toast.success('Exam started successfully!', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      toast.error('Failed to start exam. Please try again.', { id: loadingToast });
    }
  };

  const handleAccessCodeSubmit = async (accessCode: string): Promise<boolean> => {
    if (!accessCodeModal.certification) {
      return false;
    }

    try {
      const isValid = await validateAccessCode(accessCodeModal.certification, accessCode);
      
      if (isValid) {
        // Close modal and proceed to exam
        setAccessCodeModal({ isOpen: false, certification: null });
        await proceedToExam();
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      throw new Error('Failed to validate access code. Please try again.');
    }
  };

  const handleCloseAccessCodeModal = () => {
    setAccessCodeModal({ isOpen: false, certification: null });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark p-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <Loader size={40} className="text-primary-orange animate-spin mx-auto mb-4" />
            <p className="text-primary-white">Loading certification details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !certification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              Error Loading Certification
            </h3>
            <p className="text-primary-gray mb-6">
              {error || 'The requested certification could not be found.'}
            </p>
            <Button variant="primary" onClick={handleGoBack}>
              <ArrowLeft size={16} />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Format certification details for display
  const details = {
    // Basic info
    name: certification.name,
    description: certification.description,
    provider: certification.provider,
    duration: certification.duration,
    passingScore: certification.passing_score,
    totalQuestions: certification.total_questions,
    isActive: certification.is_active,
    requiresAccessCode: Boolean(certification.access_code),
    
    // Extended details
    examCoverage: certification.topics || [],
    examinationEvaluation: certification.evaluation_criteria?.assessment_methods || [],
    targetAudience: certification.details_metadata?.target_audience || [],
    examinationDetails: certification.examination_details || {},
    metadata: certification.details_metadata || {}
  };

  const canTakeExam = isAuthenticated && (questionStats?.canTakeExam || false);

  // Render different layouts for authenticated vs non-authenticated users
  if (!isAuthenticated) {
    // Non-authenticated user view - simplified layout without sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark p-6">
        <div className="max-w-5xl mx-auto">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
            >
              <ArrowLeft size={16} />
              Back to Courses
            </Button>
            
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleLogin}>
                <LogIn size={16} />
                Log In
              </Button>
              <Button variant="primary" onClick={handleLogin}>
                <UserPlus size={16} />
                Sign Up
              </Button>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-primary-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={32} className="text-primary-orange" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary-white mb-2">
                  {details.name}
                </h1>
                <div className="flex items-center gap-3 text-primary-gray mb-4">
                  <span className="flex items-center gap-1">
                    <Users size={16} />
                    {details.provider}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {details.duration} minutes
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Target size={16} />
                    {details.passingScore}% to pass
                  </span>
                  {details.requiresAccessCode && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Lock size={16} />
                        Access Code Required
                      </span>
                    </>
                  )}
                </div>
                <p className="text-primary-white/80 text-lg">
                  {details.description}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Exam Coverage */}
              {details.examCoverage && details.examCoverage.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-primary-orange" />
                    Exam Coverage
                  </h2>
                  <div className="space-y-6">
                    {details.examCoverage.map((coverage: any, index: number) => (
                      <div key={index} className="border-b border-primary-gray/20 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-primary-white">{coverage.domain}</h3>
                          {coverage.weight_percentage && (
                            <span className="text-sm bg-primary-orange/20 text-primary-orange px-2 py-1 rounded">
                              {coverage.weight_percentage}%
                            </span>
                          )}
                        </div>
                        <p className="text-primary-white/80 mb-3">{coverage.description}</p>
                        
                        {coverage.key_concepts && coverage.key_concepts.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-primary-gray mb-2">Key Concepts:</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {coverage.key_concepts.map((concept: string, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-primary-white/80">
                                  <div className="w-1.5 h-1.5 bg-primary-orange rounded-full"></div>
                                  {concept}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {coverage.depth_of_understanding && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-primary-gray mb-1">Expected Depth:</h4>
                            <span className="text-sm bg-robotic-blue/20 text-robotic-blue px-2 py-1 rounded capitalize">
                              {coverage.depth_of_understanding}
                            </span>
                          </div>
                        )}
                        
                        {coverage.evaluation_criteria && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-gray mb-1">Evaluation Criteria:</h4>
                            <p className="text-primary-white/70 text-sm">{coverage.evaluation_criteria}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Examination Evaluation */}
              {details.examinationEvaluation && details.examinationEvaluation.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                    <ClipboardList size={20} className="text-robotic-blue" />
                    How to Evaluate Examination?
                  </h2>
                  <div className="space-y-6">
                    {details.examinationEvaluation.map((evaluation: any, index: number) => (
                      <div key={index} className="border border-primary-gray/20 rounded-lg p-4 bg-primary-gray/5">
                        <h3 className="text-lg font-semibold text-primary-white mb-3">
                          {evaluation.coverage_item}
                        </h3>
                        
                        {evaluation.scoring_guidelines && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-primary-gray mb-2">Scoring Guidelines:</h4>
                            <p className="text-primary-white/80 text-sm">{evaluation.scoring_guidelines}</p>
                          </div>
                        )}
                        
                        {evaluation.performance_indicators && evaluation.performance_indicators.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-primary-gray mb-2">Performance Indicators:</h4>
                            <ul className="space-y-1">
                              {evaluation.performance_indicators.map((indicator: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-primary-white/80 text-sm">
                                  <CheckCircle size={12} className="text-robotic-green mt-0.5 flex-shrink-0" />
                                  {indicator}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {evaluation.minimum_requirements && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-gray mb-1">Minimum Requirements:</h4>
                              <p className="text-primary-white/70 text-sm">{evaluation.minimum_requirements}</p>
                            </div>
                          )}
                          
                          {evaluation.passing_threshold && (
                            <div>
                              <h4 className="text-sm font-medium text-primary-gray mb-1">Passing Threshold:</h4>
                              <p className="text-primary-white/70 text-sm">{evaluation.passing_threshold}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Target Audience */}
              {details.targetAudience && details.targetAudience.length > 0 && (
                <Card>
                  <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                    <Users size={20} className="text-robotic-purple" />
                    Target Audience
                  </h2>
                  <div className="space-y-2">
                    {details.targetAudience.map((audience: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary-orange rounded-full"></div>
                        <span className="text-primary-white">{audience}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Login CTA */}
            <div className="space-y-6">
              {/* Login CTA */}
              <Card className="bg-primary-orange/10 border-primary-orange/30">
                <h2 className="text-xl font-bold text-primary-white mb-4">Take This Exam</h2>
                
                <p className="text-primary-white/80 mb-6">
                  Sign in or create an account to take this certification exam and advance your career.
                </p>
                
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleLogin}
                  >
                    <LogIn size={16} />
                    Log In to Continue
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleLogin}
                  >
                    <UserPlus size={16} />
                    Create Account
                  </Button>
                </div>
              </Card>
              
              {/* Certification Info */}
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4">Certification Info</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-primary-gray mb-1">Provider</h3>
                    <p className="text-primary-white">{details.provider}</p>
                  </div>
                  
                  {details.metadata?.difficulty_level && (
                    <div>
                      <h3 className="text-sm font-medium text-primary-gray mb-1">Difficulty</h3>
                      <p className="text-primary-white capitalize">
                        {details.metadata.difficulty_level.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  
                  {details.metadata?.industry_recognition && (
                    <div>
                      <h3 className="text-sm font-medium text-primary-gray mb-1">Industry Recognition</h3>
                      <p className="text-primary-white">{details.metadata.industry_recognition}</p>
                    </div>
                  )}
                  
                  {details.metadata?.career_paths && details.metadata.career_paths.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-primary-gray mb-1">Career Paths</h3>
                      <div className="flex flex-wrap gap-2">
                        {details.metadata.career_paths.map((path: string, idx: number) => (
                          <span key={idx} className="bg-robotic-purple/20 text-robotic-purple px-2 py-1 rounded text-xs">
                            {path}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Exam Details */}
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4">Exam Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-primary-gray">Questions:</span>
                    <span className="text-primary-white">{details.totalQuestions}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-gray">Duration:</span>
                    <span className="text-primary-white">{details.duration} minutes</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-primary-gray">Passing Score:</span>
                    <span className="text-primary-white">{details.passingScore}%</span>
                  </div>
                  
                  {details.requiresAccessCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-primary-gray">Access:</span>
                      <span className="text-yellow-500 flex items-center gap-1">
                        <Lock size={16} />
                        Protected
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Access Code Modal */}
          <AccessCodeModal
            isOpen={accessCodeModal.isOpen}
            onClose={handleCloseAccessCodeModal}
            onSubmit={handleAccessCodeSubmit}
            certificationName={accessCodeModal.certification?.name || ''}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // Authenticated user view - with sidebar layout
  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="mb-6"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-primary-orange/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield size={32} className="text-primary-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-white mb-2">
                {details.name}
              </h1>
              <div className="flex items-center gap-3 text-primary-gray mb-4">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {details.provider}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {details.duration} minutes
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target size={16} />
                  {details.passingScore}% to pass
                </span>
                {details.requiresAccessCode && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Lock size={16} />
                      Access Code Required
                    </span>
                  </>
                )}
              </div>
              <p className="text-primary-white/80 text-lg">
                {details.description}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Exam Coverage */}
            {details.examCoverage && details.examCoverage.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-primary-orange" />
                  Exam Coverage
                </h2>
                <div className="space-y-6">
                  {details.examCoverage.map((coverage: any, index: number) => (
                    <div key={index} className="border-b border-primary-gray/20 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-primary-white">{coverage.domain}</h3>
                        {coverage.weight_percentage && (
                          <span className="text-sm bg-primary-orange/20 text-primary-orange px-2 py-1 rounded">
                            {coverage.weight_percentage}%
                          </span>
                        )}
                      </div>
                      <p className="text-primary-white/80 mb-3">{coverage.description}</p>
                      
                      {coverage.key_concepts && coverage.key_concepts.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-primary-gray mb-2">Key Concepts:</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {coverage.key_concepts.map((concept: string, idx: number) => (
                              <li key={idx} className="flex items-center gap-2 text-primary-white/80">
                                <div className="w-1.5 h-1.5 bg-primary-orange rounded-full"></div>
                                {concept}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {coverage.depth_of_understanding && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-primary-gray mb-1">Expected Depth:</h4>
                          <span className="text-sm bg-robotic-blue/20 text-robotic-blue px-2 py-1 rounded capitalize">
                            {coverage.depth_of_understanding}
                          </span>
                        </div>
                      )}
                      
                      {coverage.evaluation_criteria && (
                        <div>
                          <h4 className="text-sm font-medium text-primary-gray mb-1">Evaluation Criteria:</h4>
                          <p className="text-primary-white/70 text-sm">{coverage.evaluation_criteria}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Examination Evaluation */}
            {details.examinationEvaluation && details.examinationEvaluation.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                  <ClipboardList size={20} className="text-robotic-blue" />
                  How to Evaluate Examination?
                </h2>
                <div className="space-y-6">
                  {details.examinationEvaluation.map((evaluation: any, index: number) => (
                    <div key={index} className="border border-primary-gray/20 rounded-lg p-4 bg-primary-gray/5">
                      <h3 className="text-lg font-semibold text-primary-white mb-3">
                        {evaluation.coverage_item}
                      </h3>
                      
                      {evaluation.scoring_guidelines && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-primary-gray mb-2">Scoring Guidelines:</h4>
                          <p className="text-primary-white/80 text-sm">{evaluation.scoring_guidelines}</p>
                        </div>
                      )}
                      
                      {evaluation.performance_indicators && evaluation.performance_indicators.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-primary-gray mb-2">Performance Indicators:</h4>
                          <ul className="space-y-1">
                            {evaluation.performance_indicators.map((indicator: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2 text-primary-white/80 text-sm">
                                <CheckCircle size={12} className="text-robotic-green mt-0.5 flex-shrink-0" />
                                {indicator}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evaluation.minimum_requirements && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-gray mb-1">Minimum Requirements:</h4>
                            <p className="text-primary-white/70 text-sm">{evaluation.minimum_requirements}</p>
                          </div>
                        )}
                        
                        {evaluation.passing_threshold && (
                          <div>
                            <h4 className="text-sm font-medium text-primary-gray mb-1">Passing Threshold:</h4>
                            <p className="text-primary-white/70 text-sm">{evaluation.passing_threshold}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Target Audience */}
            {details.targetAudience && details.targetAudience.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-robotic-purple" />
                  Target Audience
                </h2>
                <div className="space-y-2">
                  {details.targetAudience.map((audience: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-orange rounded-full"></div>
                      <span className="text-primary-white">{audience}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Examination Details */}
            {details.examinationDetails && Object.keys(details.examinationDetails).length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-primary-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-primary-orange" />
                  Examination Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {details.examinationDetails.format && (
                    <div>
                      <h3 className="text-sm font-medium text-primary-gray mb-1">Format</h3>
                      <p className="text-primary-white">{details.examinationDetails.format}</p>
                    </div>
                  )}
                  
                  {details.examinationDetails.time_limit_minutes && (
                    <div>
                      <h3 className="text-sm font-medium text-primary-gray mb-1">Time Limit</h3>
                      <p className="text-primary-white">{details.examinationDetails.time_limit_minutes} minutes</p>
                    </div>
                  )}
                </div>
                
                {details.examinationDetails.evaluation_components && details.examinationDetails.evaluation_components.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-primary-gray mb-2">Evaluation Components</h3>
                    <div className="space-y-2">
                      {details.examinationDetails.evaluation_components.map((component: any, idx: number) => (
                        <div key={idx} className="bg-primary-gray/10 rounded-lg p-3">
                          <h4 className="text-primary-white font-medium">{component.coverage_item}</h4>
                          {component.scoring_guidelines && (
                            <p className="text-primary-gray text-sm mt-1">{component.scoring_guidelines}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Exam Status */}
            <Card>
              <h2 className="text-xl font-bold text-primary-white mb-4">Exam Status</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-primary-gray">Status:</span>
                  {canTakeExam ? (
                    <span className="text-robotic-green flex items-center gap-1">
                      <CheckCircle size={16} />
                      Ready
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertTriangle size={16} />
                      Not Ready
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-primary-gray">Questions:</span>
                  <span className="text-primary-white">{details.totalQuestions}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-primary-gray">Duration:</span>
                  <span className="text-primary-white">{details.duration} minutes</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-primary-gray">Passing Score:</span>
                  <span className="text-primary-white">{details.passingScore}%</span>
                </div>
              </div>
              
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStartExam}
                disabled={!canTakeExam}
              >
                {details.requiresAccessCode ? (
                  <>
                    <Lock size={16} />
                    Enter Access Code
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Start Exam
                  </>
                )}
              </Button>
              
              {!canTakeExam && questionStats?.issues && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-400" />
                    <h4 className="text-red-400 text-sm font-medium">Exam Not Available</h4>
                  </div>
                  <p className="text-red-400 text-sm">
                    {questionStats.issues.join('. ')}
                  </p>
                </div>
              )}
              
              {details.requiresAccessCode && (
                <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock size={16} className="text-yellow-500" />
                    <h4 className="text-yellow-500 text-sm font-medium">Access Code Required</h4>
                  </div>
                  <p className="text-yellow-500 text-sm">
                    This certification requires an access code. Contact your administrator for access.
                  </p>
                </div>
              )}
            </Card>
            
            {/* Certification Info */}
            <Card>
              <h2 className="text-xl font-bold text-primary-white mb-4">Certification Info</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-primary-gray mb-1">Provider</h3>
                  <p className="text-primary-white">{details.provider}</p>
                </div>
                
                {details.metadata?.difficulty_level && (
                  <div>
                    <h3 className="text-sm font-medium text-primary-gray mb-1">Difficulty</h3>
                    <p className="text-primary-white capitalize">
                      {details.metadata.difficulty_level.replace('_', ' ')}
                    </p>
                  </div>
                )}
                
                {details.metadata?.industry_recognition && (
                  <div>
                    <h3 className="text-sm font-medium text-primary-gray mb-1">Industry Recognition</h3>
                    <p className="text-primary-white">{details.metadata.industry_recognition}</p>
                  </div>
                )}
                
                {details.metadata?.career_paths && details.metadata.career_paths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-primary-gray mb-1">Career Paths</h3>
                    <div className="flex flex-wrap gap-2">
                      {details.metadata.career_paths.map((path: string, idx: number) => (
                        <span key={idx} className="bg-robotic-purple/20 text-robotic-purple px-2 py-1 rounded text-xs">
                          {path}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Download Resources */}
            <Card>
              <h2 className="text-xl font-bold text-primary-white mb-4">Resources</h2>
              
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <Download size={16} />
                  Exam Syllabus
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download size={16} />
                  Study Guide
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Download size={16} />
                  Practice Questions
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Access Code Modal */}
        <AccessCodeModal
          isOpen={accessCodeModal.isOpen}
          onClose={handleCloseAccessCodeModal}
          onSubmit={handleAccessCodeSubmit}
          certificationName={accessCodeModal.certification?.name || ''}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

export default CertificationDetailsPage;