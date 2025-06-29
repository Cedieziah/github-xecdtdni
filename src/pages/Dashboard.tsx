import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Award, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText,
  BarChart3,
  Calendar,
  Shield,
  CheckCircle,
  Settings,
  Plus
} from 'lucide-react';
import { RootState } from '../store';
import { fetchCertifications, fetchUserCertificates } from '../store/slices/examSlice';
import { fetchUsers, fetchCertificates } from '../store/slices/adminSlice';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { certifications, certificates } = useSelector((state: RootState) => state.exam);
  const { users, certificates: adminCertificates } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchCertifications());
    if (user) {
      if (user.role === 'admin') {
        dispatch(fetchUsers());
        dispatch(fetchCertificates());
      } else {
        dispatch(fetchUserCertificates(user.id));
      }
    }
  }, [dispatch, user]);

  const isAdmin = user?.role === 'admin';

  // Navigation handlers
  const handleCreateCertification = () => {
    navigate('/app/admin/certifications');
  };

  const handleManageUsers = () => {
    navigate('/app/admin/users');
  };

  const handleViewAnalytics = () => {
    navigate('/app/admin/analytics');
  };

  const handleViewReports = () => {
    navigate('/app/admin/reports');
  };

  const handleSettings = () => {
    navigate('/app/admin/settings');
  };

  const handleBrowseCertifications = () => {
    navigate('/app/certifications');
  };

  const handleScheduleExam = () => {
    navigate('/app/schedule-exam');
  };

  const handleStartFirstExam = () => {
    navigate('/app/certifications');
  };

  const adminStats = [
    { 
      title: 'Total Certifications', 
      value: certifications.length.toString(), 
      icon: FileText, 
      color: 'text-robotic-blue',
      bgColor: 'bg-robotic-blue/20'
    },
    { 
      title: 'Active Users', 
      value: users.length.toString(), 
      icon: Users, 
      color: 'text-robotic-green',
      bgColor: 'bg-robotic-green/20'
    },
    { 
      title: 'Certificates Issued', 
      value: adminCertificates.length.toString(), 
      icon: Award, 
      color: 'text-primary-orange',
      bgColor: 'bg-primary-orange/20'
    },
    { 
      title: 'Success Rate', 
      value: adminCertificates.length > 0 ? `${Math.round((adminCertificates.filter(c => !c.revoked).length / adminCertificates.length) * 100)}%` : '0%', 
      icon: TrendingUp, 
      color: 'text-robotic-purple',
      bgColor: 'bg-robotic-purple/20'
    }
  ];

  const candidateStats = [
    { 
      title: 'Available Certifications', 
      value: certifications.length.toString(), 
      icon: BookOpen, 
      color: 'text-robotic-blue',
      bgColor: 'bg-robotic-blue/20'
    },
    { 
      title: 'Earned Certificates', 
      value: certificates.length.toString(), 
      icon: Award, 
      color: 'text-robotic-green',
      bgColor: 'bg-robotic-green/20'
    },
    { 
      title: 'Average Score', 
      value: '85%', 
      icon: TrendingUp, 
      color: 'text-primary-orange',
      bgColor: 'bg-primary-orange/20'
    },
    { 
      title: 'Time Saved', 
      value: '12h', 
      icon: Clock, 
      color: 'text-robotic-purple',
      bgColor: 'bg-robotic-purple/20'
    }
  ];

  const stats = isAdmin ? adminStats : candidateStats;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              {isAdmin ? 'Admin Dashboard' : `Welcome back, ${user?.full_name}`}
            </h1>
            <p className="text-primary-gray">
              {isAdmin 
                ? 'Manage your certification platform and monitor performance'
                : 'Continue your learning journey and earn professional certifications'
              }
            </p>
          </div>
          <div className="flex gap-4">
            {isAdmin ? (
              <>
                <Button variant="secondary" onClick={handleViewAnalytics}>
                  <BarChart3 size={20} />
                  View Analytics
                </Button>
                <Button variant="primary" onClick={handleCreateCertification}>
                  <Plus size={20} />
                  Create Certification
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleScheduleExam}>
                  <Calendar size={20} />
                  Schedule Exam
                </Button>
                <Button variant="primary" onClick={handleBrowseCertifications}>
                  <BookOpen size={20} />
                  Browse Certifications
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center">
                  <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={24} className={stat.color} />
                  </div>
                  <h3 className="text-2xl font-bold text-primary-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-primary-gray font-medium">
                    {stat.title}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-primary-white mb-6">
                {isAdmin ? 'Recent Activity' : 'Available Certifications'}
              </h2>
              <div className="space-y-4">
                {certifications.slice(0, 4).map((cert, index) => (
                  <div key={cert.id} className="flex items-center gap-4 p-4 bg-primary-gray/10 rounded-lg hover:bg-primary-gray/20 transition-colors">
                    <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                      <Shield size={20} className="text-primary-orange" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-primary-white font-medium">
                        {cert.name}
                      </h3>
                      <p className="text-primary-gray text-sm">
                        {cert.provider} • {cert.total_questions} questions • {cert.duration} minutes
                      </p>
                    </div>
                    <div className="text-primary-gray text-sm">
                      {cert.passing_score}% to pass
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions or Certificates */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <h2 className="text-xl font-bold text-primary-white mb-6">
                {isAdmin ? 'Quick Actions' : 'My Certificates'}
              </h2>
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="ghost" 
                    className="h-20 flex-col gap-2"
                    onClick={handleCreateCertification}
                  >
                    <FileText size={24} />
                    <span>Create Certification</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-20 flex-col gap-2"
                    onClick={handleManageUsers}
                  >
                    <Users size={24} />
                    <span>Manage Users</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-20 flex-col gap-2"
                    onClick={handleViewReports}
                  >
                    <BarChart3 size={24} />
                    <span>View Reports</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="h-20 flex-col gap-2"
                    onClick={handleSettings}
                  >
                    <Settings size={24} />
                    <span>Settings</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.length > 0 ? (
                    certificates.slice(0, 3).map((cert) => (
                      <div key={cert.id} className="flex items-center gap-4 p-4 bg-robotic-green/10 rounded-lg border border-robotic-green/20">
                        <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center">
                          <CheckCircle size={20} className="text-robotic-green" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-primary-white font-medium">
                            {cert.certifications?.name}
                          </h3>
                          <p className="text-primary-gray text-sm">
                            Certificate #{cert.certificate_number}
                          </p>
                        </div>
                        <div className="text-robotic-green text-sm font-medium">
                          Verified
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Award size={48} className="text-primary-gray mx-auto mb-4" />
                      <p className="text-primary-gray">No certificates earned yet</p>
                      <Button variant="primary" className="mt-4" onClick={handleStartFirstExam}>
                        <BookOpen size={16} />
                        Start Your First Exam
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;