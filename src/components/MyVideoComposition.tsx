// ////////////////////////////////////////////////////////////////////////////////
// //////////////// PERFECTLY WORKING CODE Below with cursor lookahead //////////////////////////////////

// import React, { useState, useEffect, useMemo } from "react";
// import { OffthreadVideo, staticFile, useVideoConfig, useCurrentFrame } from "remotion";
// import { cursorData } from "./CursorData";

// function lerp(current: number, target: number, alpha: number) {
//   return current + (target - current) * alpha;
// }

// export default function VideoZoomPanExample() {
//   const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
//   const frame = useCurrentFrame();
//   const currentTime = frame / fps; // Convert frame to seconds

//   // Look-ahead time in seconds
//   const LOOK_AHEAD = 0.4;

//   // Get the recorded video dimensions from cursorData
//   const RECORDED_WIDTH = cursorData.recording_info.recorded_display_dimension.width;
//   const RECORDED_HEIGHT = cursorData.recording_info.recorded_display_dimension.height;

//   // Calculate scaling factors to fill the screen completely
//   const scaleX = COMP_WIDTH / RECORDED_WIDTH;
//   const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
//   // Use maximum scale to ensure no black borders
//   const scale = Math.max(scaleX, scaleY);

//   // Calculate dimensions that will cover the entire composition
//   const scaledWidth = RECORDED_WIDTH * scale;
//   const scaledHeight = RECORDED_HEIGHT * scale;
//   // Center the scaled video
//   const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
//   const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

//   const EDGE_MARGIN = 50 * scale;
//   const PAN_EXTRA = 200 * scale;

//   // States
//   const [offsetX, setOffsetX] = useState(0);
//   const [offsetY, setOffsetY] = useState(0);
//   const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
//   const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
//   const [targetOffsetX, setTargetOffsetX] = useState(0);
//   const [targetOffsetY, setTargetOffsetY] = useState(0);
//   const [cursorX, setCursorX] = useState(0);
//   const [cursorY, setCursorY] = useState(0);

//   // Dynamic dimensions based on zoom
//   const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
//   const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

//   // Zoom timeline definition
//   const zoomTimeline = useMemo(() => {
//     return [
//       {
//         zoom_startTime: 3,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 33,
//         zoomLevel: 1.2,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 43,
//         zoomLevel: 1.8,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//     ];
//   }, []);

//   // Function to get cursor position at a specific time
//   const getCursorAtTime = (time: number) => {
//     const tracking = cursorData.tracking_data;
//     if (!tracking?.length) return null;

//     const dataPoint = tracking.find(
//       item => item.recorded_display_data.timestamp / 1000 >= time
//     ) || tracking[tracking.length - 1];

//     return dataPoint.recorded_display_data;
//   };

//   // Zoom timeline handler
//   useEffect(() => {
//     const activeZoom = zoomTimeline.find(
//       zoom => currentTime >= zoom.zoom_startTime &&
//       currentTime < zoom.zoom_startTime + zoom.zoom_duration
//     );
//     setTargetZoomLevel(activeZoom ? activeZoom.zoomLevel : 1.0);
//   }, [currentTime, zoomTimeline]);

//   // Smooth zoom interpolation
//   useEffect(() => {
//     const smoothingSpeed = 0.09;
//     setCurrentZoomLevel(prevZoom => lerp(prevZoom, targetZoomLevel, smoothingSpeed));
//   }, [targetZoomLevel, frame]);

//   // Cursor tracking and viewport adjustment with look-ahead
//   useEffect(() => {
//     // Get look-ahead cursor position for both display and panning
//     const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//     if (!futureCursor) return;

//     // Set cursor position with look-ahead
//     setCursorX(futureCursor.x);
//     setCursorY(futureCursor.y);

//     // Use future cursor for panning calculations
//     const scaledFutureX = futureCursor.x * scale;
//     const scaledFutureY = futureCursor.y * scale;

//     let newTargetX = targetOffsetX;
//     let newTargetY = targetOffsetY;

//     // Calculate panning based on future position
//     if (scaledFutureX < newTargetX + EDGE_MARGIN) {
//       newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
//       newTargetX = scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     if (scaledFutureY < newTargetY + EDGE_MARGIN) {
//       newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
//       newTargetY = scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     // Clamp values
//     newTargetX = Math.max(0, Math.min(scaledWidth - dynamicZoomedWidth, newTargetX));
//     newTargetY = Math.max(0, Math.min(scaledHeight - dynamicZoomedHeight, newTargetY));

//     setTargetOffsetX(newTargetX);
//     setTargetOffsetY(newTargetY);
//   }, [currentTime, dynamicZoomedWidth, dynamicZoomedHeight, targetOffsetX, targetOffsetY, scale]);

//   // Smooth panning update
//   useEffect(() => {
//     const smoothingSpeed = 0.1;
//     const alpha = 1 - Math.exp((-smoothingSpeed * 16) / 16);

//     setOffsetX(prev => lerp(prev, targetOffsetX, alpha));
//     setOffsetY(prev => lerp(prev, targetOffsetY, alpha));
//   }, [targetOffsetX, targetOffsetY, frame]);

//   return (
//     <div className="relative w-full h-full overflow-hidden bg-black">
//       <div
//         style={{
//           position: "absolute",
//           left: offsetLeft,
//           top: offsetTop,
//           width: scaledWidth,
//           height: scaledHeight,
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             left: -offsetX * currentZoomLevel,
//             top: -offsetY * currentZoomLevel,
//             width: "100%",
//             height: "100%",
//             transform: `scale(${currentZoomLevel})`,
//             transformOrigin: "0 0",
//           }}
//         >
//           <OffthreadVideo
//             src={staticFile('assets/screen_7.webm')}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />

//           <div
//             style={{
//               position: "absolute",
//               left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
//               top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               backgroundColor: "blue",
//               transform: "translate(-50%, -50%)",
//               pointerEvents: "none",
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// //////////////// Working code but in test mode //////////////////////////////////

// import React, { useState, useEffect, useMemo } from "react";
// import { OffthreadVideo, staticFile, useVideoConfig, useCurrentFrame } from "remotion";
// import { cursorData } from "./CursorData";

// function lerp(current: number, target: number, alpha: number) {
//   return current + (target - current) * alpha;
// }

// export default function VideoZoomPanExample() {
//   const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
//   const frame = useCurrentFrame();
//   const currentTime = frame / fps; // Convert frame to seconds

//   // Look-ahead time in seconds
//   const LOOK_AHEAD = 0.4;

//   // Get the recorded video dimensions from cursorData
//   const RECORDED_WIDTH = cursorData.recording_info.recorded_display_dimension.width;
//   const RECORDED_HEIGHT = cursorData.recording_info.recorded_display_dimension.height;

