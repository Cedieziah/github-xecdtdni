import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Certification } from '../../types';

interface CertificationFormProps {
  certification?: Certification | null;
  onSubmit: (data: Partial<Certification>) => void;
  onCancel: () => void;
}

const CertificationForm: React.FC<CertificationFormProps> = ({
  certification,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    access_code: '',
    duration: 60,
    passing_score: 70,
    total_questions: 10,
    is_active: true
  });

  useEffect(() => {
    if (certification) {
      setFormData({
        name: certification.name,
        description: certification.description,
        provider: certification.provider,
        access_code: certification.access_code || '',
        duration: certification.duration,
        passing_score: certification.passing_score,
        total_questions: certification.total_questions,
        is_active: certification.is_active
      });
    }
  }, [certification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Certification Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., JavaScript Fundamentals"
          required
        />
        <Input
          label="Provider"
          name="provider"
          value={formData.provider}
          onChange={handleChange}
          placeholder="e.g., TechCorp Academy"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary-white mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
          placeholder="Describe what this certification covers..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Access Code (Optional)"
          name="access_code"
          value={formData.access_code}
          onChange={handleChange}
          placeholder="Leave empty for public access"
        />
        <Input
          label="Duration (minutes)"
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Passing Score (%)"
          name="passing_score"
          type="number"
          value={formData.passing_score}
          onChange={handleChange}
          min="1"
          max="100"
          required
        />
        <Input
          label="Total Questions"
          name="total_questions"
          type="number"
          value={formData.total_questions}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
        />
        <label htmlFor="is_active" className="text-primary-white">
          Active (visible to candidates)
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-primary-gray/30">
        <Button variant="ghost" onClick={onCancel}>
          <X size={16} />
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          <Save size={16} />
          {certification ? 'Update' : 'Create'} Certification
        </Button>
      </div>
    </motion.form>
  );
};

export default CertificationForm;