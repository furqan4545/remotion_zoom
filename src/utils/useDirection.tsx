// src/utils/useDirection.tsx

import {useRef} from 'react';

type Direction = 'horizontal' | 'vertical' | 'diagonal';

interface UseDirectionOptions {
  slopeThreshold?: number;
  minFramesToSwitch?: number;
}

export function useDirection(
  dx: number,
  dy: number,
  options?: UseDirectionOptions
): Direction {
  const SLOPE_THRESHOLD = options?.slopeThreshold ?? 0.5;
  const MIN_FRAMES_TO_SWITCH = options?.minFramesToSwitch ?? 5;

  const currentDirectionRef = useRef<Direction>('horizontal'); 
  const lastDirectionRef = useRef<Direction>('horizontal');
  const framesInNewDirectionRef = useRef<number>(0);

  // 1. Determine the new direction from dx, dy
  let newDirection: Direction = 'diagonal';
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  if (absDy < SLOPE_THRESHOLD * absDx) {
    newDirection = 'horizontal';
  } else if (absDx < SLOPE_THRESHOLD * absDy) {
    newDirection = 'vertical';
  } else {
    newDirection = 'diagonal';
  }

  // 2. Stickiness logic
  const currentDirection = currentDirectionRef.current;
  const lastDirection = lastDirectionRef.current;
  let finalDirection = currentDirection; // default to the old direction

  if (newDirection !== currentDirection) {
    // If new direction = last direction, keep counting frames
    if (newDirection === lastDirection) {
      framesInNewDirectionRef.current++;
      if (framesInNewDirectionRef.current >= MIN_FRAMES_TO_SWITCH) {
        finalDirection = newDirection;
      }
    } else {
      // Reset
      lastDirectionRef.current = newDirection;
      framesInNewDirectionRef.current = 1;
    }
  } else {
    // Movement is still in the same direction
    framesInNewDirectionRef.current = 0;
    lastDirectionRef.current = currentDirection;
  }

  // Update the ref once we know final direction
  currentDirectionRef.current = finalDirection;

  return finalDirection;
}
