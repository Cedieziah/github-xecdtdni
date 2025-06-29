import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Award, 
  Clock,
  Target,
  TrendingUp,
  Download,
  Home,
  RotateCcw
} from 'lucide-react';
import { RootState } from '../store';
import { supabase } from '../lib/supabase';
import { downloadCertificate } from '../utils/certificateGenerator';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ExamResult {
  session: any;
  certification: any;
  certificate?: any;
}

const ExamResultsPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    const fetchExamResults = async () => {
      if (!sessionId || !user) return;

      try {
        // Get exam session with certification details
        const { data: session, error: sessionError } = await supabase
          .from('exam_sessions')
          .select(`
            *,
            certifications (*)
          `)
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (sessionError) throw sessionError;

        // Get certificate if passed
        let certificate = null;
        if (session.passed) {
          const { data: cert, error: certError } = await supabase
            .from('certificates')
            .select('*')
            .eq('exam_session_id', sessionId)
            .single();

          if (!certError) {
            certificate = cert;
          }
        }

        setResult({
          session,
          certification: session.certifications,
          certificate
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, [sessionId, user]);

  const handleDownloadCertificate = async () => {
    if (!result?.certificate || !user) return;

    setDownloadingCert(true);
    try {
      const certificateData = {
        candidateName: user.full_name || 'Certificate Holder',
        examTitle: result.certification.name,
        score: result.session.score,
        date: new Date(result.certificate.issued_date).toLocaleDateString(),
        certificateId: result.certificate.verification_hash,
        certificateNumber: result.certificate.certificate_number,
        provider: result.certification.provider
      };

      await downloadCertificate(certificateData);
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate. Please try again.');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleRetakeExam = () => {
    if (result?.certification) {
      navigate(`/app/exam/${result.certification.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-primary-white mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <Card className="max-w-md text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-primary-white mb-2">Error Loading Results</h2>
          <p className="text-primary-gray mb-4">{error || 'Results not found'}</p>
          <Button onClick={() => navigate('/app/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { session, certification, certificate } = result;
  const passed = session.passed;
  const score = session.score || 0;
  const timeSpent = Math.round((certification.duration * 60 - (session.time_remaining || 0)) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed ? 'bg-robotic-green/20' : 'bg-red-500/20'
          }`}>
            {passed ? (
              <CheckCircle size={48} className="text-robotic-green" />
            ) : (
              <XCircle size={48} className="text-red-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-primary-white mb-2">
            {passed ? 'Congratulations!' : 'Exam Complete'}
          </h1>
          <p className="text-primary-gray">
            {passed 
              ? 'You have successfully passed the certification exam'
              : 'Unfortunately, you did not meet the passing requirements'
            }
          </p>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="text-center">
            <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target size={24} className="text-primary-orange" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{score}%</p>
            <p className="text-primary-gray text-sm">Final Score</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp size={24} className="text-robotic-purple" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{certification.passing_score}%</p>
            <p className="text-primary-gray text-sm">Required Score</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock size={24} className="text-robotic-green" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{timeSpent}m</p>
            <p className="text-primary-gray text-sm">Time Taken</p>
          </Card>

          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-robotic-blue" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {passed ? 'PASSED' : 'FAILED'}
            </p>
            <p className="text-primary-gray text-sm">Result</p>
          </Card>
        </motion.div>

        {/* Exam Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card>
            <h3 className="text-xl font-bold text-primary-white mb-4">Exam Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-primary-white mb-2">Certification</h4>
                <p className="text-primary-gray">{certification.name}</p>
                <p className="text-primary-gray text-sm">by {certification.provider}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-primary-white mb-2">Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primary-gray">Your Score:</span>
                    <span className={`font-bold ${passed ? 'text-robotic-green' : 'text-red-400'}`}>
                      {score}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-gray">Passing Score:</span>
                    <span className="text-primary-white">{certification.passing_score}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-gray">Time Taken:</span>
                    <span className="text-primary-white">{timeSpent} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Certificate Section */}
        {passed && certificate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="text-center">
              <div className="w-16 h-16 bg-primary-orange/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-primary-orange" />
              </div>
              <h3 className="text-xl font-bold text-primary-white mb-2">
                Certificate Earned!
              </h3>
              <p className="text-primary-gray mb-4">
                Your certificate for {certification.name} has been generated
              </p>
              <div className="bg-primary-gray/10 rounded-lg p-4 mb-4">
                <p className="text-primary-white font-medium">
                  Certificate #{certificate.certificate_number}
                </p>
                <p className="text-primary-gray text-sm">
                  Issued on {new Date(certificate.issued_date).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={handleDownloadCertificate}
                loading={downloadingCert}
              >
                <Download size={16} />
                Download Certificate
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center gap-4"
        >
          <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
            <Home size={16} />
            Back to Dashboard
          </Button>
          {!passed && (
            <Button variant="primary" onClick={handleRetakeExam}>
              <RotateCcw size={16} />
              Retake Exam
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExamResultsPage;