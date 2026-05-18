import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { svg: 24, text: 'text-sm' },
  md: { svg: 32, text: 'text-base' },
  lg: { svg: 48, text: 'text-lg' },
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = ''
}) => {
  const { svg, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="logoGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle with gradient border */}
        <circle cx="24" cy="24" r="22" fill="none" stroke="url(#logoGradient1)" strokeWidth="1" opacity="0.3" />

        {/* Main "C" shape - left side */}
        <path
          d="M 14 12 Q 14 12 18 12 L 18 36 Q 18 36 14 36"
          fill="none"
          stroke="url(#logoGradient1)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        />

        {/* Main "V" shape - right side */}
        <path
          d="M 28 12 L 36 36 L 44 12"
          fill="none"
          stroke="url(#logoGradient2)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#logoGlow)"
        />

        {/* Accent dots for cinematic feel */}
        <circle cx="14" cy="12" r="1.5" fill="#06b6d4" opacity="0.8" />
        <circle cx="14" cy="36" r="1.5" fill="#06b6d4" opacity="0.8" />
        <circle cx="44" cy="12" r="1.5" fill="#6366f1" opacity="0.8" />
      </svg>

      {showText && (
        <span className={`font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent ${text}`}>
          CineVerse
        </span>
      )}
    </div>
  );
};
