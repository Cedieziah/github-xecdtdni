import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  Settings,
  Award,
  BookOpen,
  BarChart3,
  LogOut,
  Shield,
  TrendingUp,
  Menu
} from 'lucide-react';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';
import Button from '../ui/Button';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const { mode } = useSelector((state: RootState) => state.theme);
  const location = useLocation();

  const adminNavItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/admin/certifications', icon: Shield, label: 'Certifications' },
    { path: '/app/admin/questions', icon: HelpCircle, label: 'Questions' },
    { path: '/app/admin/users', icon: Users, label: 'Users' },
    { path: '/app/admin/certificates', icon: Award, label: 'Certificates' },
    { path: '/app/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/admin/reports', icon: TrendingUp, label: 'Reports' },
    { path: '/app/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const candidateNavItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/app/certifications', icon: BookOpen, label: 'Certifications' },
    { path: '/app/certificates', icon: Award, label: 'My Certificates' },
    { path: '/app/profile', icon: Users, label: 'Profile' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : candidateNavItems;

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Get platform name from settings or use default
  const getPlatformName = () => {
    try {
      const savedSettings = localStorage.getItem('platformSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.platformName || 'EIRA';
      }
    } catch (error) {
      console.error('Error loading platform name from settings:', error);
    }
    return 'EIRA'; // Default to EIRA
  };

  const platformName = getPlatformName();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarOpen ? 280 : 80,
        transition: { duration: 0.3, ease: 'easeInOut' }
      }}
      className={`fixed left-0 top-0 h-full border-r z-40 ${
        mode === 'light' 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-primary-dark border-primary-gray/30'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Menu Button */}
        <div className={`p-6 border-b ${
          mode === 'light' ? 'border-gray-200' : 'border-primary-gray/30'
        }`}>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleSidebar())}
              className="!p-2"
            >
              <Menu size={20} />
            </Button>
            {sidebarOpen && (
              <motion.div
                animate={{
                  opacity: sidebarOpen ? 1 : 0,
                  scale: sidebarOpen ? 1 : 0.8
                }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-primary-orange rounded-lg flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <span className={`text-xl font-bold ${
                  mode === 'light' ? 'text-gray-900' : 'text-primary-white'
                }`}>
                  {platformName}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-6 ${
          mode === 'light' ? 'text-gray-700' : ''
        }`}>
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-primary-orange text-white shadow-lg'
                        : mode === 'light'
                          ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          : 'text-primary-white/70 hover:text-white hover:bg-primary-gray/20'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className={`p-4 border-t ${
          mode === 'light' ? 'border-gray-200' : 'border-primary-gray/30'
        }`}>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg transition-all duration-200 ${
              mode === 'light' 
                ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;