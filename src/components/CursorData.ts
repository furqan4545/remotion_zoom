// src/CursorData.ts
export interface RecordingInfo {
  start_time: number;
  end_time: number;
  duration: number;
  frame_rate: number;
  global_window_dimension: {
    width: number;
    height: number;
  };
  recorded_display_dimension: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface CursorPosition {
  global_display_data: {
    x: number;
    y: number;
    timestamp: number;
  };
  recorded_display_data: {
    x: number;
    y: number;
    timestamp: number;
    is_inside_bounds: boolean;
  };
}

export interface CursorData {
  recording_info: RecordingInfo;
  tracking_data: CursorPosition[];
}

// Import the cursor data
import cursorDataJson from "/public/assets/cursor_data2.json";

export const cursorData: CursorData = cursorDataJson as CursorData;
