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
// //////////////// partial working, splotlight work done //////////////////////////////////

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

//   ////// Add this useEffect to handle spotlight timing
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

//   const shouldShowSpotlight = (frame: number, currentZoomLevel: number) => {
//     const spotlightDuration = 5 * fps; // 5 seconds * fps for frame count

//     // Find when zoom started
//     const zoomStartFrame = zoomTimeline.find(event =>
//       frame >= event.zoom_startTime * fps &&
//       frame < (event.zoom_startTime + event.zoom_duration) * fps
//     );

//     if (!zoomStartFrame) return false;

//     // Only show spotlight during first 5 seconds after zoom completes
//     const zoomStartFrameNumber = zoomStartFrame.zoom_startTime * fps;
//     const framesSinceZoomStart = frame - zoomStartFrameNumber;

//     return currentZoomLevel > 1 && framesSinceZoomStart < spotlightDuration;
//   };

//   // Calculate spotlight opacity
//   const getSpotlightOpacity = (frame: number, currentZoom: number) => {
//     const activeZoom = zoomTimeline.find(zoom =>
//       frame >= (zoom.zoom_startTime * fps) &&
//       frame < ((zoom.zoom_startTime + zoom.zoom_duration) * fps)
//     );

//     if (!activeZoom) return 0;

//     const framesSinceStart = frame - (activeZoom.zoom_startTime * fps);
//     const spotlightDuration = 5 * fps;

//     // Fade in in the first second
//     const fadeInDuration = fps; // 1 second
//     if (framesSinceStart < fadeInDuration) {
//       return framesSinceStart / fadeInDuration;
//     }

//     // Fade out in the last second
//     const fadeOutStart = spotlightDuration - fps;
//     if (framesSinceStart > fadeOutStart) {
//       return 1 - (framesSinceStart - fadeOutStart) / fps;
//     }

//     // Full opacity in between
//     return 1;
//   };

//   /////////////////////// End of Spotlight ///////////////////////

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
//           {shouldShowSpotlight(frame, currentZoomLevel) && (
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               background: `radial-gradient(
//                 circle 250px at ${(cursorX / RECORDED_WIDTH) * 100}% ${(cursorY / RECORDED_HEIGHT) * 100}%,
//                 rgba(255, 255, 200, 0.15) 0%,
//                 rgba(0, 0, 0, 0.59) 70%
//               )`,
//               pointerEvents: 'none',
//               opacity: getSpotlightOpacity(frame, currentZoomLevel),
//             }}
//           />
//         )}

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

// ////////////////////////////////////////////////////////////////////////////////
// //////////////// WOrking partially with pane error fixed //////////////////////////////////

// import { useMemo } from 'react';
// import {
//   OffthreadVideo,
//   staticFile,
//   useVideoConfig,
//   useCurrentFrame,
// } from 'remotion';
// import { cursorData } from './CursorData';
// import { translate, scale as scaleZoom } from '@remotion/animation-utils';
// import { makeTransform } from '@remotion/animation-utils';

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

//   // calculate duration in frames
//   const durationInFrames = 2500;

//   // const EDGE_MARGIN = 50 * scale;
//   // const PAN_EXTRA = 200 * scale;
//   const EDGE_MARGIN = 100;
//   const PAN_EXTRA = 200;

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
//         zoom_startTime: 36,
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

//   // Function to interpolate between current and target values
//   const interpolateValues = (
//     currentValue: number,
//     targetValue: number,
//     progress: number,
//   ) => {
//     return currentValue + (targetValue - currentValue) * progress;
//   };

//   const getValuesForFrame = (
//     frame: number,
//     fps: number,
//     scaledWidth: number,
//     scaledHeight: number,
//     zoomTimeline: any,
//   ) => {
//     const currentTime = frame / fps;

//     // Find active zoom based on current time
//     const activeZoom = zoomTimeline.find(
//       (zoom: any) =>
//         currentTime >= zoom.zoom_startTime &&
//         currentTime < zoom.zoom_startTime + zoom.zoom_duration,
//     );

//     // Default values if no active zoom
//     if (!activeZoom) {
//       return {
//         zoomLevel: 1.0,
//         offsetX: 0,
//         offsetY: 0,
//         transitionProgress: 0,
//       };
//     }

//     // Calculate progress within the current zoom transition
//     const transitionProgress = Math.min(
//       1,
//       (currentTime - activeZoom.zoom_startTime) /
//         activeZoom.zoom_transition_duration,
//     );

//     // Calculate viewport dimensions for the active zoom
//     const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
//     const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

//     // Calculate center position
//     const offsetX = Math.max(
//       0,
//       Math.min(
//         scaledWidth - targetViewportWidth,
//         (scaledWidth - targetViewportWidth) / 2,
//       ),
//     );
//     const offsetY = Math.max(
//       0,
//       Math.min(
//         scaledHeight - targetViewportHeight,
//         (scaledHeight - targetViewportHeight) / 2,
//       ),
//     );

