import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald' | 'none';
  onClick?: () => void;
  hoverEffect?: boolean;
  id?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowColor = 'none',
  onClick,
  hoverEffect = true,
  id
}) => {
  const glowStyles = {
    blue: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] hover:border-blue-500/40',
    purple: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-purple-500/40',
    cyan: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-500/40',
    emerald: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:border-emerald-500/40',
    none: 'hover:border-white/20'
  };

  return (
    <motion.div
      id={id}
      whileHover={hoverEffect ? { y: -2, scale: 1.002 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        relative overflow-hidden
        glass
        rounded-3xl
        shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]
        transition-all duration-300
        ${glowStyles[glowColor]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Subtle top ambient glare line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};
