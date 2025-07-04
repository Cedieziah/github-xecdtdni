import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
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
  Plus,
  BookOpen,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import { RootState } from '../store';
import { fetchCertifications, fetchUserCertificates } from '../store/slices/examSlice';
import { fetchUsers, fetchCertificates } from '../store/slices/adminSlice';
import AdminDashboard from './admin/AdminDashboard';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { certifications, certificates } = useSelector((state: RootState) => state.exam);
  const { users, certificates: adminCertificates } = useSelector((state: RootState) => state.admin);

  const isAdmin = user?.role === 'admin';

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

  const handleViewProfile = () => {
    navigate('/app/profile');
  };

  const candidateStats = [
    { 
      title: 'Available Certifications', 
      value: certifications.length.toString(), 
      icon: BookOpen, 
      color: 'text-robotic-blue',
      bgColor: 'bg-robotic-blue/20',
      change: 'Explore new programs'
    },
    { 
      title: 'Earned Certificates', 
      value: certificates.length.toString(), 
      icon: Award, 
      color: 'text-robotic-green',
      bgColor: 'bg-robotic-green/20',
      change: 'Keep learning!'
    },
    { 
      title: 'Learning Progress', 
      value: '85%', 
      icon: Target, 
      color: 'text-primary-orange',
      bgColor: 'bg-primary-orange/20',
      change: 'Almost there!'
    },
    { 
      title: 'Study Streak', 
      value: '12 days', 
      icon: Zap, 
      color: 'text-robotic-purple',
      bgColor: 'bg-robotic-purple/20',
      change: 'Keep it up!'
    }
  ];

  // Sample recent activity data for admin dashboard
  const recentActivity = [
    {
      title: "New User Registration",
      description: "John Doe joined the platform",
      time: "2 hours ago"
    },
    {
      title: "Certificate Issued",
      description: "Maria Garcia earned Python Certification",
      time: "5 hours ago"
    },
    {
      title: "New Certification Created",
      description: "JavaScript Fundamentals certification added",
      time: "1 day ago"
    },
    {
      title: "User Completed Exam",
      description: "Alex Johnson passed Cybersecurity Basics",
      time: "2 days ago"
    }
  ];

  // Admin dashboard stats
  const adminDashboardStats = {
    certifications: certifications.length,
    users: users.length,
    certificates: adminCertificates.length,
    successRate: adminCertificates.length > 0 
      ? Math.round((adminCertificates.filter(c => !c.revoked).length / adminCertificates.length) * 100) 
      : 0
  };

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
                : 'Continue your learning journey and track your progress'
              }
            </p>
          </div>
          <div className="flex gap-4">
            {isAdmin ? (
              <>
                <Button variant="secondary" onClick={handleViewAnalytics}>
                  <BarChart3 size={20} />
                  Analytics
                </Button>
                <Button variant="primary" onClick={handleCreateCertification}>
                  <Plus size={20} />
                  Create Certification
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={handleViewProfile}>
                  <Users size={20} />
                  Profile
                </Button>
                <Button variant="primary" onClick={handleBrowseCertifications}>
                  <BookOpen size={20} />
                  Browse Certifications
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {isAdmin ? (
          <AdminDashboard 
            stats={adminDashboardStats}
            recentActivity={recentActivity}
          />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {candidateStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                          <Icon size={24} className={stat.color} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-primary-white mb-1">
                            {stat.value}
                          </h3>
                          <p className="text-primary-gray font-medium text-sm">
                            {stat.title}
                          </p>
                          <p className="text-xs text-robotic-green mt-1">
                            {stat.change}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Available Certifications */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-white">
                      Available Certifications
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {certifications.slice(0, 4).map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 bg-primary-gray/10 rounded-lg hover:bg-primary-gray/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/app/exam/${cert.id}`)}
                      >
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
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* My Certificates */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-white">
                      My Certificates
                    </h2>
                    <Button variant="ghost" size="sm">
                      <Award size={16} />
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {certificates.length > 0 ? (
                      certificates.slice(0, 3).map((cert, index) => (
                        <motion.div
                          key={cert.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex items-center gap-4 p-4 bg-robotic-green/10 rounded-lg border border-robotic-green/20"
                        >
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
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Award size={48} className="text-primary-gray mx-auto mb-4" />
                        <p className="text-primary-gray mb-4">No certificates earned yet</p>
                        <Button variant="primary" onClick={handleBrowseCertifications}>
                          <BookOpen size={16} />
                          Start Your First Exam
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Learning Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary-white">Learning Progress</h2>
                  <Button variant="ghost" size="sm">
                    <Target size={16} />
                    Set Goals
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={24} className="text-primary-orange" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-white">24h</h3>
                    <p className="text-primary-gray text-sm">Study Time</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-robotic-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BookOpen size={24} className="text-robotic-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-white">3</h3>
                    <p className="text-primary-gray text-sm">Courses Enrolled</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-robotic-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp size={24} className="text-robotic-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-white">85%</h3>
                    <p className="text-primary-gray text-sm">Average Score</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;