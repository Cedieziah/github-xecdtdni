import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, Search } from 'lucide-react';
import Button from './Button';

interface NonAuthHeaderProps {
  onSearch?: (term: string) => void;
  showSearch?: boolean;
}

const NonAuthHeader: React.FC<NonAuthHeaderProps> = ({ 
  onSearch,
  showSearch = false
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleSignUp = () => {
    navigate('/auth');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="bg-primary-black/90 backdrop-blur-sm border-b border-primary-gray/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold text-primary-white">EIRA</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {showSearch && (
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                />
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray" />
              </form>
            )}
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/courses')}
              className="text-primary-white/70 hover:text-primary-orange transition-colors"
            >
              Courses
            </Button>
            
            <Button 
              variant="ghost"
              onClick={handleLogin}
              className="text-primary-white/70 hover:text-primary-orange transition-colors"
            >
              <LogIn size={18} />
              Log In
            </Button>
            
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSignUp}
            >
              <UserPlus size={18} />
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="!p-2"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-primary-gray/30 py-4"
          >
            <div className="flex flex-col space-y-4">
              {showSearch && (
                <form onSubmit={handleSearchSubmit} className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-gray" />
                </form>
              )}
              
              <Button 
                variant="ghost" 
                onClick={() => {
                  navigate('/courses');
                  setMobileMenuOpen(false);
                }}
                className="text-primary-white/70 hover:text-primary-orange transition-colors text-left"
              >
                Courses
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => {
                  handleLogin();
                  setMobileMenuOpen(false);
                }}
                className="text-primary-white/70 hover:text-primary-orange transition-colors text-left"
              >
                <LogIn size={18} className="mr-2" />
                Log In
              </Button>
              
              <Button 
                variant="primary" 
                onClick={() => {
                  handleSignUp();
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                <UserPlus size={18} />
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default NonAuthHeader;