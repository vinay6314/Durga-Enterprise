import React from 'react';

interface DurgaSealProps {
  size?: number;
  className?: string;
  color?: string;
}

export const DurgaSeal: React.FC<DurgaSealProps> = ({ size = 80, className = '', color = '#116853' }) => {
  return (
    <div className={`durga-seal-wrap ${className}`} style={{ display: 'inline-block' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Top Arc for DURGA ENTERPRISE */}
          <path id="sealTopArcPath" d="M 32,100 A 68,68 0 0,1 168,100" fill="none" />
          {/* Bottom Arc for AUTHORIZED SEAL */}
          <path id="sealBottomArcPath" d="M 32,100 A 68,68 0 0,0 168,100" fill="none" />
        </defs>

        {/* Outer Ring Circle */}
        <circle cx="100" cy="100" r="76" fill="none" stroke={color} strokeWidth="4.5" />
        
        {/* Inner Concentric Circle */}
        <circle cx="100" cy="100" r="66" fill="none" stroke={color} strokeWidth="1.8" />

        {/* Top Curved Text: DURGA ENTERPRISE */}
        <text fontFamily="Inter, Arial, sans-serif" fontSize="12" fontWeight="800" fill={color} letterSpacing="2">
          <textPath href="#sealTopArcPath" startOffset="50%" textAnchor="middle">
            DURGA ENTERPRISE
          </textPath>
        </text>

        {/* Center Capital D */}
        <text
          x="100"
          y="114"
          fontFamily="Inter, Arial, sans-serif"
          fontWeight="800"
          fontSize="42"
          fill={color}
          textAnchor="middle"
        >
          D
        </text>

        {/* Bottom Curved Text: AUTHORIZED SEAL */}
        <text fontFamily="Inter, Arial, sans-serif" fontSize="9.5" fontWeight="700" fill={color} letterSpacing="2">
          <textPath href="#sealBottomArcPath" startOffset="50%" textAnchor="middle">
            AUTHORIZED SEAL
          </textPath>
        </text>
      </svg>
    </div>
  );
};
