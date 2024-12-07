// /// ///////////////////////////////////////////////////////
// // src/MainVideo.tsx
// import React from 'react';
// import { TransitionSeries, linearTiming } from '@remotion/transitions';
// import { slide } from '@remotion/transitions/slide';
// import { clockWipe } from '@remotion/transitions/clock-wipe';
// import { Sequence, useVideoConfig, Audio } from 'remotion';
// import { IntroComponent } from './IntroComponent';
// import { Preview } from './Preview';
// import { ZoomAndPanEffect } from './ZoomAndPanEffect';

// interface MainVideoProps {
//   mainVideoDurationInFrames: number;
//   clipDurationInSeconds: number;
//   transitionDurationInSeconds: number;
//   numberOfClips: number;
//   mainVideoSrc: string;
//   introDurationInFrames: number;
//   introText: string;
//   logoSrc?: string;
//   transitionSoundEffectSrc1?: string; // Optional sound effect file
//   transitionSoundEffectSrc2?: string; // Optional sound effect file
//   includeIntro?: boolean;
//   includePreview?: boolean;
// }

// export const MainVideo: React.FC<MainVideoProps> = ({
//   mainVideoDurationInFrames,
//   clipDurationInSeconds,
//   transitionDurationInSeconds,
//   numberOfClips,
//   mainVideoSrc,
//   introDurationInFrames,
//   introText,
//   logoSrc,
//   transitionSoundEffectSrc1,
//   transitionSoundEffectSrc2,
//   includeIntro = true,
//   includePreview = true,
// }) => {
//   const { fps, width, height } = useVideoConfig();

//   const transitionDurationInFrames = Math.floor(
//     transitionDurationInSeconds * fps,
//   );

//   // Calculate total preview duration
//   const totalPreviewDurationInFrames = Math.floor(
//     numberOfClips * clipDurationInSeconds * fps,
//   );

//   // Initialize sequences array
//   const sequences: React.ReactNode[] = [];
//   const audioSequences: React.ReactNode[] = [];

//   let currentFrame = 0;

//   if (includeIntro) {
//     sequences.push(
//       <TransitionSeries.Sequence
//         key="intro"
//         durationInFrames={introDurationInFrames}
//       >
//         <IntroComponent
//           text={introText}
//           logoSrc={logoSrc}
//           durationInFrames={introDurationInFrames}
//         />
//       </TransitionSeries.Sequence>,
//     );
//     currentFrame += introDurationInFrames;

//     // Transition after Intro
//     sequences.push(
//       <TransitionSeries.Transition
//         presentation={clockWipe({ width, height })}
//         timing={linearTiming({
//           durationInFrames: Math.floor(transitionDurationInSeconds * fps),
//         })}
//       />,
//     );

//     // Add sound effect if provided
//     if (transitionSoundEffectSrc1) {
//       audioSequences.push(
//         <Sequence
//           key="audio-transition1"
//           from={currentFrame}
//           durationInFrames={transitionDurationInFrames - 0.25 * fps}
//         >
//           <Audio src={transitionSoundEffectSrc1} volume={0.8} />
//         </Sequence>,
//       );
//     }
//     currentFrame += transitionDurationInFrames;
//   }

//   // Include Preview if flag is true
//   if (includePreview) {
//     sequences.push(
//       <TransitionSeries.Sequence
//         key="preview"
//         durationInFrames={totalPreviewDurationInFrames}
//       >
//         <Preview
//           mainVideoDurationInFrames={mainVideoDurationInFrames}
//           clipDurationInSeconds={clipDurationInSeconds}
//           transitionDurationInSeconds={transitionDurationInSeconds}
//           numberOfClips={numberOfClips}
//           mainVideoSrc={mainVideoSrc}
//         />
//       </TransitionSeries.Sequence>,
//     );
//     currentFrame += totalPreviewDurationInFrames;

//     // Transition after Preview
//     sequences.push(
//       <TransitionSeries.Transition
//         presentation={clockWipe({ width, height })}
//         timing={linearTiming({
//           durationInFrames: Math.floor(transitionDurationInSeconds * fps),
//         })}
//       />,
//     );

//     // Add sound effect if provided
//     if (transitionSoundEffectSrc2) {
//       audioSequences.push(
//         <Sequence
//           key="audio-transition2"
//           from={currentFrame}
//           durationInFrames={transitionDurationInFrames + 0.5 * fps}
//         >
//           <Audio src={transitionSoundEffectSrc2} volume={0.5} />
//         </Sequence>,
//       );
//     }

//     currentFrame += transitionDurationInFrames;
//   }

//   // Main Video Sequence
//   sequences.push(
//     <TransitionSeries.Sequence
//       key="main-video"
//       durationInFrames={mainVideoDurationInFrames}
//     >
//       <ZoomAndPanEffect mainVideoSrc={mainVideoSrc} />
//     </TransitionSeries.Sequence>,
//   );
//   // No need to update currentFrame here since this is the last component

//   return (
//     <>
//       <TransitionSeries>{sequences}</TransitionSeries>
//       {audioSequences}
//     </>
//   );
// };


/// ///////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// src/MainVideo.tsx
import React from 'react';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { Sequence, useVideoConfig, Audio } from 'remotion';
import { IntroComponent } from './IntroComponent';
import { Preview } from './Preview';
import { ZoomAndPanEffect } from './ZoomAndPanEffect';

interface MainVideoProps {
  mainVideoDurationInFrames: number;
  clipDurationInSeconds: number;
  transitionDurationInSeconds: number;
  numberOfClips: number;
  mainVideoSrc: string;
  introDurationInFrames: number;
  introText: string;
  logoSrc?: string;
  transitionSoundEffectSrc1?: string; // Optional sound effect file
  transitionSoundEffectSrc2?: string; // Optional sound effect file
  includeIntro?: boolean;
  includePreview?: boolean;
  includeBackground?: boolean; // New prop for background toggle
  trimSettings?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  originalDimensions: {
    width: number;
    height: number;
  };
}

export const MainVideo: React.FC<MainVideoProps> = ({
  mainVideoDurationInFrames,
  clipDurationInSeconds,
  transitionDurationInSeconds,
  numberOfClips,
  mainVideoSrc,
  introDurationInFrames,
  introText,
  logoSrc,
  transitionSoundEffectSrc1,
  transitionSoundEffectSrc2,
  includeIntro = true,
  includePreview = true,
  includeBackground = true,
  trimSettings = { top: 0, bottom: 0, left: 0, right: 0 },
  originalDimensions = { width: 0, height: 0 },
}) => {
  const { fps, width, height } = useVideoConfig();

  const transitionDurationInFrames = Math.floor(
    transitionDurationInSeconds * fps,
  );

  // Calculate total preview duration
  const totalPreviewDurationInFrames = Math.floor(
    numberOfClips * clipDurationInSeconds * fps,
  );

  // Initialize sequences array
  const sequences: React.ReactNode[] = [];
  const audioSequences: React.ReactNode[] = [];

  let currentFrame = 0;

  if (includeIntro) {
    sequences.push(
      <TransitionSeries.Sequence
        key="intro"
        durationInFrames={introDurationInFrames}
      >
        <IntroComponent
          text={introText}
          logoSrc={logoSrc}
          durationInFrames={introDurationInFrames}
        />
      </TransitionSeries.Sequence>,
    );
    currentFrame += introDurationInFrames;

    // Transition after Intro
    sequences.push(
      <TransitionSeries.Transition
        presentation={clockWipe({ width, height })}
        timing={linearTiming({
          durationInFrames: Math.floor(transitionDurationInSeconds * fps),
        })}
      />,
    );

    // Add sound effect if provided
    if (transitionSoundEffectSrc1) {
      audioSequences.push(
        <Sequence
          key="audio-transition1"
          from={currentFrame - (0.2 * fps)}
          durationInFrames={transitionDurationInFrames + (0.1 * fps)}
        >
          <Audio src={transitionSoundEffectSrc1}
            volume={(frame) => {
                if (frame <= 0) return 0;
                if (frame <= 0.2 * fps) return (frame / (0.2 * fps)) * 0.2;
                if (frame <= transitionDurationInFrames + 0.2 * fps) return 0.2;
                if (frame <= transitionDurationInFrames + 0.4 * fps) {
                    return 0.2 * (1 - ((frame - (transitionDurationInFrames + 0.2 * fps)) / (0.2 * fps)));
                }
                return 0;
            }}
           />
        </Sequence>,
      );
    }
    currentFrame += transitionDurationInFrames;
  }

  // Include Preview if flag is true
  if (includePreview) {
    sequences.push(
      <TransitionSeries.Sequence
        key="preview"
        durationInFrames={totalPreviewDurationInFrames}
      >
        <Preview
          mainVideoDurationInFrames={mainVideoDurationInFrames}
          clipDurationInSeconds={clipDurationInSeconds}
          transitionDurationInSeconds={transitionDurationInSeconds}
          numberOfClips={numberOfClips}
          mainVideoSrc={mainVideoSrc}
        />
      </TransitionSeries.Sequence>,
    );
    currentFrame += totalPreviewDurationInFrames;

    // Transition after Preview
    sequences.push(
      <TransitionSeries.Transition
        presentation={clockWipe({ width, height })}
        timing={linearTiming({
          durationInFrames: Math.floor(transitionDurationInSeconds * fps),
        })}
      />,
    );

    // Add sound effect if provided
    if (transitionSoundEffectSrc2) {
      audioSequences.push(
        <Sequence
          key="audio-transition2"
          from={currentFrame - (1.2 * fps)}
          durationInFrames={transitionDurationInFrames + (0.3 * fps)}
        >
          <Audio src={transitionSoundEffectSrc2} 
            volume={(frame) => {
                if (frame <= 0.2 * fps) return (frame / (0.2 * fps)) * 0.1;
                if (frame <= transitionDurationInFrames + 0.2 * fps) return 0.1;
                if (frame <= transitionDurationInFrames + 0.4 * fps) {
                    return 0.1 * (1 - ((frame - (transitionDurationInFrames + 0.2 * fps)) / (0.2 * fps)));
                }
                return 0;
            }}
          />
        </Sequence>,
      );
    }

    currentFrame += transitionDurationInFrames;
  }

  // Main Video Sequence
  sequences.push(
    <TransitionSeries.Sequence
      key="main-video"
      durationInFrames={mainVideoDurationInFrames}
    >
      <ZoomAndPanEffect mainVideoSrc={mainVideoSrc} 
       includeBackground={includeBackground}
       trimSettings = { trimSettings } 
       originalDimensions={originalDimensions}
       />
    </TransitionSeries.Sequence>,
  );
  // No need to update currentFrame here since this is the last component

  return (
    <>
      <TransitionSeries>{sequences}</TransitionSeries>
      {audioSequences}
    </>
  );
};
