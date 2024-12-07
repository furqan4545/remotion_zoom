
// // Root.tsx
// import './tailwind.css';
// import { Composition, staticFile } from 'remotion';
// // import { getVideoMetadata, VideoMetadata } from "@remotion/renderer";
// // import { getVideoMetadata } from '@remotion/media-utils';
// import { MainVideo } from './components/MainVideo';
// import { cursorData } from './components/CursorData';

// export const RemotionRoot: React.FC = () => {
//   const fps = cursorData.recording_info.frame_rate;

//   // Main Video Duration Calculation
//   const mainVideoDurationInFrames = Math.ceil(
//     (cursorData.recording_info.duration / 1000) * fps,
//   );
//   const mainVideoDurationInSeconds = mainVideoDurationInFrames / fps;

//   // Flags to include or exclude intro and preview
//   const includeIntro = true; // Set to true to include intro
//   const includePreview = true; // Set to true to include preview

//   // Main Video Source
//   const mainVideoSrc = staticFile('assets/screen_3.webm');

//   // Intro Settings
//   const introDurationInSeconds = 2.5; // Duration of the intro
//   const introDurationInFrames = Math.floor(introDurationInSeconds * fps);
//   const introText = 'Welcome to the Future'; // Custom text
//   const logoSrc = staticFile('logos/no_bg.png'); // Optional logo path

//   // Preview Settings
//   const clipDurationInSeconds = 1.5;
//   const transitionDurationInSeconds = 0.3;
//   const transitionDurationInFrames = Math.floor(
//     transitionDurationInSeconds * fps,
//   );
//   const numberOfClips = 5;

//   // Total Preview Duration
//   const totalPreviewDurationInSeconds = numberOfClips * clipDurationInSeconds;
//   const totalPreviewDurationInFrames = Math.floor(
//     totalPreviewDurationInSeconds * fps,
//   );

//   // Calculate total composition duration (excluding transition durations)
//   let totalDurationInFrames = mainVideoDurationInFrames;
//   if (includeIntro) {
//     totalDurationInFrames += introDurationInFrames - transitionDurationInFrames;
//   }
//   if (includePreview) {
//     totalDurationInFrames +=
//       totalPreviewDurationInFrames - transitionDurationInFrames;
//   }

//   // Transition Sound Effect Source (Optional)
//   const transitionSoundEffectSrc1 = staticFile('SFX/glitch1.mp3'); // Replace with your sound effect file or leave undefined
//   const transitionSoundEffectSrc2 = staticFile('SFX/whoosh1.mp3');
//   // const transitionSoundEffectSrc1 = null; 
//   // const transitionSoundEffectSrc2 = null;

//   return (
//     <Composition
//       id="MyVideo"
//       component={MainVideo as any}
//       durationInFrames={totalDurationInFrames}
//       fps={fps}
//       width={cursorData.recording_info.recorded_display_dimension.width}
//       height={cursorData.recording_info.recorded_display_dimension.height}
//       defaultProps={{
//         mainVideoDurationInFrames,
//         clipDurationInSeconds,
//         transitionDurationInSeconds,
//         numberOfClips,
//         mainVideoSrc,
//         introDurationInFrames,
//         introText,
//         logoSrc,
//         transitionSoundEffectSrc1, // Pass the sound effect prop
//         transitionSoundEffectSrc2, // Pass the sound effect prop
//         includeIntro,
//         includePreview,
//         includeBackground: false,
//       }}
//     />
//   );
// };

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

// Root.tsx
import './tailwind.css';
import { Composition, staticFile } from 'remotion';
// import { getVideoMetadata, VideoMetadata } from "@remotion/renderer";
// import { getVideoMetadata } from '@remotion/media-utils';
import { MainVideo } from './components/MainVideo';
import { cursorData } from './components/CursorData';

export const RemotionRoot: React.FC = () => {
  const fps = cursorData.recording_info.frame_rate;

  // Main Video Duration Calculation
  const mainVideoDurationInFrames = Math.ceil(
    (cursorData.recording_info.duration / 1000) * fps,
  );
  const mainVideoDurationInSeconds = mainVideoDurationInFrames / fps;

  // Flags to include or exclude intro and preview
  const includeIntro = true; // Set to true to include intro
  const includePreview = true; // Set to true to include preview

  // Main Video Source
  const mainVideoSrc = staticFile('assets/screen_3.webm');

  // Intro Settings
  const introDurationInSeconds = 2.5; // Duration of the intro
  const introDurationInFrames = Math.floor(introDurationInSeconds * fps);
  const introText = 'Welcome to the Future'; // Custom text
  const logoSrc = staticFile('logos/no_bg.png'); // Optional logo path

  // Preview Settings
  const clipDurationInSeconds = 1.5;
  const transitionDurationInSeconds = 0.3;
  const transitionDurationInFrames = Math.floor(
    transitionDurationInSeconds * fps,
  );
  const numberOfClips = 5;

  // Total Preview Duration
  const totalPreviewDurationInSeconds = numberOfClips * clipDurationInSeconds;
  const totalPreviewDurationInFrames = Math.floor(
    totalPreviewDurationInSeconds * fps,
  );

  // Calculate total composition duration (excluding transition durations)
  let totalDurationInFrames = mainVideoDurationInFrames;
  if (includeIntro) {
    totalDurationInFrames += introDurationInFrames - transitionDurationInFrames;
  }
  if (includePreview) {
    totalDurationInFrames +=
      totalPreviewDurationInFrames - transitionDurationInFrames;
  }

  // Transition Sound Effect Source (Optional)
  const transitionSoundEffectSrc1 = staticFile('SFX/glitch1.mp3'); // Replace with your sound effect file or leave undefined
  const transitionSoundEffectSrc2 = staticFile('SFX/whoosh1.mp3');
  // const transitionSoundEffectSrc1 = null; 
  // const transitionSoundEffectSrc2 = null;

  // Trim settings
  const trimSettings = {
    top: 80,
    bottom: 50,
    left: 0,
    right: 0,
  };

  // Calculate new dimensions based on trim settings
  const compositionWidth = 
    cursorData.recording_info.recorded_display_dimension.width - 
    (trimSettings.left + trimSettings.right);
    
  const compositionHeight = 
    cursorData.recording_info.recorded_display_dimension.height - 
    (trimSettings.top + trimSettings.bottom);



  return (
    <Composition
      id="MyVideo"
      component={MainVideo as any}
      durationInFrames={totalDurationInFrames}
      fps={fps}
      // width={cursorData.recording_info.recorded_display_dimension.width}
      // height={cursorData.recording_info.recorded_display_dimension.height}
      width={compositionWidth}
      height={compositionHeight}
      defaultProps={{
        mainVideoDurationInFrames,
        clipDurationInSeconds,
        transitionDurationInSeconds,
        numberOfClips,
        mainVideoSrc,
        introDurationInFrames,
        introText,
        logoSrc,
        transitionSoundEffectSrc1, // Pass the sound effect prop
        transitionSoundEffectSrc2, // Pass the sound effect prop
        includeIntro,
        includePreview,
        includeBackground: true,
        trimSettings,
        originalDimensions: {
          width: cursorData.recording_info.recorded_display_dimension.width,
          height: cursorData.recording_info.recorded_display_dimension.height,
        },
      }}
    />
  );
};
