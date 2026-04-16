import { useState } from 'react';
import Lyrics from './pages/lyrics';
import Media from './pages/media';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [isCaptioning, setIsCaptioning] = useState(true);
  const [mediaInfo, setMediaInfo] = useState(null);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0f2f5',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: '800',
            color: '#1a1a1b',
          }}
        >
          Circut Lab <span style={{ color: '#007bff' }}>Lyrics Sync</span>
        </h1>
        <p style={{ color: '#666', marginTop: '5px' }}>
          Outil professionnel de synchronisation de paroles
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          maxWidth: '1400px',
          margin: '0 auto',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: '1.5', minWidth: '400px' }}>
          <Media
            onTimeUpdate={setCurrentTime}
            currentTime={currentTime}
            captures={captures}
            isCaptioning={isCaptioning}
            onMediaLoaded={setMediaInfo}
          />
        </div>

        <div style={{ flex: '1', minWidth: '350px' }}>
          <Lyrics
            currentTime={currentTime}
            captures={captures}
            setCaptures={setCaptures}
            isCaptioning={isCaptioning}
            setIsCaptioning={setIsCaptioning}
            mediaInfo={mediaInfo}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
