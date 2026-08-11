import React from 'react';

interface HandwrittenSignatureProps {
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const HandwrittenSignature: React.FC<HandwrittenSignatureProps> = ({
  width = 130,
  height = 42,
  color = '#0F2027',
  className = '',
}) => {
  return (
    <div className={`signature-wrap ${className}`} style={{ display: 'inline-block' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 240 80"
        width={width}
        height={height}
        style={{ overflow: 'visible' }}
      >
        <g fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {/* 'B' Initial */}
          <path d="M 18,22 L 18,65 M 18,22 Q 35,18 35,36 Q 35,46 18,47 Q 38,47 38,62 Q 38,68 18,65" />
          {/* Dot after B */}
          <circle cx="44" cy="62" r="2" fill={color} stroke="none" />

          {/* 'N' Initial */}
          <path d="M 54,63 L 54,32 L 72,63 L 72,32" />
          {/* Dot after N */}
          <circle cx="78" cy="62" r="2" fill={color} stroke="none" />

          {/* 'V' Initial */}
          <path d="M 88,34 L 98,63 L 112,34" />
          {/* Dot after V */}
          <circle cx="118" cy="62" r="2" fill={color} stroke="none" />

          {/* 'V' in Vinay */}
          <path d="M 130,34 L 140,63 L 152,34" />
          
          {/* 'i' in Vinay */}
          <path d="M 158,44 L 158,63" />
          <circle cx="158" cy="35" r="2" fill={color} stroke="none" />

          {/* 'n' in Vinay */}
          <path d="M 166,63 L 166,44 Q 174,40 180,48 L 180,63" />

          {/* 'a' in Vinay */}
          <path d="M 194,54 Q 186,42 194,44 Q 200,46 200,54 L 200,63 M 200,50 Q 192,64 188,58" />

          {/* 'y' in Vinay with cursive descending loop */}
          <path d="M 206,44 L 214,60 Q 220,72 210,80 Q 200,85 195,74" />
        </g>
      </svg>
    </div>
  );
};