//     return {
//       zoomLevel: activeZoom.zoomLevel,
//       offsetX,
//       offsetY,
//       transitionProgress,
//       startTime: activeZoom.zoom_startTime,
//       duration: activeZoom.zoom_duration,
//     };
//   };

//   // Main function to get zoom and offset values for current frame
//   const getZoomValuesForFrame = ({
//     frame,
//     fps,
//     scaledWidth,
//     scaledHeight,
//     zoomTimeline,
//   }: {
//     frame: number;
//     fps: number;
//     scaledWidth: number;
//     scaledHeight: number;
//     zoomTimeline: any;
//   }) => {
//     // Get current frame values
//     const currentValues = getValuesForFrame(
//       frame,
//       fps,
//       scaledWidth,
//       scaledHeight,
//       zoomTimeline,
//     );

//     // Get previous frame values
//     const prevValues =
//       frame > 0
//         ? getValuesForFrame(
//             frame - 1,
//             fps,
//             scaledWidth,
//             scaledHeight,
//             zoomTimeline,
//           )
//         : { zoomLevel: 1.0, offsetX: 0, offsetY: 0 };
//     // If we're zooming out
//     if (prevValues.zoomLevel > currentValues.zoomLevel) {
//       // Calculate the viewport dimensions at target zoom level
//       const targetViewportWidth = scaledWidth / currentValues.zoomLevel;
//       const targetViewportHeight = scaledHeight / currentValues.zoomLevel;

//       // Calculate center position while ensuring bounds
//       const maxOffsetX = scaledWidth - targetViewportWidth;
//       const maxOffsetY = scaledHeight - targetViewportHeight;

//       // Center position clamped to valid bounds
//       currentValues.offsetX = Math.max(
//         0,
//         Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2),
//       );
//       currentValues.offsetY = Math.max(
//         0,
//         Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2),
//       );
//     }

//     // Calculate smooth transitions
//     const easeProgress = currentValues.transitionProgress; // You can apply your easing function here

//     return {
//       zoomLevel: interpolateValues(
//         prevValues.zoomLevel,
//         currentValues.zoomLevel,
//         easeProgress!,
//       ),
//       offsetX: interpolateValues(
//         prevValues.offsetX || 0,
//         currentValues.offsetX || 0,
//         easeProgress!,
//       ),
//       offsetY: interpolateValues(
//         prevValues.offsetY || 0,
//         currentValues.offsetY || 0,
//         easeProgress!,
//       ),
//     };
//   };

//   const calculateFramePositions = useMemo(() => {
//     const positions = [];
//     let previousOffsetX = 0;
//     let previousOffsetY = 0;

//     // Calculate for all frames
//     for (let f = 0; f < durationInFrames; f++) {
//       const currentTime = f / fps;

//       // Get cursor position with look-ahead
//       const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//       if (!futureCursor) {
//         positions.push({
//           offsetX: previousOffsetX,
//           offsetY: previousOffsetY,
//           cursorX: 0,
//           cursorY: 0,
//           zoomLevel: 1.0,
//         });
//         continue;
//       }

//       // Get zoom level for current frame
//       const { zoomLevel } = getZoomValuesForFrame({
//         frame: f,
//         fps,
//         scaledWidth,
//         scaledHeight,
//         zoomTimeline,
//       });

//       // Scale cursor position
//       const scaledFutureX = futureCursor.x * scale;
//       const scaledFutureY = futureCursor.y * scale;

//       // Calculate dynamic viewport dimensions based on zoom
//       const dynamicZoomedWidth = scaledWidth / zoomLevel;
//       const dynamicZoomedHeight = scaledHeight / zoomLevel;

//       // Scale EDGE_MARGIN inversely with zoom
//       const scaledEdgeMargin = EDGE_MARGIN / zoomLevel;
//       const scaledPanExtra = PAN_EXTRA / zoomLevel;

//       // Calculate panning based on future position
//       let newOffsetX = previousOffsetX;
//       let newOffsetY = previousOffsetY;

//       // Check edges and update offsets
//       const nearLeftEdge = scaledFutureX < newOffsetX + scaledEdgeMargin;
//       const nearRightEdge =
//         scaledFutureX > newOffsetX + dynamicZoomedWidth - scaledEdgeMargin;
//       const nearTopEdge = scaledFutureY < newOffsetY + scaledEdgeMargin;
//       const nearBottomEdge =
//         scaledFutureY > newOffsetY + dynamicZoomedHeight - scaledEdgeMargin;

//       if (nearLeftEdge) {
//         newOffsetX = scaledFutureX - scaledEdgeMargin - scaledPanExtra;
//       } else if (nearRightEdge) {
//         newOffsetX =
//           scaledFutureX -
//           dynamicZoomedWidth +
//           scaledEdgeMargin +
//           scaledPanExtra;
//       }

//       if (nearTopEdge) {
//         newOffsetY = scaledFutureY - scaledEdgeMargin - scaledPanExtra;
//       } else if (nearBottomEdge) {
//         newOffsetY =
//           scaledFutureY -
//           dynamicZoomedHeight +
//           scaledEdgeMargin +
//           scaledPanExtra;
//       }

//       // Clamp values
//       newOffsetX = Math.max(
//         0,
//         Math.min(scaledWidth - dynamicZoomedWidth, newOffsetX),
//       );
//       newOffsetY = Math.max(
//         0,
//         Math.min(scaledHeight - dynamicZoomedHeight, newOffsetY),
//       );

//       // Apply smooth interpolation between previous and new position
//       const easingConfig = {
//         strength: 1.0,
//         speedFactor: 0.5,
//         smoothness: 2.0,
//         threshold: 0.001,
//       };
//       const smoothingSpeed = 0.35;
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);

//       const finalOffsetX =
//         previousOffsetX + (newOffsetX - previousOffsetX) * progress;
//       const finalOffsetY =
//         previousOffsetY + (newOffsetY - previousOffsetY) * progress;

//       // Store position for this frame
//       positions.push({
//         offsetX: finalOffsetX,
//         offsetY: finalOffsetY,
//         cursorX: futureCursor.x,
//         cursorY: futureCursor.y,
//         zoomLevel,
//       });

//       // Update previous values for next frame
//       previousOffsetX = finalOffsetX;
//       previousOffsetY = finalOffsetY;
//     }
//     // Additional smoothing pass like in your code
//     const smoothingWindow = 7;
//     const smoothed = [];

//     for (let i = 0; i < positions.length; i++) {
//       let windowSum = {
//         offsetX: 0,
//         offsetY: 0,
//         zoomLevel: 0,
//         cursorX: 0,
//         cursorY: 0,
//       };
//       let windowCount = 0;

//       for (
//         let j = Math.max(0, i - smoothingWindow);
//         j < Math.min(positions.length, i + smoothingWindow + 1);
//         j++
//       ) {
//         const weight = 1 - Math.abs(i - j) / (smoothingWindow + 1);
//         windowSum.offsetX += positions[j].offsetX * weight;
//         windowSum.offsetY += positions[j].offsetY * weight;
//         windowSum.zoomLevel += positions[j].zoomLevel * weight;
//         windowSum.cursorX += positions[j].cursorX * weight;
//         windowSum.cursorY += positions[j].cursorY * weight;
//         windowCount += weight;
//       }

//       smoothed.push({
//         offsetX: windowSum.offsetX / windowCount,
//         offsetY: windowSum.offsetY / windowCount,
//         zoomLevel: windowSum.zoomLevel / windowCount,
//         cursorX: windowSum.cursorX / windowCount,
//         cursorY: windowSum.cursorY / windowCount,
//       });
//     }

//     return smoothed;
//   }, [
//     durationInFrames,
//     fps,
//     scale,
//     scaledWidth,
//     scaledHeight,
//     zoomTimeline,
//     LOOK_AHEAD,
//     EDGE_MARGIN,
//     PAN_EXTRA,
//   ]);

//   // Then in your render code, simply use the pre-calculated values:
//   const { zoomLevel, offsetX, offsetY, cursorX, cursorY } =
//     calculateFramePositions[frame] || {
//       zoomLevel: 1.0,
//       offsetX: 0,
//       offsetY: 0,
//       cursorX: 0,
//       cursorY: 0,
//     };

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
//                 -offsetX * zoomLevel, // Use frame-based zoomLevel
//                 'px',
//                 -offsetY * zoomLevel, // Use frame-based zoomLevel
//                 'px',
//               ),
//               scaleZoom(zoomLevel), // Use frame-based zoomLevel
//             ]),
//             // transformOrigin: "center center",
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

// ////////////////////////////////////////////////////////////////////////////////
// //////////////// Zoom out and pan out smoothening logic isolated successfully //////////////////////////////////
// //// WORKING production ready code //////////////////////////////////

// import { useMemo } from 'react';
// import {
//   OffthreadVideo,
//   staticFile,
//   useVideoConfig,
//   useCurrentFrame,
// } from 'remotion';
// import { cursorData } from './CursorData';
// import { translate, scale as scaleZoom } from '@remotion/animation-utils';
// import { makeTransform } from '@remotion/animation-utils';

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

//   // calculate duration in frames
//   const durationInFrames = 2500;

//   // const EDGE_MARGIN = 50 * scale;
//   // const PAN_EXTRA = 200 * scale;
//   const EDGE_MARGIN = 100;
//   const PAN_EXTRA = 200;

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
//         zoom_startTime: 36,
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

//   // Function to interpolate between current and target values
//   const interpolateValues = (
//     currentValue: number,
//     targetValue: number,
//     progress: number,
//   ) => {
//     return currentValue + (targetValue - currentValue) * progress;
//   };

//   const getValuesForFrame = (
//     frame: number,
//     fps: number,
//     scaledWidth: number,
//     scaledHeight: number,
//     zoomTimeline: any,
//   ) => {
//     const currentTime = frame / fps;

//     // Find active zoom based on current time
//     const activeZoom = zoomTimeline.find(
//       (zoom: any) =>
//         currentTime >= zoom.zoom_startTime &&
//         currentTime < zoom.zoom_startTime + zoom.zoom_duration,
//     );

//     // Default values if no active zoom
//     if (!activeZoom) {
//       return {
//         zoomLevel: 1.0,
//         offsetX: 0,
//         offsetY: 0,
//         transitionProgress: 0,
//       };
//     }

//     // Calculate progress within the current zoom transition
//     const transitionProgress = Math.min(
//       1,
//       (currentTime - activeZoom.zoom_startTime) /
//         activeZoom.zoom_transition_duration,
//     );

//     // Calculate viewport dimensions for the active zoom
//     const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
//     const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

//     // Calculate center position
//     const offsetX = Math.max(
//       0,
//       Math.min(
//         scaledWidth - targetViewportWidth,
//         (scaledWidth - targetViewportWidth) / 2,
//       ),
//     );
//     const offsetY = Math.max(
//       0,
//       Math.min(
//         scaledHeight - targetViewportHeight,
//         (scaledHeight - targetViewportHeight) / 2,
//       ),
//     );

//     return {
//       zoomLevel: activeZoom.zoomLevel,
//       offsetX,
//       offsetY,
//       transitionProgress,
//       startTime: activeZoom.zoom_startTime,
//       duration: activeZoom.zoom_duration,
//     };
//   };

//   // Main function to get zoom and offset values for current frame
//   const getZoomValuesForFrame = ({
//     frame,
//     fps,
//     scaledWidth,
//     scaledHeight,
//     zoomTimeline,
//   }: {
//     frame: number;
//     fps: number;
//     scaledWidth: number;
//     scaledHeight: number;
//     zoomTimeline: any;
//   }) => {
//     // Get current frame values
//     const currentValues = getValuesForFrame(
//       frame,
//       fps,
//       scaledWidth,
//       scaledHeight,
//       zoomTimeline,
//     );

//     // Get previous frame values
//     const prevValues =
//       frame > 0
//         ? getValuesForFrame(
//             frame - 1,
//             fps,
//             scaledWidth,
//             scaledHeight,
//             zoomTimeline,
//           )
//         : { zoomLevel: 1.0, offsetX: 0, offsetY: 0 };
//     // If we're zooming out
//     if (prevValues.zoomLevel > currentValues.zoomLevel) {
//       // Calculate the viewport dimensions at target zoom level
//       const targetViewportWidth = scaledWidth / currentValues.zoomLevel;
//       const targetViewportHeight = scaledHeight / currentValues.zoomLevel;

//       // Calculate center position while ensuring bounds
//       const maxOffsetX = scaledWidth - targetViewportWidth;
//       const maxOffsetY = scaledHeight - targetViewportHeight;

//       // Center position clamped to valid bounds
//       currentValues.offsetX = Math.max(
//         0,
//         Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2),
//       );
//       currentValues.offsetY = Math.max(
//         0,
//         Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2),
//       );
//     }

//     // Calculate smooth transitions
//     const easeProgress = currentValues.transitionProgress; // You can apply your easing function here

//     return {
//       zoomLevel: interpolateValues(
//         prevValues.zoomLevel,
//         currentValues.zoomLevel,
//         easeProgress!,
//       ),
//       offsetX: interpolateValues(
//         prevValues.offsetX || 0,
//         currentValues.offsetX || 0,
//         easeProgress!,
//       ),
//       offsetY: interpolateValues(
//         prevValues.offsetY || 0,
//         currentValues.offsetY || 0,
//         easeProgress!,
//       ),
//     };
//   };

//   const calculateFramePositions = useMemo(() => {
//     const positions = [];
//     let previousOffsetX = 0;
//     let previousOffsetY = 0;

//     let previousZoomLevel = 1.0;
//     let lastZoomLevel = 1.0;

//     // Calculate for all frames
//     for (let f = 0; f < durationInFrames; f++) {
//       const currentTime = f / fps;

//       // Get cursor position with look-ahead
//       const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
//       if (!futureCursor) {
//         positions.push({
//           offsetX: previousOffsetX,
//           offsetY: previousOffsetY,
//           cursorX: 0,
//           cursorY: 0,
//           zoomLevel: previousZoomLevel,
//         });
//         continue;
//       }

//       // Get zoom level for current frame
//       const { zoomLevel } = getZoomValuesForFrame({
//         frame: f,
//         fps,
//         scaledWidth,
//         scaledHeight,
//         zoomTimeline,
//       });

//       // Apply separate zoom smoothing
//       const zoomEasingConfig = {
//         strength: 1.0, // Much lower strength for gentler zoom
//         speedFactor: 0.2, // Much slower speed for zoom
//         smoothness: 4.0, // Higher smoothness for zoom
//         threshold: 0.001,
//       };
//       const zoomSmoothingSpeed = 0.2; // Slower smoothing for zoom
//       const zoomProgress = smoothEaseInOut(
//         zoomSmoothingSpeed,
//         zoomEasingConfig,
//       );

//       // Calculate smoothed zoom level separately
//       const smoothedZoomLevel =
//         previousZoomLevel + (zoomLevel - previousZoomLevel) * zoomProgress;

//       // Use smoothed zoom level for viewport calculations
//       const dynamicZoomedWidth = scaledWidth / smoothedZoomLevel;
//       const dynamicZoomedHeight = scaledHeight / smoothedZoomLevel;

//       // Scale EDGE_MARGIN inversely with zoom
//       const scaledEdgeMargin = EDGE_MARGIN / smoothedZoomLevel;
//       const scaledPanExtra = PAN_EXTRA / smoothedZoomLevel;

//       // Scale cursor position
//       const scaledFutureX = futureCursor.x * scale;
//       const scaledFutureY = futureCursor.y * scale;

//       // Calculate panning based on future position
//       let newOffsetX = previousOffsetX;
//       let newOffsetY = previousOffsetY;

//       // Check edges and update offsets
//       const nearLeftEdge = scaledFutureX < newOffsetX + scaledEdgeMargin;
//       const nearRightEdge =
//         scaledFutureX > newOffsetX + dynamicZoomedWidth - scaledEdgeMargin;
//       const nearTopEdge = scaledFutureY < newOffsetY + scaledEdgeMargin;
//       const nearBottomEdge =
//         scaledFutureY > newOffsetY + dynamicZoomedHeight - scaledEdgeMargin;

//       if (nearLeftEdge) {
//         newOffsetX = scaledFutureX - scaledEdgeMargin - scaledPanExtra;
//       } else if (nearRightEdge) {
//         newOffsetX =
//           scaledFutureX -
//           dynamicZoomedWidth +
//           scaledEdgeMargin +
//           scaledPanExtra;
//       }

//       if (nearTopEdge) {
//         newOffsetY = scaledFutureY - scaledEdgeMargin - scaledPanExtra;
//       } else if (nearBottomEdge) {
//         newOffsetY =
//           scaledFutureY -
//           dynamicZoomedHeight +
//           scaledEdgeMargin +
//           scaledPanExtra;
//       }

//       // Clamp values
//       newOffsetX = Math.max(
//         0,
//         Math.min(scaledWidth - dynamicZoomedWidth, newOffsetX),
//       );
//       newOffsetY = Math.max(
//         0,
//         Math.min(scaledHeight - dynamicZoomedHeight, newOffsetY),
//       );

//       // Apply smooth interpolation between previous and new position
//       const easingConfig = {
//         strength: 1.0,
//         speedFactor: 0.5,
//         smoothness: 2.0,
//         threshold: 0.001,
//       };
//       const smoothingSpeed = 0.35;
//       const progress = smoothEaseInOut(smoothingSpeed, easingConfig);

//       const finalOffsetX =
//         previousOffsetX + (newOffsetX - previousOffsetX) * progress;
//       const finalOffsetY =
//         previousOffsetY + (newOffsetY - previousOffsetY) * progress;

//       // Store position for this frame
//       positions.push({
//         offsetX: finalOffsetX,
//         offsetY: finalOffsetY,
//         cursorX: futureCursor.x,
//         cursorY: futureCursor.y,
//         zoomLevel: smoothedZoomLevel,
//       });

//       // Update previous values for next frame
//       previousOffsetX = finalOffsetX;
//       previousOffsetY = finalOffsetY;
//       previousZoomLevel = smoothedZoomLevel;
//       lastZoomLevel = zoomLevel;
//     }
//     // Additional smoothing pass like in your code
//     const panSmoothingWindow = 7; // Original window for panning
//     const zoomSmoothingWindow = 15; // Larger window for zoom
//     const smoothed = [];

//     for (let i = 0; i < positions.length; i++) {
//       // Separate sums for panning and zoom
//       let panWindowSum = {
//         offsetX: 0,
//         offsetY: 0,
//         cursorX: 0,
//         cursorY: 0,
//       };
//       let zoomSum = 0;
//       let panWindowCount = 0;
//       let zoomWindowCount = 0;

