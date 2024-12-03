///////////////////////////////////////////////////
///////////////////// Zoom pan animation working perfect all perfect //////////////////////

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// const getCursorPositionAtTime = (timestamp: number) => {
//   // Find the cursor data closest to the timestamp
//   const position = cursorData.tracking_data.find(
//     (data) =>
//       Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames } = useVideoConfig();

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = 1512;
//   const ORIGINAL_HEIGHT = 982;
//   const BOX_SIZE = 100;

//   // Maximum zoom level
//   const maxZoomLevel = 1.5;

//   // Timing calculations
//   const zoomInStartFrame = 3 * fps;
//   const zoomInDurationFrames = 2 * fps;
//   const zoomOutStartFrame = durationInFrames - 5 * fps;
//   const zoomOutDurationFrames = 2 * fps;

//   // Calculate zoom level
//   const getZoomLevel = (frame: number) => {
//     let zoomLevel = 1;
//     if (
//       frame >= zoomInStartFrame + zoomInDurationFrames &&
//       frame <= zoomOutStartFrame - zoomOutDurationFrames
//     ) {
//       zoomLevel = maxZoomLevel;
//     } else if (
//       frame > zoomInStartFrame &&
//       frame < zoomInStartFrame + zoomInDurationFrames
//     ) {
//       const progress = (frame - zoomInStartFrame) / zoomInDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = 1 + (maxZoomLevel - 1) * easedProgress;
//     } else if (
//       frame > zoomOutStartFrame - zoomOutDurationFrames &&
//       frame < zoomOutStartFrame
//     ) {
//       const progress =
//         (frame - (zoomOutStartFrame - zoomOutDurationFrames)) /
//         zoomOutDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = maxZoomLevel - (maxZoomLevel - 1) * easedProgress;
//     }
//     return zoomLevel;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];

//     // First, create an array of pan positions for each frame
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//     }

//     // Apply smoothing filter over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];

//     // const windowSize = 90; // Number of frames to look ahead and behind
//     const windowSize = 30;
//     const halfWindow = Math.floor(windowSize / 2);

//     for (let f = 0; f < durationInFrames; f++) {
//       let sumPanX = 0;
//       let sumPanY = 0;
//       let count = 0;

//       for (
//         let w = f - halfWindow;
//         w <= f + halfWindow;
//         w++
//       ) {
//         if (w >= 0 && w < durationInFrames) {
//           sumPanX += panPositions[w].panX;
//           sumPanY += panPositions[w].panY;
//           count++;
//         }
//       }

//       const avgPanX = sumPanX / count;
//       const avgPanY = sumPanY / count;

//       smoothedPanPositions.push({ panX: avgPanX, panY: avgPanY });
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

///////////////////// This is the one more copy of working zoom and pan animation//////////////////////
////////////////////////////////////////////////////

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// const getCursorPositionAtTime = (timestamp: number) => {
//   // Find the cursor data closest to the timestamp
//   const position = cursorData.tracking_data.find(
//     (data) =>
//       Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames } = useVideoConfig();

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = 1512;
//   const ORIGINAL_HEIGHT = 982;
//   const BOX_SIZE = 100;

//   // Maximum zoom level
//   const maxZoomLevel = 1.5;

//   // Timing calculations
//   const zoomInStartFrame = 3 * fps;
//   const zoomInDurationFrames = 2 * fps;
//   const zoomOutStartFrame = durationInFrames - 5 * fps;
//   const zoomOutDurationFrames = 2 * fps;

//   // Calculate zoom level
//   const getZoomLevel = (frame: number) => {
//     let zoomLevel = 1;
//     if (
//       frame >= zoomInStartFrame + zoomInDurationFrames &&
//       frame <= zoomOutStartFrame - zoomOutDurationFrames
//     ) {
//       zoomLevel = maxZoomLevel;
//     } else if (
//       frame > zoomInStartFrame &&
//       frame < zoomInStartFrame + zoomInDurationFrames
//     ) {
//       const progress = (frame - zoomInStartFrame) / zoomInDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = 1 + (maxZoomLevel - 1) * easedProgress;
//     } else if (
//       frame > zoomOutStartFrame - zoomOutDurationFrames &&
//       frame < zoomOutStartFrame
//     ) {
//       const progress =
//         (frame - (zoomOutStartFrame - zoomOutDurationFrames)) /
//         zoomOutDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = maxZoomLevel - (maxZoomLevel - 1) * easedProgress;
//     }
//     return zoomLevel;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];

//     // First, create an array of pan positions for each frame
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//     }

//     // Apply smoothing filter over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];

//     // const windowSize = 90; // Number of frames to look ahead and behind
//     const windowSize = 30;
//     const halfWindow = Math.floor(windowSize / 2);

//     for (let f = 0; f < durationInFrames; f++) {
//       let sumPanX = 0;
//       let sumPanY = 0;
//       let count = 0;

//       for (
//         let w = f - halfWindow;
//         w <= f + halfWindow;
//         w++
//       ) {
//         if (w >= 0 && w < durationInFrames) {
//           sumPanX += panPositions[w].panX;
//           sumPanY += panPositions[w].panY;
//           count++;
//         }
//       }

//       const avgPanX = sumPanX / count;
//       const avgPanY = sumPanY / count;

//       smoothedPanPositions.push({ panX: avgPanX, panY: avgPanY });
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

///////////////////// Test 4 //////////////////////
////////////////////////////////////////////////////

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// const getCursorPositionAtTime = (timestamp: number) => {
//   // Find the cursor data closest to the timestamp
//   const position = cursorData.tracking_data.find(
//     (data) =>
//       Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Maximum zoom level
//   const maxZoomLevel = 1.5;

//   // Timing calculations
//   const zoomInStartFrame = 3 * fps;
//   const zoomInDurationFrames = 2 * fps;
//   const zoomOutStartFrame = durationInFrames - 5 * fps;
//   const zoomOutDurationFrames = 2 * fps;

//   // Calculate zoom level
//   const getZoomLevel = (frame: number) => {
//     let zoomLevel = 1;
//     if (
//       frame >= zoomInStartFrame + zoomInDurationFrames &&
//       frame <= zoomOutStartFrame - zoomOutDurationFrames
//     ) {
//       zoomLevel = maxZoomLevel;
//     } else if (
//       frame > zoomInStartFrame &&
//       frame < zoomInStartFrame + zoomInDurationFrames
//     ) {
//       const progress = (frame - zoomInStartFrame) / zoomInDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = 1 + (maxZoomLevel - 1) * easedProgress;
//     } else if (
//       frame > zoomOutStartFrame - zoomOutDurationFrames &&
//       frame < zoomOutStartFrame
//     ) {
//       const progress =
//         (frame - (zoomOutStartFrame - zoomOutDurationFrames)) /
//         zoomOutDurationFrames;
//       const easedProgress = 1 - Math.pow(1 - progress, 6);
//       zoomLevel = maxZoomLevel - (maxZoomLevel - 1) * easedProgress;
//     }
//     return zoomLevel;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90;
//     // const windowSize = 60; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       // Alpha ranges from 0 (slow panning) to 1 (immediate panning)
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//       } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//       } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

//////////////////////////// Working panning with adaptive smoothing //////////////////////
///////////////////////////////////////////////////////////

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// const getCursorPositionAtTime = (timestamp: number) => {
//   // Find the cursor data closest to the timestamp
//   const position = cursorData.tracking_data.find(
//     (data) =>
//       Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 }, // No transition after last zoom
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = [] as any[];
//   let cumulativeTime = 3; // Start at 3 seconds as per your requirement

//   for (const event of zoomTimeline) {
//     const zoomEvent = {
//       ...event,
//       startTime: cumulativeTime,
//       endTime: cumulativeTime + event.zoomDuration,
//       transitionStartTime: cumulativeTime + event.zoomDuration,
//       transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
//     };
//     zoomEvents.push(zoomEvent);
//     cumulativeTime += event.zoomDuration + event.transitionDuration;
//   }

//   const totalCycleDuration = cumulativeTime;

//   // Calculate zoom level based on the zoom timeline with transitions at the end
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;
//     let zoomLevel = 1.0; // Default zoom level

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length]; // Wrap around

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         // During zoom duration, maintain current zoom level
//         zoomLevel = currentZoomLevel;
//         return zoomLevel;
//       } else if (transitionDuration > 0 && timeInSeconds >= transitionStartTime && timeInSeconds < transitionEndTime) {
//         // During transition, interpolate to next zoom level
//         const transitionProgress = (timeInSeconds - transitionStartTime) / transitionDuration;
//         const toZoomLevel = nextZoomEvent.zoomLevel;
//         zoomLevel = interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress
//         );
//         return zoomLevel;
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to default
//     return 1.0;
//   };

//   // Helper function to interpolate between zoom levels
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number
//   ) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for smooth transitions
//   const easeInOutCubic = (t: number) => {
//     return t < 0.5
//       ? 4 * t * t * t
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Rest of the code remains the same...

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(
//         ...zoomTimeline.map((z) => z.zoomLevel)
//       );
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(
//         -maxPanX,
//         Math.min(maxPanX, targetPanX)
//       );
//       targetPanY = Math.max(
//         -maxPanY,
//         Math.min(maxPanY, targetPanY)
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX =
//         cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY =
//         cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(
//         Math.abs(deltaX),
//         Math.abs(deltaY)
//       );

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//         } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//         } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//         } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//         } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX =
//         alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY =
//         alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps, zoomTimeline]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

// ///////////////////////////// Working code copy //////////////////////
// ///////////////////////////////////////////////////////////

// import React, { useMemo } from 'react';
// import {
//   useCurrentFrame,
//   useVideoConfig,
// } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// const getCursorPositionAtTime = (timestamp: number) => {
//   // Find the cursor data closest to the timestamp
//   const position = cursorData.tracking_data.find(
//     (data) =>
//       Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//   );
//   return (
//     position?.recorded_display_data ||
//     cursorData.tracking_data[0].recorded_display_data
//   );
// };

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 }, // No transition after last zoom
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = [] as any[];
//   let cumulativeTime = 3; // Start at 3 seconds as per your requirement

//   for (const event of zoomTimeline) {
//     const zoomEvent = {
//       ...event,
//       startTime: cumulativeTime,
//       endTime: cumulativeTime + event.zoomDuration,
//       transitionStartTime: cumulativeTime + event.zoomDuration,
//       transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
//     };
//     zoomEvents.push(zoomEvent);
//     cumulativeTime += event.zoomDuration + event.transitionDuration;
//   }

//   const totalCycleDuration = cumulativeTime;

//   // Calculate zoom level based on the zoom timeline with transitions at the end
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;
//     let zoomLevel = 1.0; // Default zoom level

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length]; // Wrap around

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         // During zoom duration, maintain current zoom level
//         zoomLevel = currentZoomLevel;
//         return zoomLevel;
//       } else if (transitionDuration > 0 && timeInSeconds >= transitionStartTime && timeInSeconds < transitionEndTime) {
//         // During transition, interpolate to next zoom level
//         const transitionProgress = (timeInSeconds - transitionStartTime) / transitionDuration;
//         const toZoomLevel = nextZoomEvent.zoomLevel;
//         zoomLevel = interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress
//         );
//         return zoomLevel;
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to default
//     return 1.0;
//   };

//   // Helper function to interpolate between zoom levels
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number
//   ) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for smooth transitions
//   const easeInOutCubic = (t: number) => {
//     return t < 0.5
//       ? 4 * t * t * t
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Rest of the code remains the same...

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(
//         ...zoomTimeline.map((z) => z.zoomLevel)
//       );
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(
//         -maxPanX,
//         Math.min(maxPanX, targetPanX)
//       );
//       targetPanY = Math.max(
//         -maxPanY,
//         Math.min(maxPanY, targetPanY)
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX =
//         cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY =
//         cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(
//         Math.abs(deltaX),
//         Math.abs(deltaY)
//       );

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//         } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//         } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//         } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//         } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX =
//         alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY =
//         alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps, zoomTimeline]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

///////////////////////////// Working code 6  //////////////////////
///////////////////////////////////////////////////////////

// ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { useCurrentFrame, useVideoConfig } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Function to get cursor position using the passed cursorData
//   const getCursorPositionAtTime = (timestamp: number) => {
//     const position = cursorData.tracking_data.find(
//       (data) =>
//         Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//     );
//     return (
//       position?.recorded_display_data ||
//       cursorData.tracking_data[0].recorded_display_data
//     );
//   };

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 }, // No transition after last zoom
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 3;

//     for (const event of zoomTimeline) {
//       const zoomEvent = {
//         ...event,
//         startTime: cumulativeTime,
//         endTime: cumulativeTime + event.zoomDuration,
//         transitionStartTime: cumulativeTime + event.zoomDuration,
//         transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
//       };
//       events.push(zoomEvent);
//       cumulativeTime += event.zoomDuration + event.transitionDuration;
//     }

//     return events;
//   }, []);

//   // const totalCycleDuration = cumulativeTime;
//   const totalCycleDuration = useMemo(() =>
//     zoomEvents.reduce((sum, event) => sum + event.zoomDuration + event.transitionDuration, 0),
//     [zoomEvents]
//   );

//   // Helper functions for zoom calculations
//   const interpolateZoom = (startZoom: number, endZoom: number, progress: number) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   const easeInOutCubic = (t: number) => {
//     return t < 0.5
//       ? 4 * t * t * t
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   // Calculate zoom level based on the zoom timeline with transitions at the end
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;
//     let zoomLevel = 1.0;

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length];

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         return currentZoomLevel;
//       } else if (
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         const transitionProgress = (timeInSeconds - transitionStartTime) / transitionDuration;
//         return interpolateZoom(currentZoomLevel, nextZoomEvent.zoomLevel, transitionProgress);
//       }
//     }

//     return 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Rest of the code remains the same...

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       const timestamp = (f / fps) * 1000;
//       const cursorPos = getCursorPositionAtTime(timestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//       } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//       } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, cursorData]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = (frame / fps) * 1000;
//   const cursorPos = getCursorPositionAtTime(timestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

///////////////////////////// Working code 7 with lookahead perfected //////////////////////
///////////////////////////////////////////////////////////

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { useCurrentFrame, useVideoConfig } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Function to get cursor position using the passed cursorData
//   const getCursorPositionAtTime = (timestamp: number) => {
//     const position = cursorData.tracking_data.find(
//       (data) =>
//         Math.abs(data.recorded_display_data.timestamp - timestamp) < 50
//     );
//     return (
//       position?.recorded_display_data ||
//       cursorData.tracking_data[cursorData.tracking_data.length - 1].recorded_display_data
//     );
//   };

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 0 }, // No transition after last zoom
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 3;

//     for (const event of zoomTimeline) {
//       const zoomEvent = {
//         ...event,
//         startTime: cumulativeTime,
//         endTime: cumulativeTime + event.zoomDuration,
//         transitionStartTime: cumulativeTime + event.zoomDuration,
//         transitionEndTime:
//           cumulativeTime + event.zoomDuration + event.transitionDuration,
//       };
//       events.push(zoomEvent);
//       cumulativeTime += event.zoomDuration + event.transitionDuration;
//     }

//     return events;
//   }, []);

//   const totalCycleDuration = useMemo(
//     () =>
//       zoomEvents.reduce(
//         (sum, event) => sum + event.zoomDuration + event.transitionDuration,
//         0
//       ),
//     [zoomEvents]
//   );

//   // Helper functions for zoom calculations
//   const interpolateZoom = (startZoom: number, endZoom: number, progress: number) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   const easeInOutCubic = (t: number) => {
//     return t < 0.5
//       ? 4 * t * t * t
//       : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   // Calculate zoom level based on the zoom timeline with transitions at the end
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;
//     let zoomLevel = 1.0;

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length];

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         return currentZoomLevel;
//       } else if (
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         const transitionProgress =
//           (timeInSeconds - transitionStartTime) / transitionDuration;
//         return interpolateZoom(
//           currentZoomLevel,
//           nextZoomEvent.zoomLevel,
//           transitionProgress
//         );
//       }
//     }

//     return 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = ((f / fps) + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp =
//         (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const maxPanX = (ORIGINAL_WIDTH * (maxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (maxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//       } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//       } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [durationInFrames, fps, ORIGINAL_WIDTH, ORIGINAL_HEIGHT, cursorData, LOOKAHEAD_SECONDS]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const panScaleFactor = (currentZoom - 1) / (maxZoomLevel - 1);
//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   const containerStyle: React.CSSProperties = {
//     position: 'relative',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Ensure background is black to match video
//   };

//   const transformedContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: 'center center',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Yellow boundary (original screen)
//   const originalBoundaryStyle: React.CSSProperties = {
//     position: 'absolute',
//     border: '2px solid yellow',
//     left: 0,
//     top: 0,
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     pointerEvents: 'none',
//     zIndex: 999,
//   };

//   // Get current cursor position
//   const timestamp = ((frame / fps) + LOOKAHEAD_SECONDS) * 1000;
//   const maxTimestamp = (durationInFrames / fps) * 1000;
//   const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//   const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//   // Red box (cursor area)
//   const cursorBoxStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: BOX_SIZE,
//     height: BOX_SIZE,
//     border: '2px solid red',
//     left: cursorPos.x - BOX_SIZE / 2,
//     top: cursorPos.y - BOX_SIZE / 2,
//     pointerEvents: 'none',
//     zIndex: 1000,
//   };

//   return (
//     <div style={containerStyle}>
//       <div style={transformedContainerStyle}>
//         <VideoPlayer />
//         <div style={cursorBoxStyle} />
//       </div>
//       <div style={originalBoundaryStyle} />
//     </div>
//   );
// };

