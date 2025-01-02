// //////////// OMG perfectly working code (panning and trimming Done). //////////////////////
// /////////////////////////////////////////////////////////////////

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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
//   // const ORIGINAL_WIDTH = width;
//   // const ORIGINAL_HEIGHT = height;
//   // Original dimensions from props
//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
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

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1)) / 2;

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         trimSettings.left,
//         Math.min(ORIGINAL_WIDTH - trimSettings.right, cursorPos.x)
//       );
//       const adjustedCursorY = Math.max(
//         trimSettings.top,
//         Math.min(ORIGINAL_HEIGHT - trimSettings.bottom, cursorPos.y)
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//   const panScaleFactor =
//     (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_3.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// //////////// Dec 28 Working code .. Perfect working code till here //////////////////////
// /////////////////////////////////////////////////////////////////

// // // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { VideoPlayer } from './VideoPlayer';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
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

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1)) / 2;

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         trimSettings.left,
//         Math.min(ORIGINAL_WIDTH - trimSettings.right, cursorPos.x)
//       );
//       const adjustedCursorY = Math.max(
//         trimSettings.top,
//         Math.min(ORIGINAL_HEIGHT - trimSettings.bottom, cursorPos.y)
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//   const panScaleFactor =
//     (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_3.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// MY test sonnet 1

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 1 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 1 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 1 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 1 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 1 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

// const easeInOutQuint = (t: number, strength: number = 1) => {
//   const power = 5 * strength;
//   return t < 0.5
//     ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//     : 1 - Math.pow(-2 * t + 2, power) / 2;
// };

// const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//   if (t === 0) return 0;
//   if (t === 1) return 1;
//   const factor = 20 * speedFactor;
//   if (t < 0.5) return Math.pow(2, factor * t - factor/2) / 2;
//   return (2 - Math.pow(2, -factor * t + factor/2)) / 2;
// };

// const smoothEaseInOut = (t: number, config: EasingConfig = {
//   strength: 1,
//   speedFactor: 1,
//   smoothness: 1,
//   threshold: 0
// }) => {
//   if (Math.abs(t) < config.threshold) return 0;

//   t = Math.max(0, Math.min(1, t));

//   const expo = easeInOutExpo(t, config.speedFactor);
//   const quint = easeInOutQuint(t, config.strength);

//   const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//   return expo * blend + quint * (1 - blend);
// };

// // Modified calculateSmoothing for better bezier-like motion
// const calculateSmoothing = (movementMagnitude: number) => {
//   const MOVEMENT_THRESHOLD = 400;  // Ignore movements under 400px
//   const BASE_ALPHA = 0.0001;      // Very slow base movement
//   const MAX_ALPHA = 0.1;          // Maximum movement speed

//   if (movementMagnitude < MOVEMENT_THRESHOLD) {
//     return 0;
//   }

//   // Normalize movement magnitude with better curve
//   const normalizedMagnitude = Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//   // Apply enhanced easing with carefully tuned parameters
//   const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//     strength: 6.5,        // Stronger easing for more pronounced curve
//     speedFactor: 0.8,     // Slower overall movement
//     smoothness: 1.2,      // Smoother transitions
//     threshold: 0.05       // Small threshold for stability
//   });

//   // Enhanced alpha calculation with better acceleration/deceleration
//   return BASE_ALPHA + (easedMagnitude * (MAX_ALPHA - BASE_ALPHA));
// };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress);
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1)) / 2;

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         trimSettings.left,
//         Math.min(ORIGINAL_WIDTH - trimSettings.right, cursorPos.x)
//       );
//       const adjustedCursorY = Math.max(
//         trimSettings.top,
//         Math.min(ORIGINAL_HEIGHT - trimSettings.bottom, cursorPos.y)
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });
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
//       // let alpha = 0.0001; // Default very slow panning
//       // Get smoothing factor
//       let alpha = calculateSmoothing(movementMagnitude);

//       // Only apply pan if we have a non-zero smoothing factor
//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         // Keep previous position if movement is too small
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY
//         });
//       }

//       // if (movementMagnitude >= 500) {
//       //   alpha = 0.1;
//       // } else if (movementMagnitude >= 400) {
//       //   alpha = 0.1;
//       // } else if (movementMagnitude >= 300) {
//       //   alpha = 0.003;
//       // } else if (movementMagnitude >= 200) {
//       //   alpha = 0.002;
//       // } else if (movementMagnitude >= 100) {
//       //   alpha = 0.001;
//       // }

//       // Apply exponential smoothing
//       // const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//       // const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;

//       // smoothedPanPositions.push({ panX, panY });

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//   const panScaleFactor =
//     (currentZoom - minZoomLevel) / (effectiveMaxZoomLevel - minZoomLevel);

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_3.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// PERFECTLY SMOOTH BEZIER CURVE MOTION CODE

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

// const easeInOutQuint = (t: number, strength: number = 1) => {
//   const power = 5 * strength;
//   return t < 0.5
//     ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//     : 1 - Math.pow(-2 * t + 2, power) / 2;
// };

// const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//   if (t === 0) return 0;
//   if (t === 1) return 1;
//   const factor = 20 * speedFactor;
//   if (t < 0.5) return Math.pow(2, factor * t - factor/2) / 2;
//   return (2 - Math.pow(2, -factor * t + factor/2)) / 2;
// };

// const smoothEaseInOut = (t: number, config: EasingConfig = {
//   strength: 1,
//   speedFactor: 1,
//   smoothness: 1,
//   threshold: 0
// }) => {
//   if (Math.abs(t) < config.threshold) return 0;

//   t = Math.max(0, Math.min(1, t));

//   const expo = easeInOutExpo(t, config.speedFactor);
//   const quint = easeInOutQuint(t, config.strength);

//   const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//   return expo * blend + quint * (1 - blend);
// };

// // Modified calculateSmoothing for better bezier-like motion
// const calculateSmoothing = (movementMagnitude: number) => {
//   const MOVEMENT_THRESHOLD = 400;  // Ignore movements under 400px
//   const BASE_ALPHA = 0.00005;     // Reduced from 0.0001 for slower base movement
//   const MAX_ALPHA = 0.05;         // Reduced from 0.1 for slower maximum speed

//   if (movementMagnitude < MOVEMENT_THRESHOLD) {
//     return 0;
//   }

//   // Normalize movement magnitude with better curve
//   const normalizedMagnitude = Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//   // Apply enhanced easing with carefully tuned parameters
//   const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//     // strength: 6.5,        // Stronger easing for more pronounced curve
//     // speedFactor: 0.8,     // Slower overall movement
//     // smoothness: 1.2,      // Smoother transitions
//     // threshold: 0.05       // Small threshold for stability
//     strength: 4.5,        // Match panning strength
//     speedFactor: 0.5,     // Match panning speed
//     smoothness: 1.8,      // Match panning smoothness
//     threshold: 0.08       // Match panning threshold
//   });

//   // Enhanced alpha calculation with better acceleration/deceleration
//   return BASE_ALPHA + (easedMagnitude * (MAX_ALPHA - BASE_ALPHA));
// };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 4.5,        // Match panning strength
//       speedFactor: 0.5,     // Match panning speed
//       smoothness: 1.8,      // Match panning smoothness
//       threshold: 0.08       // Match panning threshold
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1)) / 2;

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         trimSettings.left,
//         Math.min(ORIGINAL_WIDTH - trimSettings.right, cursorPos.x)
//       );
//       const adjustedCursorY = Math.max(
//         trimSettings.top,
//         Math.min(ORIGINAL_HEIGHT - trimSettings.bottom, cursorPos.y)
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude
//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       // let alpha = 0.0001; // Default very slow panning
//       // Get smoothing factor
//       let alpha = calculateSmoothing(movementMagnitude);

//       // Only apply pan if we have a non-zero smoothing factor
//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         // Keep previous position if movement is too small
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (zoom: number, minZoom: number, maxZoom: number) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 4.5,
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_3.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// TEST 3 for bezier curve motion

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

// const easeInOutQuint = (t: number, strength: number = 1) => {
//   const power = 5 * strength;
//   return t < 0.5
//     ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//     : 1 - Math.pow(-2 * t + 2, power) / 2;
// };

// const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//   if (t === 0) return 0;
//   if (t === 1) return 1;
//   const factor = 20 * speedFactor;
//   if (t < 0.5) return Math.pow(2, factor * t - factor/2) / 2;
//   return (2 - Math.pow(2, -factor * t + factor/2)) / 2;
// };

// const smoothEaseInOut = (t: number, config: EasingConfig = {
//   strength: 1,
//   speedFactor: 1,
//   smoothness: 1,
//   threshold: 0
// }) => {
//   if (Math.abs(t) < config.threshold) return 0;

//   t = Math.max(0, Math.min(1, t));

//   const expo = easeInOutExpo(t, config.speedFactor);
//   const quint = easeInOutQuint(t, config.strength);

//   const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//   return expo * blend + quint * (1 - blend);
// };

// // Modified calculateSmoothing for better bezier-like motion
// const calculateSmoothing = (movementMagnitude: number) => {
//   const MOVEMENT_THRESHOLD = 400;  // Ignore movements under 400px
//   const BASE_ALPHA = 0.00005;     // Reduced from 0.0001 for slower base movement
//   const MAX_ALPHA = 0.08;         // Reduced from 0.1 for slower maximum speed

//   // original
//   // const MOVEMENT_THRESHOLD = 400;  // Keep the same threshold
//   // const BASE_ALPHA = 0.00005;     // Reduced from 0.0001 for slower base movement
//   // const MAX_ALPHA = 0.05;         // Reduced from 0.1 for slower maximum speed

//   if (movementMagnitude < MOVEMENT_THRESHOLD) {
//     return 0;
//   }

//   // Normalize movement magnitude with better curve
//   const normalizedMagnitude = Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//   // Apply enhanced easing with carefully tuned parameters
//   const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//     // strength: 6.5,        // Stronger easing for more pronounced curve
//     // speedFactor: 0.8,     // Slower overall movement
//     // smoothness: 1.2,      // Smoother transitions
//     // threshold: 0.05       // Small threshold for stability
//     strength: 6.5,     // Match panning strength
//     speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//   });

//   // Enhanced alpha calculation with better acceleration/deceleration
//   return BASE_ALPHA + (easedMagnitude * (MAX_ALPHA - BASE_ALPHA));
// };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 6.5,       // Match panning strength
//     speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1)) / 2;
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1)) / 2;

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         trimSettings.left,
//         Math.min(ORIGINAL_WIDTH - trimSettings.right, cursorPos.x)
//       );
//       const adjustedCursorY = Math.max(
//         trimSettings.top,
//         Math.min(ORIGINAL_HEIGHT - trimSettings.bottom, cursorPos.y)
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Clamp pan values
//       targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
//       targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude
//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       // Compute cursor movement over the last windowSize frames
//       const startFrame = Math.max(0, f - windowSize + 1);

//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Determine smoothing factor based on movement magnitude
//       // let alpha = 0.0001; // Default very slow panning
//       // Get smoothing factor
//       let alpha = calculateSmoothing(movementMagnitude);

//       // Only apply pan if we have a non-zero smoothing factor
//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         // Keep previous position if movement is too small
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (zoom: number, minZoom: number, maxZoom: number) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 6.5,        // Match panning strength
//     speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_4.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_4.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
///// PERFECT WORKING CODE WITH SMOOTH PAN VERSION 3

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number;    // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number;   // Pixels to trim from left
//   right: number;  // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         { zoomDuration: 3, zoomLevel: 1.0, zoomStartLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       { zoomDuration: 3, zoomLevel: 0.8, zoomStartLevel: 0.8, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

// const easeInOutQuint = (t: number, strength: number = 1) => {
//   const power = 5 * strength;
//   return t < 0.5
//     ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//     : 1 - Math.pow(-2 * t + 2, power) / 2;
// };

// const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//   if (t === 0) return 0;
//   if (t === 1) return 1;
//   const factor = 20 * speedFactor;
//   if (t < 0.5) return Math.pow(2, factor * t - factor/2) / 2;
//   return (2 - Math.pow(2, -factor * t + factor/2)) / 2;
// };

// const smoothEaseInOut = (t: number, config: EasingConfig = {
//   strength: 1,
//   speedFactor: 1,
//   smoothness: 1,
//   threshold: 0
// }) => {
//   if (Math.abs(t) < config.threshold) return 0;

//   t = Math.max(0, Math.min(1, t));

