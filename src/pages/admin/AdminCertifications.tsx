import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Shield,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchCertifications, createCertification, updateCertification, deleteCertification } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CertificationForm from '../../components/admin/CertificationForm';
import { Certification } from '../../types';
import { supabase } from '../../lib/supabase';

const AdminCertifications: React.FC = () => {
  const dispatch = useDispatch();
  const { certifications, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
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
              questionsNeeded: cert.total_questions,
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
            questionsNeeded: cert.total_questions,
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

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && cert.is_active) ||
                         (filterStatus === 'inactive' && !cert.is_active);
    return matchesSearch && matchesFilter;
  });

  const handleCreateCertification = () => {
    setEditingCertification(null);
    setIsModalOpen(true);
  };

  const handleEditCertification = (certification: Certification) => {
    setEditingCertification(certification);
    setIsModalOpen(true);
  };

  const handleDeleteCertification = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      dispatch(deleteCertification(id));
    }
  };

  const handleSubmitCertification = (certificationData: Partial<Certification>) => {
    if (editingCertification) {
      dispatch(updateCertification({ id: editingCertification.id, ...certificationData }));
    } else {
      dispatch(createCertification(certificationData));
    }
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Certifications Management
            </h1>
            <p className="text-primary-gray">
              Create and manage certification programs
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateCertification}>
            <Plus size={20} />
            Create Certification
          </Button>
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
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </Card>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((certification, index) => {
            const stats = certificationStats[certification.id];
            const hasIssues = stats?.issues && stats.issues.length > 0;
            
            return (
              <motion.div
                key={certification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full ${hasIssues ? 'border-red-500/30' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                        <Shield size={24} className="text-primary-orange" />
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
                    <div className="flex items-center gap-1">
                      {certification.is_active ? (
                        <CheckCircle size={16} className="text-robotic-green" />
                      ) : (
                        <XCircle size={16} className="text-red-500" />
                      )}
                    </div>
                  </div>

                  <p className="text-primary-gray text-sm mb-4 line-clamp-2">
                    {certification.description}
                  </p>

                  {/* Question Statistics - Now in Admin Panel */}
                  {stats && (
                    <div className="mb-4 p-3 bg-primary-gray/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={16} className="text-robotic-blue" />
                        <span className="text-sm font-medium text-primary-white">Questions Status</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-gray">Available:</span>
                          <span className={`font-medium ${stats.canTakeExam ? 'text-robotic-green' : 'text-red-400'}`}>
                            {stats.validQuestions}/{stats.questionsNeeded}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-gray">Total Created:</span>
                          <span className="text-primary-white">{stats.totalQuestions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-gray">Active:</span>
                          <span className="text-primary-white">{stats.activeQuestions}</span>
                        </div>
                      </div>
                      {hasIssues && (
                        <div className="mt-2 pt-2 border-t border-red-500/20">
                          <div className="flex items-center gap-1 mb-1">
                            <AlertTriangle size={12} className="text-red-400" />
                            <span className="text-red-400 text-xs font-medium">Issues:</span>
                          </div>
                          <ul className="text-red-400 text-xs space-y-1">
                            {stats.issues.map((issue: string, idx: number) => (
                              <li key={idx}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-robotic-blue mb-1">
                        <Clock size={16} />
                        <span className="text-sm font-medium">{certification.duration}m</span>
                      </div>
                      <p className="text-xs text-primary-gray">Duration</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-robotic-purple mb-1">
                        <Users size={16} />
                        <span className="text-sm font-medium">{certification.total_questions}</span>
                      </div>
                      <p className="text-xs text-primary-gray">Questions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-primary-gray">Pass Score: </span>
                      <span className="text-primary-orange font-medium">
                        {certification.passing_score}%
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCertification(certification)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCertification(certification.id)}
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

        {filteredCertifications.length === 0 && (
          <Card className="text-center py-12">
            <Shield size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No certifications found
            </h3>
            <p className="text-primary-gray mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first certification to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button variant="primary" onClick={handleCreateCertification}>
                <Plus size={20} />
                Create Certification
              </Button>
            )}
          </Card>
        )}

        {/* Certification Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCertification ? 'Edit Certification' : 'Create Certification'}
          size="lg"
        >
          <CertificationForm
            certification={editingCertification}
            onSubmit={handleSubmitCertification}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminCertifications;