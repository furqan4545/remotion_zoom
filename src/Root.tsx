import "./tailwind.css";
import { Composition } from "remotion";

import { ZoomAndPanEffect } from "./components/ZoomAndPanEffect";
import { cursorData } from "./components/CursorData";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  const durationInFrames = Math.ceil(
    (cursorData.recording_info.duration / 1000) *
      cursorData.recording_info.frame_rate,
  );

  return (
    <>
      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="MyVideo"
        component={ZoomAndPanEffect}
        durationInFrames={durationInFrames}
        // durationInFrames={28 * 30}
        fps={cursorData.recording_info.frame_rate}
        width={cursorData.recording_info.recorded_display_dimension.width}
        height={cursorData.recording_info.recorded_display_dimension.height}
      />
    </>
  );
};