//   const expo = easeInOutExpo(t, config.speedFactor);
//   const quint = easeInOutQuint(t, config.strength);

//   const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//   return expo * blend + quint * (1 - blend);
// };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 6.5,       // Match panning strength
//     speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {

//     const isNearEdge = (
//       cursorX: number,
//       cursorY: number,
//       trimmedWidth: number,
//       trimmedHeight: number,
//       currentZoom: number
//     ) => {
//       const zoomedWidth = trimmedWidth * currentZoom;
//       const zoomedHeight = trimmedHeight * currentZoom;

//       const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
//       const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
//       const visibleTop = (zoomedHeight - trimmedHeight) / 2;
//       const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

//       const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.2;

//       const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
//       const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
//       const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
//       const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

//       return nearLeft || nearRight || nearTop || nearBottom;
//     };

//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     const edgeStates: boolean[] = []; // Track edge states

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = (trimmedWidth * (effectiveMaxZoomLevel - 1))
//       const maxPanY = (trimmedHeight * (effectiveMaxZoomLevel - 1))

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         -trimSettings.left,  // Allow negative values for edge panning
//         Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x)  // Allow beyond right edge
//       );
//       const adjustedCursorY = Math.max(
//         -trimSettings.top,   // Allow negative values for edge panning
//         Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y)  // Allow beyond bottom edge
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + (trimmedWidth / 2);
//       const trimmedCenterY = trimSettings.top + (trimmedHeight / 2);

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Calculate pan scale based on zoom
//       const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//       // Scale the pan values based on zoom level
//       // targetPanX *= zoomPanScale;
//       // targetPanY *= zoomPanScale;

//       // Adjust clamping to allow more movement
// targetPanX = Math.max(-maxPanX * 1.2, Math.min(maxPanX * 1.2, targetPanX));
// targetPanY = Math.max(-maxPanY * 1.2, Math.min(maxPanY * 1.2, targetPanY));

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });

//       // Check and store edge state for each frame
//       const nearEdge = isNearEdge(
//         adjustedCursorX,
//         adjustedCursorY,
//         trimmedWidth,
//         trimmedHeight,
//         currentZoom
//       );
//       edgeStates.push(nearEdge);
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude
//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Calculate distance from center
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;
//       const distanceFromCenter = Math.sqrt(
//         Math.pow(cursorPositions[f].x - centerX, 2) +
//         Math.pow(cursorPositions[f].y - centerY, 2)
//       );

//       // Normalize distance (0 at center, 1 at edges)
//       const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
//       const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

//       // Dynamic threshold based on distance from center
//       const THRESHOLD_AT_CENTER = 400;
//       const THRESHOLD_AT_EDGE = 100;
//       const MOVEMENT_THRESHOLD = THRESHOLD_AT_CENTER -
//         (normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE));

//       // Dynamic alpha calculation
//       let alpha = 0;
//       if (movementMagnitude > MOVEMENT_THRESHOLD) {
//         const BASE_ALPHA = 0.00005;
//         // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
//         // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
//         const MAX_ALPHA_CENTER = 0.005;  // Slower in center
//         const MAX_ALPHA_EDGE = 0.15;    // Faster at edges

//         // Dynamic MAX_ALPHA based on distance from center
//         const MAX_ALPHA = MAX_ALPHA_CENTER +
//           (normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER));

//         const normalizedMagnitude = Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//         const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//           strength: 6.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08
//         });

//         alpha = BASE_ALPHA + (easedMagnitude * (MAX_ALPHA - BASE_ALPHA));
//       }

//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (zoom: number, minZoom: number, maxZoom: number) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 6.5,        // Match panning strength
//     speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//     <div
//       style={{
//         position: 'relative',
//         width: trimmedWidth,
//         height: trimmedHeight,
//         overflow: 'hidden',
//       }}
//     >

//       {/* Background Layer - Only render if includeBackground is true */}
//       {includeBackground && (
//           backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           )
//         )}

//       {/* Transformed and Trimmed Main Video */}
//       <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo
//               src={staticFile("assets/screen_3.webm")}
//             />
//           </div>
//       </div>

//       {/* Camera view with adjusted position */}
//       <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// Super perfect working product code 1

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         {
//           zoomDuration: 3,
//           zoomLevel: 1.0,
//           zoomStartLevel: 1.0,
//           transitionDuration: 2,
//         },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       {
//         zoomDuration: 3,
//         zoomLevel: 0.8,
//         zoomStartLevel: 0.8,
//         transitionDuration: 2,
//       },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const isNearEdge = (
//       cursorX: number,
//       cursorY: number,
//       trimmedWidth: number,
//       trimmedHeight: number,
//       currentZoom: number,
//     ) => {
//       const zoomedWidth = trimmedWidth * currentZoom;
//       const zoomedHeight = trimmedHeight * currentZoom;

//       const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
//       const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
//       const visibleTop = (zoomedHeight - trimmedHeight) / 2;
//       const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

//       const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.06; // 0.2 mean 20% of the viewport

//       const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
//       const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
//       const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
//       const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

//       return nearLeft || nearRight || nearTop || nearBottom;
//     };

//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     const edgeStates: boolean[] = []; // Track edge states

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth =
//         ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight =
//         ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//       const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         -trimSettings.left, // Allow negative values for edge panning
//         Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x), // Allow beyond right edge
//       );
//       const adjustedCursorY = Math.max(
//         -trimSettings.top, // Allow negative values for edge panning
//         Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y), // Allow beyond bottom edge
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
//       const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Calculate pan scale based on zoom
//       const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//       // Adjust clamping to allow more movement
//       targetPanX = Math.max(
//         -maxPanX * 1.2,
//         Math.min(maxPanX * 1.2, targetPanX),
//       );
//       targetPanY = Math.max(
//         -maxPanY * 1.2,
//         Math.min(maxPanY * 1.2, targetPanY),
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });

//       // Check and store edge state for each frame
//       const nearEdge = isNearEdge(
//         adjustedCursorX,
//         adjustedCursorY,
//         trimmedWidth,
//         trimmedHeight,
//         currentZoom,
//       );
//       edgeStates.push(nearEdge);
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude
//     const windowSize = 90; // Number of frames to consider for movement magnitude

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Calculate distance from center
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;
//       const distanceFromCenter = Math.sqrt(
//         Math.pow(cursorPositions[f].x - centerX, 2) +
//           Math.pow(cursorPositions[f].y - centerY, 2),
//       );

//       // Calculate normalized distances separately (0 at center, 1 at edge)
//       const horizontalDistance =
//         Math.abs(cursorPositions[f].x - centerX) / (trimmedWidth / 2);
//       const verticalDistance =
//         Math.abs(cursorPositions[f].y - centerY) / (trimmedHeight / 2);

//       // Normalize distance (0 at center, 1 at edges)
//       // const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
//       const normalizedDistance = Math.min(
//         Math.max(horizontalDistance, verticalDistance * 1.2),
//         1,
//       );

//       // Dynamic threshold based on distance from center
//       const THRESHOLD_AT_CENTER = 550;
//       const THRESHOLD_AT_EDGE = 100;
//       const MOVEMENT_THRESHOLD =
//         THRESHOLD_AT_CENTER -
//         normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE);

//       // Dynamic alpha calculation
//       let alpha = 0;
//       if (movementMagnitude > MOVEMENT_THRESHOLD) {
//         const BASE_ALPHA = 0.00005;
//         // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
//         // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
//         // const MAX_ALPHA_CENTER = 0.005;  // original working
//         const MAX_ALPHA_CENTER = 0.0005; // Slower in center
//         const MAX_ALPHA_EDGE = 0.15; // Faster at edges

//         // Dynamic MAX_ALPHA based on distance from center
//         const MAX_ALPHA =
//           MAX_ALPHA_CENTER +
//           normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER);

//         const normalizedMagnitude =
//           Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//         const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         alpha = BASE_ALPHA + easedMagnitude * (MAX_ALPHA - BASE_ALPHA);
//         // Boost alpha for vertical movements near top/bottom
//         if (verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) {
//           alpha *= 1.3; // 30% boost for vertical movements near edges
//         }
//       }

//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY,
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_5.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_5.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// production code perfect 2

// // // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         {
//           zoomDuration: 3,
//           zoomLevel: 1.0,
//           zoomStartLevel: 1.0,
//           transitionDuration: 2,
//         },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       {
//         zoomDuration: 3,
//         zoomLevel: 0.8,
//         zoomStartLevel: 0.8,
//         transitionDuration: 2,
//       },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const isNearEdge = (
//       cursorX: number,
//       cursorY: number,
//       trimmedWidth: number,
//       trimmedHeight: number,
//       currentZoom: number,
//     ) => {
//       const zoomedWidth = trimmedWidth * currentZoom;
//       const zoomedHeight = trimmedHeight * currentZoom;

//       const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
//       const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
//       const visibleTop = (zoomedHeight - trimmedHeight) / 2;
//       const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

//       const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.06; // 0.2 mean 20% of the viewport

//       const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
//       const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
//       const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
//       const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

//       return nearLeft || nearRight || nearTop || nearBottom;
//     };

//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     const edgeStates: boolean[] = []; // Track edge states

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;

//       // Ensure timestamp does not exceed the total duration
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);

//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Compute maxPanX and maxPanY based on max zoom level
//       const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//       const minZoomLevel = Math.min(
//         ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//       );
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth =
//         ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight =
//         ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//       // Calculate pan limits considering trimmed bounds
//       const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//       const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//       // Adjust cursor position relative to trimmed viewport
//       const adjustedCursorX = Math.max(
//         -trimSettings.left, // Allow negative values for edge panning
//         Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x), // Allow beyond right edge
//       );
//       const adjustedCursorY = Math.max(
//         -trimSettings.top, // Allow negative values for edge panning
//         Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y), // Allow beyond bottom edge
//       );

//       // Calculate target pan position relative to trimmed center
//       const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
//       const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

//       let targetPanX = adjustedCursorX - trimmedCenterX;
//       let targetPanY = adjustedCursorY - trimmedCenterY;

//       // Calculate pan scale based on zoom
//       const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//       // Adjust clamping to allow more movement
//       targetPanX = Math.max(
//         -maxPanX * 1.2,
//         Math.min(maxPanX * 1.2, targetPanX),
//       );
//       targetPanY = Math.max(
//         -maxPanY * 1.2,
//         Math.min(maxPanY * 1.2, targetPanY),
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: adjustedCursorX, y: adjustedCursorY });

//       // Check and store edge state for each frame
//       const nearEdge = isNearEdge(
//         adjustedCursorX,
//         adjustedCursorY,
//         trimmedWidth,
//         trimmedHeight,
//         currentZoom,
//       );
//       edgeStates.push(nearEdge);
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude// original working
//     const windowSize = 60; // Number of frames to consider for movement magnitude // test perfect

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Calculate distance from center
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;

//       // Calculate normalized distances separately (0 at center, 1 at edge)
//       const horizontalDistance =
//         Math.abs(cursorPositions[f].x - centerX) / (trimmedWidth / 3);
//       const verticalDistance =
//         Math.abs(cursorPositions[f].y - centerY) / (trimmedHeight / 2);

//       // Normalize distance (0 at center, 1 at edges)
//       // const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
//       const normalizedDistance = Math.min(
//         Math.max(horizontalDistance, verticalDistance * 1.2),
//         1,
//       );

//       // Dynamic threshold based on distance from center
//       const THRESHOLD_AT_CENTER = 550;
//       const THRESHOLD_AT_EDGE = 100;
//       const MOVEMENT_THRESHOLD =
//         THRESHOLD_AT_CENTER -
//         normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE);

//       // Dynamic alpha calculation
//       let alpha = 0;
//       if (movementMagnitude > MOVEMENT_THRESHOLD) {
//         const BASE_ALPHA = 0.00005;
//         // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
//         // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
//         // const MAX_ALPHA_CENTER = 0.005;  // original working
//         const MAX_ALPHA_CENTER = 0.0005; // Slower in center
//         const MAX_ALPHA_EDGE = 0.15; // Faster at edges

//         // Dynamic MAX_ALPHA based on distance from center
//         const MAX_ALPHA =
//           MAX_ALPHA_CENTER +
//           normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER);

//         const normalizedMagnitude =
//           Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//         const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         alpha = BASE_ALPHA + (easedMagnitude * (MAX_ALPHA - BASE_ALPHA));
//         // Boost alpha for vertical movements near top/bottom
//         if (verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) {
//           alpha *= 1.3; // 30% boost for vertical movements near edges
//         }
//         // // Boost alpha for both vertical and horizontal edge movements
//         //   if ((verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) ||
//         //     (horizontalDistance > 0.7 && Math.abs(deltaX) > Math.abs(deltaY))) {
//         //   const verticalBoost = verticalDistance > 0.7 ? 1.3 : 1;
//         //   const horizontalBoost = horizontalDistance > 0.7 ? 1.3 : 1;
//         //   alpha *= Math.max(verticalBoost, horizontalBoost);
//         // }
//       }

//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY,
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_3.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// production code Partial working TEST

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         {
//           zoomDuration: 3,
//           zoomLevel: 1.0,
//           zoomStartLevel: 1.0,
//           transitionDuration: 2,
//         },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       {
//         zoomDuration: 3,
//         zoomLevel: 0.8,
//         zoomStartLevel: 0.8,
//         transitionDuration: 2,
//       },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

// // Inside component
// const WINDOW_SIZE = 60;  // Looking ahead 60 frames
// const SMOOTHING_FACTOR = 0.0095;  // How smooth the movement should be (0-1)

// const smoothedPanPositions = useMemo(() => {
//   const panPositions = [];

//   // Calculate max pan limits based on zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   // Calculate trimmed viewport dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//   // Calculate pan limits considering trimmed bounds
//   const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//   const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//   let previousPanX = 0;
//   let previousPanY = 0;

//   for (let f = 0; f < durationInFrames; f++) {
//     const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
//     const maxTimestamp = (durationInFrames / fps) * 1000;
//     const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//     const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//     // Adjust cursor position relative to trimmed viewport
//     const adjustedCursorX = Math.max(
//       -trimSettings.left,
//       Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x)
//     );
//     const adjustedCursorY = Math.max(
//       -trimSettings.top,
//       Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y)
//     );

//     // Calculate trimmed center
//     const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
//     const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

//     // Calculate target pan position
//     let targetPanX = adjustedCursorX - trimmedCenterX;
//     let targetPanY = adjustedCursorY - trimmedCenterY;

//     // Calculate pan scale based on zoom
//     const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//     // Adjust clamping to allow more movement
//     targetPanX = Math.max(-maxPanX * 1.2, Math.min(maxPanX * 1.2, targetPanX));
//     targetPanY = Math.max(-maxPanY * 1.2, Math.min(maxPanY * 1.2, targetPanY));

//     // Apply smoothing
//     const smoothedX = previousPanX + (targetPanX - previousPanX) * SMOOTHING_FACTOR;
//     const smoothedY = previousPanY + (targetPanY - previousPanY) * SMOOTHING_FACTOR;

//     panPositions.push({
//       panX: smoothedX,
//       panY: smoothedY
//     });

//     previousPanX = smoothedX;
//     previousPanY = smoothedY;
//   }

//   // Additional smoothing pass for extra fluidity
//   const smoothingWindow = 5;
//   const finalSmoothed = [];

//   for (let i = 0; i < panPositions.length; i++) {
//     let windowSum = { panX: 0, panY: 0 };
//     let windowCount = 0;

//     for (let j = Math.max(0, i - smoothingWindow);
//          j < Math.min(panPositions.length, i + smoothingWindow + 1); j++) {
//       const weight = 1 - Math.abs(i - j) / (smoothingWindow + 1);
//       windowSum.panX += panPositions[j].panX * weight;
//       windowSum.panY += panPositions[j].panY * weight;
//       windowCount += weight;
//     }

//     finalSmoothed.push({
//       panX: windowSum.panX / windowCount,
//       panY: windowSum.panY / windowCount
//     });
//   }

//   return finalSmoothed;
// }, [
//   durationInFrames,
//   fps,
//   ORIGINAL_WIDTH,
//   ORIGINAL_HEIGHT,
//   cursorData,
//   LOOKAHEAD_SECONDS,
//   zoomTimeline,
//   trimSettings,
//   WINDOW_SIZE,
// ]);
//   // }, [
//   //   durationInFrames,
//   //   fps,
//   //   ORIGINAL_WIDTH,
//   //   ORIGINAL_HEIGHT,
//   //   cursorData,
//   //   LOOKAHEAD_SECONDS,
//   //   zoomTimeline,
//   //   trimSettings,
//   // ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_3.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// TEST 4

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         {
//           zoomDuration: 3,
//           zoomLevel: 1.0,
//           zoomStartLevel: 1.0,
//           transitionDuration: 2,
//         },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       {
//         zoomDuration: 3,
//         zoomLevel: 0.8,
//         zoomStartLevel: 0.8,
//         transitionDuration: 2,
//       },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

// // Inside component
// const WINDOW_SIZE = 60;  // Looking ahead 60 frames
// const SMOOTHING_FACTOR = 0.0095;  // How smooth the movement should be (0-1)

// const FAST_SMOOTHING = 0.15;    // For large movements
// const SLOW_SMOOTHING = 0.0095;  // For small movements

// // const ZOOM_THRESHOLDS = [
// //   { zoom: 2.0, threshold: 100, smooth_level: { slow: 0.0075, fast: 0.15 } },
// //   { zoom: 1.8, threshold: 120, smooth_level: { slow: 0.0085, fast: 0.14 } },
// //   { zoom: 1.5, threshold: 300, smooth_level: { slow: 0.0090, fast: 0.13 } },
// //   { zoom: 1.25, threshold: 350, smooth_level: { slow: 0.0095, fast: 0.12 } },
// //   { zoom: 1.0, threshold: 500, smooth_level: { slow: 0.0095, fast: 0.11 } },
// //   { zoom: 0.8, threshold: 600, smooth_level: { slow: 0.010, fast: 0.10 } }
// // ].sort((a, b) => b.zoom - a.zoom);

// const ZOOM_THRESHOLDS = [
//   { zoom: 2.0, threshold: 100, smooth_level: { slow: 0.0075, fast: 0.085 } },
//   { zoom: 1.8, threshold: 350, smooth_level: { slow: 0.00085, fast: 0.14 } },
//   { zoom: 1.5, threshold: 400, smooth_level: { slow: 0.00090, fast: 0.13 } },
//   { zoom: 1.25, threshold: 450, smooth_level: { slow: 0.00095, fast: 0.12 } },
//   { zoom: 1.2, threshold: 440, smooth_level: { slow: 0.00095, fast: 0.12 } },
//   { zoom: 1.0, threshold: 500, smooth_level: { slow: 0.0095, fast: 0.11 } },
//   { zoom: 0.8, threshold: 600, smooth_level: { slow: 0.010, fast: 0.10 } }
// ].sort((a, b) => b.zoom - a.zoom);

// // Update the getThresholdForZoom function to include smoothing levels
// const getConfigForZoom = (currentZoom: number) => {
//   const thresholdConfig = ZOOM_THRESHOLDS.find(config => currentZoom >= config.zoom)
//                          || ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.length - 1];

//   const nextConfig = ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.indexOf(thresholdConfig) + 1];

//   if (nextConfig) {
//     const zoomDiff = thresholdConfig.zoom - nextConfig.zoom;
//     const progress = (thresholdConfig.zoom - currentZoom) / zoomDiff;

//     // Interpolate threshold and smoothing levels
//     return {
//       threshold: thresholdConfig.threshold -
//         ((thresholdConfig.threshold - nextConfig.threshold) * progress),
//       smooth_level: {
//         slow: thresholdConfig.smooth_level.slow -
//           ((thresholdConfig.smooth_level.slow - nextConfig.smooth_level.slow) * progress),
//         fast: thresholdConfig.smooth_level.fast -
//           ((thresholdConfig.smooth_level.fast - nextConfig.smooth_level.fast) * progress)
//       }
//     };
//   }

//   return {
//     threshold: thresholdConfig.threshold,
//     smooth_level: thresholdConfig.smooth_level
//   };
// };

// const smoothedPanPositions = useMemo(() => {
//   const panPositions = [];

//   // Calculate max pan limits based on zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   // Calculate trimmed viewport dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//   // Calculate pan limits considering trimmed bounds
//   const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//   const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//   let previousPanX = 0;
//   let previousPanY = 0;

//   for (let f = 0; f < durationInFrames; f++) {
//     const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
//     // const timestamp = (f / fps + 1) * 1000;
//     const maxTimestamp = (durationInFrames / fps) * 1000;
//     const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//     const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//     // Adjust cursor position relative to trimmed viewport
//     const adjustedCursorX = Math.max(
//       -trimSettings.left,
//       Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x)
//     );
//     const adjustedCursorY = Math.max(
//       -trimSettings.top,
//       Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y)
//     );

//     // Calculate trimmed center
//     const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
//     const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

//     // Calculate target pan position
//     let targetPanX = adjustedCursorX - trimmedCenterX;
//     let targetPanY = adjustedCursorY - trimmedCenterY;

//     // Adjust clamping to allow more movement
//     targetPanX = Math.max(-maxPanX * 1.2, Math.min(maxPanX * 1.2, targetPanX));  //  extra movement (20% more) beyond the normal boundaries.
//     targetPanY = Math.max(-maxPanY * 1.2, Math.min(maxPanY * 1.2, targetPanY));

//     //////////////////////

//     // Look ahead to calculate future movement magnitude
//     const futureFrame = Math.min(f + WINDOW_SIZE, durationInFrames - 1);
//     const futureCursor = getCursorPositionAtTime(
//       (futureFrame / fps + LOOKAHEAD_SECONDS) * 1000
//     );

//     // Calculate future position
//     const futureAdjustedX = Math.max(
//       -trimSettings.left,
//       Math.min(ORIGINAL_WIDTH + trimSettings.right, futureCursor.x)
//     );
//     const futureAdjustedY = Math.max(
//       -trimSettings.top,
//       Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, futureCursor.y)
//     );

//     const futurePanX = futureAdjustedX - trimmedCenterX;
//     const futurePanY = futureAdjustedY - trimmedCenterY;

//     // Calculate movement magnitude
//     const movementX = Math.abs(futurePanX - targetPanX);
//     const movementY = Math.abs(futurePanY - targetPanY);
//     const totalMovement = Math.sqrt(movementX * movementX + movementY * movementY);

//     const currentZoom = getZoomLevel(f);
//     const config = getConfigForZoom(currentZoom);
//     const zoomAdjustedThreshold = config.threshold;

//     let dynamicSmoothingFactor;
//     if (totalMovement > zoomAdjustedThreshold) {
//       const excess = Math.min(totalMovement / zoomAdjustedThreshold, 2); // More responsive to large movements, larget number mean more responsive
//       dynamicSmoothingFactor = config.smooth_level.slow +
//         (config.smooth_level.fast - config.smooth_level.slow) * (excess - 1); // Less responsive to large movements
//     } else {
//       dynamicSmoothingFactor = config.smooth_level.slow;
//     }

//     // Apply dynamic smoothing
//     const smoothedX = previousPanX + (targetPanX - previousPanX) * dynamicSmoothingFactor;
//     const smoothedY = previousPanY + (targetPanY - previousPanY) * dynamicSmoothingFactor;

//     ///////////////

//     // Apply smoothing
//     // const smoothedX = previousPanX + (targetPanX - previousPanX) * SMOOTHING_FACTOR;
//     // const smoothedY = previousPanY + (targetPanY - previousPanY) * SMOOTHING_FACTOR;

//     panPositions.push({
//       panX: smoothedX,
//       panY: smoothedY
//     });

//     previousPanX = smoothedX;
//     previousPanY = smoothedY;
//   }

//   // Additional smoothing pass for extra fluidity
//   // const smoothingWindow = 5;
//   const smoothingWindow = 50;
//   const finalSmoothed = [];

//   for (let i = 0; i < panPositions.length; i++) {
//     let windowSum = { panX: 0, panY: 0 };
//     let windowCount = 0;

//     for (let j = Math.max(0, i - smoothingWindow);
//          j < Math.min(panPositions.length, i + smoothingWindow + 1); j++) {
//       const weight = 1 - Math.abs(i - j) / (smoothingWindow + 1);
//       windowSum.panX += panPositions[j].panX * weight;
//       windowSum.panY += panPositions[j].panY * weight;
//       windowCount += weight;
//     }

//     finalSmoothed.push({
//       panX: windowSum.panX / windowCount,
//       panY: windowSum.panY / windowCount
//     });
//   }

//   return finalSmoothed;
// }, [
//   durationInFrames,
//   fps,
//   ORIGINAL_WIDTH,
//   ORIGINAL_HEIGHT,
//   cursorData,
//   LOOKAHEAD_SECONDS,
//   zoomTimeline,
//   trimSettings,
//   WINDOW_SIZE,
// ]);
//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_3.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_3.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
///// fluid motion Production ready v2

// // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }

// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;

//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';

//   // Adjust zoom timeline based on includeBackground flag
//   const zoomTimeline = useMemo(() => {
//     if (!includeBackground) {
//       // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
//       return [
//         {
//           zoomDuration: 3,
//           zoomLevel: 1.0,
//           zoomStartLevel: 1.0,
//           transitionDuration: 2,
//         },
//         { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//         { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//         { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//         { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//         { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//       ];
//     }

//     // Original timeline with zoom out capability when background is enabled
//     return [
//       {
//         zoomDuration: 3,
//         zoomLevel: 0.8,
//         zoomStartLevel: 0.8,
//         transitionDuration: 2,
//       },
//       { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
//       { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
//       { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
//       { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
//       { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
//     ];
//   }, [includeBackground]);

//   // Build zoom events with cumulative start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0; // Start from 0 instead of 3

//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent =
//         zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
//         0,
//       ),
//     [zoomEvents],
//   );

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 6.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

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
//         ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
//         firstEventEndTime;
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
//         return interpolateZoom(
//           currentZoomLevel,
//           toZoomLevel,
//           transitionProgress,
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
//           transitionProgress,
//         );
//       }
//     }

//     // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
//     return zoomTimeline[1].zoomStartLevel || 1.0;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

// // Inside component
// const WINDOW_SIZE = 60;  // Looking ahead 60 frames

// // const ZOOM_THRESHOLDS = [
// //   { zoom: 2.0, threshold: 100, smooth_level: { slow: 0.0075, fast: 0.085 } },
// //   { zoom: 1.8, threshold: 50, smooth_level: { slow: 0.0085, fast: 0.24 } },
// //   { zoom: 1.5, threshold: 400, smooth_level: { slow: 0.0090, fast: 0.23 } },
// //   { zoom: 1.25, threshold: 450, smooth_level: { slow: 0.0095, fast: 0.22 } },
// //   { zoom: 1.2, threshold: 540, smooth_level: { slow: 0.0095, fast: 0.22 } },
// //   { zoom: 1.0, threshold: 500, smooth_level: { slow: 0.0095, fast: 0.11 } },
// //   { zoom: 0.8, threshold: 600, smooth_level: { slow: 0.010, fast: 0.10 } }
// // ].sort((a, b) => b.zoom - a.zoom);

// // const ZOOM_THRESHOLDS = [
// //   { zoom: 1.8, threshold: 200, smooth_level: { slow: 0.000085, fast: 0.24 } },
// //   { zoom: 1.5, threshold: 300, smooth_level: { slow: 0.000090, fast: 0.23 } },
// //   { zoom: 1.25, threshold: 350, smooth_level: { slow: 0.000095, fast: 0.22 } },
// //   { zoom: 1.2, threshold: 380, smooth_level: { slow: 0.000096, fast: 0.22 } },
// //   { zoom: 1.0, threshold: 390, smooth_level: { slow: 0.000097, fast: 0.11 } },
// //   { zoom: 0.8, threshold: 400, smooth_level: { slow: 0.010, fast: 0.10 } }
// // ].sort((a, b) => b.zoom - a.zoom);
// // working
// // const ZOOM_THRESHOLDS = [
// //   { zoom: 1.8, threshold: 100, smooth_level: { slow: 0.000085, fast: 0.24 } },
// //   { zoom: 1.5, threshold: 120, smooth_level: { slow: 0.000090, fast: 0.23 } },
// //   { zoom: 1.25, threshold: 130, smooth_level: { slow: 0.000095, fast: 0.22 } },
// //   { zoom: 1.2, threshold: 380, smooth_level: { slow: 0.000096, fast: 0.22 } },
// //   { zoom: 1.0, threshold: 390, smooth_level: { slow: 0.000097, fast: 0.11 } },
// //   { zoom: 0.8, threshold: 400, smooth_level: { slow: 0.010, fast: 0.10 } }
// // ].sort((a, b) => b.zoom - a.zoom);

// const ZOOM_THRESHOLDS = [
//   { zoom: 1.8, threshold: 100, smooth_level: { slow: 0.000085, fast: 0.094 } },
//   { zoom: 1.5, threshold: 120, smooth_level: { slow: 0.000090, fast: 0.093 } },
//   { zoom: 1.25, threshold: 130, smooth_level: { slow: 0.000095, fast: 0.092 } },
//   { zoom: 1.2, threshold: 180, smooth_level: { slow: 0.000096, fast: 0.091 } },
//   { zoom: 1.0, threshold: 190, smooth_level: { slow: 0.000097, fast: 0.090 } },
//   { zoom: 0.8, threshold: 200, smooth_level: { slow: 0.010, fast: 0.10 } }
// ].sort((a, b) => b.zoom - a.zoom);

// // Update the getThresholdForZoom function to include smoothing levels
// const getConfigForZoom = (currentZoom: number) => {
//   const thresholdConfig = ZOOM_THRESHOLDS.find(config => currentZoom >= config.zoom)
//                          || ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.length - 1];

//   const nextConfig = ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.indexOf(thresholdConfig) + 1];

//   if (nextConfig) {
//     const zoomDiff = thresholdConfig.zoom - nextConfig.zoom;
//     const progress = (thresholdConfig.zoom - currentZoom) / zoomDiff;

//     // Interpolate threshold and smoothing levels
//     return {
//       threshold: thresholdConfig.threshold -
//         ((thresholdConfig.threshold - nextConfig.threshold) * progress),
//       smooth_level: {
//         slow: thresholdConfig.smooth_level.slow -
//           ((thresholdConfig.smooth_level.slow - nextConfig.smooth_level.slow) * progress),
//         fast: thresholdConfig.smooth_level.fast -
//           ((thresholdConfig.smooth_level.fast - nextConfig.smooth_level.fast) * progress)
//       }
//     };
//   }

//   return {
//     threshold: thresholdConfig.threshold,
//     smooth_level: thresholdConfig.smooth_level
//   };
// };

// const smoothedPanPositions = useMemo(() => {
//   const panPositions = [];

//   // Calculate max pan limits based on zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   // Calculate trimmed viewport dimensions
//   const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//   // Calculate pan limits considering trimmed bounds
//   const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//   const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//   let previousPanX = 0;
//   let previousPanY = 0;

//   for (let f = 0; f < durationInFrames; f++) {
//     const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
//     // const timestamp = (f / fps + 1) * 1000;
//     const maxTimestamp = (durationInFrames / fps) * 1000;
//     const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//     const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//     // Adjust cursor position relative to trimmed viewport
//     const adjustedCursorX = Math.max(
//       -trimSettings.left,
//       Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x)
//     );
//     const adjustedCursorY = Math.max(
//       -trimSettings.top,
//       Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y)
//     );

//     // Calculate trimmed center
//     const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
//     const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

//     // Calculate target pan position
//     let targetPanX = adjustedCursorX - trimmedCenterX;
//     let targetPanY = adjustedCursorY - trimmedCenterY;

//     // Adjust clamping to allow more movement
//     targetPanX = Math.max(-maxPanX * 1.0, Math.min(maxPanX * 1.0, targetPanX));  //  extra movement (20% more) beyond the normal boundaries.
//     targetPanY = Math.max(-maxPanY * 1.0, Math.min(maxPanY * 1.0, targetPanY));

//     //////////////////////

//     // Look ahead to calculate future movement magnitude
//     const futureFrame = Math.min(f + WINDOW_SIZE, durationInFrames - 1);
//     const futureCursor = getCursorPositionAtTime(
//       (futureFrame / fps + LOOKAHEAD_SECONDS) * 1000
//     );

//     // Calculate future position
//     const futureAdjustedX = Math.max(
//       -trimSettings.left,
//       Math.min(ORIGINAL_WIDTH + trimSettings.right, futureCursor.x)
//     );
//     const futureAdjustedY = Math.max(
//       -trimSettings.top,
//       Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, futureCursor.y)
//     );

//     const futurePanX = futureAdjustedX - trimmedCenterX;
//     const futurePanY = futureAdjustedY - trimmedCenterY;

//     // Calculate movement magnitude
//     const movementX = Math.abs(futurePanX - targetPanX);
//     const movementY = Math.abs(futurePanY - targetPanY);
//     const totalMovement = Math.sqrt(movementX * movementX + movementY * movementY);

//     const currentZoom = getZoomLevel(f);
//     const config = getConfigForZoom(currentZoom);
//     const zoomAdjustedThreshold = config.threshold;

//     let dynamicSmoothingFactor;
//     if (totalMovement > zoomAdjustedThreshold) {
//       const excess = Math.min(totalMovement / zoomAdjustedThreshold, 2);

//       // Use the excess directly for easing instead of movementProgress
//       const easeOut = smoothEaseInOut(excess - 1, {
//           // strength: 6.5,
//           // speedFactor: 0.8,
//           // smoothness: 1.8,
//           // threshold: 0.08,
//           strength: 4.5,
//           speedFactor: 0.6,
//           smoothness: 2.8,
//           threshold: 0.08,
//       });

//       // Simpler smoothing calculation
//       dynamicSmoothingFactor = config.smooth_level.slow +
//           (config.smooth_level.fast - config.smooth_level.slow) * easeOut;
//   } else {
//       dynamicSmoothingFactor = config.smooth_level.slow;
//   }

//     // Apply dynamic smoothing
//     const smoothedX = previousPanX + (targetPanX - previousPanX) * dynamicSmoothingFactor;
//     const smoothedY = previousPanY + (targetPanY - previousPanY) * dynamicSmoothingFactor;

//     ///////////////

//     panPositions.push({
//       panX: smoothedX,
//       panY: smoothedY
//     });

//     previousPanX = smoothedX;
//     previousPanY = smoothedY;
//   }

//   // Additional smoothing pass for extra fluidity
//   const smoothingWindow = 7;
//   // const smoothingWindow = 10;
//   const finalSmoothed = [];

//   for (let i = 0; i < panPositions.length; i++) {
//     let windowSum = { panX: 0, panY: 0 };
//     let windowCount = 0;

//     for (let j = Math.max(0, i - smoothingWindow);
//          j < Math.min(panPositions.length, i + smoothingWindow + 1); j++) {
//       const weight = 1 - Math.abs(i - j) / (smoothingWindow + 1);
//       windowSum.panX += panPositions[j].panX * weight;
//       windowSum.panY += panPositions[j].panY * weight;
//       windowCount += weight;
//     }

//     finalSmoothed.push({
//       panX: windowSum.panX / windowCount,
//       panY: windowSum.panY / windowCount
//     });
//   }

//   return finalSmoothed;
// }, [
//   durationInFrames,
//   fps,
//   ORIGINAL_WIDTH,
//   ORIGINAL_HEIGHT,
//   cursorData,
//   LOOKAHEAD_SECONDS,
//   zoomTimeline,
//   trimSettings,
//   WINDOW_SIZE,
// ]);
//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
//   const minZoomLevel = Math.min(
//     ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
//   );
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       // strength: 6.5, // Match panning strength
//       // speedFactor: 0.5,
//       // smoothness: 1.8,
//       // threshold: 0.08,
//       strength: 4.5,
//           speedFactor: 0.6,
//           smoothness: 1.8,
//           threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px
//       ${trimSettings.right}px
//       ${trimSettings.bottom}px
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_7.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_7.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };

// // ////////////////////////////////////////////////////////////////////////////////////////
// // //////////////////////////////////////////////////////////////////////////////////////
// // ///// production code without fluid dynamic motion... partial working

// // // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }


// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;
  
//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';


//       const zoomTimeline = useMemo(() => {
//         const defaultZoom = includeBackground ? 0.8 : 1.0;
        
//         if (!includeBackground) {
//           return [
//             {
//               zoom_startTime: 3,
//               zoomLevel: 1.5,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 13,
//               zoomLevel: 1.25,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 23,
//               zoomLevel: 1.5,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 33,
//               zoomLevel: 1.2,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 43,
//               zoomLevel: 1.8,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 53,
//               zoomLevel: 1.0,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             }
//           ];
//         }
      
//         return [
//           {
//             zoom_startTime: 3,
//             zoomLevel: 1.0,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 6,
//             zoomLevel: 1.25,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 9,
//             zoomLevel: 1.5,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 14,
//             zoomLevel: 1.2,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 19,
//             zoomLevel: 1.8,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 22,
//             zoomLevel: 1.0,
//             zoom_duration: 6,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 28,
//             zoomLevel: 1.25,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 33,
//             zoomLevel: 1.0,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           }
//         ];
//       }, [includeBackground]);

//   // Build zoom events with start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0;
  
//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent = i > 0 ? zoomTimeline[i - 1] : null;
  
//       const zoomEvent = {
//         ...event,
//         startTime: event.zoom_startTime,
//         endTime: event.zoom_startTime + event.zoom_duration,
//         transitionStartTime: event.zoom_startTime + event.zoom_duration,
//         transitionEndTime: event.zoom_startTime + event.zoom_duration + event.zoom_transition_duration,
//         prevZoomLevel: prevEvent ? prevEvent.zoomLevel : (includeBackground ? 0.8 : 1.0)
//       };
  
//       events.push(zoomEvent);
//     }
  
//     return events;
//   }, [zoomTimeline, includeBackground]);

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

//   // Calculate zoom level based on the zoom timeline with transitions
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = frame / fps;
//     const defaultZoom = includeBackground ? 0.8 : 1.0;
  
//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextEvent = zoomEvents[i + 1];
//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel,
//         prevZoomLevel
//       } = zoomEvent;
  
//       // Initial transition into this zoom level
//       if (timeInSeconds >= startTime && timeInSeconds < startTime + zoomEvent.zoom_transition_duration) {
//         const transitionProgress = (timeInSeconds - startTime) / zoomEvent.zoom_transition_duration;
//         return interpolateZoom(prevZoomLevel, zoomLevel, transitionProgress);
//       }
  
//       // During main zoom duration
//       if (timeInSeconds >= startTime + zoomEvent.zoom_transition_duration && timeInSeconds < endTime) {
//         return zoomLevel;
//       }
  
//       // During transition to next level
//       if (timeInSeconds >= transitionStartTime && timeInSeconds < transitionEndTime) {
//         const transitionProgress = (timeInSeconds - transitionStartTime) / zoomEvent.zoom_transition_duration;
//         const targetZoom = nextEvent ? nextEvent.zoomLevel : defaultZoom;
//         return interpolateZoom(zoomLevel, targetZoom, transitionProgress);
//       }
//     }
  
//     // Outside any zoom event, return to default
//     const lastEvent = zoomEvents[zoomEvents.length - 1];
//     if (timeInSeconds > lastEvent.endTime && timeInSeconds < lastEvent.transitionEndTime) {
//       const transitionProgress = (timeInSeconds - lastEvent.endTime) / lastEvent.zoom_transition_duration;
//       return interpolateZoom(lastEvent.zoomLevel, defaultZoom, transitionProgress);
//     }
  
//     return defaultZoom;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = [
//     ...zoomTimeline.map(event => event.zoomLevel)
//   ];
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const isNearEdge = (
//       cursorX: number,
//       cursorY: number,
//       trimmedWidth: number,
//       trimmedHeight: number,
//       currentZoom: number,
//     ) => {
//       const zoomedWidth = trimmedWidth * currentZoom;
//       const zoomedHeight = trimmedHeight * currentZoom;

//       const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
//       const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
//       const visibleTop = (zoomedHeight - trimmedHeight) / 2;
//       const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

//       const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.2; // 0.2 mean 20% of the viewport

//       const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
//       const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
//       const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
//       const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

//       return nearLeft || nearRight || nearTop || nearBottom;
//     };

//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     const edgeStates: boolean[] = []; // Track edge states

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Get current and previous zoom levels to detect zoom out
//       const currentZoom = getZoomLevel(f);
//       const previousZoom = f > 0 ? getZoomLevel(f - 1) : currentZoom;
//       const isZoomingOut = currentZoom < previousZoom;

//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth =
//         ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight =
//         ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;

//       // Get zoom level range for pan calculations
//       const allZoomLevels = [
//         ...zoomTimeline.map(event => event.zoomLevel),
//         includeBackground ? 0.8 : 1.0  // Include default zoom level
//       ];

//       // Calculate max pan based on max zoom level
//       const maxZoomLevel = Math.max(...allZoomLevels);
//       const minZoomLevel = Math.min(...allZoomLevels);
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);
//       const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//       const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

//       let targetPanX, targetPanY;

//       if (isZoomingOut) {
//         // During zoom out, gradually move towards center
//         const zoomOutProgress = 1 - currentZoom / previousZoom;
//         const easeProgress = smoothEaseInOut(zoomOutProgress, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         // Get previous pan position or default to cursor position
//         const prevPan = panPositions[Math.max(0, f - 1)] || {
//           panX: cursorPos.x - centerX,
//           panY: cursorPos.y - centerY,
//         };

//         // Interpolate between previous position and center
//         targetPanX = prevPan.panX * (1 - easeProgress);
//         targetPanY = prevPan.panY * (1 - easeProgress);
//       } else {
//         // During zoom in or normal panning, use existing cursor-following logic
//         const adjustedCursorX = Math.max(
//           -trimSettings.left,
//           Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x),
//         );
//         const adjustedCursorY = Math.max(
//           -trimSettings.top,
//           Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y),
//         );

//         targetPanX = adjustedCursorX - centerX;
//         targetPanY = adjustedCursorY - centerY;
//       }

//       // Calculate pan scale based on zoom
//       const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//       // Apply clamping
//       targetPanX = Math.max(
//         -maxPanX * 1.2,
//         Math.min(maxPanX * 1.2, targetPanX),
//       );
//       targetPanY = Math.max(
//         -maxPanY * 1.2,
//         Math.min(maxPanY * 1.2, targetPanY),
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });

//       // Check and store edge state
//       const nearEdge = isNearEdge(
//         cursorPos.x,
//         cursorPos.y,
//         trimmedWidth,
//         trimmedHeight,
//         currentZoom,
//       );
//       edgeStates.push(nearEdge);
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude// original working
//     const windowSize = 30; // Number of frames to consider for movement magnitude // test perfect

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Calculate distance from center
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;

//       // Calculate normalized distances separately (0 at center, 1 at edge)
//       const horizontalDistance =
//         Math.abs(cursorPositions[f].x - centerX) / (trimmedWidth / 2);
//       const verticalDistance =
//         Math.abs(cursorPositions[f].y - centerY) / (trimmedHeight / 2);

//       // Normalize distance (0 at center, 1 at edges)
//       // const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
//       const normalizedDistance = Math.min(
//         Math.max(horizontalDistance, verticalDistance * 1.2),
//         1,
//       );

//       // Dynamic threshold based on distance from center
//       const THRESHOLD_AT_CENTER = 550;
//       const THRESHOLD_AT_EDGE = 100;
//       const MOVEMENT_THRESHOLD =
//         THRESHOLD_AT_CENTER -
//         normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE);

//       // Dynamic alpha calculation
//       let alpha = 0;
//       if (movementMagnitude > MOVEMENT_THRESHOLD) {
//         const BASE_ALPHA = 0.00005;
//         // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
//         // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
//         // const MAX_ALPHA_CENTER = 0.005;  // original working
//         const MAX_ALPHA_CENTER = 0.0005; // Slower in center
//         const MAX_ALPHA_EDGE = 0.15; // Faster at edges

//         // Dynamic MAX_ALPHA based on distance from center
//         const MAX_ALPHA =
//           MAX_ALPHA_CENTER +
//           normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER);

//         const normalizedMagnitude =
//           Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//         const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         alpha = BASE_ALPHA + easedMagnitude * (MAX_ALPHA - BASE_ALPHA);
//         // Boost alpha for vertical movements near top/bottom
//         if (verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) {
//           alpha *= 1.3; // 30% boost for vertical movements near edges
//         }
//       }

//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY,
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//     getZoomLevel,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;


//   // 3. Pan Adjustment Section - similar update
//   const allZoomLevelsForPan = [
//     ...zoomTimeline.map(event => event.zoomLevel),
//     includeBackground ? 0.8 : 1.0  // Include default zoom level
//   ];

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...allZoomLevelsForPan);
//   const minZoomLevel = Math.min(...allZoomLevelsForPan);
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px 
//       ${trimSettings.right}px 
//       ${trimSettings.bottom}px 
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_7.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_7.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };



// // ////////////////////////////////////////////////////////////////////////////////////////
// // //////////////////////////////////////////////////////////////////////////////////////
// // ///// production code without fluid dynamic motion... panning bug fixed for background

// // // ZoomAndPanEffect.tsx
// import React, { useMemo } from 'react';
// import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
// import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
// import { cursorData } from './CursorData';
// import { makeTransform, scale, translate } from '@remotion/animation-utils';
// import { CameraView } from './CameraView';

// interface TrimSettings {
//   top: number; // Pixels to trim from top
//   bottom: number; // Pixels to trim from bottom
//   left: number; // Pixels to trim from left
//   right: number; // Pixels to trim from right
// }

// interface ZoomAndPanEffectProps {
//   mainVideoSrc: string;
//   includeBackground: boolean;
//   trimSettings?: TrimSettings;
//   originalDimensions: {
//     width: number;
//     height: number;
//   };
// }

// interface EasingConfig {
//   strength: number;
//   speedFactor: number;
//   smoothness: number;
//   threshold: number;
// }


// export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
//   mainVideoSrc,
//   includeBackground,
//   trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
//   originalDimensions,
// }) => {
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

//   const ORIGINAL_WIDTH = originalDimensions.width;
//   const ORIGINAL_HEIGHT = originalDimensions.height;
//   const BOX_SIZE = 100;
  
//   // Introduce the LOOKAHEAD_SECONDS parameter
//   const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

//   // Calculate trimmed dimensions
//   const trimmedWidth =
//     ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//   const trimmedHeight =
//     ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//   // Scale factor to maintain aspect ratio after trimming
//   const scaleX = ORIGINAL_WIDTH / trimmedWidth;
//   const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
//   const trimScale = Math.max(scaleX, scaleY);

//   // Option to select background type: 'image' or 'video'
//   const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

//   // Background source
//   // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
//   const backgroundSource =
//     backgroundType === 'image'
//       ? 'background_imgs/back1.jpg'
//       : 'background_video/backgroundVideo.mp4';


//       const zoomTimeline = useMemo(() => {
//         const defaultZoom = includeBackground ? 0.8 : 1.0;
        
//         if (!includeBackground) {
//           return [
//             {
//               zoom_startTime: 3,
//               zoomLevel: 1.5,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 13,
//               zoomLevel: 1.25,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 23,
//               zoomLevel: 1.5,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 33,
//               zoomLevel: 1.2,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 43,
//               zoomLevel: 1.8,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             },
//             {
//               zoom_startTime: 53,
//               zoomLevel: 1.0,
//               zoom_duration: 10,
//               zoom_transition_duration: 2
//             }
//           ];
//         }
      
//         return [
//           {
//             zoom_startTime: 3,
//             zoomLevel: 1.0,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 6,
//             zoomLevel: 1.25,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 9,
//             zoomLevel: 1.5,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 14,
//             zoomLevel: 1.2,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 19,
//             zoomLevel: 1.8,
//             zoom_duration: 3,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 22,
//             zoomLevel: 1.0,
//             zoom_duration: 6,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 28,
//             zoomLevel: 1.25,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           },
//           {
//             zoom_startTime: 33,
//             zoomLevel: 1.0,
//             zoom_duration: 5,
//             zoom_transition_duration: 2
//           }
//         ];
//       }, [includeBackground]);

//   // Build zoom events with start and end times
//   const zoomEvents = useMemo(() => {
//     const events = [] as any[];
//     let cumulativeTime = 0;
  
//     for (let i = 0; i < zoomTimeline.length; i++) {
//       const event = zoomTimeline[i];
//       const prevEvent = i > 0 ? zoomTimeline[i - 1] : null;
  
//       const zoomEvent = {
//         ...event,
//         startTime: event.zoom_startTime,
//         endTime: event.zoom_startTime + event.zoom_duration,
//         transitionStartTime: event.zoom_startTime + event.zoom_duration,
//         transitionEndTime: event.zoom_startTime + event.zoom_duration + event.zoom_transition_duration,
//         prevZoomLevel: prevEvent ? prevEvent.zoomLevel : (includeBackground ? 0.8 : 1.0)
//       };
  
//       events.push(zoomEvent);
//     }
  
//     return events;
//   }, [zoomTimeline, includeBackground]);

