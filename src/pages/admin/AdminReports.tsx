import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Users,
  Award,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchUsers, fetchCertificates, fetchCertifications } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { format } from 'date-fns';

const AdminReports: React.FC = () => {
  const dispatch = useDispatch();
  const { users, certificates, certifications } = useSelector((state: RootState) => state.admin);
  const [reportType, setReportType] = useState<'users' | 'certificates' | 'certifications' | 'overview'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCertificates());
    dispatch(fetchCertifications());
  }, [dispatch]);

  const generateReport = (type: string) => {
    let reportData: any = {};
    const timestamp = new Date().toISOString();

    switch (type) {
      case 'users':
        reportData = {
          title: 'Users Report',
          generatedAt: timestamp,
          totalUsers: users.length,
          adminUsers: users.filter(u => u.role === 'admin').length,
          regularUsers: users.filter(u => u.role === 'user').length,
          recentUsers: users.filter(u => 
            new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          users: users.map(u => ({
            id: u.id,
            name: u.full_name,
            email: u.email,
            role: u.role,
            joinDate: u.created_at
          }))
        };
        break;

      case 'certificates':
        reportData = {
          title: 'Certificates Report',
          generatedAt: timestamp,
          totalCertificates: certificates.length,
          activeCertificates: certificates.filter(c => !c.revoked).length,
          revokedCertificates: certificates.filter(c => c.revoked).length,
          recentCertificates: certificates.filter(c => 
            new Date(c.issued_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          certificates: certificates.map(c => ({
            id: c.id,
            certificateNumber: c.certificate_number,
            recipient: c.user?.full_name,
            certification: c.certification?.name,
            issuedDate: c.issued_date,
            status: c.revoked ? 'Revoked' : 'Active'
          }))
        };
        break;

      case 'certifications':
        reportData = {
          title: 'Certifications Report',
          generatedAt: timestamp,
          totalCertifications: certifications.length,
          activeCertifications: certifications.filter(c => c.is_active).length,
          inactiveCertifications: certifications.filter(c => !c.is_active).length,
          certifications: certifications.map(c => ({
            id: c.id,
            name: c.name,
            provider: c.provider,
            duration: c.duration,
            passingScore: c.passing_score,
            totalQuestions: c.total_questions,
            status: c.is_active ? 'Active' : 'Inactive',
            createdAt: c.created_at
          }))
        };
        break;

      default:
        reportData = {
          title: 'Platform Overview Report',
          generatedAt: timestamp,
          summary: {
            totalUsers: users.length,
            totalCertifications: certifications.length,
            totalCertificates: certificates.length,
            successRate: certificates.length > 0 ? 
              Math.round((certificates.filter(c => !c.revoked).length / certificates.length) * 100) : 0
          },
          userBreakdown: {
            admins: users.filter(u => u.role === 'admin').length,
            candidates: users.filter(u => u.role === 'user').length
          },
          certificateBreakdown: {
            active: certificates.filter(c => !c.revoked).length,
            revoked: certificates.filter(c => c.revoked).length
          }
        };
    }

    return reportData;
  };

  const downloadReport = (type: string, format: 'json' | 'csv' = 'json') => {
    const reportData = generateReport(type);
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format for tabular data
      let csvContent = '';
      if (type === 'users' && reportData.users) {
        csvContent = 'ID,Name,Email,Role,Join Date\n';
        csvContent += reportData.users.map((u: any) => 
          `${u.id},${u.name},${u.email},${u.role},${u.joinDate}`
        ).join('\n');
      } else if (type === 'certificates' && reportData.certificates) {
        csvContent = 'ID,Certificate Number,Recipient,Certification,Issued Date,Status\n';
        csvContent += reportData.certificates.map((c: any) => 
          `${c.id},${c.certificateNumber},${c.recipient},${c.certification},${c.issuedDate},${c.status}`
        ).join('\n');
      }
      
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const reportTypes = [
    { id: 'overview', label: 'Platform Overview', icon: BarChart3 },
    { id: 'users', label: 'Users Report', icon: Users },
    { id: 'certificates', label: 'Certificates Report', icon: Award },
    { id: 'certifications', label: 'Certifications Report', icon: FileText }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Reports & Analytics
            </h1>
            <p className="text-primary-gray">
              Generate and download comprehensive platform reports
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Report Type Selection */}
        <Card>
          <h3 className="text-lg font-bold text-primary-white mb-4">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    reportType === type.id
                      ? 'border-primary-orange bg-primary-orange/10'
                      : 'border-primary-gray/30 hover:border-primary-orange/50'
                  }`}
                >
                  <Icon size={24} className={`mx-auto mb-2 ${
                    reportType === type.id ? 'text-primary-orange' : 'text-primary-gray'
                  }`} />
                  <p className={`text-sm font-medium ${
                    reportType === type.id ? 'text-primary-orange' : 'text-primary-white'
                  }`}>
                    {type.label}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Report Preview */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary-white">
              {reportTypes.find(t => t.id === reportType)?.label} Preview
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => downloadReport(reportType, 'csv')}
                disabled={reportType === 'overview'}
              >
                <Download size={16} />
                Download CSV
              </Button>
              <Button 
                variant="primary" 
                onClick={() => downloadReport(reportType, 'json')}
              >
                <Download size={16} />
                Download JSON
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {reportType === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-primary-gray/10 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary-white">{users.length}</p>
                  <p className="text-sm text-primary-gray">Total Users</p>
                </div>
                <div className="bg-primary-gray/10 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary-white">{certifications.length}</p>
                  <p className="text-sm text-primary-gray">Certifications</p>
                </div>
                <div className="bg-primary-gray/10 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary-white">{certificates.length}</p>
                  <p className="text-sm text-primary-gray">Certificates Issued</p>
                </div>
                <div className="bg-primary-gray/10 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-primary-white">
                    {certificates.length > 0 ? Math.round((certificates.filter(c => !c.revoked).length / certificates.length) * 100) : 0}%
                  </p>
                  <p className="text-sm text-primary-gray">Success Rate</p>
                </div>
              </div>
            )}

            {reportType === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-gray/30">
                      <th className="text-left py-2 text-primary-gray">Name</th>
                      <th className="text-left py-2 text-primary-gray">Email</th>
                      <th className="text-left py-2 text-primary-gray">Role</th>
                      <th className="text-left py-2 text-primary-gray">Join Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b border-primary-gray/10">
                        <td className="py-2 text-primary-white">{user.full_name || 'N/A'}</td>
                        <td className="py-2 text-primary-gray">{user.email}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin' ? 'bg-primary-orange/20 text-primary-orange' : 'bg-robotic-blue/20 text-robotic-blue'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-2 text-primary-gray">
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length > 10 && (
                  <p className="text-center text-primary-gray mt-4">
                    Showing 10 of {users.length} users. Download full report for complete data.
                  </p>
                )}
              </div>
            )}

            {reportType === 'certificates' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-gray/30">
                      <th className="text-left py-2 text-primary-gray">Certificate #</th>
                      <th className="text-left py-2 text-primary-gray">Recipient</th>
                      <th className="text-left py-2 text-primary-gray">Certification</th>
                      <th className="text-left py-2 text-primary-gray">Issued</th>
                      <th className="text-left py-2 text-primary-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.slice(0, 10).map((cert) => (
                      <tr key={cert.id} className="border-b border-primary-gray/10">
                        <td className="py-2 text-primary-white">#{cert.certificate_number}</td>
                        <td className="py-2 text-primary-gray">{cert.user?.full_name || 'N/A'}</td>
                        <td className="py-2 text-primary-white">{cert.certification?.name}</td>
                        <td className="py-2 text-primary-gray">
                          {format(new Date(cert.issued_date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            cert.revoked ? 'bg-red-500/20 text-red-400' : 'bg-robotic-green/20 text-robotic-green'
                          }`}>
                            {cert.revoked ? 'Revoked' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {certificates.length > 10 && (
                  <p className="text-center text-primary-gray mt-4">
                    Showing 10 of {certificates.length} certificates. Download full report for complete data.
                  </p>
                )}
              </div>
            )}

            {reportType === 'certifications' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary-gray/30">
                      <th className="text-left py-2 text-primary-gray">Name</th>
                      <th className="text-left py-2 text-primary-gray">Provider</th>
                      <th className="text-left py-2 text-primary-gray">Duration</th>
                      <th className="text-left py-2 text-primary-gray">Questions</th>
                      <th className="text-left py-2 text-primary-gray">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.map((cert) => (
                      <tr key={cert.id} className="border-b border-primary-gray/10">
                        <td className="py-2 text-primary-white">{cert.name}</td>
                        <td className="py-2 text-primary-gray">{cert.provider}</td>
                        <td className="py-2 text-primary-gray">{cert.duration} min</td>
                        <td className="py-2 text-primary-gray">{cert.total_questions}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            cert.is_active ? 'bg-robotic-green/20 text-robotic-green' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {cert.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminReports;