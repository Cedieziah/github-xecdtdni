import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, AlertTriangle, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Certification } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapDatabaseToFormData } from '../../utils/certificationMappers';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import CertificationDetailsForm, { CertificationFormData } from './CertificationDetailsForm';
import ConfirmationModal from '../ui/ConfirmationModal';
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
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const { certifications } = useSelector((state: RootState) => state.admin);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Store original form data for comparison
  const originalFormData = useRef<CertificationFormData | null>(null);
  
  // Track if the modal is attempting to close
  const isClosing = useRef(false);

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
          originalFormData.current = JSON.parse(JSON.stringify(mappedFormData));
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
      isClosing.current = false;
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
        originalFormData.current = null;
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Use useCallback to prevent unnecessary re-renders
  const handleFormChange = useCallback((updatedFormData: CertificationFormData) => {
    setFormData(updatedFormData);
    
    // Check if there are actual changes by comparing with original data
    if (originalFormData.current) {
      // Simple deep comparison for detecting changes
      const hasActualChanges = JSON.stringify(updatedFormData) !== JSON.stringify(originalFormData.current);
      setHasChanges(hasActualChanges);
    }
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

  const handleRequestClose = () => {
    if (hasChanges) {
      setShowUnsavedChangesModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    setShowUnsavedChangesModal(false);
    onClose();
  };

  const handleContinueEditing = () => {
    setShowUnsavedChangesModal(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleRequestClose}
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
            onCancel={handleRequestClose}
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

      {/* Confirmation Modal for Saving Changes */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title="Confirm Changes"
        message="Please review your changes before saving. This will update the certification information for all users."
        confirmText="Save Changes"
        cancelText="Continue Editing"
        type="info"
      />

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

export default CertificationEditModal;