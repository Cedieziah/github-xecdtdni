import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Shield, Mail, Database, Globe, Lock, Users, CheckCircle, AlertTriangle, Palette, Moon, Sun, Type, FileText, Award } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/theme/ThemeToggle';
import FontSizeControl from '../../components/theme/FontSizeControl';
import Input from '../../components/ui/Input';
import ThemeSettings from '../../components/theme/ThemeSettings';
import toast from 'react-hot-toast';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // Platform Settings
    platformName: 'CertifyPro',
    platformDescription: 'Professional Certification Platform',
    supportEmail: 'support@certifypro.com',
    maxExamDuration: 180,
    defaultPassingScore: 70,
    
    // Security Settings
    enableTwoFactor: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    
    // Email Settings
    emailNotifications: true,
    examReminders: true,
    certificateNotifications: true,
    
    // Exam Settings
    allowExamPause: true,
    showResultsImmediately: false,
    randomizeQuestions: true,
    preventTabSwitching: true,
    
    // Certificate Settings
    certificateValidityPeriod: 365,
    autoGenerateCertificates: true,
    requireDigitalSignature: true
  });

  const [activeTab, setActiveTab] = useState<'platform' | 'security' | 'email' | 'exam' | 'certificate' | 'theme'>('platform');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); 
  const { mode } = useSelector((state: RootState) => state.theme);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('platformSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        const savedDate = localStorage.getItem('platformSettingsLastSaved');
        if (savedDate) {
          setLastSaved(new Date(savedDate));
        }
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const validateSettings = () => {
    const errors: string[] = [];

    // Platform validation
    if (!settings.platformName.trim()) {
      errors.push('Platform name is required');
    }
    if (!settings.supportEmail.trim()) {
      errors.push('Support email is required');
    }
    if (settings.maxExamDuration < 1) {
      errors.push('Max exam duration must be at least 1 minute');
    }
    if (settings.defaultPassingScore < 1 || settings.defaultPassingScore > 100) {
      errors.push('Default passing score must be between 1 and 100');
    }

    // Security validation
    if (settings.sessionTimeout < 5) {
      errors.push('Session timeout must be at least 5 minutes');
    }
    if (settings.maxLoginAttempts < 1) {
      errors.push('Max login attempts must be at least 1');
    }
    if (settings.passwordMinLength < 6) {
      errors.push('Password minimum length must be at least 6 characters');
    }

    // Certificate validation
    if (settings.certificateValidityPeriod < 1) {
      errors.push('Certificate validity period must be at least 1 day');
    }

    return errors;
  };

  const handleSaveSettings = async () => {
    const validationErrors = validateSettings();
    
    if (validationErrors.length > 0) {
      toast.error(`Validation failed: ${validationErrors.join(', ')}`);
      return;
    }

    setSaving(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (simulating database save)
      localStorage.setItem('platformSettings', JSON.stringify(settings));
      const now = new Date();
      localStorage.setItem('platformSettingsLastSaved', now.toISOString());
      
      setLastSaved(now);
      setHasUnsavedChanges(false);
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'exam', label: 'Exam', icon: FileText },
    { id: 'certificate', label: 'Certificate', icon: Award },
    { id: 'theme', label: 'Theme', icon: Palette }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Platform Settings
            </h1>
            <p className="text-primary-gray">
              Configure platform behavior and preferences
            </p>
            {lastSaved && (
              <p className="text-sm text-robotic-green mt-1">
                <CheckCircle size={14} className="inline mr-1" />
                Last saved: {lastSaved.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertTriangle size={16} />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <Button 
              variant="primary" 
              onClick={handleSaveSettings}
              loading={saving}
              disabled={!hasUnsavedChanges}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save All Settings'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="lg:col-span-1">
            <h3 className="text-lg font-bold text-primary-white mb-4">Settings</h3>
            <nav className="space-y-2">
              {settingsTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-orange text-white'
                        : 'text-primary-gray hover:text-primary-white hover:bg-primary-gray/20'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card>
              {activeTab === 'platform' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-white">Platform Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Platform Name *"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                      placeholder="Enter platform name"
                      required
                    />
                    <Input
                      label="Support Email *"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                      placeholder="support@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-white mb-2">
                      Platform Description
                    </label>
                    <textarea
                      value={settings.platformDescription}
                      onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                      placeholder="Describe your platform..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Max Exam Duration (minutes) *"
                      type="number"
                      min="1"
                      value={settings.maxExamDuration}
                      onChange={(e) => handleSettingChange('maxExamDuration', parseInt(e.target.value) || 1)}
                      required
                    />
                    <Input
                      label="Default Passing Score (%) *"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.defaultPassingScore}
                      onChange={(e) => handleSettingChange('defaultPassingScore', parseInt(e.target.value) || 70)}
                      required
                    />
                  </div>

                  <div className="p-4 bg-robotic-blue/10 border border-robotic-blue/30 rounded-lg">
                    <h4 className="text-robotic-blue font-medium mb-2">Platform Name Preview</h4>
                    <p className="text-primary-white">
                      Your platform will be displayed as: <strong>{settings.platformName}</strong>
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-white">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary-white font-medium">Two-Factor Authentication</p>
                        <p className="text-primary-gray text-sm">Require 2FA for admin accounts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableTwoFactor}
                        onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                        className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Session Timeout (minutes) *"
                      type="number"
                      min="5"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value) || 30)}
                      required
                    />
                    <Input
                      label="Max Login Attempts *"
                      type="number"
                      min="1"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value) || 5)}
                      required
                    />
                    <Input
                      label="Min Password Length *"
                      type="number"
                      min="6"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value) || 8)}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'email' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-white">Email Notifications</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Enable email notifications' },
                      { key: 'examReminders', label: 'Exam Reminders', desc: 'Send exam reminder emails' },
                      { key: 'certificateNotifications', label: 'Certificate Notifications', desc: 'Notify when certificates are issued' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-primary-white font-medium">{setting.label}</p>
                          <p className="text-primary-gray text-sm">{setting.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[setting.key as keyof typeof settings] as boolean}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'exam' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-white">Exam Configuration</h3>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'allowExamPause', label: 'Allow Exam Pause', desc: 'Allow candidates to pause exams' },
                      { key: 'showResultsImmediately', label: 'Show Results Immediately', desc: 'Show results after exam completion' },
                      { key: 'randomizeQuestions', label: 'Randomize Questions', desc: 'Randomize question order' },
                      { key: 'preventTabSwitching', label: 'Prevent Tab Switching', desc: 'Detect and prevent tab switching during exams' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-primary-white font-medium">{setting.label}</p>
                          <p className="text-primary-gray text-sm">{setting.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[setting.key as keyof typeof settings] as boolean}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'certificate' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-bold text-primary-white">Certificate Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Certificate Validity (days) *"
                      type="number"
                      min="1"
                      value={settings.certificateValidityPeriod}
                      onChange={(e) => handleSettingChange('certificateValidityPeriod', parseInt(e.target.value) || 365)}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'autoGenerateCertificates', label: 'Auto-Generate Certificates', desc: 'Automatically generate certificates upon exam completion' },
                      { key: 'requireDigitalSignature', label: 'Digital Signature', desc: 'Require digital signatures on certificates' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-primary-white font-medium">{setting.label}</p>
                          <p className="text-primary-gray text-sm">{setting.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[setting.key as keyof typeof settings] as boolean}
                          onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded focus:ring-primary-orange"
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quick Actions */}
              <div className="border-t border-primary-gray/30 pt-4 mt-6">
                <h3 className="text-lg font-semibold text-primary-white mb-4">Quick Theme Controls</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3 p-3 bg-primary-gray/10 rounded-lg">
                    <Palette size={18} className="text-primary-orange" />
                    <span className="text-sm text-primary-white">Theme:</span>
                    <ThemeToggle size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-primary-gray/10 rounded-lg">
                    <Type size={18} className="text-robotic-blue" />
                    <span className="text-sm text-primary-white">Font Size:</span>
                    <FontSizeControl compact />
                  </div>
                </div>
              </div>

              {activeTab === 'theme' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <ThemeSettings />
                </motion.div>
              )}

            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSettings;