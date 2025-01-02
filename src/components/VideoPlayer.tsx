// src/Video.tsx

import { Composition } from "remotion";
import React from "react";
import MyVideoComposition from "./MyVideoComposition";

const Main: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: "black" }}>
      {/* Background Video */}
      <video
        src="/background.mp4"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        autoPlay
        muted
        loop
      />

      {/* Overlaying Smooth Panning and Zooming */}
      <MyVideoComposition />
    </div>
  );
};

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={10000} // Adjust based on your video's length and frame rate
        fps={30} // Ensure this matches your video's frame rate
        width={1920}
        height={1080}
      />
    </>
  );
};