//       // Calculate pan-related values with original window
//       for (
//         let j = Math.max(0, i - panSmoothingWindow);
//         j < Math.min(positions.length, i + panSmoothingWindow + 1);
//         j++
//       ) {
//         const panWeight = 1 - Math.abs(i - j) / (panSmoothingWindow + 1);
//         panWindowSum.offsetX += positions[j].offsetX * panWeight;
//         panWindowSum.offsetY += positions[j].offsetY * panWeight;
//         panWindowSum.cursorX += positions[j].cursorX * panWeight;
//         panWindowSum.cursorY += positions[j].cursorY * panWeight;
//         panWindowCount += panWeight;
//       }

//       // Calculate zoom values with larger window for smoother zoom transitions
//       for (
//         let j = Math.max(0, i - zoomSmoothingWindow);
//         j < Math.min(positions.length, i + zoomSmoothingWindow + 1);
//         j++
//       ) {
//         const zoomWeight = 1 - Math.abs(i - j) / (zoomSmoothingWindow + 1);
//         zoomSum += positions[j].zoomLevel * zoomWeight;
//         zoomWindowCount += zoomWeight;
//       }

//       smoothed.push({
//         offsetX: panWindowSum.offsetX / panWindowCount,
//         offsetY: panWindowSum.offsetY / panWindowCount,
//         cursorX: panWindowSum.cursorX / panWindowCount,
//         cursorY: panWindowSum.cursorY / panWindowCount,
//         zoomLevel: zoomSum / zoomWindowCount, // Using separate zoom smoothing
//       });
//     }

//     return smoothed;
//   }, [
//     durationInFrames,
//     fps,
//     scale,
//     scaledWidth,
//     scaledHeight,
//     zoomTimeline,
//     LOOK_AHEAD,
//     EDGE_MARGIN,
//     PAN_EXTRA,
//   ]);

//   // Then in your render code, simply use the pre-calculated values:
//   const { zoomLevel, offsetX, offsetY, cursorX, cursorY } =
//     calculateFramePositions[frame] || {
//       zoomLevel: 1.0,
//       offsetX: 0,
//       offsetY: 0,
//       cursorX: 0,
//       cursorY: 0,
//     };

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
//                 -offsetX * zoomLevel, // Use frame-based zoomLevel
//                 'px',
//                 -offsetY * zoomLevel, // Use frame-based zoomLevel
//                 'px',
//               ),
//               scaleZoom(zoomLevel), // Use frame-based zoomLevel
//             ]),
//             // transformOrigin: "center center",
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
//////////////// Zoom out and pan out smoothening logic isolated successfully //////////////////////////////////
//// Test v4 //////////////////////////////////

