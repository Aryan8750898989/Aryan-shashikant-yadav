import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="logo-grad-3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      
      {/* Outer C-shape top */}
      <path 
        d="M50 20C33.4315 20 20 33.4315 20 50C20 55.5228 24.4772 60 30 60C35.5228 60 40 55.5228 40 50C40 44.4772 44.4772 40 50 40C55.5228 40 60 35.5228 60 30C60 24.4772 55.5228 20 50 20Z" 
        fill="url(#logo-grad-1)" 
      />
      
      {/* Outer C-shape bottom */}
      <path 
        d="M50 80C33.4315 80 20 66.5685 20 50C20 44.4772 24.4772 40 30 40C35.5228 40 40 44.4772 40 50C40 55.5228 44.4772 60 50 60C55.5228 60 60 64.4772 60 70C60 75.5228 55.5228 80 50 80Z" 
        fill="url(#logo-grad-3)" 
      />

      {/* Connection and bulb */}
      <path 
        d="M50 40C55.5228 40 60 44.4772 60 50C60 55.5228 64.4772 60 70 60H75C83.2843 60 90 53.2843 90 45C90 36.7157 83.2843 30 75 30C66.7157 30 60 36.7157 60 45" 
        fill="url(#logo-grad-1)"
        opacity="0.8"
      />
      
      {/* Inner bulb/node */}
      <circle cx="50" cy="50" r="15" fill="url(#logo-grad-2)" />
      <path 
        d="M50 50H70C78.2843 50 85 56.7157 85 65C85 73.2843 78.2843 80 70 80C61.7157 80 55 73.2843 55 65" 
        fill="url(#logo-grad-3)"
        opacity="0.9"
      />
      
      {/* Rightmost bulb */}
      <circle cx="75" cy="50" r="15" fill="#EC4899" />
    </svg>
  );
};
