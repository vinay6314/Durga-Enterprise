import React from 'react';

interface DurgaLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const DurgaLogo: React.FC<DurgaLogoProps> = ({
  size = 36,
  showText = false,
  textColor = '#ffffff',
  className = '',
}) => {
  return (
    <div className={`durga-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ flexShrink: 0 }}
      >
        {/* Dark Emerald Outer Circle */}
        <circle cx="100" cy="100" r="95" fill="#116853" />
        
        {/* Light Mint Letter 'D' */}
        <path
          d="M 68 55 H 102 C 124 55, 138 68, 138 100 C 138 132, 124 145, 102 145 H 68 Z"
          fill="none"
          stroke="#dcf5eb"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Orange Accent Dot */}
        <circle cx="138" cy="62" r="10" fill="#e25829" />
      </svg>

      {showText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: `${Math.max(1, size * 0.45)}px`,
            color: textColor,
            letterSpacing: '-0.3px',
          }}
        >
          Durga Enterprise
        </span>
      )}
    </div>
  );
};
