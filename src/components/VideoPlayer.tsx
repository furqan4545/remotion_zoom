// src/VideoPlayer.tsx
import React from "react";
import { OffthreadVideo, staticFile, AbsoluteFill } from "remotion";

export const VideoPlayer: React.FC = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("assets/screen_3.webm")} />
    </AbsoluteFill>
  );
};