//   // Calculate scaling factors to fill the screen completely
//   const scaleX = COMP_WIDTH / RECORDED_WIDTH;
//   const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
//   // Use maximum scale to ensure no black borders
//   const scale = Math.max(scaleX, scaleY);

//   // Calculate dimensions that will cover the entire composition
//   const scaledWidth = RECORDED_WIDTH * scale;
//   const scaledHeight = RECORDED_HEIGHT * scale;
//   // Center the scaled video
//   const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
//   const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

//   const EDGE_MARGIN = 50 * scale;
//   const PAN_EXTRA = 200 * scale;

//   // States
//   const [offsetX, setOffsetX] = useState(0);
//   const [offsetY, setOffsetY] = useState(0);
//   const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
//   const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
//   const [targetOffsetX, setTargetOffsetX] = useState(0);
//   const [targetOffsetY, setTargetOffsetY] = useState(0);
//   const [cursorX, setCursorX] = useState(0);
//   const [cursorY, setCursorY] = useState(0);

//   // Dynamic dimensions based on zoom
//   const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
//   const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

//   // Zoom timeline definition
//   const zoomTimeline = useMemo(() => {
//     return [
//       {
//         zoom_startTime: 3,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 13,
//         zoomLevel: 1.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 23,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 33,
//         zoomLevel: 1.2,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 43,
//         zoomLevel: 1.8,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//     ];
//   }, []);

//   // Function to get cursor position at a specific time
//   const getCursorAtTime = (time: number) => {
//     const tracking = cursorData.tracking_data;
//     if (!tracking?.length) return null;

//     const dataPoint = tracking.find(
//       item => item.recorded_display_data.timestamp / 1000 >= time
//     ) || tracking[tracking.length - 1];

//     return dataPoint.recorded_display_data;
//   };

//   // Zoom timeline handler
//   useEffect(() => {
//     const activeZoom = zoomTimeline.find(
//       zoom => currentTime >= zoom.zoom_startTime &&
//       currentTime < zoom.zoom_startTime + zoom.zoom_duration
//     );
//     setTargetZoomLevel(activeZoom ? activeZoom.zoomLevel : 1.0);
//   }, [currentTime, zoomTimeline]);

//   // Smooth zoom interpolation
//   useEffect(() => {
//     const smoothingSpeed = 0.09;
//     setCurrentZoomLevel(prevZoom => lerp(prevZoom, targetZoomLevel, smoothingSpeed));
//   }, [targetZoomLevel, frame]);

//   // Cursor tracking and viewport adjustment with look-ahead
//   useEffect(() => {
//     // Get look-ahead cursor position for both display and panning
//     const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//     if (!futureCursor) return;

//     // Set cursor position with look-ahead
//     setCursorX(futureCursor.x);
//     setCursorY(futureCursor.y);

//     // Use future cursor for panning calculations
//     const scaledFutureX = futureCursor.x * scale;
//     const scaledFutureY = futureCursor.y * scale;

//     let newTargetX = targetOffsetX;
//     let newTargetY = targetOffsetY;

//     // Calculate panning based on future position
//     if (scaledFutureX < newTargetX + EDGE_MARGIN) {
//       newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
//       newTargetX = scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     if (scaledFutureY < newTargetY + EDGE_MARGIN) {
//       newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
//       newTargetY = scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     // Clamp values
//     newTargetX = Math.max(0, Math.min(scaledWidth - dynamicZoomedWidth, newTargetX));
//     newTargetY = Math.max(0, Math.min(scaledHeight - dynamicZoomedHeight, newTargetY));

//     setTargetOffsetX(newTargetX);
//     setTargetOffsetY(newTargetY);
//   }, [currentTime, dynamicZoomedWidth, dynamicZoomedHeight, targetOffsetX, targetOffsetY, scale]);

//   // Smooth panning update
//   useEffect(() => {
//     const smoothingSpeed = 0.1;
//     const alpha = 1 - Math.exp((-smoothingSpeed * 16) / 16);

//     setOffsetX(prev => lerp(prev, targetOffsetX, alpha));
//     setOffsetY(prev => lerp(prev, targetOffsetY, alpha));
//   }, [targetOffsetX, targetOffsetY, frame]);

//   return (
//     <div className="relative w-full h-full overflow-hidden bg-black">
//       <div
//         style={{
//           position: "absolute",
//           left: offsetLeft,
//           top: offsetTop,
//           width: scaledWidth,
//           height: scaledHeight,
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             left: -offsetX * currentZoomLevel,
//             top: -offsetY * currentZoomLevel,
//             width: "100%",
//             height: "100%",
//             transform: `scale(${currentZoomLevel})`,
//             transformOrigin: "0 0",
//           }}
//         >
//           <OffthreadVideo
//             src={staticFile('assets/screen_7.webm')}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />

//           <div
//             style={{
//               position: "absolute",
//               left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
//               top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               backgroundColor: "blue",
//               transform: "translate(-50%, -50%)",
//               pointerEvents: "none",
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

////////////////////////////////////////////////////////////////////////////////
//////////////// Working for zooming out no black background  //////////////////////////////////

// import React, { useState, useEffect, useMemo } from "react";
// import { OffthreadVideo, staticFile, useVideoConfig, useCurrentFrame } from "remotion";
// import { cursorData } from "./CursorData";

// function lerp(current: number, target: number, alpha: number) {
//   return current + (target - current) * alpha;
// }

// export default function VideoZoomPanExample() {
//   const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
//   const frame = useCurrentFrame();
//   const currentTime = frame / fps; // Convert frame to seconds

//   // Look-ahead time in seconds
//   const LOOK_AHEAD = 0.4;

//   // Get the recorded video dimensions from cursorData
//   const RECORDED_WIDTH = cursorData.recording_info.recorded_display_dimension.width;
//   const RECORDED_HEIGHT = cursorData.recording_info.recorded_display_dimension.height;

//   // Calculate scaling factors to fill the screen completely
//   const scaleX = COMP_WIDTH / RECORDED_WIDTH;
//   const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
//   // Use maximum scale to ensure no black borders
//   const scale = Math.max(scaleX, scaleY);

//   // Calculate dimensions that will cover the entire composition
//   const scaledWidth = RECORDED_WIDTH * scale;
//   const scaledHeight = RECORDED_HEIGHT * scale;
//   // Center the scaled video
//   const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
//   const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

//   const EDGE_MARGIN = 50 * scale;
//   const PAN_EXTRA = 200 * scale;

//   // States
//   const [offsetX, setOffsetX] = useState(0);
//   const [offsetY, setOffsetY] = useState(0);
//   const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
//   const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
//   const [targetOffsetX, setTargetOffsetX] = useState(0);
//   const [targetOffsetY, setTargetOffsetY] = useState(0);
//   const [cursorX, setCursorX] = useState(0);
//   const [cursorY, setCursorY] = useState(0);

//   // Dynamic dimensions based on zoom
//   const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
//   const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

//   // Zoom timeline definition
//   const zoomTimeline = useMemo(() => {
//     return [
//       {
//         zoom_startTime: 3,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 13,
//         zoomLevel: 1.0,
//         zoom_duration: 2,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 15,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 25,
//         zoomLevel: 1.2,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 35,
//         zoomLevel: 1.8,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 45,
//         zoomLevel: 1.5,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//     ];
//   }, []);

//   // Function to get cursor position at a specific time
//   const getCursorAtTime = (time: number) => {
//     const tracking = cursorData.tracking_data;
//     if (!tracking?.length) return null;

//     const dataPoint = tracking.find(
//       item => item.recorded_display_data.timestamp / 1000 >= time
//     ) || tracking[tracking.length - 1];

//     return dataPoint.recorded_display_data;
//   };

//   // Zoom timeline handler
//   // Zoom timeline handler
//   useEffect(() => {
//     const activeZoom = zoomTimeline.find(
//       zoom => currentTime >= zoom.zoom_startTime &&
//       currentTime < zoom.zoom_startTime + zoom.zoom_duration
//     );

//     if (activeZoom) {
//       // If we're zooming out (current zoom is higher than target zoom)
//       if (currentZoomLevel > activeZoom.zoomLevel) {
//         // Calculate the viewport dimensions at target zoom level
//         const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
//         const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

//         // Calculate center position while ensuring bounds
//         const maxOffsetX = scaledWidth - targetViewportWidth;
//         const maxOffsetY = scaledHeight - targetViewportHeight;

//         // Center position clamped to valid bounds
//         const centerX = Math.max(0, Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2));
//         const centerY = Math.max(0, Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2));

//         setTargetOffsetX(centerX);
//         setTargetOffsetY(centerY);
//       }
//       setTargetZoomLevel(activeZoom.zoomLevel);
//     } else {
//       setTargetZoomLevel(1.0);
//       setTargetOffsetX(0);
//       setTargetOffsetY(0);
//     }
//   }, [currentTime, zoomTimeline, currentZoomLevel, scaledWidth, scaledHeight]);

//   // Smooth zoom interpolation
//   useEffect(() => {
//     const smoothingSpeed = 0.09;
//     setCurrentZoomLevel(prevZoom => lerp(prevZoom, targetZoomLevel, smoothingSpeed));
//   }, [targetZoomLevel, frame]);

//   // Cursor tracking and viewport adjustment with look-ahead
//   useEffect(() => {
//     // Get look-ahead cursor position for both display and panning
//     const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//     if (!futureCursor) return;

//     // Set cursor position with look-ahead
//     setCursorX(futureCursor.x);
//     setCursorY(futureCursor.y);

//     // Use future cursor for panning calculations
//     const scaledFutureX = futureCursor.x * scale;
//     const scaledFutureY = futureCursor.y * scale;

//     let newTargetX = targetOffsetX;
//     let newTargetY = targetOffsetY;

//     // Calculate panning based on future position
//     if (scaledFutureX < newTargetX + EDGE_MARGIN) {
//       newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
//       newTargetX = scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     if (scaledFutureY < newTargetY + EDGE_MARGIN) {
//       newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
//       newTargetY = scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     // Clamp values
//     newTargetX = Math.max(0, Math.min(scaledWidth - dynamicZoomedWidth, newTargetX));
//     newTargetY = Math.max(0, Math.min(scaledHeight - dynamicZoomedHeight, newTargetY));

//     setTargetOffsetX(newTargetX);
//     setTargetOffsetY(newTargetY);
//   }, [currentTime, dynamicZoomedWidth, dynamicZoomedHeight, targetOffsetX, targetOffsetY, scale]);

//   // Smooth panning update
//   useEffect(() => {
//     const smoothingSpeed = 0.07;
//     const alpha = 1 - Math.exp((-smoothingSpeed * 16) / 16);

//     const maxOffsetX = Math.max(0, scaledWidth - dynamicZoomedWidth);
//     const maxOffsetY = Math.max(0, scaledHeight - dynamicZoomedHeight);

//     setOffsetX(prev => {
//       const next = lerp(prev, targetOffsetX, alpha);
//       return Math.max(0, Math.min(maxOffsetX, next));
//     });

//     setOffsetY(prev => {
//       const next = lerp(prev, targetOffsetY, alpha);
//       return Math.max(0, Math.min(maxOffsetY, next));
//     });
//   }, [targetOffsetX, targetOffsetY, frame, scaledWidth, scaledHeight, dynamicZoomedWidth, dynamicZoomedHeight]);

//   return (
//     <div className="relative w-full h-full overflow-hidden bg-black">
//       <div
//         style={{
//           position: "absolute",
//           left: offsetLeft,
//           top: offsetTop,
//           width: scaledWidth,
//           height: scaledHeight,
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             left: -offsetX * currentZoomLevel,
//             top: -offsetY * currentZoomLevel,
//             width: "100%",
//             height: "100%",
//             transform: `scale(${currentZoomLevel})`,
//             transformOrigin: "0 0",
//           }}
//         >
//           <OffthreadVideo
//             src={staticFile('assets/screen_3.webm')}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />

//           <div
//             style={{
//               position: "absolute",
//               left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
//               top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               backgroundColor: "blue",
//               transform: "translate(-50%, -50%)",
//               pointerEvents: "none",
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// //////////////// Working for zooming out no black background and smooth easing //////////////////////////////////

// import React, { useState, useEffect, useMemo } from "react";
// import { OffthreadVideo, staticFile, useVideoConfig, useCurrentFrame } from "remotion";
// import { cursorData } from "./CursorData";
// import { translate, scale as scaleZoom } from "@remotion/animation-utils";
// import { makeTransform } from "@remotion/animation-utils";

// function lerp(current: number, target: number, alpha: number) {
//   return current + (target - current) * alpha;
// }

// export default function VideoZoomPanExample() {
//   const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
//   const frame = useCurrentFrame();
//   const currentTime = frame / fps; // Convert frame to seconds

//   // Look-ahead time in seconds
//   const LOOK_AHEAD = 0.4;

//   // Get the recorded video dimensions from cursorData
//   const RECORDED_WIDTH = cursorData.recording_info.recorded_display_dimension.width;
//   const RECORDED_HEIGHT = cursorData.recording_info.recorded_display_dimension.height;

//   // Calculate scaling factors to fill the screen completely
//   const scaleX = COMP_WIDTH / RECORDED_WIDTH;
//   const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
//   // Use maximum scale to ensure no black borders
//   const scale = Math.max(scaleX, scaleY);

//   // Calculate dimensions that will cover the entire composition
//   const scaledWidth = RECORDED_WIDTH * scale;
//   const scaledHeight = RECORDED_HEIGHT * scale;
//   // Center the scaled video
//   const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
//   const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

//   const EDGE_MARGIN = 50 * scale;
//   const PAN_EXTRA = 200 * scale;

//   // States
//   const [offsetX, setOffsetX] = useState(0);
//   const [offsetY, setOffsetY] = useState(0);
//   const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
//   const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
//   const [targetOffsetX, setTargetOffsetX] = useState(0);
//   const [targetOffsetY, setTargetOffsetY] = useState(0);
//   const [cursorX, setCursorX] = useState(0);
//   const [cursorY, setCursorY] = useState(0);

//   // Dynamic dimensions based on zoom
//   const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
//   const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

//   // Zoom timeline definition
//   const zoomTimeline = useMemo(() => {
//     return [
//       {
//         zoom_startTime: 3,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 13,
//         zoomLevel: 1.0,
//         zoom_duration: 2,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 15,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 25,
//         zoomLevel: 1.2,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 35,
//         zoomLevel: 1.8,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 45,
//         zoomLevel: 1.5,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//     ];
//   }, []);

//   //// Zoom Easing functions ////
//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     if (t < 0.5) {
//       // Keep the first half (start) the same
//       return Math.pow(16 * t, power) / Math.pow(16, power - 1);
//     } else {
//       // Make the second half (end) more aggressive
//       const adjusted = (t - 0.5) * 1.5 + 0.5; // Accelerate the end phase
//       return 1 - Math.pow(-2 * adjusted + 2, power) / 2;
//     }
// };

// const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) {
//       // Keep start phase the same
//       return Math.pow(2, factor * t - factor / 2) / 2;
//     } else {
//       // Make end phase snappier
//       const adjusted = (t - 0.5) * 1.3 + 0.5; // Less aggressive adjustment than quint
//       return (2 - Math.pow(2, -factor * adjusted + factor / 2)) / 2;
//     }
// };

//   const smoothEaseInOut = (
//     t: number,
//     config: {
//       strength: number,
//       speedFactor: number,
//       smoothness: number,
//       threshold: number,
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };
//   //// End of Zoom Easing functions ////

//   // Function to get cursor position at a specific time
//   const getCursorAtTime = (time: number) => {
//     const tracking = cursorData.tracking_data;
//     if (!tracking?.length) return null;

//     const dataPoint = tracking.find(
//       item => item.recorded_display_data.timestamp / 1000 >= time
//     ) || tracking[tracking.length - 1];

//     return dataPoint.recorded_display_data;
//   };

//   // Zoom timeline handler
//   // Zoom timeline handler
//   useEffect(() => {
//     const activeZoom = zoomTimeline.find(
//       zoom => currentTime >= zoom.zoom_startTime &&
//       currentTime < zoom.zoom_startTime + zoom.zoom_duration
//     );

//     if (activeZoom) {
//       // If we're zooming out (current zoom is higher than target zoom)
//       if (currentZoomLevel > activeZoom.zoomLevel) {
//         // Calculate the viewport dimensions at target zoom level
//         const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
//         const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

//         // Calculate center position while ensuring bounds
//         const maxOffsetX = scaledWidth - targetViewportWidth;
//         const maxOffsetY = scaledHeight - targetViewportHeight;

//         // Center position clamped to valid bounds
//         const centerX = Math.max(0, Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2));
//         const centerY = Math.max(0, Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2));

//         setTargetOffsetX(centerX);
//         setTargetOffsetY(centerY);
//       }
//       setTargetZoomLevel(activeZoom.zoomLevel);
//     } else {
//       setTargetZoomLevel(1.0);
//       setTargetOffsetX(0);
//       setTargetOffsetY(0);
//     }
//   }, [currentTime, zoomTimeline, currentZoomLevel, scaledWidth, scaledHeight]);

//   //// Smooth zoom interpolation ////
//   useEffect(() => {
//     const easingConfig = {
//       strength: 5.0,      // Increased strength for faster movement
//       speedFactor: 1.0,   // Doubled speed factor
//       smoothness: 1.0,    // Kept smooth but not too slow
//       threshold: 0.001
//     };

//     const smoothingSpeed = 0.45;  // Increased from 0.09 to 0.25

//     setCurrentZoomLevel(prevZoom => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       return prevZoom + (targetZoomLevel - prevZoom) * progress;
//     });
//   }, [targetZoomLevel, frame]);

//   // Cursor tracking and viewport adjustment with look-ahead
//   useEffect(() => {
//     // Get look-ahead cursor position for both display and panning
//     const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//     if (!futureCursor) return;

//     // Set cursor position with look-ahead
//     setCursorX(futureCursor.x);
//     setCursorY(futureCursor.y);

//     // Use future cursor for panning calculations
//     const scaledFutureX = futureCursor.x * scale;
//     const scaledFutureY = futureCursor.y * scale;

//     let newTargetX = targetOffsetX;
//     let newTargetY = targetOffsetY;

//     // Calculate panning based on future position
//     if (scaledFutureX < newTargetX + EDGE_MARGIN) {
//       newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
//       newTargetX = scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     if (scaledFutureY < newTargetY + EDGE_MARGIN) {
//       newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
//       newTargetY = scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     // Clamp values
//     newTargetX = Math.max(0, Math.min(scaledWidth - dynamicZoomedWidth, newTargetX));
//     newTargetY = Math.max(0, Math.min(scaledHeight - dynamicZoomedHeight, newTargetY));

//     setTargetOffsetX(newTargetX);
//     setTargetOffsetY(newTargetY);
//   }, [currentTime, dynamicZoomedWidth, dynamicZoomedHeight, targetOffsetX, targetOffsetY, scale]);

//   // // Smooth panning update
//   // Smooth panning update
//   useEffect(() => {
//     const easingConfig = {
//       strength: 1.0,      // Increased strength for faster movement
//       speedFactor: 0.5,   // Doubled speed factor
//       smoothness: 2.0,    // Kept smooth but not too slow
//       threshold: 0.001
//     };

//     const smoothingSpeed = 0.25;

//     // Calculate maximum allowed offsets
//     const maxOffsetX = Math.max(0, scaledWidth - dynamicZoomedWidth);
//     const maxOffsetY = Math.max(0, scaledHeight - dynamicZoomedHeight);

//     setOffsetX(prev => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       // First calculate the smoothed position
//       const next = prev + (targetOffsetX - prev) * progress;
//       // Then clamp it to valid bounds
//       return Math.max(0, Math.min(maxOffsetX, next));
//     });

//     setOffsetY(prev => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       const next = prev + (targetOffsetY - prev) * progress;
//       return Math.max(0, Math.min(maxOffsetY, next));
//     });
//   }, [targetOffsetX, targetOffsetY, frame, scaledWidth, scaledHeight, dynamicZoomedWidth, dynamicZoomedHeight]);

//   return (
//     <div className="relative w-full h-full overflow-hidden bg-black">
//       <div
//         style={{
//           position: "absolute",
//           left: offsetLeft,
//           top: offsetTop,
//           width: scaledWidth,
//           height: scaledHeight,
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             width: "100%",
//             height: "100%",
//             transform: makeTransform([
//               translate(-offsetX * currentZoomLevel, "px", -offsetY * currentZoomLevel, "px"),
//               scaleZoom(currentZoomLevel),
//             ]),
//             transformOrigin: "0 0",
//           }}
//         >
//           <OffthreadVideo
//             src={staticFile('assets/screen_3.webm')}
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//             }}
//           />

//           <div
//             style={{
//               position: "absolute",
//               left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
//               top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
//               width: 10,
//               height: 10,
//               borderRadius: "50%",
//               backgroundColor: "blue",
//               transform: "translate(-50%, -50%)",
//               pointerEvents: "none",
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// ////////////////////////////////////////////////////////////////////////////////
// //////////////// partial working, we need to eliminate useeffect and make spotlight better //////////////////////////////////

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   OffthreadVideo,
//   staticFile,
//   useVideoConfig,
//   useCurrentFrame,
// } from 'remotion';
// import { cursorData } from './CursorData';
// import { translate, scale as scaleZoom } from '@remotion/animation-utils';
// import { makeTransform } from '@remotion/animation-utils';

// function lerp(current: number, target: number, alpha: number) {
//   return current + (target - current) * alpha;
// }

// export default function VideoZoomPanExample() {
//   const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
//   const frame = useCurrentFrame();
//   const currentTime = frame / fps; // Convert frame to seconds

//   // Look-ahead time in seconds
//   const LOOK_AHEAD = 0.4;

//   // Get the recorded video dimensions from cursorData
//   const RECORDED_WIDTH =
//     cursorData.recording_info.recorded_display_dimension.width;
//   const RECORDED_HEIGHT =
//     cursorData.recording_info.recorded_display_dimension.height;

//   // Calculate scaling factors to fill the screen completely
//   const scaleX = COMP_WIDTH / RECORDED_WIDTH;
//   const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
//   // Use maximum scale to ensure no black borders
//   const scale = Math.max(scaleX, scaleY);

//   // Calculate dimensions that will cover the entire composition
//   const scaledWidth = RECORDED_WIDTH * scale;
//   const scaledHeight = RECORDED_HEIGHT * scale;
//   // Center the scaled video
//   const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
//   const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

//   const EDGE_MARGIN = 50 * scale;
//   const PAN_EXTRA = 200 * scale;

//   // States
//   const [offsetX, setOffsetX] = useState(0);
//   const [offsetY, setOffsetY] = useState(0);
//   const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
//   const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
//   const [targetOffsetX, setTargetOffsetX] = useState(0);
//   const [targetOffsetY, setTargetOffsetY] = useState(0);
//   const [cursorX, setCursorX] = useState(0);
//   const [cursorY, setCursorY] = useState(0);

//   const [isZooming, setIsZooming] = useState(false); // State to check if we are in the process of zooming
//   // Add this state to track if we should show spotlight
//   const [showSpotlight, setShowSpotlight] = useState(false);

//   // Dynamic dimensions based on zoom
//   const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
//   const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

//   // Zoom timeline definition
//   const zoomTimeline = useMemo(() => {
//     return [
//       {
//         zoom_startTime: 3,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 13,
//         zoomLevel: 1.0,
//         zoom_duration: 2,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 15,
//         zoomLevel: 2.0,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 25,
//         zoomLevel: 1.2,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 35,
//         zoomLevel: 1.8,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//       {
//         zoom_startTime: 45,
//         zoomLevel: 1.5,
//         zoom_duration: 10,
//         zoom_transition_duration: 2,
//       },
//     ];
//   }, []);

//   //// Zoom Easing functions ////
//   const easeInOutQuint = (t: number, strength: number = 1) => {
//     const power = 5 * strength;
//     if (t < 0.5) {
//       // Keep the first half (start) the same
//       return Math.pow(16 * t, power) / Math.pow(16, power - 1);
//     } else {
//       // Make the second half (end) more aggressive
//       const adjusted = (t - 0.5) * 1.5 + 0.5; // Accelerate the end phase
//       return 1 - Math.pow(-2 * adjusted + 2, power) / 2;
//     }
//   };

//   const easeInOutExpo = (t: number, speedFactor: number = 1) => {
//     if (t === 0) return 0;
//     if (t === 1) return 1;
//     const factor = 20 * speedFactor;
//     if (t < 0.5) {
//       // Keep start phase the same
//       return Math.pow(2, factor * t - factor / 2) / 2;
//     } else {
//       // Make end phase snappier
//       const adjusted = (t - 0.5) * 1.3 + 0.5; // Less aggressive adjustment than quint
//       return (2 - Math.pow(2, -factor * adjusted + factor / 2)) / 2;
//     }
//   };

//   const smoothEaseInOut = (
//     t: number,
//     config: {
//       strength: number;
//       speedFactor: number;
//       smoothness: number;
//       threshold: number;
//     },
//   ) => {
//     if (Math.abs(t) < config.threshold) return 0;

//     t = Math.max(0, Math.min(1, t));

//     const expo = easeInOutExpo(t, config.speedFactor);
//     const quint = easeInOutQuint(t, config.strength);

//     const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

//     return expo * blend + quint * (1 - blend);
//   };
//   //// End of Zoom Easing functions ////

//   // Function to get cursor position at a specific time
//   const getCursorAtTime = (time: number) => {
//     const tracking = cursorData.tracking_data;
//     if (!tracking?.length) return null;

//     const dataPoint =
//       tracking.find(
//         (item) => item.recorded_display_data.timestamp / 1000 >= time,
//       ) || tracking[tracking.length - 1];

//     return dataPoint.recorded_display_data;
//   };

//   // Zoom timeline handler
//   // Zoom timeline handler
//   useEffect(() => {
//     const activeZoom = zoomTimeline.find(
//       (zoom) =>
//         currentTime >= zoom.zoom_startTime &&
//         currentTime < zoom.zoom_startTime + zoom.zoom_duration,
//     );

//     if (activeZoom) {
//       ///////////////////// lens Effect ///////////////////////
//       // If zoom level is changing, we're in transition
//       // if (Math.abs(currentZoomLevel - activeZoom.zoomLevel) > 0.01) {
//       //   setIsZooming(true);
//       // } else {
//       //   setIsZooming(false);
//       //   }
//       ///////////////////// End of Lens Effect ///////////////////////

//       // If we're zooming out (current zoom is higher than target zoom)
//       if (currentZoomLevel > activeZoom.zoomLevel) {
//         // Calculate the viewport dimensions at target zoom level
//         const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
//         const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

//         // Calculate center position while ensuring bounds
//         const maxOffsetX = scaledWidth - targetViewportWidth;
//         const maxOffsetY = scaledHeight - targetViewportHeight;

//         // Center position clamped to valid bounds
//         const centerX = Math.max(
//           0,
//           Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2),
//         );
//         const centerY = Math.max(
//           0,
//           Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2),
//         );

//         setTargetOffsetX(centerX);
//         setTargetOffsetY(centerY);
//       }
//       setTargetZoomLevel(activeZoom.zoomLevel);
//     } else {
//       setTargetZoomLevel(1.0);
//       setTargetOffsetX(0);
//       setTargetOffsetY(0);
//     }
//   }, [currentTime, zoomTimeline, currentZoomLevel, scaledWidth, scaledHeight]);

//   // Add this useEffect to handle spotlight timing
//   useEffect(() => {
//     let timeoutId: NodeJS.Timeout;

//     if (currentZoomLevel > 1) {
//       setShowSpotlight(true);
//       timeoutId = setTimeout(() => {
//         setShowSpotlight(false);
//       }, 5000); // 5 seconds
//       // setShowSpotlight(false);
//     } else {
//       setShowSpotlight(false);
//     }

//     return () => {
//       if (timeoutId) clearTimeout(timeoutId);
//     };
//   }, [currentZoomLevel]);

//   //// Smooth zoom interpolation ////
//   useEffect(() => {
//     const easingConfig = {
//       strength: 5.0, // Increased strength for faster movement
//       speedFactor: 1.0, // Doubled speed factor
//       smoothness: 1.0, // Kept smooth but not too slow
//       threshold: 0.001,
//     };

//     const smoothingSpeed = 0.45; // Increased from 0.09 to 0.25

//     setCurrentZoomLevel((prevZoom) => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       return prevZoom + (targetZoomLevel - prevZoom) * progress;
//     });
//   }, [targetZoomLevel, frame]);

//   // Cursor tracking and viewport adjustment with look-ahead
//   useEffect(() => {
//     // Get look-ahead cursor position for both display and panning
//     const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//     if (!futureCursor) return;

//     // Set cursor position with look-ahead
//     setCursorX(futureCursor.x);
//     setCursorY(futureCursor.y);

//     // Use future cursor for panning calculations
//     const scaledFutureX = futureCursor.x * scale;
//     const scaledFutureY = futureCursor.y * scale;

//     let newTargetX = targetOffsetX;
//     let newTargetY = targetOffsetY;

//     // Calculate panning based on future position
//     if (scaledFutureX < newTargetX + EDGE_MARGIN) {
//       newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
//       newTargetX =
//         scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     if (scaledFutureY < newTargetY + EDGE_MARGIN) {
//       newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
//     } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
//       newTargetY =
//         scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
//     }

//     // Clamp values
//     newTargetX = Math.max(
//       0,
//       Math.min(scaledWidth - dynamicZoomedWidth, newTargetX),
//     );
//     newTargetY = Math.max(
//       0,
//       Math.min(scaledHeight - dynamicZoomedHeight, newTargetY),
//     );

//     setTargetOffsetX(newTargetX);
//     setTargetOffsetY(newTargetY);
//   }, [
//     currentTime,
//     dynamicZoomedWidth,
//     dynamicZoomedHeight,
//     targetOffsetX,
//     targetOffsetY,
//     scale,
//   ]);

//   // // Smooth panning update
//   // Smooth panning update
//   useEffect(() => {
//     const easingConfig = {
//       strength: 1.0, // Increased strength for faster movement
//       speedFactor: 0.5, // Doubled speed factor
//       smoothness: 2.0, // Kept smooth but not too slow
//       threshold: 0.001,
//     };

//     const smoothingSpeed = 0.25;

//     // Calculate maximum allowed offsets
//     const maxOffsetX = Math.max(0, scaledWidth - dynamicZoomedWidth);
//     const maxOffsetY = Math.max(0, scaledHeight - dynamicZoomedHeight);

//     setOffsetX((prev) => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       // First calculate the smoothed position
//       const next = prev + (targetOffsetX - prev) * progress;
//       // Then clamp it to valid bounds
//       return Math.max(0, Math.min(maxOffsetX, next));
//     });

//     setOffsetY((prev) => {
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
//       const next = prev + (targetOffsetY - prev) * progress;
//       return Math.max(0, Math.min(maxOffsetY, next));
//     });
//   }, [
//     targetOffsetX,
//     targetOffsetY,
//     frame,
//     scaledWidth,
//     scaledHeight,
//     dynamicZoomedWidth,
//     dynamicZoomedHeight,
//   ]);

//   return (
//     <div className="relative w-full h-full overflow-hidden bg-black">
//       <div
//         style={{
//           position: 'absolute',
//           left: offsetLeft,
//           top: offsetTop,
//           width: scaledWidth,
//           height: scaledHeight,
//           overflow: 'hidden',
//         }}
//       >
//         <div
//           style={{
//             position: 'absolute',
//             width: '100%',
//             height: '100%',
//             transform: makeTransform([
//               translate(
//                 -offsetX * currentZoomLevel,
//                 'px',
//                 -offsetY * currentZoomLevel,
//                 'px',
//               ),
//               scaleZoom(currentZoomLevel),
//             ]),
//             transformOrigin: '0 0',
//           }}
//         >
//           <OffthreadVideo
//             src={staticFile('assets/screen_3.webm')}
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//             }}
//           />

//           {/* spotlight effect */}
//           {showSpotlight && (
//             <div
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 background: `radial-gradient(
//                 circle 250px at ${(cursorX / RECORDED_WIDTH) * 100}% ${(cursorY / RECORDED_HEIGHT) * 100}%,
//                 rgba(255, 255, 200, 0.15) 0%,
//                 rgba(0, 0, 0, 0.65) 70%  
//               )`, // this controls the color of the spotlight and background as well
//                 pointerEvents: 'none',
//                 // transition: 'background 0.2s ease',
//                 opacity: showSpotlight ? 1 : 0,
//                 transition: 'opacity 0.3s ease',
//               }}
//             />
//           )}

//           {/* Cursor dot */}
//           <div
//             style={{
//               position: 'absolute',
//               left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
//               top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
//               width: 10,
//               height: 10,
//               borderRadius: '50%',
//               backgroundColor: 'blue',
//               transform: 'translate(-50%, -50%)',
//               pointerEvents: 'none',
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



////////////////////////////////////////////////////////////////////////////////
//////////////// TEST //////////////////////////////////

