import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={`
        bg-primary-black border border-primary-gray/30 rounded-xl p-6
        shadow-lg backdrop-blur-sm
        ${glow ? 'shadow-primary-orange/20 animate-glow' : ''}
        ${hover ? 'hover:shadow-xl hover:border-primary-orange/50 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;