//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     return t < 0.5
//       ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
//       : 1 - Math.pow(-2 * t + 2, power) / 2;
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
//     return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: EasingConfig = {
//       strength: 1,
//       speedFactor: 1,
//       smoothness: 1,
//       threshold: 0,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };

//   // Helper functions for zoom calculations
//   const interpolateZoom = (
//     startZoom: number,
//     endZoom: number,
//     progress: number,
//   ) => {
//     // const easedProgress = easeInOutCubic(progress);
//     const easedProgress = smoothEaseInOut(progress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//     return startZoom + (endZoom - startZoom) * easedProgress;
//   };

//   // Easing function for camera size (optional)
//   const easeOutQuad = (t: number) => t * (2 - t);

//   // Calculate zoom level based on the zoom timeline with transitions
//   const getZoomLevel = (frame: number) => {
//     const timeInSeconds = frame / fps;
//     const defaultZoom = includeBackground ? 0.8 : 1.0;
  
//     for (let i = 0; i < zoomEvents.length; i++) {
//       const zoomEvent = zoomEvents[i];
//       const nextEvent = zoomEvents[i + 1];
//       const {
//         startTime,
//         endTime,
//         transitionStartTime,
//         transitionEndTime,
//         zoomLevel,
//         prevZoomLevel
//       } = zoomEvent;
  
//       // Initial transition into this zoom level
//       if (timeInSeconds >= startTime && timeInSeconds < startTime + zoomEvent.zoom_transition_duration) {
//         const transitionProgress = (timeInSeconds - startTime) / zoomEvent.zoom_transition_duration;
//         return interpolateZoom(prevZoomLevel, zoomLevel, transitionProgress);
//       }
  
//       // During main zoom duration
//       if (timeInSeconds >= startTime + zoomEvent.zoom_transition_duration && timeInSeconds < endTime) {
//         return zoomLevel;
//       }
  
//       // During transition to next level
//       if (timeInSeconds >= transitionStartTime && timeInSeconds < transitionEndTime) {
//         const transitionProgress = (timeInSeconds - transitionStartTime) / zoomEvent.zoom_transition_duration;
//         const targetZoom = nextEvent ? nextEvent.zoomLevel : defaultZoom;
//         return interpolateZoom(zoomLevel, targetZoom, transitionProgress);
//       }
//     }
  
//     // Outside any zoom event, return to default
//     const lastEvent = zoomEvents[zoomEvents.length - 1];
//     if (timeInSeconds > lastEvent.endTime && timeInSeconds < lastEvent.transitionEndTime) {
//       const transitionProgress = (timeInSeconds - lastEvent.endTime) / lastEvent.zoom_transition_duration;
//       return interpolateZoom(lastEvent.zoomLevel, defaultZoom, transitionProgress);
//     }
  
//     return defaultZoom;
//   };

//   const currentZoom = getZoomLevel(frame);

//   // Define camera widget size range
//   const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
//   const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

//   // Get min and max zoom levels from zoomTimeline
//   const zoomLevels = [
//     ...zoomTimeline.map(event => event.zoomLevel)
//   ];
//   const minminZoomLevel = Math.min(...zoomLevels);
//   const maxmaxZoomLevel = Math.max(...zoomLevels);
//   // Compute zoom range
//   const zoomRange = maxmaxZoomLevel - minminZoomLevel;
//   // Normalize current zoom level
//   const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
//   // Apply easing function
//   const easedZoom = easeOutQuad(normalizedZoom);
//   // Invert eased zoom to get camera size factor
//   const invertedEasedZoom = 1 - easedZoom;
//   // Compute camera size
//   const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
//   const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

//   // Precompute smoothed pan positions with adaptive smoothing
//   const smoothedPanPositions = useMemo(() => {
//     const isNearEdge = (
//       cursorX: number,
//       cursorY: number,
//       trimmedWidth: number,
//       trimmedHeight: number,
//       currentZoom: number,
//     ) => {
//       const zoomedWidth = trimmedWidth * currentZoom;
//       const zoomedHeight = trimmedHeight * currentZoom;

//       const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
//       const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
//       const visibleTop = (zoomedHeight - trimmedHeight) / 2;
//       const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

//       const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.2; // 0.2 mean 20% of the viewport

//       const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
//       const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
//       const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
//       const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

//       return nearLeft || nearRight || nearTop || nearBottom;
//     };

//     const panPositions: { panX: number; panY: number }[] = [];
//     const cursorPositions: { x: number; y: number }[] = [];

//     const edgeStates: boolean[] = []; // Track edge states

//     // First, create an array of pan positions for each frame and store cursor positions
//     for (let f = 0; f < durationInFrames; f++) {
//       // Get current and previous zoom levels to detect zoom out
//       const currentZoom = getZoomLevel(f);
//       const previousZoom = f > 0 ? getZoomLevel(f - 1) : currentZoom;
//       const isZoomingOut = currentZoom < previousZoom;

//       // Adjust the timestamp to look ahead into the future
//       const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
//       const maxTimestamp = (durationInFrames / fps) * 1000;
//       const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
//       const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

//       // Calculate trimmed viewport dimensions
//       const trimmedWidth =
//         ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//       const trimmedHeight =
//         ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;

//       // Get zoom level range for pan calculations
//       const allZoomLevels = [
//         ...zoomTimeline.map(event => event.zoomLevel),
//         includeBackground ? 0.8 : 1.0  // Include default zoom level
//       ];

//       // Calculate max pan based on max zoom level
//       const maxZoomLevel = Math.max(...allZoomLevels);
//       const minZoomLevel = Math.min(...allZoomLevels);
//       const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//       // In the first loop where pan positions are calculated
//       // Modify the maxPan calculation to consider video bounds when includeBackground is false
//       let maxPanX, maxPanY;
//       if (includeBackground) {
//         maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
//         maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);
//       } else {
//         // When no background, restrict pan to keep video in view
//         maxPanX = (trimmedWidth * currentZoom - trimmedWidth) / 2;
//         maxPanY = (trimmedHeight * currentZoom - trimmedHeight) / 2;
//       }
      

//       let targetPanX, targetPanY;

//       if (isZoomingOut) {
//         // During zoom out, gradually move towards center
//         const zoomOutProgress = 1 - currentZoom / previousZoom;
//         const easeProgress = smoothEaseInOut(zoomOutProgress, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         // Get previous pan position or default to cursor position
//         const prevPan = panPositions[Math.max(0, f - 1)] || {
//           panX: cursorPos.x - centerX,
//           panY: cursorPos.y - centerY,
//         };

//         // Interpolate between previous position and center
//         targetPanX = prevPan.panX * (1 - easeProgress);
//         targetPanY = prevPan.panY * (1 - easeProgress);
//       } else {
//         // During zoom in or normal panning, use existing cursor-following logic
//         const adjustedCursorX = Math.max(
//           -trimSettings.left,
//           Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x),
//         );
//         const adjustedCursorY = Math.max(
//           -trimSettings.top,
//           Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y),
//         );

//         targetPanX = adjustedCursorX - centerX;
//         targetPanY = adjustedCursorY - centerY;
//       }

//       // Calculate pan scale based on zoom
//       const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

//       // Apply clamping
//       // Then modify the clamping
//       targetPanX = Math.max(
//         -maxPanX,  // Remove the 1.2 multiplier when no background
//         Math.min(maxPanX, targetPanX)
//       );
//       targetPanY = Math.max(
//         -maxPanY,  // Remove the 1.2 multiplier when no background
//         Math.min(maxPanY, targetPanY)
//       );

//       panPositions.push({ panX: targetPanX, panY: targetPanY });
//       cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });

//       // Check and store edge state
//       const nearEdge = isNearEdge(
//         cursorPos.x,
//         cursorPos.y,
//         trimmedWidth,
//         trimmedHeight,
//         currentZoom,
//       );
//       edgeStates.push(nearEdge);
//     }

//     // Apply adaptive exponential smoothing over pan positions
//     const smoothedPanPositions: { panX: number; panY: number }[] = [];
//     let previousPanX = panPositions[0].panX;
//     let previousPanY = panPositions[0].panY;

//     // const windowSize = 90; // Number of frames to consider for movement magnitude// original working
//     const windowSize = 30; // Number of frames to consider for movement magnitude // test perfect

//     for (let f = 0; f < durationInFrames; f++) {
//       const startFrame = Math.max(0, f - windowSize + 1);
//       const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
//       const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

//       const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

//       // Calculate distance from center
//       const centerX = trimmedWidth / 2;
//       const centerY = trimmedHeight / 2;

//       // Calculate normalized distances separately (0 at center, 1 at edge)
//       const horizontalDistance =
//         Math.abs(cursorPositions[f].x - centerX) / (trimmedWidth / 2);
//       const verticalDistance =
//         Math.abs(cursorPositions[f].y - centerY) / (trimmedHeight / 2);

//       // Normalize distance (0 at center, 1 at edges)
//       // const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
//       const normalizedDistance = Math.min(
//         Math.max(horizontalDistance, verticalDistance * 1.2),
//         1,
//       );

//       // Dynamic threshold based on distance from center
//       const THRESHOLD_AT_CENTER = 550;
//       const THRESHOLD_AT_EDGE = 100;
//       const MOVEMENT_THRESHOLD =
//         THRESHOLD_AT_CENTER -
//         normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE);

//       // Dynamic alpha calculation
//       let alpha = 0;
//       if (movementMagnitude > MOVEMENT_THRESHOLD) {
//         const BASE_ALPHA = 0.00005;
//         // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
//         // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
//         // const MAX_ALPHA_CENTER = 0.005;  // original working
//         const MAX_ALPHA_CENTER = 0.0005; // Slower in center
//         const MAX_ALPHA_EDGE = 0.15; // Faster at edges

//         // Dynamic MAX_ALPHA based on distance from center
//         const MAX_ALPHA =
//           MAX_ALPHA_CENTER +
//           normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER);

//         const normalizedMagnitude =
//           Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

//         const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
//           strength: 8.5,
//           speedFactor: 0.5,
//           smoothness: 1.8,
//           threshold: 0.08,
//         });

//         alpha = BASE_ALPHA + easedMagnitude * (MAX_ALPHA - BASE_ALPHA);
//         // Boost alpha for vertical movements near top/bottom
//         if (verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) {
//           alpha *= 1.3; // 30% boost for vertical movements near edges
//         }
//       }

//       if (alpha > 0) {
//         const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
//         const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
//         smoothedPanPositions.push({ panX, panY });
//       } else {
//         smoothedPanPositions.push({
//           panX: previousPanX,
//           panY: previousPanY,
//         });
//       }

//       previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
//       previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
//     trimSettings,
//     getZoomLevel,
//   ]);

//   // Get pan values for the current frame
//   const panX = smoothedPanPositions[frame]?.panX || 0;
//   const panY = smoothedPanPositions[frame]?.panY || 0;


//   // 3. Pan Adjustment Section - similar update
//   const allZoomLevelsForPan = [
//     ...zoomTimeline.map(event => event.zoomLevel),
//     includeBackground ? 0.8 : 1.0  // Include default zoom level
//   ];

//   // Adjust pan values based on current zoom level
//   const maxZoomLevel = Math.max(...allZoomLevelsForPan);
//   const minZoomLevel = Math.min(...allZoomLevelsForPan);
//   const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

//   const getAdjustedPanFactor = (
//     zoom: number,
//     minZoom: number,
//     maxZoom: number,
//   ) => {
//     const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
//     return smoothEaseInOut(zoomProgress, {
//       strength: 8.5, // Match panning strength
//       speedFactor: 0.5,
//       smoothness: 1.8,
//       threshold: 0.08,
//     });
//   };
//   const panScaleFactor = getAdjustedPanFactor(
//     currentZoom,
//     minZoomLevel,
//     effectiveMaxZoomLevel,
//   );

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

//   // Modify the video container style to handle trimming
//   const videoContainerStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: trimmedWidth,
//     height: trimmedHeight,
//     transformOrigin: 'center center',
//     overflow: 'hidden',
//     transform: makeTransform([
//       translate(-adjustedPanX, -adjustedPanY),
//       scale(currentZoom),
//     ]),
//   };

//   // Create a style for the video element that includes trimming
//   const videoStyle: React.CSSProperties = {
//     position: 'absolute',
//     width: ORIGINAL_WIDTH,
//     height: ORIGINAL_HEIGHT,
//     transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
//     transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
//     clipPath: `inset(
//       ${trimSettings.top}px 
//       ${trimSettings.right}px 
//       ${trimSettings.bottom}px 
//       ${trimSettings.left}px
//     )`,
//   };

