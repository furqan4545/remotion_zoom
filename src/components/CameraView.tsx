// src/CameraView.tsx
import React from 'react';
import { OffthreadVideo, Video, staticFile } from 'remotion';

interface CameraViewProps {
  // Position can be predefined positions or custom coordinates
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | { x: number; y: number };
  // Size of the camera widget
  width?: number;
  height?: number;
  // Roundness of the widget corners
  borderRadius?: number;
  // Border styles
  borderWidth?: number;
  borderColor?: string;
  borderGradient?: string;
  // Shadow effect
  boxShadow?: string;
  // Source of the camera video
  videoSrc: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  position = 'bottom-right',
  width = 200,
  height = 150,
  borderRadius = 20,
  borderWidth = 4,
  borderColor = 'transparent',
  borderGradient = 'linear-gradient(45deg, #f3ec78, #af4261)',
  boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)',
  videoSrc,
}) => {
  // Compute position styles based on the 'position' prop
  const positionStyles: React.CSSProperties = {};
  if (typeof position === 'string') {
    const offset = 20; // Margin from the edges
    switch (position) {
      case 'bottom-right':
        positionStyles.bottom = offset;
        positionStyles.right = offset;
        break;
      case 'bottom-left':
        positionStyles.bottom = offset;
        positionStyles.left = offset;
        break;
      case 'top-right':
        positionStyles.top = offset;
        positionStyles.right = offset;
        break;
      case 'top-left':
        positionStyles.top = offset;
        positionStyles.left = offset;
        break;
      default:
        positionStyles.bottom = offset;
        positionStyles.right = offset;
        break;
    }
  } else {
    // Custom x and y coordinates
    positionStyles.left = position.x;
    positionStyles.top = position.y;
  }

  return (
    <div
      style={{
        position: 'absolute',
        ...positionStyles,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: width + borderWidth * 2,
          height: height + borderWidth * 2,
          borderRadius: borderRadius + borderWidth,
          overflow: 'hidden',
          boxShadow,
          background: borderGradient,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: borderWidth,
            left: borderWidth,
            width,
            height,
            borderRadius,
            overflow: 'hidden',
            backgroundColor: borderColor,
          }}
        >
          <Video
            src={staticFile(videoSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    </div>
  );
};
