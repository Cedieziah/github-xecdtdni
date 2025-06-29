import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter,
  Users,
  Shield,
  User,
  Mail,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Award
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchUsers, updateUserRole, deleteUser } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User as UserType } from '../../types';
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      dispatch(updateUserRole({ userId, role: newRole }));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      dispatch(deleteUser(userId));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Users Management
            </h1>
            <p className="text-primary-gray">
              Manage user accounts and permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-white">{users.length}</p>
              <p className="text-sm text-primary-gray">Total Users</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-robotic-blue/20 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-robotic-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {users.filter(u => u.role === 'user').length}
                </p>
                <p className="text-sm text-primary-gray">Candidates</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-orange/20 rounded-lg flex items-center justify-center">
                <Shield size={24} className="text-primary-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-primary-gray">Administrators</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-robotic-green/20 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-robotic-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-white">
                  {users.filter(u => u.created_at && new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </p>
                <p className="text-sm text-primary-gray">New This Month</p>
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
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRoleFilter('all')}
              >
                All Users
              </Button>
              <Button
                variant={roleFilter === 'user' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRoleFilter('user')}
              >
                Candidates
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admins
              </Button>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-gray/30">
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">User</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Role</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Joined</th>
                  <th className="text-left py-4 px-2 text-primary-gray font-medium">Status</th>
                  <th className="text-right py-4 px-2 text-primary-gray font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-primary-gray/10 hover:bg-primary-gray/5"
                  >
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-orange/20 rounded-full flex items-center justify-center">
                          <User size={20} className="text-primary-orange" />
                        </div>
                        <div>
                          <p className="text-primary-white font-medium">
                            {user.full_name || 'No name'}
                          </p>
                          <p className="text-primary-gray text-sm">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        {user.role === 'admin' ? (
                          <Shield size={16} className="text-primary-orange" />
                        ) : (
                          <User size={16} className="text-robotic-blue" />
                        )}
                        <span className={`text-sm font-medium capitalize ${
                          user.role === 'admin' ? 'text-primary-orange' : 'text-robotic-blue'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2 text-primary-gray text-sm">
                        <Calendar size={16} />
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-robotic-green/20 text-robotic-green">
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                          className="px-2 py-1 bg-primary-black border border-primary-gray rounded text-primary-white text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredUsers.length === 0 && (
          <Card className="text-center py-12">
            <Users size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No users found
            </h3>
            <p className="text-primary-gray">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No users have registered yet'
              }
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;