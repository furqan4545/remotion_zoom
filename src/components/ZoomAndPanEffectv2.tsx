
// ZoomAndPanEffect.tsx
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

  // Adjust zoom timeline based on includeBackground flag
  const zoomTimeline = useMemo(() => {
    if (!includeBackground) {
      // When background is disabled, start at 1.0 and don't allow zoom out below 1.0
      return [
        {
          zoomDuration: 3,
          zoomLevel: 1.0,
          zoomStartLevel: 1.0,
          transitionDuration: 2,
        },
        { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
        { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
        { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
        { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
        { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
        { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
      ];
    }

    // Original timeline with zoom out capability when background is enabled
    return [
      {
        zoomDuration: 3,
        zoomLevel: 0.8,
        zoomStartLevel: 0.8,
        transitionDuration: 2,
      },
      { zoomDuration: 5, zoomLevel: 1.25, transitionDuration: 2 },
      { zoomDuration: 5, zoomLevel: 1.5, transitionDuration: 2 },
      { zoomDuration: 5, zoomLevel: 1.2, transitionDuration: 2 },
      { zoomDuration: 3, zoomLevel: 1.8, transitionDuration: 2 },
      { zoomDuration: 6, zoomLevel: 1.0, transitionDuration: 2 },
      { zoomDuration: 2, zoomLevel: 1.25, transitionDuration: 2 },
    ];
  }, [includeBackground]);

  // Build zoom events with cumulative start and end times
  const zoomEvents = useMemo(() => {
    const events = [] as any[];
    let cumulativeTime = 0; // Start from 0 instead of 3

    for (let i = 0; i < zoomTimeline.length; i++) {
      const event = zoomTimeline[i];
      const prevEvent =
        zoomTimeline[i - 1] || zoomTimeline[zoomTimeline.length - 1];

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
        0,
      ),
    [zoomEvents],
  );

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
      strength: 6.5, // Match panning strength
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
    const timeInSecondsRaw = frame / fps;

    if (timeInSecondsRaw < totalCycleDuration) {
      // During the first iteration, use the actual time
      var timeInSeconds = timeInSecondsRaw;
    } else {
      // For subsequent iterations, adjust time to skip the first event
      const firstEventEndTime = zoomEvents[0].transitionEndTime;
      const loopDuration = totalCycleDuration - firstEventEndTime;

      timeInSeconds =
        ((timeInSecondsRaw - firstEventEndTime) % loopDuration) +
        firstEventEndTime;
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
        return interpolateZoom(
          currentZoomLevel,
          toZoomLevel,
          transitionProgress,
        );
      } else if (
        startTime === endTime && // Initial transition when zoomDuration is 0
        transitionDuration > 0 &&
        timeInSeconds >= transitionStartTime &&
        timeInSeconds < transitionEndTime
      ) {
        // Interpolate from zoomStartLevel to currentZoomLevel
        const transitionProgress =
          (timeInSeconds - transitionStartTime) / transitionDuration;
        return interpolateZoom(
          zoomStartLevel,
          currentZoomLevel,
          transitionProgress,
        );
      }
    }

    // If time is outside any zoom event, set zoomLevel to initial zoomStartLevel
    return zoomTimeline[1].zoomStartLevel || 1.0;
  };

  const currentZoom = getZoomLevel(frame);

  // Define camera widget size range
  const CAMERA_MIN_SIZE = 170; // Smallest size when zoomed in
  const CAMERA_MAX_SIZE = 320; // Largest size when zoomed out

  // Get min and max zoom levels from zoomTimeline
  const zoomLevels = zoomTimeline.map((z) => z.zoomLevel);
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



// Inside component
const WINDOW_SIZE = 60;  // Looking ahead 60 frames

const ZOOM_THRESHOLDS = [
  { zoom: 1.8, threshold: 100, smooth_level: { slow: 0.000085, fast: 0.094 } },
  { zoom: 1.5, threshold: 120, smooth_level: { slow: 0.000090, fast: 0.093 } },
  { zoom: 1.25, threshold: 130, smooth_level: { slow: 0.000095, fast: 0.092 } },
  { zoom: 1.2, threshold: 180, smooth_level: { slow: 0.000096, fast: 0.091 } },
  { zoom: 1.0, threshold: 190, smooth_level: { slow: 0.000097, fast: 0.090 } },
  { zoom: 0.8, threshold: 200, smooth_level: { slow: 0.010, fast: 0.10 } }
].sort((a, b) => b.zoom - a.zoom);

// Update the getThresholdForZoom function to include smoothing levels
const getConfigForZoom = (currentZoom: number) => {
  const thresholdConfig = ZOOM_THRESHOLDS.find(config => currentZoom >= config.zoom) 
                         || ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.length - 1];
  
  const nextConfig = ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.indexOf(thresholdConfig) + 1];
  
  if (nextConfig) {
    const zoomDiff = thresholdConfig.zoom - nextConfig.zoom;
    const progress = (thresholdConfig.zoom - currentZoom) / zoomDiff;
    
    // Interpolate threshold and smoothing levels
    return {
      threshold: thresholdConfig.threshold - 
        ((thresholdConfig.threshold - nextConfig.threshold) * progress),
      smooth_level: {
        slow: thresholdConfig.smooth_level.slow - 
          ((thresholdConfig.smooth_level.slow - nextConfig.smooth_level.slow) * progress),
        fast: thresholdConfig.smooth_level.fast - 
          ((thresholdConfig.smooth_level.fast - nextConfig.smooth_level.fast) * progress)
      }
    };
  }
  
  return {
    threshold: thresholdConfig.threshold,
    smooth_level: thresholdConfig.smooth_level
  };
};

const smoothedPanPositions = useMemo(() => {
  const panPositions = [];
  
  // Calculate max pan limits based on zoom level
  const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
  const minZoomLevel = Math.min(...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel));
  const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

  // Calculate trimmed viewport dimensions
  const trimmedWidth = ORIGINAL_WIDTH - (trimSettings.left + trimSettings.right);
  const trimmedHeight = ORIGINAL_HEIGHT - (trimSettings.top + trimSettings.bottom);

  // Calculate pan limits considering trimmed bounds
  const maxPanX = trimmedWidth * (effectiveMaxZoomLevel - 1);
  const maxPanY = trimmedHeight * (effectiveMaxZoomLevel - 1);

  let previousPanX = 0;
  let previousPanY = 0;

  for (let f = 0; f < durationInFrames; f++) {
    const timestamp = (f / fps + LOOKAHEAD_SECONDS) * 1000;
    // const timestamp = (f / fps + 1) * 1000;
    const maxTimestamp = (durationInFrames / fps) * 1000;
    const adjustedTimestamp = Math.min(timestamp, maxTimestamp);
    const cursorPos = getCursorPositionAtTime(adjustedTimestamp);

    // Adjust cursor position relative to trimmed viewport
    const adjustedCursorX = Math.max(
      -trimSettings.left,
      Math.min(ORIGINAL_WIDTH + trimSettings.right, cursorPos.x)
    );
    const adjustedCursorY = Math.max(
      -trimSettings.top,
      Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, cursorPos.y)
    );

    // Calculate trimmed center
    const trimmedCenterX = trimSettings.left + trimmedWidth / 2;
    const trimmedCenterY = trimSettings.top + trimmedHeight / 2;

    // Calculate target pan position
    let targetPanX = adjustedCursorX - trimmedCenterX;
    let targetPanY = adjustedCursorY - trimmedCenterY;

    // Adjust clamping to allow more movement
    targetPanX = Math.max(-maxPanX * 1.0, Math.min(maxPanX * 1.0, targetPanX));  //  extra movement (20% more) beyond the normal boundaries.
    targetPanY = Math.max(-maxPanY * 1.0, Math.min(maxPanY * 1.0, targetPanY));

    //////////////////////

    // Look ahead to calculate future movement magnitude
    const futureFrame = Math.min(f + WINDOW_SIZE, durationInFrames - 1);
    const futureCursor = getCursorPositionAtTime(
      (futureFrame / fps + LOOKAHEAD_SECONDS) * 1000
    );

    // Calculate future position
    const futureAdjustedX = Math.max(
      -trimSettings.left,
      Math.min(ORIGINAL_WIDTH + trimSettings.right, futureCursor.x)
    );
    const futureAdjustedY = Math.max(
      -trimSettings.top,
      Math.min(ORIGINAL_HEIGHT + trimSettings.bottom, futureCursor.y)
    );

    const futurePanX = futureAdjustedX - trimmedCenterX;
    const futurePanY = futureAdjustedY - trimmedCenterY;

    // Calculate movement magnitude
    const movementX = Math.abs(futurePanX - targetPanX);
    const movementY = Math.abs(futurePanY - targetPanY);
    const totalMovement = Math.sqrt(movementX * movementX + movementY * movementY);

    const currentZoom = getZoomLevel(f);
    const config = getConfigForZoom(currentZoom);
    const zoomAdjustedThreshold = config.threshold;

    let dynamicSmoothingFactor;
    if (totalMovement > zoomAdjustedThreshold) {
      const excess = Math.min(totalMovement / zoomAdjustedThreshold, 2);
      
      // Use the excess directly for easing instead of movementProgress
      const easeOut = smoothEaseInOut(excess - 1, {
          // strength: 6.5,
          // speedFactor: 0.8,
          // smoothness: 1.8,
          // threshold: 0.08,
          strength: 4.5,
          speedFactor: 0.6,
          smoothness: 2.8,
          threshold: 0.08,
      });
      
      // Simpler smoothing calculation
      dynamicSmoothingFactor = config.smooth_level.slow + 
          (config.smooth_level.fast - config.smooth_level.slow) * easeOut;
  } else {
      dynamicSmoothingFactor = config.smooth_level.slow;
  }

    // Apply dynamic smoothing
    const smoothedX = previousPanX + (targetPanX - previousPanX) * dynamicSmoothingFactor;
    const smoothedY = previousPanY + (targetPanY - previousPanY) * dynamicSmoothingFactor;

    ///////////////

    panPositions.push({ 
      panX: smoothedX, 
      panY: smoothedY 
    });

    previousPanX = smoothedX;
    previousPanY = smoothedY;
  }

  // Additional smoothing pass for extra fluidity
  const smoothingWindow = 7;
  // const smoothingWindow = 10;
  const finalSmoothed = [];
  
  for (let i = 0; i < panPositions.length; i++) {
    let windowSum = { panX: 0, panY: 0 };
    let windowCount = 0;
    
    for (let j = Math.max(0, i - smoothingWindow); 
         j < Math.min(panPositions.length, i + smoothingWindow + 1); j++) {
      const weight = 1 - Math.abs(i - j) / (smoothingWindow + 1);
      windowSum.panX += panPositions[j].panX * weight;
      windowSum.panY += panPositions[j].panY * weight;
      windowCount += weight;
    }
    
    finalSmoothed.push({
      panX: windowSum.panX / windowCount,
      panY: windowSum.panY / windowCount
    });
  }

  return finalSmoothed;
}, [
  durationInFrames,
  fps,
  ORIGINAL_WIDTH,
  ORIGINAL_HEIGHT,
  cursorData,
  LOOKAHEAD_SECONDS,
  zoomTimeline,
  trimSettings,
  WINDOW_SIZE,
]);
  // Get pan values for the current frame
  const panX = smoothedPanPositions[frame]?.panX || 0;
  const panY = smoothedPanPositions[frame]?.panY || 0;

  // Adjust pan values based on current zoom level
  const maxZoomLevel = Math.max(...zoomTimeline.map((z) => z.zoomLevel));
  const minZoomLevel = Math.min(
    ...zoomTimeline.map((z) => z.zoomStartLevel || z.zoomLevel),
  );
  const effectiveMaxZoomLevel = Math.max(maxZoomLevel, minZoomLevel);

  const getAdjustedPanFactor = (
    zoom: number,
    minZoom: number,
    maxZoom: number,
  ) => {
    const zoomProgress = (zoom - minZoom) / (maxZoom - minZoom);
    return smoothEaseInOut(zoomProgress, {
      // strength: 6.5, // Match panning strength
      // speedFactor: 0.5,
      // smoothness: 1.8,
      // threshold: 0.08,
      strength: 4.5,
          speedFactor: 0.6,
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