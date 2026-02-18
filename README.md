# Video Lyrics Synchronizer

A powerful React application designed to synchronize lyrics with video and audio files. This tool allows users to easily create synchronized `.lrc` files by playing media and clicking to mark timestamps for each line of lyrics.

## Features

-   **Media Playback**: Supports local video/audio files and external URLs (including YouTube) via `react-player`.
-   **Lyrics Synchronization**: Intuitive interface to paste lyrics and sync them line-by-line with the media playback.
-   **Visualizer**: Real-time visualization of the synchronized lyrics.
-   **Export**: Generate and download standard `.lrc` files for use in media players.
-   **Interactive UI**: Keyboard shortcuts (Enter key) for quick synchronization and mouse support.
-   **Responsive Design**: Built with TailwindCSS for a modern and responsive user interface.

## Tech Stack

-   **Frontend**: React, Vite
-   **Styling**: TailwindCSS
-   **Animations**: Framer Motion
-   **Icons**: React Icons
-   **Media Player**: React Player
-   **Routing**: React Router DOM

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```

2.  Navigate to the project directory:
    ```bash
    cd videolyrics
    ```

3.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  **Import Media**: Use the media input section to load a video or audio file from your computer, or paste a Youtube URL.
2.  **Paste Lyrics**: Switch to "Edit Mode" in the lyrics section and paste your song lyrics.
3.  **Synchronize**:
    -   Play the media.
    -   Click "Resume" (Reprendre) to start synchronization mode.
    -   As the song plays, press `Enter` or click the "SYNC" button to mark the start time for the current line.
    -   The next line will automatically become active.
4.  **Download**: Once finished, click "Download .LRC" (Télécharger .LRC) to save your synchronized lyrics file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](https://choosealicense.com/licenses/mit/)
