import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          iconColor: 'text-red-400',
          buttonVariant: 'danger' as const
        };
      case 'info':
        return {
          bgColor: 'bg-robotic-blue/20',
          borderColor: 'border-robotic-blue/30',
          iconColor: 'text-robotic-blue',
          buttonVariant: 'secondary' as const
        };
      case 'warning':
      default:
        return {
          bgColor: 'bg-primary-orange/20',
          borderColor: 'border-primary-orange/30',
          iconColor: 'text-primary-orange',
          buttonVariant: 'primary' as const
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-primary-black border border-primary-gray/30 rounded-xl shadow-2xl max-w-md w-full mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-gray/30">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${typeStyles.bgColor} rounded-lg flex items-center justify-center`}>
                <AlertTriangle size={20} className={typeStyles.iconColor} />
              </div>
              <h2 className="text-xl font-bold text-primary-white">{title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-2 hover:bg-primary-gray/20"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className={`${typeStyles.bgColor} border ${typeStyles.borderColor} rounded-lg p-4 mb-6`}>
              <p className="text-primary-white">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                {cancelText}
              </Button>
              <Button variant={type === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;