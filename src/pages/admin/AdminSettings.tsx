import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Mail,
  Database,
  Palette,
  Globe,
  Lock,
  Users
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

  const [activeTab, setActiveTab] = useState<'platform' | 'security' | 'email' | 'exam' | 'certificate'>('platform');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would save settings to your backend
    console.log('Saving settings:', settings);
    // Show success message
  };

  const settingsTabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'exam', label: 'Exam', icon: Settings },
    { id: 'certificate', label: 'Certificate', icon: Database }
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
          </div>
          <Button variant="primary" onClick={handleSaveSettings}>
            <Save size={16} />
            Save All Settings
          </Button>
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
                      label="Platform Name"
                      value={settings.platformName}
                      onChange={(e) => handleSettingChange('platformName', e.target.value)}
                    />
                    <Input
                      label="Support Email"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
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
                      className="w-full px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Max Exam Duration (minutes)"
                      type="number"
                      value={settings.maxExamDuration}
                      onChange={(e) => handleSettingChange('maxExamDuration', parseInt(e.target.value))}
                    />
                    <Input
                      label="Default Passing Score (%)"
                      type="number"
                      min="1"
                      max="100"
                      value={settings.defaultPassingScore}
                      onChange={(e) => handleSettingChange('defaultPassingScore', parseInt(e.target.value))}
                    />
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
                        className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Session Timeout (minutes)"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                    <Input
                      label="Max Login Attempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                    />
                    <Input
                      label="Min Password Length"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
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
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded"
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
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded"
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
                      label="Certificate Validity (days)"
                      type="number"
                      value={settings.certificateValidityPeriod}
                      onChange={(e) => handleSettingChange('certificateValidityPeriod', parseInt(e.target.value))}
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
                          className="w-4 h-4 text-primary-orange bg-primary-black border-primary-gray rounded"
                        />
                      </div>
                    ))}
                  </div>
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