//   // Calculate new camera position based on trimmed dimensions
//   const getCameraPosition = () => {
//     // Calculate trimmed dimensions
//     const trimmedWidth =
//       ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
//     const trimmedHeight =
//       ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

//     // Calculate scale factor to fit trimmed video to canvas
//     const scaleX = width / trimmedWidth;
//     const scaleY = height / trimmedHeight;
//     const scale = Math.min(scaleX, scaleY);

//     // Scale camera size proportionally
//     const scaledCameraSize = cameraSize * scale;

//     // Position camera in bottom-right of trimmed area with padding
//     const padding = 20 * scale;
//     return {
//       x: width - scaledCameraSize - padding,
//       y: height - scaledCameraSize - padding,
//     };
//   };

//   const cameraPosition = getCameraPosition();

//   return (
//     <AbsoluteFill>
//       <div
//         style={{
//           position: 'relative',
//           width: trimmedWidth,
//           height: trimmedHeight,
//           overflow: 'hidden',
//         }}
//       >
//         {/* Background Layer - Only render if includeBackground is true */}
//         {includeBackground &&
//           (backgroundType === 'image' ? (
//             <Img
//               src={staticFile(backgroundSource)}
//               alt="Background"
//               style={backgroundStyle}
//             />
//           ) : (
//             <Video
//               src={staticFile(backgroundSource)}
//               style={backgroundStyle}
//               loop={true}
//               muted={true}
//             />
//           ))}

//         {/* Transformed and Trimmed Main Video */}
//         <div style={videoContainerStyle}>
//           <div style={videoStyle}>
//             <OffthreadVideo src={staticFile('assets/screen_7.webm')} />
//           </div>
//         </div>

//         {/* Camera view with adjusted position */}
//         <CameraView
//           videoSrc="assets/camera_7.webm"
//           position={cameraPosition}
//           width={cameraSize}
//           height={cameraSize}
//           borderRadius={70}
//           borderWidth={1}
//           borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
//           boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
//         />
//       </div>
//     </AbsoluteFill>
//   );
// };



// ////////////////////////////////////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////////////////////////////////
// ///// TEST 6 fixing edge panning issue
// BElow code is just a test and it's not working.. 

// // ZoomAndPanEffect.tsx
import React, { useMemo } from 'react';
import { OffthreadVideo, useCurrentFrame, useVideoConfig } from 'remotion';
import { AbsoluteFill, Img, staticFile, Video } from 'remotion';
import { cursorData } from './CursorData';
import { makeTransform, scale, translate } from '@remotion/animation-utils';
import { CameraView } from './CameraView';

interface TrimSettings {
  top: number; // Pixels to trim from top
  bottom: number; // Pixels to trim from bottom
  left: number; // Pixels to trim from left
  right: number; // Pixels to trim from right
}

interface ZoomAndPanEffectProps {
  mainVideoSrc: string;
  includeBackground: boolean;
  trimSettings?: TrimSettings;
  originalDimensions: {
    width: number;
    height: number;
  };
}

interface EasingConfig {
  strength: number;
  speedFactor: number;
  smoothness: number;
  threshold: number;
}


