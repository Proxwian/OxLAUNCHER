import React from 'react';
import styled from 'styled-components';

const Logo = styled.svg`
  width: ${props => props.size}px;
  cursor: ${props => (props.pointer ? 'cursor' : 'pointer')};
  &:hover {
    .cube-top {
      fill: #4a2d31;
    }
    .cube-front {
      fill: #5a3d42;
    }
    .cube-left {
      fill: #3a2226;
    }
  }
`;

const HorizontalLogo = ({ size, pointer, onClick }) => {
  return (
    <Logo
      version="1.1"
      x="0px"
      pointer={pointer}
      y="0px"
      viewBox="0 0 100 100"
      size={size}
      fill="none"
      xmlSpace="preserve"
      onClick={onClick}
    >
      {/* 3D Cube - Isometric */}
      <g>
        {/* Top face */}
        <polygon
          className="cube-top"
          points="50,15 80,32 50,49 20,32"
          fill="#5a3d42"
        />
        {/* Front right face */}
        <polygon
          className="cube-front"
          points="50,49 80,32 80,68 50,85"
          fill="#6D4D52"
        />
        {/* Front left face */}
        <polygon
          className="cube-left"
          points="50,49 20,32 20,68 50,85"
          fill="#4a3236"
        />
        {/* Bold X */}
        <g
          className="x-mark"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
        >
          {/* Left stroke */}
          <line x1="35" y1="35" x2="65" y2="65" />
          {/* Right stroke */}
          <line x1="65" y1="35" x2="35" y2="65" />
        </g>
      </g>
    </Logo>
  );
};

export default HorizontalLogo;
