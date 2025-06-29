import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Users,
  Search,
  Filter,
  Play,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { RootState } from '../store';
import { fetchCertifications } from '../store/slices/examSlice';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const CertificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { certifications, loading } = useSelector((state: RootState) => state.exam);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [certificationStats, setCertificationStats] = useState<Record<string, any>>({});

  useEffect(() => {
    dispatch(fetchCertifications());
  }, [dispatch]);

  // Fetch question stats for each certification
  useEffect(() => {
    const fetchCertificationStats = async () => {
      const stats: Record<string, any> = {};
      
      for (const cert of certifications) {
        try {
          // Get all questions for this certification
          const { data: allQuestions, error } = await supabase
            .from('questions')
            .select(`
              *,
              answer_options (*)
            `)
            .eq('certification_id', cert.id);

          if (!error && allQuestions) {
            const activeQuestions = allQuestions.filter(q => q.is_active);
            const validQuestions = activeQuestions.filter(q => 
              q.answer_options && 
              q.answer_options.length >= 2 &&
              q.answer_options.some(opt => opt.is_correct)
            );

            stats[cert.id] = {
              totalQuestions: allQuestions.length,
              activeQuestions: activeQuestions.length,
              validQuestions: validQuestions.length,
              canTakeExam: validQuestions.length >= Math.min(cert.total_questions, 1),
              issues: []
            };

            // Identify issues
            if (allQuestions.length === 0) {
              stats[cert.id].issues.push('No questions created');
            } else if (activeQuestions.length === 0) {
              stats[cert.id].issues.push('No active questions');
            } else if (validQuestions.length === 0) {
              stats[cert.id].issues.push('No valid questions with answer options');
            } else if (validQuestions.length < cert.total_questions) {
              stats[cert.id].issues.push(`Only ${validQuestions.length} valid questions, need ${cert.total_questions}`);
            }
          }
        } catch (error) {
          console.error(`Error fetching stats for certification ${cert.id}:`, error);
          stats[cert.id] = {
            totalQuestions: 0,
            activeQuestions: 0,
            validQuestions: 0,
            canTakeExam: false,
            issues: ['Error loading question data']
          };
        }
      }
      
      setCertificationStats(stats);
    };

    if (certifications.length > 0) {
      fetchCertificationStats();
    }
  }, [certifications]);

  const providers = Array.from(new Set(certifications.map(c => c.provider)));

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider === 'all' || cert.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  const handleStartExam = async (certification: any) => {
    const stats = certificationStats[certification.id];
    
    // Check if certification has valid questions
    if (!stats || !stats.canTakeExam) {
      toast.error(
        `This certification is not ready for exams. Issues: ${stats?.issues.join(', ') || 'Unknown error'}`
      );
      return;
    }

    // Check if certification requires access code
    if (certification.access_code) {
      const accessCode = prompt('This certification requires an access code:');
      if (accessCode !== certification.access_code) {
        toast.error('Invalid access code. Please contact your administrator.');
        return;
      }
    }
    
    // Show loading toast
    const loadingToast = toast.loading('Starting exam...');
    
    try {
      navigate(`/app/exam/${certification.id}`);
    } catch (error) {
      toast.error('Failed to start exam. Please try again.');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const getDifficultyColor = (questions: number) => {
    if (questions <= 10) return 'text-robotic-green';
    if (questions <= 20) return 'text-primary-orange';
    return 'text-red-500';
  };

  const getDifficultyLabel = (questions: number) => {
    if (questions <= 10) return 'Beginner';
    if (questions <= 20) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-white mb-2">
            Available Certifications
          </h1>
          <p className="text-primary-gray">
            Choose from our comprehensive certification programs and advance your career
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} className="text-robotic-blue" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{certifications.length}</p>
            <p className="text-primary-gray text-sm">Available Certifications</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users size={24} className="text-robotic-green" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{providers.length}</p>
            <p className="text-primary-gray text-sm">Certification Providers</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-primary-orange" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {Object.values(certificationStats).filter(s => s.canTakeExam).length}
            </p>
            <p className="text-primary-gray text-sm">Ready for Exams</p>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
            >
              <option value="all">All Providers</option>
              {providers.map(provider => (
                <option key={provider} value={provider}>{provider}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((certification, index) => {
            const stats = certificationStats[certification.id];
            const canTakeExam = stats?.canTakeExam || false;
            
            return (
              <motion.div
                key={certification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        canTakeExam ? 'bg-primary-orange/20' : 'bg-red-500/20'
                      }`}>
                        <Shield size={24} className={canTakeExam ? 'text-primary-orange' : 'text-red-500'} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary-white">
                          {certification.name}
                        </h3>
                        <p className="text-sm text-primary-gray">
                          {certification.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canTakeExam ? (
                        <CheckCircle size={16} className="text-robotic-green" />
                      ) : (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-primary-gray text-sm mb-6 flex-1">
                    {certification.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-robotic-blue mb-1">
                        <Clock size={16} />
                        <span className="text-sm font-medium">{certification.duration}m</span>
                      </div>
                      <p className="text-xs text-primary-gray">Duration</p>
                    </div>
                    <div className="text-center">
                      <div className={`flex items-center justify-center gap-1 mb-1 ${getDifficultyColor(certification.total_questions)}`}>
                        <BookOpen size={16} />
                        <span className="text-sm font-medium">{certification.total_questions}</span>
                      </div>
                      <p className="text-xs text-primary-gray">Questions</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-robotic-purple mb-1">
                        <Award size={16} />
                        <span className="text-sm font-medium">{certification.passing_score}%</span>
                      </div>
                      <p className="text-xs text-primary-gray">Pass Score</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-primary-gray">Difficulty:</span>
                      <span className={`font-medium ${getDifficultyColor(certification.total_questions)}`}>
                        {getDifficultyLabel(certification.total_questions)}
                      </span>
                    </div>
                    <div className="w-full bg-primary-gray/20 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          certification.total_questions <= 10 ? 'bg-robotic-green' :
                          certification.total_questions <= 20 ? 'bg-primary-orange' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min((certification.total_questions / 30) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    variant={canTakeExam ? "primary" : "ghost"}
                    className="w-full"
                    onClick={() => handleStartExam(certification)}
                    disabled={!canTakeExam}
                  >
                    {canTakeExam ? (
                      <>
                        <Play size={16} />
                        Start Exam
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} />
                        Not Ready
                      </>
                    )}
                  </Button>

                  {!canTakeExam && (
                    <p className="text-red-400 text-xs text-center mt-2">
                      Contact administrator to add questions
                    </p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredCertifications.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No certifications found
            </h3>
            <p className="text-primary-gray">
              {searchTerm || selectedProvider !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No certifications are currently available'
              }
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CertificationsPage;