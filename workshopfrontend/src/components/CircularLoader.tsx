import React from 'react';
import './CircularLoader.css';

interface CircularLoaderProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  thickness?: number;
  showBackground?: boolean;
  message?: string;
}

const CircularLoader: React.FC<CircularLoaderProps> = ({
  size = 'medium',
  color = '#ffd600',
  thickness = 4,
  showBackground = true,
  message = 'Loading...'
}) => {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 64
  };

  const loaderSize = sizeMap[size];

  return (
    <>
      {showBackground && <div className="loader-background" />}
      <div className="loader-container">
        <div 
          className="circular-loader"
          style={{
            width: loaderSize,
            height: loaderSize,
            borderWidth: thickness,
            borderTopColor: color
          }}
        />
        {message && (
          <div className="loader-message" style={{ color }}>
            {message}
          </div>
        )}
      </div>
    </>
  );
};

export default CircularLoader; 