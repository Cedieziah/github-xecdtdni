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
  HelpCircle,
  Info,
  FileText
} from 'lucide-react';
import { RootState } from '../../store';
import { 
  fetchCertifications, 
  createCertificationWithDetails, 
  updateCertificationWithDetails, 
  deleteCertification,
  fetchCertificationWithDetails
} from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import CertificationDetailsForm, { CertificationFormData } from '../../components/admin/CertificationDetailsForm';
import CertificationEditModal from '../../components/admin/CertificationEditModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { Certification } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminCertifications: React.FC = () => {
  const dispatch = useDispatch();
  const { certifications, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [certificationStats, setCertificationStats] = useState<Record<string, any>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCertificationDetails, setSelectedCertificationDetails] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null);

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
    setIsEditModalOpen(true);
  };

  const handleDeleteCertification = async (id: string) => {
    setShowDeleteConfirmation(id);
  };
  
  const confirmDeleteCertification = async () => {
    if (!showDeleteConfirmation) return;
    
    try {
      await dispatch(deleteCertification(showDeleteConfirmation));
      toast.success('Certification deleted successfully');
      setShowDeleteConfirmation(null);
    } catch (error) {
      toast.error('Failed to delete certification');
    }
  };

  const handleViewDetails = async (certification: Certification) => {
    try {
      // Fetch detailed certification information
      const { data, error } = await supabase
        .from('certifications_with_details')
        .select('*')
        .eq('id', certification.id)
        .single();

      if (error) {
        console.error('Error fetching certification details:', error);
        toast.error('Failed to load certification details');
        return;
      }

      setSelectedCertificationDetails(data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error viewing certification details:', error);
      toast.error('Failed to load certification details');
    }
  };

  const handleSubmitCertification = async (formData: CertificationFormData) => {
    try {
      if (editingCertification) {
        await dispatch(updateCertificationWithDetails({ 
          id: editingCertification.id, 
          formData 
        }));
        toast.success('Certification updated successfully');
      } else {
        await dispatch(createCertificationWithDetails(formData));
        
        toast.success('Certification created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save certification');
    }
  };

  const handleEditSubmit = async (formData: CertificationFormData) => {
    try {
      if (editingCertification) {
        await dispatch(updateCertificationWithDetails({ 
          id: editingCertification.id, 
          formData 
        }));
        toast.success('Certification updated successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update certification');
      throw error;
    }
  };
  
  const handleCloseModal = () => {
    setShowUnsavedChangesModal(true);
  };
  
  const handleConfirmCloseModal = () => {
    setIsModalOpen(false);
    setEditingCertification(null);
    setShowUnsavedChangesModal(false);
  };
  
  const handleContinueEditing = () => {
    setShowUnsavedChangesModal(false);
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
              Create and manage comprehensive certification programs with detailed requirements
            </p>
          </div>
          <Button variant="primary" onClick={handleCreateCertification}>
            <Plus size={20} />
            Create Certification
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield size={24} className="text-robotic-blue" />
            </div>
            <p className="text-2xl font-bold text-primary-white">{certifications.length}</p>
            <p className="text-primary-gray text-sm">Total Certifications</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-robotic-green" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {certifications.filter(c => c.is_active).length}
            </p>
            <p className="text-primary-gray text-sm">Active</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <HelpCircle size={24} className="text-primary-orange" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {Object.values(certificationStats).filter(s => s.canTakeExam).length}
            </p>
            <p className="text-primary-gray text-sm">Exam Ready</p>
          </Card>
          <Card className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-primary-white">
              {Object.values(certificationStats).filter(s => s.issues && s.issues.length > 0).length}
            </p>
            <p className="text-primary-gray text-sm">Need Attention</p>
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
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({certifications.length})
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({certifications.filter(c => c.is_active).length})
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({certifications.filter(c => !c.is_active).length})
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

                  {/* Question Statistics */}
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-primary-gray">Pass Score: </span>
                      <span className="text-primary-orange font-medium">
                        {certification.passing_score}%
                      </span>
                    </div>
                    {certification.access_code && (
                      <div className="text-xs text-yellow-500 bg-yellow-500/20 px-2 py-1 rounded">
                        Protected
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(certification)}
                      className="flex-1"
                    >
                      <Eye size={16} />
                      Details
                    </Button>
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

        {/* Certification Form Modal (for new certifications) */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Create Certification"
          size="xl"
        >
          <CertificationDetailsForm
            certification={null}
            onSubmit={handleSubmitCertification}
            onCancel={handleCloseModal}
          />
        </Modal>

        {/* Certification Edit Modal (for existing certifications) */}
        <CertificationEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          certification={editingCertification}
          onSubmit={handleEditSubmit}
        />

        {/* Certification Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Certification Details"
          size="xl"
        >
          {selectedCertificationDetails && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-primary-white mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-primary-gray">Name</p>
                    <p className="text-primary-white font-medium">{selectedCertificationDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-gray">Provider</p>
                    <p className="text-primary-white font-medium">{selectedCertificationDetails.provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-gray">Duration</p>
                    <p className="text-primary-white font-medium">{selectedCertificationDetails.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-primary-gray">Passing Score</p>
                    <p className="text-primary-white font-medium">{selectedCertificationDetails.passing_score}%</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-primary-gray">Description</p>
                  <p className="text-primary-white">{selectedCertificationDetails.description}</p>
                </div>
              </div>

              {/* Exam Coverage */}
              {selectedCertificationDetails.topics && selectedCertificationDetails.topics.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-primary-white mb-4">Exam Coverage</h3>
                  <div className="space-y-4">
                    {selectedCertificationDetails.topics.map((topic: any, index: number) => (
                      <div key={index} className="border border-primary-gray/20 rounded-lg p-4 bg-primary-gray/5">
                        <h4 className="text-primary-white font-medium mb-2">{topic.domain}</h4>
                        <p className="text-primary-white/80 text-sm mb-2">{topic.description}</p>
                        
                        {topic.key_concepts && topic.key_concepts.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-primary-gray mb-1">Key Concepts:</p>
                            <div className="flex flex-wrap gap-2">
                              {topic.key_concepts.map((concept: string, idx: number) => (
                                <span key={idx} className="bg-primary-orange/10 text-primary-orange px-2 py-1 rounded-full text-xs">
                                  {concept}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {topic.depth_of_understanding && (
                          <div className="mb-2">
                            <p className="text-sm text-primary-gray mb-1">Depth:</p>
                            <span className="bg-robotic-blue/10 text-robotic-blue px-2 py-1 rounded text-xs capitalize">
                              {topic.depth_of_understanding}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Criteria */}
              {selectedCertificationDetails.evaluation_criteria?.assessment_methods && (
                <div>
                  <h3 className="text-lg font-bold text-primary-white mb-4">Evaluation Criteria</h3>
                  <div className="space-y-4">
                    {selectedCertificationDetails.evaluation_criteria.assessment_methods.map((method: any, index: number) => (
                      <div key={index} className="border border-primary-gray/20 rounded-lg p-4 bg-primary-gray/5">
                        <h4 className="text-primary-white font-medium mb-2">{method.coverage_item}</h4>
                        
                        {method.scoring_guidelines && (
                          <div className="mb-2">
                            <p className="text-sm text-primary-gray mb-1">Scoring Guidelines:</p>
                            <p className="text-primary-white/80 text-sm">{method.scoring_guidelines}</p>
                          </div>
                        )}
                        
                        {method.performance_indicators && method.performance_indicators.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-primary-gray mb-1">Performance Indicators:</p>
                            <ul className="space-y-1">
                              {method.performance_indicators.map((indicator: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-primary-white/80 text-sm">
                                  <CheckCircle size={12} className="text-robotic-green mt-0.5 flex-shrink-0" />
                                  {indicator}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Target Audience */}
              {selectedCertificationDetails.details_metadata?.target_audience && (
                <div>
                  <h3 className="text-lg font-bold text-primary-white mb-4">Target Audience</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCertificationDetails.details_metadata.target_audience.map((audience: string, index: number) => (
                      <span key={index} className="bg-robotic-purple/10 text-robotic-purple px-3 py-1 rounded-full text-sm">
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
          onConfirm={confirmDeleteCertification}
          title="Delete Certification"
          message="Are you sure you want to delete this certification? This will also delete all associated questions and exam data."
          confirmText="Delete Certification"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </Layout>
  );
};

export default AdminCertifications;