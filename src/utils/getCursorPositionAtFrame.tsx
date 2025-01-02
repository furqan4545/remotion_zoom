// src/utils/getCursorPositionAtFrame.tsx

import {CursorPosition, CursorData} from '../components/CursorData';

export function getCursorPositionAtFrame(
  frame: number,
  fps: number,
  cursorData: CursorData
): {x: number; y: number} {
  // Convert frame to a time offset in ms relative to start
  const timeMs = (frame / fps) * 1000;
  const startTimeMs = cursorData.recording_info.start_time;

  // The absolute timestamp in ms
  const actualTimestamp = startTimeMs + timeMs;

  // Find the closest cursor record
  // In a real scenario, you might do a more sophisticated interpolation
  // or binary search. For a simple approach, we’ll just do a linear search
  // for the tracking_data entry with timestamp closest to `actualTimestamp`.
  
  // "recorded_display_data.timestamp" might be relative to start_time
  // or it might be the full timestamp. Adjust as needed.

  // We'll assume "timestamp" in recorded_display_data is *relative* to start_time
  let closest: CursorPosition | null = null;
  let minDiff = Number.MAX_SAFE_INTEGER;

  for (const pos of cursorData.tracking_data) {
    const currentTimestamp = cursorData.recording_info.start_time + pos.recorded_display_data.timestamp;
    const diff = Math.abs(currentTimestamp - actualTimestamp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pos;
    }
  }

  if (!closest) {
    // If we didn't find anything, just return (0,0) or some fallback
    return {x: 0, y: 0};
  }

  // Use recorded_display_data or global_display_data depending on your needs
  return {
    x: closest.recorded_display_data.x,
    y: closest.recorded_display_data.y,
  };
}
