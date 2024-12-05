//////////////////////////////////////////////////////////////////////////
// Preview.tsx
import React from 'react';
import {
  useVideoConfig,
  Video,
  AbsoluteFill,
  OffthreadVideo,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { wipe } from '@remotion/transitions/wipe';
import { clockWipe } from '@remotion/transitions/clock-wipe';

interface PreviewProps {
  mainVideoDurationInFrames: number;
  clipDurationInSeconds: number;
  transitionDurationInSeconds: number;
  numberOfClips: number;
  mainVideoSrc: string;
}

export const Preview: React.FC<PreviewProps> = ({
  mainVideoDurationInFrames,
  clipDurationInSeconds,
  transitionDurationInSeconds,
  numberOfClips,
  mainVideoSrc,
}) => {
  const { fps } = useVideoConfig();

  // Calculate interval between clips
  const mainVideoDurationInSeconds = mainVideoDurationInFrames / fps;
  const intervalBetweenClips = mainVideoDurationInSeconds / numberOfClips;

  // Calculate the starting times of each clip
  const clipStartTimes = Array.from({ length: numberOfClips }, (_, i) => {
    return i * intervalBetweenClips;
  });

  // Transition configurations
  const transitionConfigs = [
    // {
    //   Transition: clockWipe,
    //   directions: [
    //     { width, height }, // clockWipe takes width and height instead of directions
    //   ],
    // },
    // {
    //   Transition: slide,
    //   directions: ['from-left', 'from-right', 'from-top', 'from-bottom'],
    // },
    {
      Transition: wipe,
      directions: [
        'from-left',
        'from-top-left',
        'from-top',
        'from-top-right',
        'from-right',
        'from-bottom-left',
        'from-bottom-right',
      ],
    },
  ] as any;

  // Create sequences and transitions
  const elements = clipStartTimes.map((startTime, index) => {
    const configIndex = index % transitionConfigs.length;
    // const { Transition, directions } = transitionConfigs[configIndex];

    // Calculate frames
    const clipStartFrameInVideo = Math.floor(startTime * fps);
    const clipDurationInFrames = Math.floor(clipDurationInSeconds * fps);
    const transitionDurationInFrames = Math.floor(
      transitionDurationInSeconds * fps,
    );

    const isLastSequence = index === numberOfClips - 1;

    // Sequence duration includes transition overlap (except for last sequence)
    const sequenceDurationInFrames = isLastSequence
      ? clipDurationInFrames
      : clipDurationInFrames + transitionDurationInFrames;

    // Create the sequence
    const sequence = (
      <TransitionSeries.Sequence
        key={`sequence-${index}`}
        durationInFrames={sequenceDurationInFrames}
      >
        <AbsoluteFill>
          <Video
            src={mainVideoSrc} // Replace with your main video file
            startFrom={clipStartFrameInVideo}
            endAt={clipStartFrameInVideo + sequenceDurationInFrames}
          />
        </AbsoluteFill>
      </TransitionSeries.Sequence>
    );

    // Prepare the transition
    let transition = null;
    if (!isLastSequence) {
      //   const direction = directions[index % directions.length];
      const { Transition, directions } = transitionConfigs[configIndex];

      // Check if it's clockWipe or other transition type
      const presentation =
        Transition === clockWipe
          ? Transition(directions[0]) // For clockWipe, pass width and height
          : Transition({ direction: directions[index % directions.length] }); // For other transitions

    transition = (
        <TransitionSeries.Transition
          key={`transition-${index}`}
          presentation={presentation}
          timing={linearTiming({ durationInFrames: transitionDurationInFrames })}
        />
      );
    }

    return (
      <React.Fragment key={`fragment-${index}`}>
        {sequence}
        {transition}
      </React.Fragment>
    );
  });

  return <TransitionSeries>{elements}</TransitionSeries>;
};
