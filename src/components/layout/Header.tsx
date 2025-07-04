import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, User } from 'lucide-react';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import Button from '../ui/Button';
import ThemeToggle from '../theme/ThemeToggle';
import FontSizeControl from '../theme/FontSizeControl';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const { mode } = useSelector((state: RootState) => state.theme);

  return (
    <motion.header
      animate={{
        marginLeft: sidebarOpen ? 280 : 80,
        transition: { duration: 0.3, ease: 'easeInOut' }
      }}
      className="fixed top-0 right-0 h-16 bg-primary-black/80 backdrop-blur-sm border-b border-primary-gray/30 z-30 flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-4">
        <h1 className={`text-xl font-semibold ${mode === 'light' ? 'text-gray-900' : 'text-primary-white'}`}>
          Welcome back, {user?.full_name}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <ThemeToggle size="sm" />
          <FontSizeControl compact />
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary-gray/20 rounded-lg">
          <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="text-sm">
            <p className={`font-medium ${mode === 'light' ? 'text-gray-900' : 'text-primary-white'}`}>{user?.full_name}</p>
            <p className={`text-xs capitalize ${mode === 'light' ? 'text-gray-600' : 'text-primary-gray'}`}>{user?.role}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;