import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter,
  Award,
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchCertificates, revokeCertificate } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Certificate } from '../../types';
import { format } from 'date-fns';

const AdminCertificates: React.FC = () => {
  const dispatch = useDispatch();
  const { certificates, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  useEffect(() => {
    dispatch(fetchCertificates());
  }, [dispatch]);

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.certificate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.certification?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && !cert.revoked) ||
                         (statusFilter === 'revoked' && cert.revoked);
    return matchesSearch && matchesStatus;
  });

  const handleRevokeCertificate = async (certificateId: string) => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      dispatch(revokeCertificate(certificateId));
    }
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Generate and download PDF certificate
    console.log('Download certificate:', certificate.id);
  };

  const handleViewCertificate = (certificate: Certificate) => {
    // Open certificate in new window
    window.open(`/certificate/${certificate.verification_hash}`, '_blank');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Certificates Management
            </h1>
            <p className="text-primary-gray">
              Monitor and manage issued certificates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-white">{certificates.length}</p>
              <p className="text-sm text-primary-gray">Total Certificates</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-robotic-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {certificates.filter(c => !c.revoked).length}
                </p>
                <p className="text-sm text-primary-gray">Active</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {certificates.filter(c => c.revoked).length}
                </p>
                <p className="text-sm text-primary-gray">Revoked</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-primary-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {certificates.filter(c => 
                    new Date(c.issued_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p className="text-sm text-primary-gray">This Month</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-robotic-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {certificates.filter(c => 
                    new Date(c.issued_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p className="text-sm text-primary-gray">This Week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'revoked' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter('revoked')}
              >
                Revoked
              </Button>
            </div>
          </div>
        </Card>

        {/* Certificates Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-gray/30">
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Certificate</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Recipient</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Certification</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Issued</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Status</th>
                  <th className="text-right py-4 px-2 text-primary-gray font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCertificates.map((certificate, index) => (
                  <motion.tr
                    key={certificate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-primary-gray/10 hover:bg-primary-gray/5"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                          <Award size={20} className="text-primary-orange" />
                        </div>
                        <div>
                          <p className="text-primary-white font-medium">
                            #{certificate.certificate_number}
                          </p>
                          <p className="text-primary-gray text-sm">
                            {certificate.verification_hash.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-robotic-blue" />
                        <span className="text-primary-white">
                          {certificate.user?.full_name || 'Unknown User'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-robotic-purple" />
                        <span className="text-primary-white">
                          {certificate.certification?.name || 'Unknown Certification'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 text-primary-gray text-sm">
                        <Calendar size={16} />
                        {format(new Date(certificate.issued_date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {certificate.revoked ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          <XCircle size={12} className="mr-1" />
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-robotic-green/20 text-robotic-green">
                          <CheckCircle size={12} className="mr-1" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCertificate(certificate)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadCertificate(certificate)}
                        >
                          <Download size={16} />
                        </Button>
                        {!certificate.revoked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeCertificate(certificate.id)}
                            className="hover:bg-red-500/20 hover:text-red-400"
                          >
                            <XCircle size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredCertificates.length === 0 && (
          <Card className="text-center py-12">
            <Award size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No certificates found
            </h3>
            <p className="text-primary-gray">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No certificates have been issued yet'
              }
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminCertificates;