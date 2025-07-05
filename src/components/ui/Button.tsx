import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-robotic font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';
  const { mode } = useSelector((state: RootState) => state.theme);
  
  const variantClasses = {
    primary: 'bg-primary-orange hover:bg-orange-600 text-white focus:ring-primary-orange shadow-lg hover:shadow-xl',
    secondary: mode === 'light' 
      ? 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500' 
      : 'bg-primary-gray hover:bg-gray-600 text-primary-white focus:ring-primary-gray',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: mode === 'light'
      ? 'bg-transparent hover:bg-gray-100 text-primary-orange border border-primary-orange hover:bg-primary-orange hover:text-white'
      : 'bg-transparent hover:bg-primary-gray/20 text-primary-orange border border-primary-orange hover:bg-primary-orange hover:text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </motion.button>
  );
};

export default Button;