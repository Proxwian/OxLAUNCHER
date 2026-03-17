import React, { memo } from 'react';

const Logo = ({ size, pointerCursor }) => {
  return (
    <svg
      version="1.1"
      x="0px"
      y="0px"
      viewBox="0 0 100 100"
      css={{ width: size, height: size }}
      xmlSpace="preserve"
    >
      {/* 3D Cube - Isometric */}
      <g>
        {/* Top face */}
        <polygon
          css={{ fill: '#5a3d42' }}
          points="50,15 80,32 50,49 20,32"
        />
        {/* Front right face */}
        <polygon
          css={{ fill: '#6D4D52' }}
          points="50,49 80,32 80,68 50,85"
        />
        {/* Front left face */}
        <polygon
          css={{ fill: '#4a3236' }}
          points="50,49 20,32 20,68 50,85"
        />
        {/* Bold X */}
        <g
          css={{
            fill: 'none',
            stroke: '#ffffff',
            strokeWidth: 6,
            strokeLinecap: 'round'
          }}
        >
          {/* Left stroke */}
          <line x1="35" y1="35" x2="65" y2="65" />
          {/* Right stroke */}
          <line x1="65" y1="35" x2="35" y2="65" />
        </g>
      </g>
    </svg>
  );
};

export default memo(Logo);
