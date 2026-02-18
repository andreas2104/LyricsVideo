import { useState } from "react";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';

import Media from "./pages/media";
import Lyrics from "./pages/lyrics";

function App() {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [isCaptioning, setIsCaptioning] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("video");
  const [lyrics, setLyrics] = useState("");

  const handleResetAll = () => {
    setMediaUrl("");
    setMediaType("video");
    setLyrics("");
    setCaptures([]);
    setIsCaptioning(true);
    setCurrentTime(0);
  };

  return (
    <div style={{ 
      height: '100vh', 
      background: '#f0f2f5', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ padding: '20px 20px 10px', textAlign: 'center', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#1a1a1b' }}>
           <span style={{ color: '#007bff' }}>{t('app.title')}</span>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
          <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{t('app.subtitle')}</p>
          <LanguageSwitcher />
        </div>
      </header>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        maxWidth: '1400px', 
        margin: '0 auto',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'stretch',
        flex: 1,
        width: '100%',
        padding: '0 20px 20px',
        overflow: 'hidden'
      }}>
        <div style={{ flex: '1.5', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
          <Media 
            onTimeUpdate={setCurrentTime} 
            currentTime={currentTime}
            captures={captures}
            isCaptioning={isCaptioning}
            mediaUrl={mediaUrl}
            setMediaUrl={setMediaUrl}
            mediaType={mediaType}
            setMediaType={setMediaType}
          />
        </div>
        
        <div style={{ flex: '1', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
          <Lyrics
            currentTime={currentTime} 
            captures={captures}
            setCaptures={setCaptures}
            isCaptioning={isCaptioning}
            setIsCaptioning={setIsCaptioning}
            lyrics={lyrics}
            setLyrics={setLyrics}
            onResetAll={handleResetAll}
          />
        </div>
      </div>

      <footer style={{ 
        flexShrink: 0,
        textAlign: 'center', 
        padding: '10px', 
        borderTop: '1px solid #ddd',
        color: '#666',
        fontSize: '0.8rem',
        background: 'white'
      }}>
        <p style={{ margin: 0 }}>Copyright © 2026 <span style={{ fontWeight: '600', color: '#333' }}>Circut Lab</span>. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;