import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, CheckCircle, XCircle } from 'lucide-react';

interface ThemePreviewProps {
  mode: 'dark' | 'light';
  fontSize: 'default' | 'medium' | 'large';
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ mode, fontSize }) => {
  // Calculate font size based on the selected option
  const getFontSize = (baseSize: number): string => {
    const multiplier = fontSize === 'medium' ? 1.15 : fontSize === 'large' ? 1.25 : 1;
    return `${baseSize * multiplier}px`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-lg overflow-hidden border ${
        mode === 'light' ? 'bg-white border border-gray-200' : 'bg-primary-black border border-primary-gray/30'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${
        mode === 'light' 
          ? 'border-gray-200 bg-gray-50' 
          : 'border-primary-gray/30 bg-primary-dark'
      }`}>
        <h3 className={`font-bold ${
          mode === 'light' ? 'text-gray-900' : 'text-primary-white'
        }`} style={{ fontSize: getFontSize(18) }}>
          Theme Preview
        </h3>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`p-3 rounded-lg border shadow-sm ${
            mode === 'light' 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-primary-gray/10 border border-primary-gray/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'light' ? 'bg-blue-100' : 'bg-robotic-blue/20'
              }`}>
                <Users size={16} className={
                  mode === 'light' ? 'text-blue-600' : 'text-robotic-blue'
                } />
              </div>
              <div>
                <p className={`font-bold ${
                  mode === 'light' ? 'text-gray-900' : 'text-primary-white'
                }`} style={{ fontSize: getFontSize(16) }}>
                  125
                </p>
                <p className={`text-xs ${
                  mode === 'light' ? 'text-gray-500' : 'text-primary-gray'
                }`}>
                  Users
                </p>
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-lg border shadow-sm ${
            mode === 'light' 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-primary-gray/10 border border-primary-gray/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mode === 'light' ? 'bg-green-100' : 'bg-robotic-green/20'
              }`}>
                <Award size={16} className={
                  mode === 'light' ? 'text-green-600' : 'text-robotic-green'
                } />
              </div>
              <div>
                <p className={`font-bold ${
                  mode === 'light' ? 'text-gray-900' : 'text-primary-white'
                }`} style={{ fontSize: getFontSize(16) }}>
                  48
                </p>
                <p className={`text-xs ${
                  mode === 'light' ? 'text-gray-500' : 'text-primary-gray'
                }`}>
                  Certificates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Table */}
        <div className={`rounded-lg overflow-hidden border shadow-sm ${
          mode === 'light' ? 'border-gray-200' : 'border-primary-gray/30'
        } mb-4`}>
          <table className="w-full border-collapse">
            <thead className={
              mode === 'light' ? 'bg-gray-50' : 'bg-primary-gray/10'
            }>
              <tr>
                <th className={`px-3 py-2 text-left text-xs font-medium ${
                  mode === 'light' ? 'text-gray-500' : 'text-primary-gray'
                }`} style={{ fontSize: getFontSize(12) }}>
                  Name
                </th>
                <th className={`px-3 py-2 text-left text-xs font-medium ${
                  mode === 'light' ? 'text-gray-500' : 'text-primary-gray'
                }`} style={{ fontSize: getFontSize(12) }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={
                mode === 'light' ? 'border-t border-gray-200' : 'border-t border-primary-gray/30'
              }>
                <td className={`px-3 py-2 ${
                  mode === 'light' ? 'text-gray-900' : 'text-primary-white'
                }`} style={{ fontSize: getFontSize(14) }}>
                  Sample Item 1
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    mode === 'light' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-robotic-green/20 text-robotic-green'
                  }`} style={{ fontSize: getFontSize(12) }}>
                    <CheckCircle size={12} className="mr-1" />
                    Active
                  </span>
                </td>
              </tr>
              <tr className={
                mode === 'light' ? 'border-t border-gray-200' : 'border-t border-primary-gray/30'
              }>
                <td className={`px-3 py-2 ${
                  mode === 'light' ? 'text-gray-900' : 'text-primary-white'
                }`} style={{ fontSize: getFontSize(14) }}>
                  Sample Item 2
                </td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    mode === 'light' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-red-500/20 text-red-400'
                  }`} style={{ fontSize: getFontSize(12) }}>
                    <XCircle size={12} className="mr-1" />
                    Inactive
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sample Form */}
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${
            mode === 'light' ? 'text-gray-700' : 'text-primary-white'
          }`} style={{ fontSize: getFontSize(14), fontWeight: 500 }}>
            Sample Input
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 rounded-lg border ${
              mode === 'light' 
                ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-400' 
                : 'border-primary-gray bg-primary-black text-primary-white placeholder-primary-gray/50'
            } focus:outline-none focus:ring-2 ${
              mode === 'light' ? 'focus:ring-blue-500' : 'focus:ring-primary-orange'
            }`}
            placeholder="Enter text here..."
            style={{ fontSize: getFontSize(14) }}
          />
        </div>

        {/* Sample Buttons */}
        <div className="flex gap-3">
          <button className={`px-4 py-2 rounded-lg font-medium ${
            mode === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-primary-orange hover:bg-orange-600 text-white'
          }`} style={{ fontSize: getFontSize(14) }}>
            Primary
          </button>
          <button className={`px-4 py-2 rounded-lg font-medium border shadow-sm ${
            mode === 'light' 
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'bg-primary-gray/20 border-primary-gray/30 text-primary-white hover:bg-primary-gray/30'
          }`} style={{ fontSize: getFontSize(14) }}>
            Secondary
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ThemePreview;