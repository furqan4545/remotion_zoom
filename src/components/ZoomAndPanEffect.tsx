/////////////////////////////// working code 1 only zoom  ///////////////////////////////

// import React from "react";
// import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
// import { VideoPlayer } from "./VideoPlayer";
// import { cursorData } from "./CursorData";

// interface PanPosition {
//   x: number;
//   y: number;
// }

// interface Rectangle {
//   left: number;
//   right: number;
//   top: number;
//   bottom: number;
//   width: number;
//   height: number;
// }

// const EDGE_THRESHOLD = 100;
// const PAN_SMOOTHING = 0.85;
// const CURSOR_ADVANCE_TIME = 0.7;
// const DEBUG = true;

// const getCursorPositionAtTime = (
//   frame: number,
//   fps: number,
//   lookAheadSeconds: number = 0,
// ) => {
//   const timestamp = (frame / fps + lookAheadSeconds) * 1000;
//   const position = cursorData.tracking_data.find(
//     (data) => Math.abs(data.recorded_display_data.timestamp - timestamp) < 50,
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// const calculateRectangles = (
//   originalWidth: number,
//   originalHeight: number,
//   zoom: number,
// ): { largeRect: Rectangle; smallRect: Rectangle } => {
//   // Large Rectangle (original video size)
//   const largeRect: Rectangle = {
//     left: 0,
//     top: 0,
//     right: originalWidth,
//     bottom: originalHeight,
//     width: originalWidth,
//     height: originalHeight,
//   };

//   // Available pan space
//   const totalPanSpaceX = originalWidth - originalWidth / zoom;
//   const totalPanSpaceY = originalHeight - originalHeight / zoom;

//   // Start small rectangle at center (half of available pan space)
//   const centerOffsetX = totalPanSpaceX / 2;
//   const centerOffsetY = totalPanSpaceY / 2;

//   // Small Rectangle (zoomed viewport)
//   const smallRect: Rectangle = {
//     width: originalWidth / zoom,
//     height: originalHeight / zoom,
//     left: centerOffsetX,
//     top: centerOffsetY,
//     right: centerOffsetX + originalWidth / zoom,
//     bottom: centerOffsetY + originalHeight / zoom,
//   };

//   return { largeRect, smallRect };
// };

// const calculateDistances = (
//   cursor: { x: number; y: number },
//   smallRect: Rectangle,
//   largeRect: Rectangle,
//   zoom: number,
// ) => {
//   // Calculate available total pan space
//   const totalPanSpaceX = largeRect.width - smallRect.width;
//   const totalPanSpaceY = largeRect.height - smallRect.height;

//   // Calculate distances from small rectangle to large rectangle bounds
//   const rectDistances = {
//     toLeftEdge: smallRect.left,
//     toRightEdge: totalPanSpaceX - smallRect.left,
//     toTopEdge: smallRect.top,
//     toBottomEdge: totalPanSpaceY - smallRect.top,
//   };

//   // Calculate cursor distances to small rectangle edges
//   const cursorDistances = {
//     toLeftEdge: cursor.x - smallRect.left,
//     toRightEdge: smallRect.left + smallRect.width - cursor.x,
//     toTopEdge: cursor.y - smallRect.top,
//     toBottomEdge: smallRect.top + smallRect.height - cursor.y,
//   };

//   return { cursorDistances, rectDistances };
// };

// const calculatePanAmount = (
//   cursor: { x: number; y: number },
//   smallRect: Rectangle,
//   largeRect: Rectangle,
//   zoom: number,
// ): PanPosition => {
//   if (zoom <= 1) return { x: 0, y: 0 };

//   const { cursorDistances, rectDistances } = calculateDistances(
//     cursor,
//     smallRect,
//     largeRect,
//     zoom,
//   );
//   let panX = 0;
//   let panY = 0;

//   // Calculate pan based on cursor position and available space
//   if (
//     cursorDistances.toLeftEdge < EDGE_THRESHOLD &&
//     rectDistances.toLeftEdge > 0
//   ) {
//     const strength = 1 - cursorDistances.toLeftEdge / EDGE_THRESHOLD;
//     panX = rectDistances.toLeftEdge * strength;
//   } else if (
//     cursorDistances.toRightEdge < EDGE_THRESHOLD &&
//     rectDistances.toRightEdge > 0
//   ) {
//     const strength = 1 - cursorDistances.toRightEdge / EDGE_THRESHOLD;
//     panX = -rectDistances.toRightEdge * strength;
//   }

//   if (
//     cursorDistances.toTopEdge < EDGE_THRESHOLD &&
//     rectDistances.toTopEdge > 0
//   ) {
//     const strength = 1 - cursorDistances.toTopEdge / EDGE_THRESHOLD;
//     panY = rectDistances.toTopEdge * strength;
//   } else if (
//     cursorDistances.toBottomEdge < EDGE_THRESHOLD &&
//     rectDistances.toBottomEdge > 0
//   ) {
//     const strength = 1 - cursorDistances.toBottomEdge / EDGE_THRESHOLD;
//     panY = -rectDistances.toBottomEdge * strength;
//   }

//   return { x: panX, y: panY };
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, width, height } = useVideoConfig();
//   const currentTimeInSeconds = frame / fps;

//   // Zoom cycle timings
//   const ZOOM_CYCLE = {
//     FIRST_ZOOM_START: 3,
//     FIRST_ZOOM_DURATION: 9,
//     SECOND_ZOOM_START: 12,
//     SECOND_ZOOM_DURATION: 11,
//     GAP_DURATION: 5,
//     TOTAL_DURATION: 28,
//   };

//   const timeInCurrentCycle = currentTimeInSeconds % ZOOM_CYCLE.TOTAL_DURATION;

//   // Get cursor position for current frame
//   const cursorPosition = getCursorPositionAtTime(
//     frame,
//     fps,
//     CURSOR_ADVANCE_TIME,
//   );

//   // Calculate zoom level
//   let targetZoom = 1;
//   let progress = 0;

//   if (
//     timeInCurrentCycle >= ZOOM_CYCLE.FIRST_ZOOM_START &&
//     timeInCurrentCycle <
//       ZOOM_CYCLE.FIRST_ZOOM_START + ZOOM_CYCLE.FIRST_ZOOM_DURATION
//   ) {
//     progress = spring({
//       frame: frame - ZOOM_CYCLE.FIRST_ZOOM_START * fps,
//       fps,
//       config: { damping: 12, stiffness: 100, mass: 0.5 },
//     });
//     targetZoom = interpolate(progress, [0, 1], [1, 1.3]);
//   } else if (
//     timeInCurrentCycle >= ZOOM_CYCLE.SECOND_ZOOM_START &&
//     timeInCurrentCycle <
//       ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION
//   ) {
//     progress = spring({
//       frame: frame - ZOOM_CYCLE.SECOND_ZOOM_START * fps,
//       fps,
//       config: { damping: 12, stiffness: 100, mass: 0.5 },
//     });
//     targetZoom = interpolate(progress, [0, 1], [1.3, 1.5]);
//   } else if (
//     timeInCurrentCycle >=
//     ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION
//   ) {
//     progress = spring({
//       frame:
//         frame -
//         (ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION) * fps,
//       fps,
//       config: { damping: 12, stiffness: 100, mass: 0.5 },
//     });
//     targetZoom = interpolate(progress, [0, 1], [1.5, 1]);
//   }

//   // Calculate rectangles and pan amount
//   const { largeRect, smallRect } = calculateRectangles(
//     width,
//     height,
//     targetZoom,
//   );

//   // Get the target pan position for the current frame
//   const targetPan = calculatePanAmount(
//     cursorPosition,
//     smallRect,
//     largeRect,
//     targetZoom,
//   );

//   // Get the previous frame's cursor position for smooth transitions
//   const previousCursorPosition = getCursorPositionAtTime(
//     Math.max(0, frame - 1),
//     fps,
//     CURSOR_ADVANCE_TIME,
//   );

//   // Calculate previous frame's pan position
//   const { largeRect: prevLargeRect, smallRect: prevSmallRect } =
//     calculateRectangles(width, height, targetZoom);

//   const previousPan = calculatePanAmount(
//     previousCursorPosition,
//     prevSmallRect,
//     prevLargeRect,
//     targetZoom,
//   );

//   // Apply smoothing between frames
//   const smoothPan = {
//     x: interpolate(PAN_SMOOTHING, [0, 1], [targetPan.x, previousPan.x], {
//       extrapolateRight: "clamp",
//     }),
//     y: interpolate(PAN_SMOOTHING, [0, 1], [targetPan.y, previousPan.y], {
//       extrapolateRight: "clamp",
//     }),
//   };

//   if (DEBUG) {
//     console.log({
//       frame,
//       zoom: targetZoom,
//       cursor: cursorPosition,
//       smallRect,
//       largeRect,
//       smoothPan,
//       targetPan,
//     });
//   }

//   const style: React.CSSProperties = {
//     position: "relative",
//     width: "100%",
//     height: "100%",
//     overflow: "hidden",
//   };

//   const videoStyle: React.CSSProperties = {
//     position: "absolute",
//     width: "100%",
//     height: "100%",
//     transform: `
//       scale(${targetZoom})
//       translate(${smoothPan.x}px, ${smoothPan.y}px)
//     `,
//     transformOrigin: "center center",
//   };

//   return (
//     <div style={style}>
//       <div style={videoStyle}>
//         <VideoPlayer />
//       </div>
//     </div>
//   );
// };

//////////////////////////////////////////////////////////////
//// test code 2

import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { VideoPlayer } from "./VideoPlayer";
import { cursorData } from "./CursorData";

interface PanPosition {
  x: number;
  y: number;
}

interface Rectangle {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

const EDGE_THRESHOLD = 100;
// const PAN_SMOOTHING = 0.85;
const PAN_SMOOTHING = 0.95;
const CURSOR_ADVANCE_TIME = 0.7;
const DEBUG = true;

// Add new pan spring configuration
const PAN_SPRING_CONFIG = {
  damping: 30, // Higher damping for less oscillation
  stiffness: 70, // Lower stiffness for smoother movement
  mass: 1.2, // Higher mass for more inertia
};

const getCursorPositionAtTime = (
  frame: number,
  fps: number,
  lookAheadSeconds: number = 0,
) => {
  const timestamp = (frame / fps + lookAheadSeconds) * 1000;
  const position = cursorData.tracking_data.find(
    (data) => Math.abs(data.recorded_display_data.timestamp - timestamp) < 50,
  );
  return (
    position?.recorded_display_data ||
    cursorData.tracking_data[0].recorded_display_data
  );
};

const calculateRectangles = (
  originalWidth: number,
  originalHeight: number,
  zoom: number,
): { largeRect: Rectangle; smallRect: Rectangle } => {
  // Large Rectangle (original video size)
  const largeRect: Rectangle = {
    left: 0,
    top: 0,
    right: originalWidth,
    bottom: originalHeight,
    width: originalWidth,
    height: originalHeight,
  };

  // Available pan space
  const totalPanSpaceX = originalWidth - originalWidth / zoom;
  const totalPanSpaceY = originalHeight - originalHeight / zoom;

  // Start small rectangle at center (half of available pan space)
  const centerOffsetX = totalPanSpaceX / 2;
  const centerOffsetY = totalPanSpaceY / 2;

  // Small Rectangle (zoomed viewport)
  const smallRect: Rectangle = {
    width: originalWidth / zoom,
    height: originalHeight / zoom,
    left: centerOffsetX,
    top: centerOffsetY,
    right: centerOffsetX + originalWidth / zoom,
    bottom: centerOffsetY + originalHeight / zoom,
  };

  return { largeRect, smallRect };
};

const calculateDistances = (
  cursor: { x: number; y: number },
  smallRect: Rectangle,
  largeRect: Rectangle,
  zoom: number,
) => {
  // Calculate available total pan space
  const totalPanSpaceX = largeRect.width - smallRect.width;
  const totalPanSpaceY = largeRect.height - smallRect.height;

  // Calculate distances from small rectangle to large rectangle bounds
  const rectDistances = {
    toLeftEdge: smallRect.left,
    toRightEdge: totalPanSpaceX - smallRect.left,
    toTopEdge: smallRect.top,
    toBottomEdge: totalPanSpaceY - smallRect.top,
  };

  // Calculate cursor distances to small rectangle edges
  const cursorDistances = {
    toLeftEdge: cursor.x - smallRect.left,
    toRightEdge: smallRect.left + smallRect.width - cursor.x,
    toTopEdge: cursor.y - smallRect.top,
    toBottomEdge: smallRect.top + smallRect.height - cursor.y,
  };

  return { cursorDistances, rectDistances };
};

const calculatePanAmount = (
  cursor: { x: number; y: number },
  smallRect: Rectangle,
  largeRect: Rectangle,
  zoom: number,
): PanPosition => {
  if (zoom <= 1) return { x: 0, y: 0 };

  const { cursorDistances, rectDistances } = calculateDistances(
    cursor,
    smallRect,
    largeRect,
    zoom,
  );
  let panX = 0;
  let panY = 0;

  // Smoother strength calculation with easing
  const calculateStrength = (distance: number) => {
    const normalized = 1 - distance / EDGE_THRESHOLD;
    // Ease the strength calculation for smoother transitions
    return Math.pow(Math.max(0, Math.min(1, normalized)), 2);
  };

  if (
    cursorDistances.toLeftEdge < EDGE_THRESHOLD &&
    rectDistances.toLeftEdge > 0
  ) {
    const strength = calculateStrength(cursorDistances.toLeftEdge);
    panX = rectDistances.toLeftEdge * strength;
  } else if (
    cursorDistances.toRightEdge < EDGE_THRESHOLD &&
    rectDistances.toRightEdge > 0
  ) {
    const strength = calculateStrength(cursorDistances.toRightEdge);
    panX = -rectDistances.toRightEdge * strength;
  }

  if (
    cursorDistances.toTopEdge < EDGE_THRESHOLD &&
    rectDistances.toTopEdge > 0
  ) {
    const strength = calculateStrength(cursorDistances.toTopEdge);
    panY = rectDistances.toTopEdge * strength;
  } else if (
    cursorDistances.toBottomEdge < EDGE_THRESHOLD &&
    rectDistances.toBottomEdge > 0
  ) {
    const strength = calculateStrength(cursorDistances.toBottomEdge);
    panY = -rectDistances.toBottomEdge * strength;
  }

  return { x: panX, y: panY };
};

export const ZoomAndPanEffect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const currentTimeInSeconds = frame / fps;

