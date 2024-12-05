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
          from={currentFrame}
          durationInFrames={transitionDurationInFrames - 0.25 * fps}
        >
          <Audio src={transitionSoundEffectSrc1} volume={0.8} />
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
          from={currentFrame}
          durationInFrames={transitionDurationInFrames + 0.5 * fps}
        >
          <Audio src={transitionSoundEffectSrc2} volume={0.5} />
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
      <ZoomAndPanEffect mainVideoSrc={mainVideoSrc} />
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
