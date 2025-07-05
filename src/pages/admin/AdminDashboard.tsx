import React from 'react';
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
import Card from '../../components/ui/Card';
import AdminQuickActions from './AdminQuickActions';

interface AdminDashboardProps {
  stats: {
    certifications: number;
    users: number;
    certificates: number;
    successRate: number;
  };
  recentActivity: any[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats, recentActivity }) => {
  const navigate = useNavigate();

  const handleCreateCertification = () => {
    navigate('/app/admin/certifications');
  };

  const handleManageUsers = () => {
    navigate('/app/admin/users');
  };

  const handleViewReports = () => {
    navigate('/app/admin/reports');
  };

  const handleSettings = () => {
    navigate('/app/admin/settings');
  };

  const adminStats = [
    { 
      title: 'Total Certifications', 
      value: stats.certifications.toString(), 
      icon: FileText, 
      color: 'text-robotic-blue',
      bgColor: 'bg-robotic-blue/20',
      change: '+2 this month'
    },
    { 
      title: 'Active Users', 
      value: stats.users.toString(), 
      icon: Users, 
      color: 'text-robotic-green',
      bgColor: 'bg-robotic-green/20',
      change: '+15 this week'
    },
    { 
      title: 'Certificates Issued', 
      value: stats.certificates.toString(), 
      icon: Award, 
      color: 'text-primary-orange',
      bgColor: 'bg-primary-orange/20',
      change: '+8 today'
    },
    { 
      title: 'Success Rate', 
      value: `${stats.successRate}%`, 
      icon: TrendingUp, 
      color: 'text-robotic-purple',
      bgColor: 'bg-robotic-purple/20',
      change: '+5% vs last month'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => {
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
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary-white">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-4 p-4 bg-primary-gray/10 rounded-lg hover:bg-primary-gray/20 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-primary-orange" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-primary-white font-medium">
                      {activity.title}
                    </h3>
                    <p className="text-primary-gray text-sm">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-primary-gray text-sm">
                    {activity.time}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary-white">
                Quick Actions
              </h2>
            </div>
            <AdminQuickActions 
              onCreateCertification={handleCreateCertification}
              onManageUsers={handleManageUsers}
              onViewReports={handleViewReports}
              onSettings={handleSettings}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;