import React, { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

const Lyrics = ({
  currentTime,
  captures,
  setCaptures,
  isCaptioning,
  setIsCaptioning,
  mediaInfo,
}) => {
  const [lyrics, setLyrics] = useState('');
  const [isEditMode, setIsEditMode] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const scrollRef = useRef(null);

  const lyricsLines = useMemo(() => {
    return lyrics.split('\n').filter((line) => line.trim() !== '');
  }, [lyrics]);

  const handleTextChange = (e) => {
    setLyrics(e.target.value);
    setCurrentLineIndex(0);
  };

  // Capture instantanée sans décalage pour coller au clic
  const handleCapture = () => {
    if (!isCaptioning || currentLineIndex >= lyricsLines.length) return;

    const calibratedTime = currentTime;
    const lineText = lyricsLines[currentLineIndex];

    const newCapture = {
      time: calibratedTime.toFixed(2),
      text: lineText,
    };

    setCaptures((prev) => [...prev, newCapture]);
    setCurrentLineIndex((prev) => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditMode && isCaptioning && e.key === 'Enter') {
        e.preventDefault();
        handleCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, isCaptioning, currentLineIndex, currentTime, lyricsLines]);

  useEffect(() => {
    if (!isEditMode && scrollRef.current) {
      const activeLine = scrollRef.current.querySelector(
        `#line-${currentLineIndex}`,
      );
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex, isEditMode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  const generateLRC = () => {
    const lrc = captures
      .map((c) => `[${formatTime(parseFloat(c.time))}] ${c.text}`)
      .join('\n');
    const blob = new Blob([lrc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lyrics.lrc';
    a.click();
  };

  const downloadAll = async () => {
    const baseName = mediaInfo?.filename
      ? mediaInfo.filename.replace(/\.[^/.]+$/, '')
      : 'lyrics';

    if (mediaInfo?.file) {
      const mediaResponse = await fetch(mediaInfo.url);
      const mediaBlob = await mediaResponse.blob();
      const mediaUrl = URL.createObjectURL(mediaBlob);
      const mediaA = document.createElement('a');
      mediaA.href = mediaUrl;
      mediaA.download = mediaInfo.filename;
      mediaA.click();
      URL.revokeObjectURL(mediaUrl);
    }

    const lrc = captures
      .map((c) => `[${formatTime(parseFloat(c.time))}] ${c.text}`)
      .join('\n');
    const lrcBlob = new Blob([lrc], { type: 'text/plain' });
    const lrcUrl = URL.createObjectURL(lrcBlob);
    const lrcA = document.createElement('a');
    lrcA.href = lrcUrl;
    lrcA.download = `${baseName}.lrc`;
    lrcA.click();
    URL.revokeObjectURL(lrcUrl);
  };

  return (
    <div className="lyrics-container">
      <div className="lyrics-header">
        <h2 className="lyrics-title">
          {isCaptioning ? ' Synchronisation ' : ' Visualisation '}
        </h2>
        <button
          onClick={() => setIsCaptioning(!isCaptioning)}
          className={`lyrics-toggle-btn ${isCaptioning ? 'active' : ''}`}
        >
          {isCaptioning ? 'Terminer' : 'Reprendre'}
        </button>
      </div>

      {isCaptioning && (
        <div className="sync-container">
          <div className="mode-toggle">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`mode-btn ${isEditMode ? 'active' : ''}`}
            >
              {isEditMode ? ' VALIDER LE TEXTE' : ' MODIFIER LE TEXTE'}
            </button>
          </div>

          {isEditMode ? (
            <div className="edit-mode">
              <label className="edit-label">Collez vos paroles ici :</label>
              <textarea
                value={lyrics}
                onChange={handleTextChange}
                placeholder="Une phrase par ligne..."
                className="edit-textarea"
              />
            </div>
          ) : (
            <div ref={scrollRef} className="sync-list-container">
              {lyricsLines.map((line, index) => {
                const isActive = index === currentLineIndex;
                const isNext = index === currentLineIndex + 1;
                const isPassed = index < currentLineIndex;
                const capture = captures[index];

                return (
                  <div
                    key={index}
                    id={`line-${index}`}
                    className={`lyric-line ${isActive ? 'active' : ''} ${isNext ? 'next' : ''} ${isPassed ? 'passed' : ''}`}
                  >
                    <div className="line-header">
                      <span
                        className={`line-status ${isActive ? 'active' : ''} ${capture ? 'captured' : ''}`}
                      >
                        {capture
                          ? `✅ ${capture.time}s`
                          : isActive
                            ? 'CLIQUEZ ICI ➔'
                            : isNext
                              ? 'PROCHAINE LIGNE'
                              : `Ligne ${index + 1}`}
                      </span>
                    </div>

                    <div className="line-content">
                      <span
                        className={`line-text ${isActive ? 'active' : ''} ${isNext ? 'next' : ''} ${isPassed ? 'passed' : ''}`}
                      >
                        {line}
                      </span>

                      {isActive && (
                        <button onClick={handleCapture} className="sync-btn">
                          SYNC (Entrée)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer avec bouton LRC */}
      <div className="lyrics-footer">
        <div className="progress-info">
          Progression:{' '}
          <b>
            {captures.length} / {lyricsLines.length}
          </b>
        </div>
        {captures.length > 0 && (
          <div className="download-buttons">
            <button onClick={generateLRC} className="download-btn">
              Télécharger .LRC
            </button>
            {mediaInfo?.file && (
              <button
                onClick={downloadAll}
                className="download-btn download-all-btn"
              >
                Tout télécharger
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lyrics;
