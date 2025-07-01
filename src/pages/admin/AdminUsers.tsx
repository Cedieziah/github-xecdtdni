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
  Award,
  RefreshCw,
  AlertTriangle,
  Database,
  Eye,
  Info
} from 'lucide-react';
import { RootState } from '../../store';
import { fetchUsers, updateUserRole, deleteUser } from '../../store/slices/adminSlice';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User as UserType } from '../../types';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface UserDatabaseStats {
  totalInProfiles: number;
  totalVisible: number;
  issues: string[];
  rawProfilesData?: any[];
  fetchError?: string;
}

const AdminUsers: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state: RootState) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [showDiagnostics, setShowDiagnostics] = useState(true); // Auto-show diagnostics
  const [databaseStats, setDatabaseStats] = useState<UserDatabaseStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    console.log('🔄 AdminUsers component mounted, fetching users...');
    dispatch(fetchUsers());
    // Automatically run diagnostics on component mount
    runUserDiagnostics();
  }, [dispatch]);

  // Log when users state changes
  useEffect(() => {
    console.log('👥 Users state updated:', {
      count: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        full_name: u.full_name,
        role: u.role,
        created_at: u.created_at
      }))
    });
  }, [users]);

  const runUserDiagnostics = async () => {
    setLoadingStats(true);
    console.log('🔍 Running comprehensive user management diagnostics...');
    
    try {
      // Get all profiles with detailed logging
      console.log('📊 Fetching profiles from database...');
      const { data: profiles, error: profilesError, count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      console.log('📋 Raw profiles data:', {
        count: profilesCount,
        dataLength: profiles?.length,
        error: profilesError,
        profiles: profiles?.map(p => ({
          id: p.id,
          email: p.email,
          username: p.username,
          full_name: p.full_name,
          role: p.role,
          created_at: p.created_at
        }))
      });

      // Get visible users (what the UI shows)
      const visibleUsers = users;
      console.log('👀 Visible users in UI:', {
        count: visibleUsers.length,
        users: visibleUsers.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username
        }))
      });

      const issues: string[] = [];

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        issues.push(`Profiles fetch error: ${profilesError.message}`);
      }

      if (profiles) {
        // Check for data consistency issues
        const profilesWithMissingData = profiles.filter(profile => 
          !profile.email || !profile.username
        );

        if (profilesWithMissingData.length > 0) {
          console.warn('⚠️ Profiles with missing data:', profilesWithMissingData);
          issues.push(`${profilesWithMissingData.length} profiles with missing required data`);
        }

        // Check for duplicate emails
        const emailCounts = profiles.reduce((acc, profile) => {
          acc[profile.email] = (acc[profile.email] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const duplicateEmails = Object.entries(emailCounts).filter(([_, count]) => count > 1);
        if (duplicateEmails.length > 0) {
          console.warn('⚠️ Duplicate emails found:', duplicateEmails);
          issues.push(`${duplicateEmails.length} duplicate email addresses found`);
        }

        // Check for duplicate usernames
        const usernameCounts = profiles.reduce((acc, profile) => {
          acc[profile.username] = (acc[profile.username] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const duplicateUsernames = Object.entries(usernameCounts).filter(([_, count]) => count > 1);
        if (duplicateUsernames.length > 0) {
          console.warn('⚠️ Duplicate usernames found:', duplicateUsernames);
          issues.push(`${duplicateUsernames.length} duplicate usernames found`);
        }

        // Check for discrepancy between database and UI
        const dbCount = profilesCount || profiles.length;
        const uiCount = visibleUsers.length;
        
        if (dbCount !== uiCount) {
          console.warn('⚠️ User count mismatch:', { database: dbCount, ui: uiCount });
          issues.push(`User count mismatch: ${dbCount} in database vs ${uiCount} visible in UI`);
          
          // Find missing users
          const dbUserIds = new Set(profiles.map(p => p.id));
          const uiUserIds = new Set(visibleUsers.map(u => u.id));
          
          const missingFromUI = profiles.filter(p => !uiUserIds.has(p.id));
          const extraInUI = visibleUsers.filter(u => !dbUserIds.has(u.id));
          
          if (missingFromUI.length > 0) {
            console.warn('👻 Users in database but not in UI:', missingFromUI);
            issues.push(`${missingFromUI.length} users exist in database but not visible in UI`);
          }
          
          if (extraInUI.length > 0) {
            console.warn('🔍 Users in UI but not in database:', extraInUI);
            issues.push(`${extraInUI.length} users visible in UI but not in database`);
          }
        }
      }

      const stats: UserDatabaseStats = {
        totalInProfiles: profilesCount || profiles?.length || 0,
        totalVisible: visibleUsers.length,
        issues,
        rawProfilesData: profiles || [],
        fetchError: profilesError?.message
      };

      setDatabaseStats(stats);

      console.log('📊 User diagnostics results:', {
        profiles: stats.totalInProfiles,
        visible: stats.totalVisible,
        issues: stats.issues,
        hasDiscrepancy: stats.totalInProfiles !== stats.totalVisible
      });

      if (stats.issues.length > 0) {
        toast.error(`Found ${stats.issues.length} user data issues. Check diagnostics for details.`);
      } else if (stats.totalInProfiles === stats.totalVisible) {
        toast.success('User data integrity check passed - all users are visible');
      }

    } catch (error: any) {
      console.error('💥 Diagnostics failed:', error);
      toast.error('Failed to run user diagnostics');
      setDatabaseStats({
        totalInProfiles: 0,
        totalVisible: users.length,
        issues: [`Diagnostics error: ${error.message}`],
        fetchError: error.message
      });
    } finally {
      setLoadingStats(false);
    }
  };

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

  const handleRefreshUsers = () => {
    console.log('🔄 Manual refresh triggered');
    dispatch(fetchUsers());
    runUserDiagnostics();
  };

  const handleForceRefresh = async () => {
    console.log('🔄 Force refresh - clearing cache and refetching');
    
    // Clear any potential cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Force refresh
    window.location.reload();
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
            <Button variant="secondary" onClick={() => setShowDiagnostics(!showDiagnostics)}>
              <Database size={16} />
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </Button>
            <Button variant="secondary" onClick={handleRefreshUsers}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleForceRefresh}>
              <RefreshCw size={16} />
              Force Refresh
            </Button>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-white">{users.length}</p>
              <p className="text-sm text-primary-gray">Visible Users</p>
            </div>
          </div>
        </div>

        {/* Diagnostics Panel */}
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-primary-orange/10 border-primary-orange/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-primary-white">User Database Diagnostics</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowRawData(!showRawData)}>
                    <Eye size={16} />
                    {showRawData ? 'Hide' : 'Show'} Raw Data
                  </Button>
                  <Button variant="ghost" size="sm" onClick={runUserDiagnostics} loading={loadingStats}>
                    <RefreshCw size={16} />
                    Refresh Diagnostics
                  </Button>
                </div>
              </div>

              {databaseStats ? (
                <div className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-black/50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-robotic-green">{databaseStats.totalInProfiles}</p>
                      <p className="text-xs text-primary-gray">Profile Records in DB</p>
                    </div>
                    <div className="bg-primary-black/50 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary-orange">{databaseStats.totalVisible}</p>
                      <p className="text-xs text-primary-gray">Visible in UI</p>
                    </div>
                    <div className="bg-primary-black/50 p-3 rounded-lg text-center">
                      <p className={`text-2xl font-bold ${
                        databaseStats.totalInProfiles === databaseStats.totalVisible 
                          ? 'text-robotic-green' 
                          : 'text-red-400'
                      }`}>
                        {databaseStats.totalInProfiles === databaseStats.totalVisible ? '✓' : '✗'}
                      </p>
                      <p className="text-xs text-primary-gray">Data Sync Status</p>
                    </div>
                  </div>

                  {/* Issues */}
                  {databaseStats.issues.length > 0 ? (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-400" />
                        <h4 className="font-semibold text-red-400">Issues Found</h4>
                      </div>
                      <ul className="space-y-1">
                        {databaseStats.issues.map((issue, index) => (
                          <li key={index} className="text-red-400 text-sm">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                        <h4 className="font-semibold text-green-400">All checks passed</h4>
                      </div>
                      <p className="text-green-400 text-sm mt-1">No data integrity issues found</p>
                    </div>
                  )}

                  {/* Raw Data Display */}
                  {showRawData && databaseStats.rawProfilesData && (
                    <div className="bg-primary-black/50 border border-primary-gray/30 rounded-lg p-4">
                      <h4 className="font-semibold text-primary-white mb-2">Raw Database Data</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <pre className="text-xs text-primary-gray whitespace-pre-wrap">
                          {JSON.stringify(databaseStats.rawProfilesData, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Troubleshooting Steps */}
                  {databaseStats.totalInProfiles !== databaseStats.totalVisible && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">Troubleshooting Steps</h4>
                      <ol className="text-blue-400 text-sm space-y-1 list-decimal list-inside">
                        <li>Check if the missing user has all required fields (email, username, role)</li>
                        <li>Verify the user's profile was created properly in the profiles table</li>
                        <li>Check for any RLS (Row Level Security) policies blocking access</li>
                        <li>Try refreshing the page or clearing browser cache</li>
                        <li>Check browser console for any JavaScript errors</li>
                      </ol>
                    </div>
                  )}

                  {/* Info Note */}
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-2">Diagnostic Information</h4>
                        <p className="text-blue-400 text-sm">
                          This diagnostic compares the total number of user profiles in the database with the number 
                          of users visible in this interface. If there's a mismatch, it indicates a data synchronization 
                          issue that needs investigation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-primary-gray">Click "Refresh Diagnostics" to analyze user data</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}

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
                All Users ({users.length})
              </Button>
              <Button
                variant={roleFilter === 'user' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRoleFilter('user')}
              >
                Candidates ({users.filter(u => u.role === 'user').length})
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
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
                          <p className="text-primary-gray text-xs">
                            @{user.username}
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

          {/* Table Footer with Summary */}
          <div className="border-t border-primary-gray/30 p-4">
            <div className="flex justify-between items-center text-sm text-primary-gray">
              <span>
                Showing {filteredUsers.length} of {users.length} users
                {searchTerm && ` (filtered by "${searchTerm}")`}
                {roleFilter !== 'all' && ` (${roleFilter} only)`}
              </span>
              <span>
                Total: {users.length} users loaded from database
                {databaseStats && databaseStats.totalInProfiles !== users.length && (
                  <span className="text-red-400 ml-2">
                    (⚠️ {databaseStats.totalInProfiles} in DB)
                  </span>
                )}
              </span>
            </div>
          </div>
        </Card>

        {filteredUsers.length === 0 && (
          <Card className="text-center py-12">
            <Users size={48} className="text-primary-gray mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-white mb-2">
              No users found
            </h3>
            <p className="text-primary-gray mb-4">
              {searchTerm || roleFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No users have registered yet'
              }
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <Button variant="ghost" onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}>
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminUsers;