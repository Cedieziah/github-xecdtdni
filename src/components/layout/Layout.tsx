import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary-black to-primary-dark">
      <Sidebar />
      <Header />
      
      <motion.main
        animate={{
          marginLeft: sidebarOpen ? 280 : 80,
          transition: { duration: 0.3, ease: 'easeInOut' }
        }}
        className="pt-16 min-h-screen"
      >
        <div className="p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
};

export default Layout;