import { useMemo } from 'react';
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

  // calculate duration in frames
  const durationInFrames = 2500;

  // const EDGE_MARGIN = 50 * scale;
  // const PAN_EXTRA = 200 * scale;
  const EDGE_MARGIN = 100;
  const PAN_EXTRA = 200;

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
        zoom_startTime: 36,
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

  // Function to interpolate between current and target values
  const interpolateValues = (
    currentValue: number,
    targetValue: number,
    progress: number,
  ) => {
    return currentValue + (targetValue - currentValue) * progress;
  };

  const getValuesForFrame = (
    frame: number,
    fps: number,
    scaledWidth: number,
    scaledHeight: number,
    zoomTimeline: any,
  ) => {
    const currentTime = frame / fps;

    // Find active zoom based on current time
    const activeZoom = zoomTimeline.find(
      (zoom: any) =>
        currentTime >= zoom.zoom_startTime &&
        currentTime < zoom.zoom_startTime + zoom.zoom_duration,
    );

    // Default values if no active zoom
    if (!activeZoom) {
      return {
        zoomLevel: 1.0,
        offsetX: 0,
        offsetY: 0,
        transitionProgress: 0,
      };
    }

    // Calculate progress within the current zoom transition
    const transitionProgress = Math.min(
      1,
      (currentTime - activeZoom.zoom_startTime) /
        activeZoom.zoom_transition_duration,
    );

    // Calculate viewport dimensions for the active zoom
    const targetViewportWidth = scaledWidth / activeZoom.zoomLevel;
    const targetViewportHeight = scaledHeight / activeZoom.zoomLevel;

    // Calculate center position
    const offsetX = Math.max(
      0,
      Math.min(
        scaledWidth - targetViewportWidth,
        (scaledWidth - targetViewportWidth) / 2,
      ),
    );
    const offsetY = Math.max(
      0,
      Math.min(
        scaledHeight - targetViewportHeight,
        (scaledHeight - targetViewportHeight) / 2,
      ),
    );

    return {
      zoomLevel: activeZoom.zoomLevel,
      offsetX,
      offsetY,
      transitionProgress,
      startTime: activeZoom.zoom_startTime,
      duration: activeZoom.zoom_duration,
    };
  };

  // Main function to get zoom and offset values for current frame
  const getZoomValuesForFrame = ({
    frame,
    fps,
    scaledWidth,
    scaledHeight,
    zoomTimeline,
  }: {
    frame: number;
    fps: number;
    scaledWidth: number;
    scaledHeight: number;
    zoomTimeline: any;
  }) => {
    // Get current frame values
    const currentValues = getValuesForFrame(
      frame,
      fps,
      scaledWidth,
      scaledHeight,
      zoomTimeline,
    );

    // Get previous frame values
    const prevValues =
      frame > 0
        ? getValuesForFrame(
            frame - 1,
            fps,
            scaledWidth,
            scaledHeight,
            zoomTimeline,
          )
        : { zoomLevel: 1.0, offsetX: 0, offsetY: 0 };
    // If we're zooming out
    if (prevValues.zoomLevel > currentValues.zoomLevel) {
      // Calculate the viewport dimensions at target zoom level
      const targetViewportWidth = scaledWidth / currentValues.zoomLevel;
      const targetViewportHeight = scaledHeight / currentValues.zoomLevel;

      // Calculate center position while ensuring bounds
      const maxOffsetX = scaledWidth - targetViewportWidth;
      const maxOffsetY = scaledHeight - targetViewportHeight;

      // Center position clamped to valid bounds
      currentValues.offsetX = Math.max(
        0,
        Math.min(maxOffsetX, (scaledWidth - targetViewportWidth) / 2),
      );
      currentValues.offsetY = Math.max(
        0,
        Math.min(maxOffsetY, (scaledHeight - targetViewportHeight) / 2),
      );
    }

    // Calculate smooth transitions
    const easeProgress = currentValues.transitionProgress; // You can apply your easing function here

    return {
      zoomLevel: interpolateValues(
        prevValues.zoomLevel,
        currentValues.zoomLevel,
        easeProgress!,
      ),
      offsetX: interpolateValues(
        prevValues.offsetX || 0,
        currentValues.offsetX || 0,
        easeProgress!,
      ),
      offsetY: interpolateValues(
        prevValues.offsetY || 0,
        currentValues.offsetY || 0,
        easeProgress!,
      ),
    };
  };

  const calculateFramePositions = useMemo(() => {
    const positions = [];
    let previousOffsetX = 0;
    let previousOffsetY = 0;

    let previousZoomLevel = 1.0;
    let lastZoomLevel = 1.0;

    // Calculate for all frames
    for (let f = 0; f < durationInFrames; f++) {
      const currentTime = f / fps;

      // Get cursor position with look-ahead
      const futureCursor = getCursorAtTime(currentTime + LOOK_AHEAD);
      if (!futureCursor) {
        positions.push({
          offsetX: previousOffsetX,
          offsetY: previousOffsetY,
          cursorX: 0,
          cursorY: 0,
          zoomLevel: previousZoomLevel,
        });
        continue;
      }

      // Get zoom level for current frame
      const { zoomLevel } = getZoomValuesForFrame({
        frame: f,
        fps,
        scaledWidth,
        scaledHeight,
        zoomTimeline,
      });

      // Apply separate zoom smoothing
      const zoomEasingConfig = {
        strength: 1.0, // Much lower strength for gentler zoom
        speedFactor: 0.2, // Much slower speed for zoom
        smoothness: 4.0, // Higher smoothness for zoom
        threshold: 0.001,
      };
      const zoomSmoothingSpeed = 0.2; // Slower smoothing for zoom
      const zoomProgress = smoothEaseInOut(
        zoomSmoothingSpeed,
        zoomEasingConfig,
      );

      // Calculate smoothed zoom level separately
      const smoothedZoomLevel =
        previousZoomLevel + (zoomLevel - previousZoomLevel) * zoomProgress;

      // Use smoothed zoom level for viewport calculations
      const dynamicZoomedWidth = scaledWidth / smoothedZoomLevel;
      const dynamicZoomedHeight = scaledHeight / smoothedZoomLevel;

      // Scale EDGE_MARGIN inversely with zoom
      const scaledEdgeMargin = EDGE_MARGIN / smoothedZoomLevel;
      const scaledPanExtra = PAN_EXTRA / smoothedZoomLevel;

      // Scale cursor position
      const scaledFutureX = futureCursor.x * scale;
      const scaledFutureY = futureCursor.y * scale;

      // Calculate panning based on future position
      let newOffsetX = previousOffsetX;
      let newOffsetY = previousOffsetY;

      // Check edges and update offsets
      const nearLeftEdge = scaledFutureX < newOffsetX + scaledEdgeMargin;
      const nearRightEdge =
        scaledFutureX > newOffsetX + dynamicZoomedWidth - scaledEdgeMargin;
      const nearTopEdge = scaledFutureY < newOffsetY + scaledEdgeMargin;
      const nearBottomEdge =
        scaledFutureY > newOffsetY + dynamicZoomedHeight - scaledEdgeMargin;

      if (nearLeftEdge) {
        newOffsetX = scaledFutureX - scaledEdgeMargin - scaledPanExtra;
      } else if (nearRightEdge) {
        newOffsetX =
          scaledFutureX -
          dynamicZoomedWidth +
          scaledEdgeMargin +
          scaledPanExtra;
      }

      if (nearTopEdge) {
        newOffsetY = scaledFutureY - scaledEdgeMargin - scaledPanExtra;
      } else if (nearBottomEdge) {
        newOffsetY =
          scaledFutureY -
          dynamicZoomedHeight +
          scaledEdgeMargin +
          scaledPanExtra;
      }

      // Clamp values
      newOffsetX = Math.max(
        0,
        Math.min(scaledWidth - dynamicZoomedWidth, newOffsetX),
      );
      newOffsetY = Math.max(
        0,
        Math.min(scaledHeight - dynamicZoomedHeight, newOffsetY),
      );

      // Apply smooth interpolation between previous and new position
      const easingConfig = {
        strength: 1.0,
        speedFactor: 0.5,
        smoothness: 2.0,
        threshold: 0.001,
      };
      const smoothingSpeed = 0.35;
      const progress = smoothEaseInOut(smoothingSpeed, easingConfig);

      const finalOffsetX =
        previousOffsetX + (newOffsetX - previousOffsetX) * progress;
      const finalOffsetY =
        previousOffsetY + (newOffsetY - previousOffsetY) * progress;

      // Store position for this frame
      positions.push({
        offsetX: finalOffsetX,
        offsetY: finalOffsetY,
        cursorX: futureCursor.x,
        cursorY: futureCursor.y,
        zoomLevel: smoothedZoomLevel,
      });

      // Update previous values for next frame
      previousOffsetX = finalOffsetX;
      previousOffsetY = finalOffsetY;
      previousZoomLevel = smoothedZoomLevel;
      lastZoomLevel = zoomLevel;
    }
    // Additional smoothing pass like in your code
    const panSmoothingWindow = 7; // Original window for panning
    const zoomSmoothingWindow = 15; // Larger window for zoom
    const smoothed = [];

    for (let i = 0; i < positions.length; i++) {
      // Separate sums for panning and zoom
      let panWindowSum = {
        offsetX: 0,
        offsetY: 0,
        cursorX: 0,
        cursorY: 0,
      };
      let zoomSum = 0;
      let panWindowCount = 0;
      let zoomWindowCount = 0;

      // Calculate pan-related values with original window
      for (
        let j = Math.max(0, i - panSmoothingWindow);
        j < Math.min(positions.length, i + panSmoothingWindow + 1);
        j++
      ) {
        const panWeight = 1 - Math.abs(i - j) / (panSmoothingWindow + 1);
        panWindowSum.offsetX += positions[j].offsetX * panWeight;
        panWindowSum.offsetY += positions[j].offsetY * panWeight;
        panWindowSum.cursorX += positions[j].cursorX * panWeight;
        panWindowSum.cursorY += positions[j].cursorY * panWeight;
        panWindowCount += panWeight;
      }

      // Calculate zoom values with larger window for smoother zoom transitions
      for (
        let j = Math.max(0, i - zoomSmoothingWindow);
        j < Math.min(positions.length, i + zoomSmoothingWindow + 1);
        j++
      ) {
        const zoomWeight = 1 - Math.abs(i - j) / (zoomSmoothingWindow + 1);
        zoomSum += positions[j].zoomLevel * zoomWeight;
        zoomWindowCount += zoomWeight;
      }

      smoothed.push({
        offsetX: panWindowSum.offsetX / panWindowCount,
        offsetY: panWindowSum.offsetY / panWindowCount,
        cursorX: panWindowSum.cursorX / panWindowCount,
        cursorY: panWindowSum.cursorY / panWindowCount,
        zoomLevel: zoomSum / zoomWindowCount, // Using separate zoom smoothing
      });
    }

    return smoothed;
  }, [
    durationInFrames,
    fps,
    scale,
    scaledWidth,
    scaledHeight,
    zoomTimeline,
    LOOK_AHEAD,
    EDGE_MARGIN,
    PAN_EXTRA,
  ]);

  // Then in your render code, simply use the pre-calculated values:
  const { zoomLevel, offsetX, offsetY, cursorX, cursorY } =
    calculateFramePositions[frame] || {
      zoomLevel: 1.0,
      offsetX: 0,
      offsetY: 0,
      cursorX: 0,
      cursorY: 0,
    };

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
                -offsetX * zoomLevel, // Use frame-based zoomLevel
                'px',
                -offsetY * zoomLevel, // Use frame-based zoomLevel
                'px',
              ),
              scaleZoom(zoomLevel), // Use frame-based zoomLevel
            ]),
            // transformOrigin: "center center",
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
