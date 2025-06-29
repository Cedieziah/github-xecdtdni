import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchUsers, fetchCertificates, fetchCertifications } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminAnalytics: React.FC = () => {
  const dispatch = useDispatch();
  const { users, certificates, certifications, loading } = useSelector((state: RootState) => state.admin);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCertificates());
    dispatch(fetchCertifications());
  }, [dispatch]);

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  };

  const filterByDateRange = (items: any[], dateField: string) => {
    const startDate = getDateRange(timeRange);
    return items.filter(item => new Date(item[dateField]) >= startDate);
  };

  const recentUsers = filterByDateRange(users, 'created_at');
  const recentCertificates = filterByDateRange(certificates, 'issued_date');
  const activeCertifications = certifications.filter(c => c.is_active);

  const analyticsData = [
    {
      title: 'Total Users',
      value: users.length,
      change: `+${recentUsers.length} this period`,
      icon: Users,
      color: 'text-robotic-blue',
      bgColor: 'bg-robotic-blue/20'
    },
    {
      title: 'Certificates Issued',
      value: certificates.length,
      change: `+${recentCertificates.length} this period`,
      icon: Award,
      color: 'text-robotic-green',
      bgColor: 'bg-robotic-green/20'
    },
    {
      title: 'Active Certifications',
      value: activeCertifications.length,
      change: `${certifications.length - activeCertifications.length} inactive`,
      icon: BarChart3,
      color: 'text-primary-orange',
      bgColor: 'bg-primary-orange/20'
    },
    {
      title: 'Success Rate',
      value: `${certificates.length > 0 ? Math.round((certificates.filter(c => !c.revoked).length / certificates.length) * 100) : 0}%`,
      change: `${certificates.filter(c => c.revoked).length} revoked`,
      icon: TrendingUp,
      color: 'text-robotic-purple',
      bgColor: 'bg-robotic-purple/20'
    }
  ];

  const handleExportData = () => {
    const data = {
      users: users.length,
      certificates: certificates.length,
      certifications: certifications.length,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    dispatch(fetchUsers());
    dispatch(fetchCertificates());
    dispatch(fetchCertifications());
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-primary-gray">
              Monitor platform performance and user engagement
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button variant="primary" onClick={handleExportData}>
              <Download size={16} />
              Export Data
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon size={24} className={item.color} />
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-primary-white">
                        {item.value}
                      </p>
                      <p className="text-sm text-primary-gray">{item.title}</p>
                      <p className="text-xs text-robotic-green mt-1">{item.change}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card>
            <h3 className="text-xl font-bold text-primary-white mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-primary-gray/10 rounded-lg">
              <div className="text-center">
                <BarChart3 size={48} className="text-primary-gray mx-auto mb-4" />
                <p className="text-primary-gray">Chart visualization would go here</p>
                <p className="text-sm text-primary-gray mt-2">
                  {recentUsers.length} new users in the last {timeRange}
                </p>
              </div>
            </div>
          </Card>

          {/* Certificate Distribution */}
          <Card>
            <h3 className="text-xl font-bold text-primary-white mb-4">Certificate Distribution</h3>
            <div className="space-y-4">
              {certifications.slice(0, 5).map((cert) => {
                const certCertificates = certificates.filter(c => c.certification_id === cert.id);
                const percentage = certificates.length > 0 ? (certCertificates.length / certificates.length) * 100 : 0;
                
                return (
                  <div key={cert.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-white">{cert.name}</span>
                      <span className="text-primary-gray">{certCertificates.length} certificates</span>
                    </div>
                    <div className="w-full bg-primary-gray/20 rounded-full h-2">
                      <div 
                        className="bg-primary-orange h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-xl font-bold text-primary-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentCertificates.slice(0, 10).map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-3 bg-primary-gray/10 rounded-lg"
              >
                <div className="w-8 h-8 bg-robotic-green/20 rounded-full flex items-center justify-center">
                  <Award size={16} className="text-robotic-green" />
                </div>
                <div className="flex-1">
                  <p className="text-primary-white text-sm">
                    Certificate issued to {cert.user?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-primary-gray text-xs">
                    {cert.certification?.name} • {new Date(cert.issued_date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminAnalytics;