import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const NonAuthFooter: React.FC = () => {
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-black border-t border-primary-gray/30 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold text-primary-white">EIRA</span>
            </div>
            <p className="text-primary-white/70 mb-4">
              Erovoutika International Academy - Leading the future of technology education in the Philippines.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary-orange flex-shrink-0 mt-1" />
                <p className="text-primary-white/70 text-sm">
                  123 Tech Hub Street, Makati City, Metro Manila
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-primary-orange" />
                <p className="text-primary-white/70 text-sm">
                  +63 2 8123 4567
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-primary-orange" />
                <p className="text-primary-white/70 text-sm">
                  info@eira.academy
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-primary-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm"
                >
                  Courses
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/auth')}
                  className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm"
                >
                  Sign In
                </button>
              </li>
            </ul>
          </div>
          
          {/* Programs */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-primary-white mb-4">Programs</h3>
            <ul className="space-y-2">
              <li>
                <button className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm">
                  Cybersecurity
                </button>
              </li>
              <li>
                <button className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm">
                  Electronics
                </button>
              </li>
              <li>
                <button className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm">
                  Robotics
                </button>
              </li>
              <li>
                <button className="text-primary-white/70 hover:text-primary-orange transition-colors text-sm">
                  IT Fundamentals
                </button>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold text-primary-white mb-4">Stay Updated</h3>
            <p className="text-primary-white/70 text-sm mb-4">
              Subscribe to our newsletter for the latest courses and industry insights.
            </p>
            <form className="space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2 bg-primary-black border border-primary-gray rounded-lg text-primary-white placeholder-primary-gray/50 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-orange hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-primary-gray/30 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-white/70 text-sm text-center md:text-left">
            © {currentYear} Erovoutika International Academy. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">
              Privacy Policy
            </button>
            <button className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">
              Terms of Service
            </button>
            <button className="text-primary-white/70 hover:text-primary-orange text-sm transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NonAuthFooter;