// ///////////////////////////// Working code with background image and video //////////////////////
// ///////////////////////////////////////////////////////////

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from "remotion";
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Function to get cursor position using the passed cursorData
//   const getCursorPositionAtTime = (timestamp: number) => {
//     const position = cursorData.tracking_data.find(
//       (data) => Math.abs(data.recorded_display_data.timestamp - timestamp) < 50,
//     );
//     return (
//       position?.recorded_display_data ||
//       cursorData.tracking_data[cursorData.tracking_data.length - 1]
//         .recorded_display_data
//     );
//   };

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     { zoomDuration: 0, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//     // { zoomDuration: 0, zoomLevel: 1.25, zoomStartLevel: 0.8, transitionDuration: 1 },
//     // { zoomDuration: 0, zoomLevel: 1.0, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 }, // No transition after last zoom
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 3;

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent = zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

//       const zoomEvent = {
//         ...event,
//         startTime: cumulativeTime,
//         endTime: cumulativeTime + event.zoomDuration,
//         transitionStartTime: cumulativeTime + event.zoomDuration,
//         transitionEndTime: cumulativeTime + event.zoomDuration + event.transitionDuration,
//         zoomStartLevel: event.zoomStartLevel !== undefined ? event.zoomStartLevel : prevEvent.zoomLevel,
//       };
//       events.push(zoomEvent);
//       cumulativeTime += event.zoomDuration + event.transitionDuration;
//     }

//     return events;
//   }, [zoomTimeline]);

//   const totalCycleDuration = useMemo(
//     () =>
//       zoomEvents.reduce(
//         (sum, event) => sum + event.zoomDuration + event.transitionDuration,
//         0
//       ),
//     [zoomEvents]
//   );

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   const easeInOutCubic = (t: number) => {
//     return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   // Calculate zoom level based on the zoom timeline with transitions
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = (frame / fps) % totalCycleDuration;

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextZoomEvent = zoomEvents[(i + 1) % zoomEvents.length]; // Wrap around

//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         zoomStartLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         // During zoom duration, maintain current zoom level
//         return currentZoomLevel;
//       } else if (
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         // During transition, interpolate to next zoom level
//         const transitionProgress =
//           (timeInSeconds - transitionStartTime) / transitionDuration;
//         const toZoomLevel = nextZoomEvent.zoomLevel;
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress
//         );
//       } else if (
//         startTime === endTime && // Initial transition when zoomDuration is 0
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         // Interpolate from zoomStartLevel to currentZoomLevel
//         const transitionProgress =
//           (timeInSeconds - transitionStartTime) / transitionDuration;
//         return interpolateZoom(
//           zoomStartLevel,
//           currentZoomLevel,
//           transitionProgress
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[0].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = ((f / fps) + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp =
//         (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       const maxPanX = (ORIGINAL_WIDTH * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (effectiveMaxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//       } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//       } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [
//     durationInFrames,
//     fps,
//     ORIGINAL_WIDTH,
//     ORIGINAL_HEIGHT,
//     cursorData,
//     LOOKAHEAD_SECONDS,
//     zoomTimeline,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//   const panScaleFactor = (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   // Background style
//   const backgroundStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Fallback color
//   };

//   //   // Get current cursor position
//   const timestamp = (frame / fps + LOOKAHEAD_SECONDS) * 1000;
//   const maxTimestamp = (durationInFrames / fps) * 1000;
//   const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//   const cursorPositions = getCursorPositionAtTime(adjustedTimestamp);

//   return (
//     <div style={{ position: 'relative', width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT, overflow: 'hidden' }}>
//       {/* Background Layer */}
//       {backgroundType === 'image' ? (
//         <Img src={staticFile(backgroundSource)} alt="Background" style={backgroundStyle} />
//       ) : (
//         <Video
//           src={staticFile(backgroundSource)}
//           style={backgroundStyle}
//           loop={true}
//           muted={true}
//         />
//       )}
//       {/* Transformed Main Video */}
//       <div
//         style={{
//           position: 'absolute',
//           width: ORIGINAL_WIDTH,
//           height: ORIGINAL_HEIGHT,
//           transformOrigin: 'center center',
//           transform: makeTransform([
//             translate(-adjustedPanX, -adjustedPanY),
//             scale(currentZoom),
//           ]),
//         }}
//       >
//         <VideoPlayer />
//         {/* Cursor Box */}
        
//         <div
//           style={{
//             position: 'absolute',
//             width: BOX_SIZE,
//             height: BOX_SIZE,
//             border: '2px solid red',
//             left: cursorPositions.x - BOX_SIZE / 2,
//             top: cursorPositions.y - BOX_SIZE / 2,
//             pointerEvents: 'none',
//             zIndex: 1000,
//           }}
//         />
//       </div>
//     </div>
//   );
// };


//////////// Working code perfect with background img and zoom starting from 2nd index after first iteration //////////////////////
/////////////////////////////////////////////////////////////////

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from "remotion";
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';

// export const ZoomAndPanEffect: React.FC = () => {
//   const frame = useCurrentFrame();
//   const { fps, durationInFrames, width, height } = useVideoConfig();

//   // Function to get cursor position using the passed cursorData
//   const getCursorPositionAtTime = (timestamp: number) => {
//     const position = cursorData.tracking_data.find(
//       (data) => Math.abs(data.recorded_display_data.timestamp - timestamp) < 50,
//     );
//     return (
//       position?.recorded_display_data ||
//       cursorData.tracking_data[cursorData.tracking_data.length - 1]
//         .recorded_display_data
//     );
//   };

//   // Original screen dimensions
//   const ORIGINAL_WIDTH = width;
//   const ORIGINAL_HEIGHT = height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
//   const zoomTimeline = [
//     // { zoomDuration: 0, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//     { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//     { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//     { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 }, // No transition after last zoom
//     { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//     // Add more zoom events as needed
//   ];

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent = zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

//       const zoomEvent = {
//         ...event,
//         startTime: cumulativeTime,
//         endTime: cumulativeTime + event.zoomDuration,
//         transitionStartTime: cumulativeTime + event.zoomDuration,
//         transitionEndTime:
//           cumulativeTime + event.zoomDuration + event.transitionDuration,
//         zoomStartLevel:
//           event.zoomStartLevel !== undefined
//             ? event.zoomStartLevel
//             : prevEvent.zoomLevel,
//       };
//       events.push(zoomEvent);
//       cumulativeTime += event.zoomDuration + event.transitionDuration;
//     }

//     return events;
//   }, [zoomTimeline]);

//   const totalCycleDuration = useMemo(
//     () =>
//       zoomEvents.reduce(
//         (sum, event) => sum + event.zoomDuration + event.transitionDuration,
//         0
//       ),
//     [zoomEvents]
//   );

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     const easedProgress = easeInOutCubic(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   const easeInOutCubic = (t: number) => {
//     return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
//   };

//   // Calculate zoom level based on the zoom timeline with transitions
//   const getZoomLevel = (frame: number) => {
//     const timeInSecondsRaw = frame / fps;

//     if (timeInSecondsRaw < totalCycleDuration) {
//       // During the first iteration, use the actual time
//       var timeInSeconds = timeInSecondsRaw;
//     } else {
//       // For subsequent iterations, adjust time to skip the first event
//       const firstEventEndTime = zoomEvents[0].transitionEndTime;
//       const loopDuration = totalCycleDuration - firstEventEndTime;

//       timeInSeconds =
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) + firstEventEndTime;
//     }

//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextIndex = (i + 1) % zoomEvents.length;
//       const nextZoomEvent =
//         nextIndex === 0 ? zoomEvents[1] : zoomEvents[nextIndex]; // Skip the first event in loops
//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel: currentZoomLevel,
//         zoomStartLevel,
//         transitionDuration,
//       } = zoomEvent;

//       if (timeInSeconds >= startTime && timeInSeconds < endTime) {
//         // During zoom duration, maintain current zoom level
//         return currentZoomLevel;
//       } else if (
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         // During transition, interpolate to next zoom level
//         const transitionProgress =
//           (timeInSeconds - transitionStartTime) / transitionDuration;
//         const toZoomLevel = nextZoomEvent.zoomLevel;
//         return interpolateZoom(currentZoomLevel, toZoomLevel, transitionProgress);
//       } else if (
//         startTime === endTime && // Initial transition when zoomDuration is 0
//         transitionDuration > 0 &&
//         timeInSeconds >= transitionStartTime &&
//         timeInSeconds < transitionEndTime
//       ) {
//         // Interpolate from zoomStartLevel to currentZoomLevel
//         const transitionProgress =
//           (timeInSeconds - transitionStartTime) / transitionDuration;
//         return interpolateZoom(zoomStartLevel, currentZoomLevel, transitionProgress);
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

  
//   const currentZoom = getZoomLevel(frame);

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = ((f / fps) + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp =
//         (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       const maxPanX = (ORIGINAL_WIDTH * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (ORIGINAL_HEIGHT * (effectiveMaxZoomLevel - 1)) / 2;

//       let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
//       let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       let alpha = 0.0001; // Default very slow panning

//       if (movementMagnitude >= 500) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 400) {
//         alpha = 0.1;
//       } else if (movementMagnitude >= 300) {
//         alpha = 0.003;
//       } else if (movementMagnitude >= 200) {
//         alpha = 0.002;
//       } else if (movementMagnitude >= 100) {
//         alpha = 0.001;
//       }

//       // Apply exponential smoothing
//       const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       smoothedPanPositions.push({ panX, panY });

//       previousPanX = panX;
//       previousPanY = panY;
//     }

//     return smoothedPanPositions;
//   }, [
//     durationInFrames,
//     fps,
//     ORIGINAL_WIDTH,
//     ORIGINAL_HEIGHT,
//     cursorData,
//     LOOKAHEAD_SECONDS,
//     zoomTimeline,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//   const panScaleFactor = (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

//   const adjustedPanX = panX * panScaleFactor;
//   const adjustedPanY = panY * panScaleFactor;

//   // Background style
//   const backgroundStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     overflow: 'hidden',
//     backgroundColor: 'black', // Fallback color
//   };

//   //   // Get current cursor position
//   const timestamp = (frame / fps + LOOKAHEAD_SECONDS) * 1000;
//   const maxTimestamp = (durationInFrames / fps) * 1000;
//   const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//   const cursorPositions = getCursorPositionAtTime(adjustedTimestamp);

//   return (
//     <div style={{ position: 'relative', width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT, overflow: 'hidden' }}>
//       {/* Background Layer */}
//       {backgroundType === 'image' ? (
//         <Img src={staticFile(backgroundSource)} alt="Background" style={backgroundStyle} />
//       ) : (
//         <Video
//           src={staticFile(backgroundSource)}
//           style={backgroundStyle}
//           loop={true}
//           muted={true}
//         />
//       )}
//       {/* Transformed Main Video */}
//       <div
//         style={{
//           position: 'absolute',
//           width: ORIGINAL_WIDTH,
//           height: ORIGINAL_HEIGHT,
//           transformOrigin: 'center center',
//           transform: makeTransform([
//             translate(-adjustedPanX, -adjustedPanY),
//             scale(currentZoom),
//           ]),
//         }}
//       >
//         <VideoPlayer />
//         {/* Cursor Box */}
        
//         <div
//           style={{
//             position: 'absolute',
//             width: BOX_SIZE,
//             height: BOX_SIZE,
//             border: '2px solid red',
//             left: cursorPositions.x - BOX_SIZE / 2,
//             top: cursorPositions.y - BOX_SIZE / 2,
//             pointerEvents: 'none',
//             zIndex: 1000,
//           }}
//         />
//       </div>
//     </div>
//   );
// };


//////////// Test 9 //////////////////////
/////////////////////////////////////////////////////////////////

// ZoomAndPanEffect.tsx
import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { AbsoluteFill, Img, staticFile, Video } from "remotion";
import { VideoPlayer } from './VideoPlayer';
import { cursorData } from './CursorData';
import { makeTransform, scale, translate } from '@remotion/animation-utils';

export const ZoomAndPanEffect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Function to get cursor position using the passed cursorData
  const getCursorPositionAtTime = (timestamp: number) => {
    const position = cursorData.tracking_data.find(
      (data) => Math.abs(data.recorded_display_data.timestamp - timestamp) < 50,
    );
    return (
      position?.recorded_display_data ||
      cursorData.tracking_data[cursorData.tracking_data.length - 1]
        .recorded_display_data
    );
  };

  // Original screen dimensions
  const ORIGINAL_WIDTH = width;
  const ORIGINAL_HEIGHT = height;
  const BOX_SIZE = 100;

  // Introduce the LOOKAHEAD_SECONDS parameter
  const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

  // Option to select background type: 'image' or 'video'
  const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

  // Background source
  // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
  const backgroundSource =
    backgroundType === 'image'
      ? 'background_imgs/back1.jpg'
      : 'background_video/backgroundVideo.mp4';

  // Zoom timeline: array of { zoomDuration, zoomLevel, transitionDuration }
  const zoomTimeline = [
    // { zoomDuration: 0, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
    { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
    { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
    { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
    { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 }, // No transition after last zoom
    { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
    // Add more zoom events as needed
  ];

  // Build zoom events with cumulative start and end times
  const zoomEvents = useMemo(() => {
    const events = [] as any[];
    let cumulativeTime = 0; // Start from 0 instead of 3

    for (let i = 0; i < zoomTimeline.length; i++) {
      const event = zoomTimeline[i];
      const prevEvent = zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

      const zoomEvent = {
        ...event,
        startTime: cumulativeTime,
        endTime: cumulativeTime + event.zoomDuration,
        transitionStartTime: cumulativeTime + event.zoomDuration,
        transitionEndTime:
          cumulativeTime + event.zoomDuration + event.transitionDuration,
        zoomStartLevel:
          event.zoomStartLevel !== undefined
            ? event.zoomStartLevel
            : prevEvent.zoomLevel,
      };
      events.push(zoomEvent);
      cumulativeTime += event.zoomDuration + event.transitionDuration;
    }

    return events;
  }, [zoomTimeline]);

  const totalCycleDuration = useMemo(
    () =>
      zoomEvents.reduce(
        (sum, event) => sum + event.zoomDuration + event.transitionDuration,
        0
      ),
    [zoomEvents]
  );

  // Helper functions for zoom calculations
  const interpolateZoom = (
    startZoom: number,
    endZoom: number,
    progress: number,
  ) => {
    const easedProgress = easeInOutCubic(progress);
    return startZoom + (endZoom - startZoom) * easedProgress;
  };

  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Calculate zoom level based on the zoom timeline with transitions
  const getZoomLevel = (frame: number) => {
    const timeInSecondsRaw = frame / fps;

    if (timeInSecondsRaw < totalCycleDuration) {
      // During the first iteration, use the actual time
      var timeInSeconds = timeInSecondsRaw;
    } else {
      // For subsequent iterations, adjust time to skip the first event
      const firstEventEndTime = zoomEvents[0].transitionEndTime;
      const loopDuration = totalCycleDuration - firstEventEndTime;

      timeInSeconds =
        ((timeInSecondsRaw - firstEventEndTime) % loopDuration) + firstEventEndTime;
    }

    for (let i = 0; i < zoomEvents.length; i++) {
      const zoomEvent = zoomEvents[i];
      const nextIndex = (i + 1) % zoomEvents.length;
      const nextZoomEvent =
        nextIndex === 0 ? zoomEvents[1] : zoomEvents[nextIndex]; // Skip the first event in loops
      const {
        startTime,
        endTime,
        transitionStartTime,
        transitionEndTime,
        zoomLevel: currentZoomLevel,
        zoomStartLevel,
        transitionDuration,
      } = zoomEvent;

      if (timeInSeconds >= startTime && timeInSeconds < endTime) {
        // During zoom duration, maintain current zoom level
        return currentZoomLevel;
      } else if (
        transitionDuration > 0 &&
        timeInSeconds >= transitionStartTime &&
        timeInSeconds < transitionEndTime
      ) {
        // During transition, interpolate to next zoom level
        const transitionProgress =
          (timeInSeconds - transitionStartTime) / transitionDuration;
        const toZoomLevel = nextZoomEvent.zoomLevel;
        return interpolateZoom(currentZoomLevel, toZoomLevel, transitionProgress);
      } else if (
        startTime === endTime && // Initial transition when zoomDuration is 0
        transitionDuration > 0 &&
        timeInSeconds >= transitionStartTime &&
        timeInSeconds < transitionEndTime
      ) {
        // Interpolate from zoomStartLevel to currentZoomLevel
        const transitionProgress =
          (timeInSeconds - transitionStartTime) / transitionDuration;
        return interpolateZoom(zoomStartLevel, currentZoomLevel, transitionProgress);
      }
    }

    // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
    return zoomTimeline[1].zoomStartLevel || 1.0;
  };

  
  const currentZoom = getZoomLevel(frame);

  // Precompute smoothed pan positions with adaptive smoothing
  const smoothedPanPositions = useMemo(() => {
    const panPositions: { panX: number; panY: number }[] = [];
    const cursorPositions: { x: number; y: number }[] = [];

    // First, create an array of pan positions for each frame and store cursor positions
    for (let f = 0; f < durationInFrames; f++) {
      // Adjust the timestamp to look ahead into the future
      const timestamp = ((f / fps) + LOOKAHEAD_SECONDS) * 1000;

      // Ensure timestamp does not exceed the total duration
      const maxTimestamp =
        (durationInFrames / fps) * 1000;
      const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

      const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

      // Compute maxPanX and maxPanY based on max zoom level
      const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
      const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
      const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

      const maxPanX = (ORIGINAL_WIDTH * (effectiveMaxZoomLevel - 1)) / 2;
      const maxPanY = (ORIGINAL_HEIGHT * (effectiveMaxZoomLevel - 1)) / 2;

      let targetPanX = cursorPos.x - ORIGINAL_WIDTH / 2;
      let targetPanY = cursorPos.y - ORIGINAL_HEIGHT / 2;

      // Clamp pan values
      targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
      targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

      panPositions.push({ panX: targetPanX, panY: targetPanY });
      cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });
    }

    // Apply adaptive exponential smoothing over pan positions
    const smoothedPanPositions: { panX: number; panY: number }[] = [];
    let previousPanX = panPositions[0].panX;
    let previousPanY = panPositions[0].panY;

    const windowSize = 90; // Number of frames to consider for movement magnitude

    for (let f = 0; f < durationInFrames; f++) {
      // Compute cursor movement over the last windowSize frames
      const startFrame = Math.max(0, f - windowSize + 1);

      const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
      const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

      const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

      // Determine smoothing factor based on movement magnitude
      let alpha = 0.0001; // Default very slow panning

      if (movementMagnitude >= 500) {
        alpha = 0.1;
      } else if (movementMagnitude >= 400) {
        alpha = 0.1;
      } else if (movementMagnitude >= 300) {
        alpha = 0.003;
      } else if (movementMagnitude >= 200) {
        alpha = 0.002;
      } else if (movementMagnitude >= 100) {
        alpha = 0.001;
      }

      // Apply exponential smoothing
      const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
      const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

      smoothedPanPositions.push({ panX, panY });

      previousPanX = panX;
      previousPanY = panY;
    }

    return smoothedPanPositions;
  }, [
    durationInFrames,
    fps,
    ORIGINAL_WIDTH,
    ORIGINAL_HEIGHT,
    cursorData,
    LOOKAHEAD_SECONDS,
    zoomTimeline,
  ]);

  // Get pan values for the current frame
  const panX = smoothedPanPositions[frame]?.panX || 0;
  const panY = smoothedPanPositions[frame]?.panY || 0;

  // Adjust pan values based on current zoom level
  const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
  const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
  const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
  const panScaleFactor = (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

  const adjustedPanX = panX * panScaleFactor;
  const adjustedPanY = panY * panScaleFactor;

  // Background style
  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'black', // Fallback color
  };

  //   // Get current cursor position
  const timestamp = (frame / fps + LOOKAHEAD_SECONDS) * 1000;
  const maxTimestamp = (durationInFrames / fps) * 1000;
  const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
  const cursorPositions = getCursorPositionAtTime(adjustedTimestamp);

  return (
    <div style={{ position: 'relative', width: ORIGINAL_WIDTH, height: ORIGINAL_HEIGHT, overflow: 'hidden' }}>
      {/* Background Layer */}
      {backgroundType === 'image' ? (
        <Img src={staticFile(backgroundSource)} alt="Background" style={backgroundStyle} />
      ) : (
        <Video
          src={staticFile(backgroundSource)}
          style={backgroundStyle}
          loop={true}
          muted={true}
        />
      )}
      {/* Transformed Main Video */}
      <div
        style={{
          position: 'absolute',
          width: ORIGINAL_WIDTH,
          height: ORIGINAL_HEIGHT,
          transformOrigin: 'center center',
          transform: makeTransform([
            translate(-adjustedPanX, -adjustedPanY),
            scale(currentZoom),
          ]),
        }}
      >
        <VideoPlayer />
        {/* Cursor Box */}
        
        <div
          style={{
            position: 'absolute',
            width: BOX_SIZE,
            height: BOX_SIZE,
            border: '2px solid red',
            left: cursorPositions.x - BOX_SIZE / 2,
            top: cursorPositions.y - BOX_SIZE / 2,
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      </div>
    </div>
  );
};