  // Zoom cycle timings
  const ZOOM_CYCLE = {
    FIRST_ZOOM_START: 3,
    FIRST_ZOOM_DURATION: 9,
    SECOND_ZOOM_START: 12,
    SECOND_ZOOM_DURATION: 11,
    GAP_DURATION: 5,
    TOTAL_DURATION: 28,
  };

  const timeInCurrentCycle = currentTimeInSeconds % ZOOM_CYCLE.TOTAL_DURATION;

  // Get cursor position for current frame
  const cursorPosition = getCursorPositionAtTime(
    frame,
    fps,
    CURSOR_ADVANCE_TIME,
  );

  // Calculate zoom level
  let targetZoom = 1;
  let progress = 0;

  if (
    timeInCurrentCycle >= ZOOM_CYCLE.FIRST_ZOOM_START &&
    timeInCurrentCycle <
      ZOOM_CYCLE.FIRST_ZOOM_START + ZOOM_CYCLE.FIRST_ZOOM_DURATION
  ) {
    progress = spring({
      frame: frame - ZOOM_CYCLE.FIRST_ZOOM_START * fps,
      fps,
      config: { damping: 12, stiffness: 100, mass: 0.5 },
    });
    targetZoom = interpolate(progress, [0, 1], [1, 1.3]);
  } else if (
    timeInCurrentCycle >= ZOOM_CYCLE.SECOND_ZOOM_START &&
    timeInCurrentCycle <
      ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION
  ) {
    progress = spring({
      frame: frame - ZOOM_CYCLE.SECOND_ZOOM_START * fps,
      fps,
      config: { damping: 12, stiffness: 100, mass: 0.5 },
    });
    targetZoom = interpolate(progress, [0, 1], [1.3, 1.5]);
  } else if (
    timeInCurrentCycle >=
    ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION
  ) {
    progress = spring({
      frame:
        frame -
        (ZOOM_CYCLE.SECOND_ZOOM_START + ZOOM_CYCLE.SECOND_ZOOM_DURATION) * fps,
      fps,
      config: { damping: 12, stiffness: 100, mass: 0.5 },
    });
    targetZoom = interpolate(progress, [0, 1], [1.5, 1]);
  }

  // Calculate rectangles and pan amount
  const { largeRect, smallRect } = calculateRectangles(
    width,
    height,
    targetZoom,
  );

  // Get the target pan position for the current frame
  const targetPan = calculatePanAmount(
    cursorPosition,
    smallRect,
    largeRect,
    targetZoom,
  );

  // Get the previous frame's cursor position for smooth transitions
  const previousCursorPosition = getCursorPositionAtTime(
    Math.max(0, frame - 1),
    fps,
    CURSOR_ADVANCE_TIME,
  );

  // Calculate previous frame's pan position
  const { largeRect: prevLargeRect, smallRect: prevSmallRect } =
    calculateRectangles(width, height, targetZoom);

  const previousPan = calculatePanAmount(
    previousCursorPosition,
    prevSmallRect,
    prevLargeRect,
    targetZoom,
  );

  // First apply spring animation
  const springPan = {
    x: spring({
      frame,
      fps,
      from: previousPan.x,
      to: targetPan.x,
      config: PAN_SPRING_CONFIG,
    }),
    y: spring({
      frame,
      fps,
      from: previousPan.y,
      to: targetPan.y,
      config: PAN_SPRING_CONFIG,
    }),
  };

  const smoothPan = {
    x: interpolate(PAN_SMOOTHING, [0, 1], [springPan.x, previousPan.x], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }),
    y: interpolate(PAN_SMOOTHING, [0, 1], [springPan.y, previousPan.y], {
      extrapolateRight: "clamp",
      extrapolateLeft: "clamp",
    }),
  };

  if (DEBUG) {
    console.log({
      frame,
      zoom: targetZoom,
      cursor: cursorPosition,
      smallRect,
      largeRect,
      smoothPan,
      targetPan,
    });
  }

  const style: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
  };

  const videoStyle: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    transform: `
      scale(${targetZoom})
      translate(${smoothPan.x}px, ${smoothPan.y}px)
    `,
    transformOrigin: "center center",
    willChange: "transform", // Added for better performance
  };

  return (
    <div style={style}>
      <div style={videoStyle}>
        <VideoPlayer />
      </div>
    </div>
  );
};