export const ZoomAndPanEffect: React.FC<ZoomAndPanEffectProps> = ({
  mainVideoSrc,
  includeBackground,
  trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
  originalDimensions,
}) => {
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

  const ORIGINAL_WIDTH = originalDimensions.width;
  const ORIGINAL_HEIGHT = originalDimensions.height;
  const BOX_SIZE = 100;
  
  // Introduce the LOOKAHEAD_SECONDS parameter
  const LOOKAHEAD_SECONDS = 0.7; // Adjust this value as needed

  // Calculate trimmed dimensions
  const trimmedWidth =
    ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
  const trimmedHeight =
    ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
  // Scale factor to maintain aspect ratio after trimming
  const scaleX = ORIGINAL_WIDTH / trimmedWidth;
  const scaleY = ORIGINAL_HEIGHT / trimmedHeight;
  const trimScale = Math.max(scaleX, scaleY);

  // Option to select background type: 'image' or 'video'
  const backgroundType: 'image' | 'video' = 'image'; // Change to 'video' if needed

  // Background source
  // const backgroundSource = backgroundType === 'image' ? 'path/to/background.jpg' : 'path/to/backgroundVideo.mp4';
  const backgroundSource =
    backgroundType === 'image'
      ? 'background_imgs/back1.jpg'
      : 'background_video/backgroundVideo.mp4';


      const zoomTimeline = useMemo(() => {
        const defaultZoom = includeBackground ? 0.8 : 1.0;
        
        if (!includeBackground) {
          return [
            {
              zoom_startTime: 3,
              zoomLevel: 1.5,
              zoom_duration: 70,
              zoom_transition_duration: 2
            },
            // {
            //   zoom_startTime: 13,
            //   zoomLevel: 1.25,
            //   zoom_duration: 10,
            //   zoom_transition_duration: 2
            // },
            // {
            //   zoom_startTime: 23,
            //   zoomLevel: 1.5,
            //   zoom_duration: 10,
            //   zoom_transition_duration: 2
            // },
            // {
            //   zoom_startTime: 33,
            //   zoomLevel: 1.2,
            //   zoom_duration: 10,
            //   zoom_transition_duration: 2
            // },
            // {
            //   zoom_startTime: 43,
            //   zoomLevel: 1.8,
            //   zoom_duration: 10,
            //   zoom_transition_duration: 2
            // },
            // {
            //   zoom_startTime: 53,
            //   zoomLevel: 1.0,
            //   zoom_duration: 10,
            //   zoom_transition_duration: 2
            // }
          ];
        }
      
        return [
          {
            zoom_startTime: 3,
            zoomLevel: 1.0,
            zoom_duration: 3,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 6,
            zoomLevel: 1.25,
            zoom_duration: 3,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 9,
            zoomLevel: 1.5,
            zoom_duration: 5,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 14,
            zoomLevel: 1.2,
            zoom_duration: 5,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 19,
            zoomLevel: 1.8,
            zoom_duration: 3,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 22,
            zoomLevel: 1.0,
            zoom_duration: 6,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 28,
            zoomLevel: 1.25,
            zoom_duration: 5,
            zoom_transition_duration: 2
          },
          {
            zoom_startTime: 33,
            zoomLevel: 1.0,
            zoom_duration: 5,
            zoom_transition_duration: 2
          }
        ];
      }, [includeBackground]);

  // Build zoom events with start and end times
  const zoomEvents = useMemo(() => {
    const events = [] as any[];
    let cumulativeTime = 0;
  
    for (let i = 0; i < zoomTimeline.length; i++) {
      const event = zoomTimeline[i];
      const prevEvent = i > 0 ? zoomTimeline[i - 1] : null;
  
      const zoomEvent = {
        ...event,
        startTime: event.zoom_startTime,
        endTime: event.zoom_startTime + event.zoom_duration,
        transitionStartTime: event.zoom_startTime + event.zoom_duration,
        transitionEndTime: event.zoom_startTime + event.zoom_duration + event.zoom_transition_duration,
        prevZoomLevel: prevEvent ? prevEvent.zoomLevel : (includeBackground ? 0.8 : 1.0)
      };
  
      events.push(zoomEvent);
    }
  
    return events;
  }, [zoomTimeline, includeBackground]);

  const easeInOutQuint = (t: number, strength: number = 1) => {
    const power = 5 * strength;
    return t < 0.5
      ? Math.pow(16 * t, power) / Math.pow(16, power - 1)
      : 1 - Math.pow(-2 * t + 2, power) / 2;
  };

  const easeInOutExpo = (t: number, speedFactor: number = 1) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const factor = 20 * speedFactor;
    if (t < 0.5) return Math.pow(2, factor * t - factor / 2) / 2;
    return (2 - Math.pow(2, -factor * t + factor / 2)) / 2;
  };

  const smoothEaseInOut = (
    t: number,
    config: EasingConfig = {
      strength: 1,
      speedFactor: 1,
      smoothness: 1,
      threshold: 0,
    },
  ) => {
    if (Math.abs(t) < config.threshold) return 0;

    t = Math.max(0, Math.min(1, t));

    const expo = easeInOutExpo(t, config.speedFactor);
    const quint = easeInOutQuint(t, config.strength);

    const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

    return expo * blend + quint * (1 - blend);
  };

  // Helper functions for zoom calculations
  const interpolateZoom = (
    startZoom: number,
    endZoom: number,
    progress: number,
  ) => {
    // const easedProgress = easeInOutCubic(progress);
    const easedProgress = smoothEaseInOut(progress, {
      strength: 8.5, // Match panning strength
      speedFactor: 0.5,
      smoothness: 1.8,
      threshold: 0.08,
    });
    return startZoom + (endZoom - startZoom) * easedProgress;
  };

  // Easing function for camera size (optional)
  const easeOutQuad = (t: number) => t * (2 - t);

  // Calculate zoom level based on the zoom timeline with transitions
  const getZoomLevel = (frame: number) => {
    const timeInSeconds = frame / fps;
    const defaultZoom = includeBackground ? 0.8 : 1.0;
  
    for (let i = 0; i < zoomEvents.length; i++) {
      const zoomEvent = zoomEvents[i];
      const nextEvent = zoomEvents[i + 1];
      const {
        startTime,
        endTime,
        transitionStartTime,
        transitionEndTime,
        zoomLevel,
        prevZoomLevel
      } = zoomEvent;
  
      // Initial transition into this zoom level
      if (timeInSeconds >= startTime && timeInSeconds < startTime + zoomEvent.zoom_transition_duration) {
        const transitionProgress = (timeInSeconds - startTime) / zoomEvent.zoom_transition_duration;
        return interpolateZoom(prevZoomLevel, zoomLevel, transitionProgress);
      }
  
      // During main zoom duration
      if (timeInSeconds >= startTime + zoomEvent.zoom_transition_duration && timeInSeconds < endTime) {
        return zoomLevel;
      }
  
      // During transition to next level
      if (timeInSeconds >= transitionStartTime && timeInSeconds < transitionEndTime) {
        const transitionProgress = (timeInSeconds - transitionStartTime) / zoomEvent.zoom_transition_duration;
        const targetZoom = nextEvent ? nextEvent.zoomLevel : defaultZoom;
        return interpolateZoom(zoomLevel, targetZoom, transitionProgress);
      }
    }
  
    // Outside any zoom event, return to default
    const lastEvent = zoomEvents[zoomEvents.length - 1];
    if (timeInSeconds > lastEvent.endTime && timeInSeconds < lastEvent.transitionEndTime) {
      const transitionProgress = (timeInSeconds - lastEvent.endTime) / lastEvent.zoom_transition_duration;
      return interpolateZoom(lastEvent.zoomLevel, defaultZoom, transitionProgress);
    }
  
    return defaultZoom;
  };

  const currentZoom = getZoomLevel(frame);

  // Define camera widget size range
  const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
  const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

  // Get min and max zoom levels from zoomTimeline
  const zoomLevels = [
    ...zoomTimeline.map(event => event.zoomLevel)
  ];
  const minminZoomLevel = Math.min(...zoomLevels);
  const maxmaxZoomLevel = Math.max(...zoomLevels);
  // Compute zoom range
  const zoomRange = maxmaxZoomLevel - minminZoomLevel;
  // Normalize current zoom level
  const normalizedZoom = (currentZoom - minminZoomLevel) / zoomRange;
  // Apply easing function
  const easedZoom = easeOutQuad(normalizedZoom);
  // Invert eased zoom to get camera size factor
  const invertedEasedZoom = 1 - easedZoom;
  // Compute camera size
  const cameraSizeRange = CAMERA_MAX_SIZE - CAMERA_MIN_SIZE;
  const cameraSize = CAMERA_MIN_SIZE + cameraSizeRange * invertedEasedZoom;

  // Precompute smoothed pan positions with adaptive smoothing
  const smoothedPanPositions = useMemo(() => {
    const isNearEdge = (
      cursorX: number,
      cursorY: number,
      trimmedWidth: number,
      trimmedHeight: number,
      currentZoom: number,
    ) => {
      const zoomedWidth = trimmedWidth * currentZoom;
      const zoomedHeight = trimmedHeight * currentZoom;

      const visibleLeft = (zoomedWidth - trimmedWidth) / 2;
      const visibleRight = trimmedWidth - (zoomedWidth - trimmedWidth) / 2;
      const visibleTop = (zoomedHeight - trimmedHeight) / 2;
      const visibleBottom = trimmedHeight - (zoomedHeight - trimmedHeight) / 2;

      const edgeThreshold = Math.min(trimmedWidth, trimmedHeight) * 0.2; // 0.2 mean 20% of the viewport

      const nearLeft = Math.abs(cursorX - visibleLeft) < edgeThreshold;
      const nearRight = Math.abs(cursorX - visibleRight) < edgeThreshold;
      const nearTop = Math.abs(cursorY - visibleTop) < edgeThreshold;
      const nearBottom = Math.abs(cursorY - visibleBottom) < edgeThreshold;

      return nearLeft || nearRight || nearTop || nearBottom;
    };

    const panPositions: { panX: number; panY: number }[] = [];
    const cursorPositions: { x: number; y: number }[] = [];

    const edgeStates: boolean[] = []; // Track edge states

    // First, create an array of pan positions for each frame and store cursor positions
    for (let f = 0; f < durationInFrames; f++) {
      // Get current and previous zoom levels to detect zoom out
      const currentZoom = getZoomLevel(f);
      const previousZoom = f > 0 ? getZoomLevel(f - 1) : currentZoom;
      const isZoomingOut = currentZoom < previousZoom;
      

      // Adjust the timestamp to look ahead into the future
      const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
      const maxTimestamp = (durationInFrames / fps) * 1000;
      const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
      const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

      // Calculate trimmed viewport dimensions
      const trimmedWidth =
        ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
      const trimmedHeight =
        ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);
      const centerX = trimmedWidth / 2;
      const centerY = trimmedHeight / 2;

      // Get zoom level range for pan calculations
      const allZoomLevels = [
        ...zoomTimeline.map(event => event.zoomLevel),
        includeBackground ? 0.8 : 1.0  // Include default zoom level
      ];

      // Calculate max pan based on max zoom level
      const maxZoomLevel = Math.max(...allZoomLevels);
      const minZoomLevel = Math.min(...allZoomLevels);
      const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

      // In the first loop where pan positions are calculated
      // Modify the maxPan calculation to consider video bounds when includeBackground is false
      let maxPanX, maxPanY;
      if (includeBackground) {
        maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
        maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);
      } else {
        // When no background, restrict pan to keep video in view
        maxPanX = (trimmedWidth * currentZoom - trimmedWidth) / 2;
        maxPanY = (trimmedHeight * currentZoom - trimmedHeight) / 2;
      }
      

      let targetPanX, targetPanY;

      if (isZoomingOut) {
        // During zoom out, gradually move towards center
        const zoomOutProgress = 1 - currentZoom / previousZoom;
        const easeProgress = smoothEaseInOut(zoomOutProgress, {
          strength: 8.5,
          speedFactor: 0.5,
          smoothness: 1.8,
          threshold: 0.08,
        });

        // Get previous pan position or default to cursor position
        const prevPan = panPositions[Math.max(0, f - 1)] || {
          panX: cursorPos.x - centerX,
          panY: cursorPos.y - centerY,
        };

        // Interpolate between previous position and center
        targetPanX = prevPan.panX * (1 - easeProgress);
        targetPanY = prevPan.panY * (1 - easeProgress);
      } else {
        // During zoom in or normal panning, use existing cursor-following logic
        const adjustedCursorX = Math.max(
          -trimSettings.left,
          Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x),
        );
        const adjustedCursorY = Math.max(
          -trimSettings.top,
          Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y),
        );

        targetPanX = adjustedCursorX - centerX;
        targetPanY = adjustedCursorY - centerY;
      }

      // Calculate pan scale based on zoom
      const zoomPanScale = (effectiveMaxZoomLevel - 1) / effectiveMaxZoomLevel;

      // Apply clamping
      // Then modify the clamping
      targetPanX = Math.max(
        -maxPanX,  // Remove the 1.2 multiplier when no background
        Math.min(maxPanX, targetPanX)
      );
      targetPanY = Math.max(
        -maxPanY,  // Remove the 1.2 multiplier when no background
        Math.min(maxPanY, targetPanY)
      );

      panPositions.push({ panX: targetPanX, panY: targetPanY });
      cursorPositions.push({ x: cursorPos.x, y: cursorPos.y });

      // Check and store edge state
      const nearEdge = isNearEdge(
        cursorPos.x,
        cursorPos.y,
        trimmedWidth,
        trimmedHeight,
        currentZoom,
      );
      edgeStates.push(nearEdge);
    }

    // Apply adaptive exponential smoothing over pan positions
    const smoothedPanPositions: { panX: number; panY: number }[] = [];
    let previousPanX = panPositions[0].panX;
    let previousPanY = panPositions[0].panY;

    // const windowSize = 90; // Number of frames to consider for movement magnitude// original working
    const windowSize = 60; // Number of frames to consider for movement magnitude // test perfect

    for (let f = 0; f < durationInFrames; f++) {
      const startFrame = Math.max(0, f - windowSize + 1);
      const deltaX = cursorPositions[f].x - cursorPositions[startFrame].x;
      const deltaY = cursorPositions[f].y - cursorPositions[startFrame].y;

      const movementMagnitude = Math.max(Math.abs(deltaX), Math.abs(deltaY));

      // Calculate distance from center
      const centerX = trimmedWidth / 2;
      const centerY = trimmedHeight / 2;

      // Calculate normalized distances separately (0 at center, 1 at edge)
      const horizontalDistance =
        Math.abs(cursorPositions[f].x - centerX) / (trimmedWidth / 2);
      const verticalDistance =
        Math.abs(cursorPositions[f].y - centerY) / (trimmedHeight / 2);

      // Normalize distance (0 at center, 1 at edges)
      // const maxDistance = Math.sqrt(Math.pow(trimmedWidth/2, 2) + Math.pow(trimmedHeight/2, 2));
      let normalizedDistance;
      if (currentZoom >= 1.5) {
        normalizedDistance = Math.min(
          Math.max(horizontalDistance, verticalDistance * 1.2),
          1,
        );
      } else {
        normalizedDistance = Math.min(
          Math.max(horizontalDistance, verticalDistance * 1.2),
          1,
        );
      }

      // Dynamic threshold based on distance from center
      const THRESHOLD_AT_CENTER = 550;
      const THRESHOLD_AT_EDGE = 100;
      const MOVEMENT_THRESHOLD =
        THRESHOLD_AT_CENTER -
        normalizedDistance * (THRESHOLD_AT_CENTER - THRESHOLD_AT_EDGE);

      // Dynamic alpha calculation
      let alpha = 0;
      if (movementMagnitude > MOVEMENT_THRESHOLD) {
        const BASE_ALPHA = 0.00005;
        // const MAX_ALPHA_CENTER = 0.05;  // Slower in center
        // const MAX_ALPHA_EDGE = 0.15;    // Faster at edges
        // const MAX_ALPHA_CENTER = 0.005;  // original working
        const MAX_ALPHA_CENTER = 0.00005; // Slower in center
        const MAX_ALPHA_EDGE = 0.15; // Faster at edges

        // Dynamic MAX_ALPHA based on distance from center
        const MAX_ALPHA =
          MAX_ALPHA_CENTER +
          normalizedDistance * (MAX_ALPHA_EDGE - MAX_ALPHA_CENTER);

        const normalizedMagnitude =
          Math.max(0, movementMagnitude - MOVEMENT_THRESHOLD) / 400;

        const easedMagnitude = smoothEaseInOut(normalizedMagnitude, {
          strength: 8.5,
          speedFactor: 0.5,
          smoothness: 1.8,
          threshold: 0.08,
        });

        alpha = BASE_ALPHA + easedMagnitude * (MAX_ALPHA - BASE_ALPHA);
        // Boost alpha for vertical movements near top/bottom
        if (verticalDistance > 0.7 && Math.abs(deltaY) > Math.abs(deltaX)) {
          alpha *= 1.3; // 30% boost for vertical movements near edges
        }
      }

      if (alpha > 0) {
        const panX = alpha * panPositions[f].panX + (1 - alpha) * previousPanX;
        const panY = alpha * panPositions[f].panY + (1 - alpha) * previousPanY;
        smoothedPanPositions.push({ panX, panY });
      } else {
        smoothedPanPositions.push({
          panX: previousPanX,
          panY: previousPanY,
        });
      }

      previousPanX = smoothedPanPositions[smoothedPanPositions.length - 1].panX;
      previousPanY = smoothedPanPositions[smoothedPanPositions.length - 1].panY;
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
    trimSettings,
    getZoomLevel,
  ]);

  // Get pan values for the current frame
  const panX = smoothedPanPositions[frame]?.panX || 0;
  const panY = smoothedPanPositions[frame]?.panY || 0;


  // 3. Pan Adjustment Section - similar update
  const allZoomLevelsForPan = [
    ...zoomTimeline.map(event => event.zoomLevel),
    includeBackground ? 0.8 : 1.0  // Include default zoom level
  ];

  // Adjust pan values based on current zoom level
  const maxZoomLevel = Math.max(...allZoomLevelsForPan);
  const minZoomLevel = Math.min(...allZoomLevelsForPan);
  const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

  const getAdjustedPanFactor = (
    zoom: number,
    minZoom: number,
    maxZoom: number,
  ) => {
    const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
    return smoothEaseInOut(zoomProgress, {
      strength: 8.5, // Match panning strength
      speedFactor: 0.5,
      smoothness: 1.8,
      threshold: 0.08,
    });
  };
  const panScaleFactor = getAdjustedPanFactor(
    currentZoom,
    minZoomLevel,
    effectiveMaxZoomLevel,
  );

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

  // Modify the video container style to handle trimming
  const videoContainerStyle: React.CSSProperties = {
    position: 'absolute',
    width: trimmedWidth,
    height: trimmedHeight,
    transformOrigin: 'center center',
    overflow: 'hidden',
    transform: makeTransform([
      translate(-adjustedPanX, -adjustedPanY),
      scale(currentZoom),
    ]),
  };

  // Create a style for the video element that includes trimming
  const videoStyle: React.CSSProperties = {
    position: 'absolute',
    width: ORIGINAL_WIDTH,
    height: ORIGINAL_HEIGHT,
    transformOrigin: `${trimSettings.left}px ${trimSettings.top}px`, // Set transform origin to trim point
    transform: `translate(${-trimSettings.left}px, ${-trimSettings.top}px)`, // Offset by trim amount
    clipPath: `inset(
      ${trimSettings.top}px 
      ${trimSettings.right}px 
      ${trimSettings.bottom}px 
      ${trimSettings.left}px
    )`,
  };

  // Calculate new camera position based on trimmed dimensions
  const getCameraPosition = () => {
    // Calculate trimmed dimensions
    const trimmedWidth =
      ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
    const trimmedHeight =
      ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

    // Calculate scale factor to fit trimmed video to canvas
    const scaleX = width / trimmedWidth;
    const scaleY = height / trimmedHeight;
    const scale = Math.min(scaleX, scaleY);

    // Scale camera size proportionally
    const scaledCameraSize = cameraSize * scale;

    // Position camera in bottom-right of trimmed area with padding
    const padding = 20 * scale;
    return {
      x: width - scaledCameraSize - padding,
      y: height - scaledCameraSize - padding,
    };
  };

  const cameraPosition = getCameraPosition();

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'relative',
          width: trimmedWidth,
          height: trimmedHeight,
          overflow: 'hidden',
        }}
      >
        {/* Background Layer - Only render if includeBackground is true */}
        {includeBackground &&
          (backgroundType === 'image' ? (
            <Img
              src={staticFile(backgroundSource)}
              alt="Background"
              style={backgroundStyle}
            />
          ) : (
            <Video
              src={staticFile(backgroundSource)}
              style={backgroundStyle}
              loop={true}
              muted={true}
            />
          ))}

        {/* Transformed and Trimmed Main Video */}
        <div style={videoContainerStyle}>
          <div style={videoStyle}>
            <OffthreadVideo src={staticFile('assets/screen_7.webm')} />
          </div>
        </div>

        {/* Camera view with adjusted position */}
        <CameraView
          videoSrc="assets/camera_7.webm"
          position={cameraPosition}
          width={cameraSize}
          height={cameraSize}
          borderRadius={70}
          borderWidth={1}
          borderGradient="linear-gradient(45deg, #f3ec78, #af4261)"
          boxShadow="0 0px 80px 50px rgba(0, 0, 0, 0.5)"
        />
      </div>
    </AbsoluteFill>
  );
};
