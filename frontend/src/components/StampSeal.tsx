import React from 'react';

interface StampSealProps {
  size?: number;
  className?: string;
  name?: string;
}

export const StampSeal: React.FC<StampSealProps> = ({ size = 95, className = '', name = 'B.N.V. Vinay' }) => {
  return (
    <div className={`stamp-seal-wrap ${className}`} style={{ display: 'inline-block' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Top Arc Path inside double circle */}
          <path id="stampTopArc" d="M 38,105 A 62,62 0 0,1 162,105" fill="none" />
        </defs>

        {/* Outer Ring Circle */}
        <circle cx="100" cy="100" r="75" fill="none" stroke="#116853" strokeWidth="4.5" />
        
        {/* Inner Concentric Circle */}
        <circle cx="100" cy="100" r="66" fill="none" stroke="#116853" strokeWidth="2" />

        {/* Top Curved Text: DURGA ENTERPRISE */}
        <text fontFamily="Inter, Arial, sans-serif" fontSize="12" fontWeight="800" fill="#116853" letterSpacing="1.5">
          <textPath href="#stampTopArc" startOffset="50%" textAnchor="middle">
            DURGA ENTERPRISE
          </textPath>
        </text>

        {/* Center Signature Name */}
        <text
          x="100"
          y="96"
          fontFamily="'Times New Roman', Times, Georgia, serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize={name.length > 14 ? "12" : "16"}
          fill="#116853"
          textAnchor="middle"
        >
          {name}
        </text>

        {/* Divider Line */}
        <line x1="72" y1="104" x2="128" y2="104" stroke="#116853" strokeWidth="1.5" />

        {/* Center D Badge Circle */}
        <circle cx="100" cy="115" r="7" fill="#116853" />
        <text x="100" y="118.5" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="8" fill="#ffffff" textAnchor="middle">
          D
        </text>

        {/* Sub-label AUTHORIZED SIGNATORY */}
        <text
          x="100"
          y="131"
          fontFamily="Inter, sans-serif"
          fontWeight="700"
          fontSize="7.5"
          fill="#0f5142"
          letterSpacing="0.8"
          textAnchor="middle"
        >
          AUTHORIZED SIGNATORY
        </text>
      </svg>
    </div>
  );
};
