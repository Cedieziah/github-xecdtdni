import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertTriangle, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Certification } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapDatabaseToFormData } from '../../utils/certificationQueries';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CertificationDetailsForm, { CertificationFormData } from './CertificationDetailsForm';
import toast from 'react-hot-toast';

interface CertificationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  certification: Certification | null;
  onSubmit: (formData: CertificationFormData) => Promise<void>;
}

const CertificationEditModal: React.FC<CertificationEditModalProps> = ({
  isOpen,
  onClose,
  certification,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CertificationFormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { certifications } = useSelector((state: RootState) => state.admin);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch full certification details when modal opens
  useEffect(() => {
    let isMounted = true;
    
    const fetchCertificationDetails = async () => {
      if (!certification || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching details for certification:', certification.id);
        
        // Fetch certification with all its details
        const { data, error } = await supabase
          .from('certifications_with_details')
          .select('*')
          .eq('id', certification.id)
          .single();
        
        if (error) {
          console.error('Error fetching certification details:', error);
          throw new Error(`Failed to load certification details: ${error.message}`);
        }
        
        if (!data) {
          throw new Error('Certification details not found');
        }
        
        console.log('Certification details loaded:', data);
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Map database data to form structure
          const mappedFormData = mapDatabaseToFormData(data);
          setFormData(mappedFormData);
          setIsInitialized(true);
          setHasChanges(false);
        }
      } catch (err: any) {
        console.error('Error in fetchCertificationDetails:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load certification details');
          toast.error('Failed to load certification details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (isOpen) {
      fetchCertificationDetails();
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [certification, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Use a timeout to prevent flickering during the closing animation
      const timer = setTimeout(() => {
        setFormData(null);
        setError(null);
        setHasChanges(false);
        setShowConfirmation(false);
        setIsInitialized(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Use useCallback to prevent unnecessary re-renders
  const handleFormChange = useCallback((updatedFormData: CertificationFormData) => {
    setFormData(updatedFormData);
    setHasChanges(true);
  }, []);

  const handleSubmit = async (data: CertificationFormData) => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await onSubmit(formData);
      setHasChanges(false);
      setShowConfirmation(false);
      onClose();
      toast.success(`Certification updated successfully`);
    } catch (err: any) {
      console.error('Error saving certification:', err);
      setError(err.message || 'Failed to save certification');
      toast.error('Failed to save certification');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        title={certification ? 'Edit Certification' : 'Create Certification'}
        size="xl"
        showCloseButton={!loading}
      >
        {loading && !isInitialized ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary-orange/30 border-t-primary-orange rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-primary-white">Loading certification details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Error Loading Certification</h3>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : formData ? (
          <CertificationDetailsForm
            certification={certification}
            initialFormData={formData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onChange={handleFormChange}
            isSubmitting={loading}
          />
        ) : (
          <div className="text-center py-8">
            <AlertTriangle size={48} className="text-primary-orange mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No Certification Data
            </h3>
            <p className="text-primary-gray mb-6">
              Unable to load certification data. Please try again.
            </p>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Changes"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-primary-orange/10 border border-primary-orange/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Info size={24} className="text-primary-orange" />
              <div>
                <h3 className="text-lg font-semibold text-primary-white">Review Your Changes</h3>
                <p className="text-primary-gray">
                  Please review your changes before saving. This will update the certification information for all users.
                </p>
              </div>
            </div>
          </div>

          {formData && (
            <div className="space-y-4">
              <div className="border border-primary-gray/30 rounded-lg p-4 bg-primary-gray/5">
                <h4 className="text-md font-semibold text-primary-white mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-gray">Name:</span>
                    <span className="text-primary-white ml-2">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-primary-gray">Provider:</span>
                    <span className="text-primary-white ml-2">{formData.provider}</span>
                  </div>
                  <div>
                    <span className="text-primary-gray">Duration:</span>
                    <span className="text-primary-white ml-2">{formData.duration} minutes</span>
                  </div>
                  <div>
                    <span className="text-primary-gray">Passing Score:</span>
                    <span className="text-primary-white ml-2">{formData.passing_score}%</span>
                  </div>
                  <div>
                    <span className="text-primary-gray">Questions:</span>
                    <span className="text-primary-white ml-2">{formData.total_questions}</span>
                  </div>
                  <div>
                    <span className="text-primary-gray">Status:</span>
                    <span className="text-primary-white ml-2">{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="border border-primary-gray/30 rounded-lg p-4 bg-primary-gray/5">
                <h4 className="text-md font-semibold text-primary-white mb-2">Exam Coverage</h4>
                <p className="text-primary-gray text-sm">
                  {formData.exam_coverage.length} coverage items defined
                </p>
              </div>

              <div className="border border-primary-gray/30 rounded-lg p-4 bg-primary-gray/5">
                <h4 className="text-md font-semibold text-primary-white mb-2">Evaluation Criteria</h4>
                <p className="text-primary-gray text-sm">
                  {formData.examination_evaluation.length} evaluation components defined
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              <X size={16} />
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmSubmit}
              loading={loading}
            >
              <Save size={16} />
              Confirm & Save
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CertificationEditModal;