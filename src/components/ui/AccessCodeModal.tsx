import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accessCode: string) => Promise<boolean>;
  certificationName: string;
  loading?: boolean;
}

const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  certificationName,
  loading = false
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAccessCode('');
      setError(null);
      setValidationState('idle');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const input = document.getElementById('access-code-input');
        input?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('Please enter an access code');
      return;
    }

    setIsSubmitting(true);
    setValidationState('validating');
    setError(null);

    try {
      console.log('🔐 Validating access code for certification:', certificationName);
      const isValid = await onSubmit(accessCode.trim());
      
      if (isValid) {
        console.log('✅ Access code validated successfully');
        setValidationState('success');
        // Small delay to show success state before closing
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        console.log('❌ Invalid access code provided');
        setValidationState('error');
        setError('Invalid access code. Please check and try again.');
      }
    } catch (error: any) {
      console.error('💥 Access code validation error:', error);
      setValidationState('error');
      setError(error.message || 'Failed to validate access code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-primary-black border border-primary-gray/30 rounded-xl shadow-2xl max-w-md w-full mx-4"
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-primary-gray/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                  <Lock size={20} className="text-primary-orange" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-white">Access Code Required</h2>
                  <p className="text-sm text-primary-gray">Protected Certification</p>
                </div>
              </div>
              {!isSubmitting && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="!p-2 hover:bg-red-500/20"
                >
                  <X size={20} />
                </Button>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary-white mb-2">
                  {certificationName}
                </h3>
                <p className="text-primary-gray text-sm">
                  This certification requires an access code to proceed. Please enter the code provided by your administrator.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    id="access-code-input"
                    type="text"
                    label="Access Code"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => {
                      setAccessCode(e.target.value);
                      setError(null);
                      setValidationState('idle');
                    }}
                    disabled={isSubmitting}
                    error={error}
                    icon={<Lock size={18} />}
                    className="uppercase tracking-wider"
                    autoComplete="off"
                    maxLength={50}
                  />
                  
                  {/* Validation State Indicator */}
                  <div className="absolute right-3 top-8 flex items-center">
                    {validationState === 'validating' && (
                      <Loader size={16} className="text-primary-orange animate-spin" />
                    )}
                    {validationState === 'success' && (
                      <CheckCircle size={16} className="text-robotic-green" />
                    )}
                    {validationState === 'error' && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Success Message */}
                <AnimatePresence>
                  {validationState === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-robotic-green/20 border border-robotic-green/30 rounded-lg"
                    >
                      <CheckCircle size={16} className="text-robotic-green flex-shrink-0" />
                      <p className="text-robotic-green text-sm">Access granted! Starting exam...</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={!accessCode.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Validating...' : 'Start Exam'}
                  </Button>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-6 p-4 bg-primary-gray/10 rounded-lg">
                <h4 className="text-sm font-medium text-primary-white mb-2">Need help?</h4>
                <p className="text-xs text-primary-gray">
                  Contact your administrator or training coordinator if you don't have an access code or if you're experiencing issues.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AccessCodeModal;