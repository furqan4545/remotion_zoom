// src/components/IntroComponent.tsx

import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { Animated, Fade, Scale } from 'remotion-animated';

interface IntroComponentProps {
  text: string;
  logoSrc?: string;
  durationInFrames: number;
}

export const IntroComponent: React.FC<IntroComponentProps> = ({
    text,
    logoSrc,
    durationInFrames,
  }) => {
    const frame = useCurrentFrame();
    const textDuration = Math.floor(durationInFrames * 0.4);
    const logoStart = textDuration;
    const logoDuration = durationInFrames - textDuration;
  
    // Split text into chunks of exactly 4 words (or less for the last line)
    const words = text.split(' ');
    const lines = [];
    for (let i = 0; i < words.length; i += 4) {
      // Pad shorter lines with empty strings to maintain alignment
      const line = words.slice(i, i + 4);
      while (line.length < 4) {
        line.push('');
      }
      lines.push(line.join(' ').trim()); // trim to remove extra spaces
    }
  
    return (
      <AbsoluteFill
        style={{
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Text animation */}
        <Animated
          animations={[
            Scale({ by: 1, initial: 0, duration: textDuration / 1.5 }),
            Fade({ to: 1, initial: 0, duration: textDuration / 1.5 }),
          ]}
        >
          <div style={{ 
            position: 'relative',
            top: '-10%',
            fontSize: 70, 
            textAlign: 'center', 
            color: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.1em', // Consistent spacing between lines
            fontFamily: 'monospace',
            // fontWeight: 'bold',
          }}>
            {lines.map((line, index) => (
              <div 
                key={index}
                style={{
                  width: '100%',
                  minWidth: '800px', // Adjust this value based on your needs
                  lineHeight: '1.2',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </Animated>
  
        {/* Logo animation remains the same */}
        {logoSrc && frame >= logoStart && (
          <div style={{ 
            position: 'absolute',
            top: '55%',
          }}>
            <Animated
              animations={[
                Scale({
                  by: 1,
                  initial: 0,
                  start: logoStart,
                  duration: logoDuration / 2,
                }),
                Fade({
                  to: 1,
                  initial: 0,
                  start: logoStart,
                  duration: logoDuration / 2,
                }),
              ]}
            >
              <Img src={logoSrc} style={{ width: 550, height: 550 }} />
            </Animated>
          </div>
        )}
      </AbsoluteFill>
    );
  };