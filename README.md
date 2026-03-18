# MOZ-3 Anime Studio

MOZ-3 Anime Studio is an interactive, Electron and React-based vTuber/avatar studio application. It provides dynamic lip-sync capabilities, animated expressions, and audio analysis to bring 2D avatars to life for streaming or recording.

This project is a fork. The original source code can be found here:

https://github.com/motaro-aniki/moz-3-anime-studio

The Creator's Youtube Channel is here:


Motaro sensei

https://www.youtube.com/channel/UCKetWmeZ8I95zejbTxiNg9Q


I found out about this project from here and just wanted to translate to English.

https://www.youtube.com/watch?v=48kUGGBYD2I

## Features

- **Avatar Customization:** Organize your avatar into customizable slots and expressions.
- **Microphone Lip-Sync:** Real-time audio analysis automatically triggers lip-sync and expressions based on your microphone input.
- **Audio File Lip-Sync:** Load custom audio files and have your avatar automatically lip-sync to the playback.
- **Background Support:** Toggle between Transparent, Green, Blue, and Magenta backgrounds for easy chroma-keying in OBS or other broadcasting software.
- **BGM Support:** Play background music (looped or random) directly from the application.
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
   - Use the **Slot Panel** to upload or assign different image parts (e.g., base, eyes, mouth) to your character.
   - Configure **Expressions** via the Expression Tabs to create varied looks (e.g., normal, laughing, silent).

2. **Audio & Lip-Sync:**
   - Navigate to the **Settings Panel** to select your audio input device.
   - You can speak into your microphone or upload an audio file. The application will analyze the audio to trigger the appropriate avatar expressions and mouth shapes.
   - Use the **Calibration Modal** if the lip-sync feels too sensitive or not responsive enough.

3. **Backgrounds (OBS / Streaming):**
   - In the Settings Panel, find the **Background Color** section.
   - Select Green, Blue, or Magenta to use chroma key filters in your streaming software (like OBS Studio). Choose Transparent if your capture setup supports an alpha channel directly.

4. **Background Music (BGM):**
   - Place your music tracks inside the `public/BGM/` directory.
   - Within the application's Settings Panel, select a track or choose "Random Playback" to set the perfect mood.

## License
This project is a fork of moz-3-anime-studio, see original repository for licensing.

https://github.com/motaro-aniki/moz-3-anime-studio.