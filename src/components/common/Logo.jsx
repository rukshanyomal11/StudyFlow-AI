// Logo component
import React from 'react';
import Link from 'next/link';

const Logo = ({ size = 'md', showText = true, href = '/', className = '' }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-lg' },
    md: { icon: 'w-8 h-8', text: 'text-xl' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl' },
  };

  const logoContent = (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Icon */}
      <div className={`${sizes[size].icon} bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
        <svg viewBox="0 0 24 24" fill="white" className="w-1/2 h-1/2">
          <path d="M12 2L3.09 8.26L4 21L12 17L20 21L20.91 8.26L12 2Z" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${sizes[size].text}`}>
          StudyFlow AI
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