import React, { useState, useEffect, useMemo } from 'react';
import {
  OffthreadVideo,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
} from 'remotion';
import { cursorData } from './CursorData';
import { translate, scale as scaleZoom } from '@remotion/animation-utils';
import { makeTransform } from '@remotion/animation-utils';


export default function VideoZoomPanExample() {
  const { width: COMP_WIDTH, height: COMP_HEIGHT, fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const currentTime = frame / fps; // Convert frame to seconds

  // Look-ahead time in seconds
  const LOOK_AHEAD = 0.4;

  // Get the recorded video dimensions from cursorData
  const RECORDED_WIDTH =
    cursorData.recording_info.recorded_display_dimension.width;
  const RECORDED_HEIGHT =
    cursorData.recording_info.recorded_display_dimension.height;

  // Calculate scaling factors to fill the screen completely
  const scaleX = COMP_WIDTH / RECORDED_WIDTH;
  const scaleY = COMP_HEIGHT / RECORDED_HEIGHT;
  // Use maximum scale to ensure no black borders
  const scale = Math.max(scaleX, scaleY);

  // Calculate dimensions that will cover the entire composition
  const scaledWidth = RECORDED_WIDTH * scale;
  const scaledHeight = RECORDED_HEIGHT * scale;
  // Center the scaled video
  const offsetLeft = (COMP_WIDTH - scaledWidth) / 2;
  const offsetTop = (COMP_HEIGHT - scaledHeight) / 2;

  const EDGE_MARGIN = 50 * scale;
  const PAN_EXTRA = 200 * scale;

  // States
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(1.0);
  const [targetZoomLevel, setTargetZoomLevel] = useState(1.0);
  const [targetOffsetX, setTargetOffsetX] = useState(0);
  const [targetOffsetY, setTargetOffsetY] = useState(0);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const [isZooming, setIsZooming] = useState(false); // State to check if we are in the process of zooming
  // Add this state to track if we should show spotlight
  const [showSpotlight, setShowSpotlight] = useState(false);

  // Dynamic dimensions based on zoom
  const dynamicZoomedWidth = scaledWidth / currentZoomLevel;
  const dynamicZoomedHeight = scaledHeight / currentZoomLevel;

  // Zoom timeline definition
  const zoomTimeline = useMemo(() => {
    return [
      {
        zoom_startTime: 3,
        zoomLevel: 2.0,
        zoom_duration: 10,
        zoom_transition_duration: 2,
      },
      {
        zoom_startTime: 13,
        zoomLevel: 1.0,
        zoom_duration: 2,
        zoom_transition_duration: 2,
      },
      {
        zoom_startTime: 15,
        zoomLevel: 2.0,
        zoom_duration: 10,
        zoom_transition_duration: 2,
      },
      {
        zoom_startTime: 25,
        zoomLevel: 1.2,
        zoom_duration: 10,
        zoom_transition_duration: 2,
      },
      {
        zoom_startTime: 35,
        zoomLevel: 1.8,
        zoom_duration: 10,
        zoom_transition_duration: 2,
      },
      {
        zoom_startTime: 45,
        zoomLevel: 1.5,
        zoom_duration: 10,
        zoom_transition_duration: 2,
      },
    ];
  }, []);

  //// Zoom Easing functions ////
  const easeInOutQuint = (t: number, strength: number = 1) => {
    const power = 5 * strength;
    if (t < 0.5) {
      // Keep the first half (start) the same
      return Math.pow(16 * t, power) / Math.pow(16, power - 1);
    } else {
      // Make the second half (end) more aggressive
      const adjusted = (t - 0.5) * 1.5 + 0.5; // Accelerate the end phase
      return 1 - Math.pow(-2 * adjusted + 2, power) / 2;
    }
  };

  const easeInOutExpo = (t: number, speedFactor: number = 1) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const factor = 20 * speedFactor;
    if (t < 0.5) {
      // Keep start phase the same
      return Math.pow(2, factor * t - factor / 2) / 2;
    } else {
      // Make end phase snappier
      const adjusted = (t - 0.5) * 1.3 + 0.5; // Less aggressive adjustment than quint
      return (2 - Math.pow(2, -factor * adjusted + factor / 2)) / 2;
    }
  };

  const smoothEaseInOut = (
    t: number,
    config: {
      strength: number;
      speedFactor: number;
      smoothness: number;
      threshold: number;
    },
  ) => {
    if (Math.abs(t) < config.threshold) return 0;

    t = Math.max(0, Math.min(1, t));

    const expo = easeInOutExpo(t, config.speedFactor);
    const quint = easeInOutQuint(t, config.strength);

    const blend = (1 - Math.cos(t * Math.PI * config.smoothness)) / 2;

    return expo * blend + quint * (1 - blend);
  };
  //// End of Zoom Easing functions ////

  // Function to get cursor position at a specific time
  const getCursorAtTime = (time: number) => {
    const tracking = cursorData.tracking_data;
    if (!tracking?.length) return null;

    const dataPoint =
      tracking.find(
        (item) => item.recorded_display_data.timestamp / 1000 >= time,
      ) || tracking[tracking.length - 1];

    return dataPoint.recorded_display_data;
  };

  // Zoom timeline handler
  // Zoom timeline handler
  useEffect(() => {
    const activeZoom = zoomTimeline.find(
      (zoom) =>
        currentTime >= zoom.zoom_startTime &&
        currentTime < zoom.zoom_startTime + zoom.zoom_duration,
    );

    if (activeZoom) {
      // If we're zooming out (current zoom is higher than target zoom)
      if (currentZoomLevel > activeZoom.zoomLevel) {
        // Calculate the viewport dimensions at target zoom level
        const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
        const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

        // Calculate center position while ensuring bounds
        const maxOffsetX = scaledWidth - targetViewportWidth;
        const maxOffsetY = scaledHeight - targetViewportHeight;

        // Center position clamped to valid bounds
        const centerX = Math.max(
          0,
          Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2),
        );
        const centerY = Math.max(
          0,
          Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2),
        );

        setTargetOffsetX(centerX);
        setTargetOffsetY(centerY);
      }
      setTargetZoomLevel(activeZoom.zoomLevel);
    } else {
      setTargetZoomLevel(1.0);
      setTargetOffsetX(0);
      setTargetOffsetY(0);
    }
  }, [currentTime, zoomTimeline, currentZoomLevel, scaledWidth, scaledHeight]);

  ////// Add this useEffect to handle spotlight timing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (currentZoomLevel > 1) {
      setShowSpotlight(true);
      timeoutId = setTimeout(() => {
        setShowSpotlight(false);
      }, 5000); // 5 seconds
      // setShowSpotlight(false);
    } else {
      setShowSpotlight(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentZoomLevel]);

  const shouldShowSpotlight = (frame: number, currentZoomLevel: number) => {
    const spotlightDuration = 5 * fps; // 5 seconds * fps for frame count
    
    // Find when zoom started
    const zoomStartFrame = zoomTimeline.find(event => 
      frame >= event.zoom_startTime * fps && 
      frame < (event.zoom_startTime + event.zoom_duration) * fps
    );
  
    if (!zoomStartFrame) return false;
  
    // Only show spotlight during first 5 seconds after zoom completes
    const zoomStartFrameNumber = zoomStartFrame.zoom_startTime * fps;
    const framesSinceZoomStart = frame - zoomStartFrameNumber;
    
    return currentZoomLevel > 1 && framesSinceZoomStart < spotlightDuration;
  };

  // Calculate spotlight opacity
  const getSpotlightOpacity = (frame: number, currentZoom: number) => {
    const activeZoom = zoomTimeline.find(zoom => 
      frame >= (zoom.zoom_startTime * fps) && 
      frame < ((zoom.zoom_startTime + zoom.zoom_duration) * fps)
    );
  
    if (!activeZoom) return 0;
  
    const framesSinceStart = frame - (activeZoom.zoom_startTime * fps);
    const spotlightDuration = 5 * fps;
    
    // Fade in in the first second
    const fadeInDuration = fps; // 1 second
    if (framesSinceStart < fadeInDuration) {
      return framesSinceStart / fadeInDuration;
    }
    
    // Fade out in the last second
    const fadeOutStart = spotlightDuration - fps;
    if (framesSinceStart > fadeOutStart) {
      return 1 - (framesSinceStart - fadeOutStart) / fps;
    }
    
    // Full opacity in between
    return 1;
  };
  

  /////////////////////// End of Spotlight ///////////////////////

  //// Smooth zoom interpolation ////
  useEffect(() => {
    const easingConfig = {
      strength: 5.0, // Increased strength for faster movement
      speedFactor: 1.0, // Doubled speed factor
      smoothness: 1.0, // Kept smooth but not too slow
      threshold: 0.001,
    };

    const smoothingSpeed = 0.45; // Increased from 0.09 to 0.25

    setCurrentZoomLevel((prevZoom) => {
      const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
      return prevZoom + (targetZoomLevel - prevZoom) * progress;
    });
  }, [targetZoomLevel, frame]);

  // Cursor tracking and viewport adjustment with look-ahead
  useEffect(() => {
    // Get look-ahead cursor position for both display and panning
    const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
    if (!futureCursor) return;

    // Set cursor position with look-ahead
    setCursorX(futureCursor.x);
    setCursorY(futureCursor.y);

    // Use future cursor for panning calculations
    const scaledFutureX = futureCursor.x * scale;
    const scaledFutureY = futureCursor.y * scale;

    let newTargetX = targetOffsetX;
    let newTargetY = targetOffsetY;

    // Calculate panning based on future position
    if (scaledFutureX < newTargetX + EDGE_MARGIN) {
      newTargetX = scaledFutureX - EDGE_MARGIN - PAN_EXTRA;
    } else if (scaledFutureX > newTargetX + dynamicZoomedWidth - EDGE_MARGIN) {
      newTargetX =
        scaledFutureX - (dynamicZoomedWidth - EDGE_MARGIN) + PAN_EXTRA;
    }

    if (scaledFutureY < newTargetY + EDGE_MARGIN) {
      newTargetY = scaledFutureY - EDGE_MARGIN - PAN_EXTRA;
    } else if (scaledFutureY > newTargetY + dynamicZoomedHeight - EDGE_MARGIN) {
      newTargetY =
        scaledFutureY - (dynamicZoomedHeight - EDGE_MARGIN) + PAN_EXTRA;
    }

    // Clamp values
    newTargetX = Math.max(
      0,
      Math.min(scaledWidth - dynamicZoomedWidth, newTargetX),
    );
    newTargetY = Math.max(
      0,
      Math.min(scaledHeight - dynamicZoomedHeight, newTargetY),
    );

    setTargetOffsetX(newTargetX);
    setTargetOffsetY(newTargetY);
  }, [
    currentTime,
    dynamicZoomedWidth,
    dynamicZoomedHeight,
    targetOffsetX,
    targetOffsetY,
    scale,
  ]);

  // // Smooth panning update
  useEffect(() => {
    const easingConfig = {
      strength: 1.0, // Increased strength for faster movement
      speedFactor: 0.5, // Doubled speed factor
      smoothness: 2.0, // Kept smooth but not too slow
      threshold: 0.001,
    };

    const smoothingSpeed = 0.25;

    // Calculate maximum allowed offsets
    const maxOffsetX = Math.max(0, scaledWidth - dynamicZoomedWidth);
    const maxOffsetY = Math.max(0, scaledHeight - dynamicZoomedHeight);

    setOffsetX((prev) => {
      const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
      // First calculate the smoothed position
      const next = prev + (targetOffsetX - prev) * progress;
      // Then clamp it to valid bounds
      return Math.max(0, Math.min(maxOffsetX, next));
    });

    setOffsetY((prev) => {
      const progress = smoothEaseInOut(smoothingSpeed, easingConfig);
      const next = prev + (targetOffsetY - prev) * progress;
      return Math.max(0, Math.min(maxOffsetY, next));
    });
  }, [
    targetOffsetX,
    targetOffsetY,
    frame,
    scaledWidth,
    scaledHeight,
    dynamicZoomedWidth,
    dynamicZoomedHeight,
  ]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <div
        style={{
          position: 'absolute',
          left: offsetLeft,
          top: offsetTop,
          width: scaledWidth,
          height: scaledHeight,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transform: makeTransform([
              translate(
                -offsetX * currentZoomLevel,
                'px',
                -offsetY * currentZoomLevel,
                'px',
              ),
              scaleZoom(currentZoomLevel),
            ]),
            transformOrigin: '0 0',
          }}
        >
          <OffthreadVideo
            src={staticFile('assets/screen_3.webm')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* spotlight effect */}
          {shouldShowSpotlight(frame, currentZoomLevel) && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(
                circle 250px at ${(cursorX / RECORDED_WIDTH) * 100}% ${(cursorY / RECORDED_HEIGHT) * 100}%,
                rgba(255, 255, 200, 0.15) 0%,
                rgba(0, 0, 0, 0.59) 70%
              )`,
              pointerEvents: 'none',
              opacity: getSpotlightOpacity(frame, currentZoomLevel),
            }}
          />
        )}

          {/* Cursor dot */}
          <div
            style={{
              position: 'absolute',
              left: `${(cursorX / RECORDED_WIDTH) * 100}%`,
              top: `${(cursorY / RECORDED_HEIGHT) * 100}%`,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'blue',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}