// src/VideoPlayer.tsx
import React from "react";
import { Video, staticFile } from "remotion";

export const VideoPlayer: React.FC = () => {
  return <Video src={staticFile("assets/screen-1.webm")} />;
};
