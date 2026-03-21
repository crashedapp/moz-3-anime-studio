# MOZ-3 Anime Studio

MOZ-3 Anime Studio is an interactive, Electron and React-based vTuber/avatar studio application. It provides dynamic lip-sync capabilities, animated expressions, and audio analysis to bring 2D avatars to life for streaming or recording.

This project is a fork. The original source code can be found here:

https://github.com/motaro-aniki/moz-3-anime-studio

This Fork Contains the following Changes.
- **Text is now all in English - Translated from Japanese.
- **There is no more auto-switching between tabs by the app as I found that not suitable for my purposes.
- **Background Music Feature has been removed.
- **Added the ability to place the character in a circular border with and optional background image.
- **Fixed Dragging of Window when not maximized on Windows. You can move by title bar though can be a bit finicky (Due to transparent window support)
- **Fixed cannot resized non maximized window. Not normal resize but it works if you do it from the bootom or right edge (Due to transparent window support)
- **Added ability to scale model image (including eyes).
- **Removed support for dragging character in editor. Added x,y positional sliders instead as drag and drop was flakey.
- **Redid positioning system to offest characters from the right panel so they maintain position when window is resized.
- **Microphone will default to last one you seleted ( ie Nvidia Broadcast)
- **Defaulted to Mic being active.
- **Reworked lip-syncing to move mouth more accurately with sound.




The Creator's Youtube Channel is here:


Motaro sensei

https://www.youtube.com/channel/UCKetWmeZ8I95zejbTxiNg9Q


I found out about this project from here and originally just wanted to translate to English (I have done a lot more!).

https://www.youtube.com/watch?v=48kUGGBYD2I

## Features

- **Avatar Customization:** Organize your avatar into customizable slots and expressions.
- **Microphone Lip-Sync:** Real-time audio analysis automatically triggers lip-sync and expressions based on your microphone input.
- **Audio File Lip-Sync:** Load custom audio files and have your avatar automatically lip-sync to the playback.
- **Background Support:** Toggle between Transparent, Green, Blue, and Magenta backgrounds for easy chroma-keying in OBS or other broadcasting software.
- **Transform Controls:** Adjust the position, scale, and rotation of individual avatar parts.
- **Calibration:** Calibrate microphone sensitivity and audio thresholds for an accurate lip-sync and tone-detection response.

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### Installation
1. Clone the repository to your local machine.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

### Running the App
To run the app in development mode using Electron and Vite:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## How to Use

1. **Adding Your Avatar:**
   - Use the **Assemble Model Assets Panel** to upload or assign different image parts (e.g., base, eyes, mouth) to your character.
   - Configure different **Characters** or **Expressions** by adding new tabs. (e.g., talking, laughing, sleeping).

2. **Audio & Lip-Sync:**
   - Navigate to the **Settings Panel** to select your audio input device.
   - You can speak into your microphone or upload an audio file. The application will analyze the audio to trigger the appropriate avatar expressions and mouth shapes.
   - Use the **Calibration Modal** if the lip-sync feels too sensitive or not responsive enough.

3. **Backgrounds (OBS / Streaming):**
   - In the Settings Panel, find the **Background Color** section.
   - Select Green, Blue, or Magenta to use chroma key filters in your streaming software (like OBS Studio). Choose Transparent if your capture setup supports an alpha channel directly.


## License
This project is a fork of moz-3-anime-studio, see original repository for licensing.

https://github.com/motaro-aniki/moz-3-anime-studio.