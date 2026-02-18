import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

const Lyrics = ({ currentTime, captures, setCaptures, isCaptioning, setIsCaptioning, lyrics, setLyrics, onResetAll }) => {
  const { t } = useTranslation();
  const [isEditMode, setIsEditMode] = useState(true);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const scrollRef = useRef(null);

  const lyricsLines = useMemo(() => {
    return lyrics.split('\n').filter(line => line.trim() !== "");
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
      text: lineText
    };
    
    setCaptures(prev => [...prev, newCapture]);
    setCurrentLineIndex(prev => prev + 1);
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
      // Scroll to finish step when all lines are synced
      if (currentLineIndex >= lyricsLines.length && lyricsLines.length > 0) {
        const finishStep = scrollRef.current.querySelector('#finish-step');
        if (finishStep) {
          finishStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        const activeLine = scrollRef.current.querySelector(`#line-${currentLineIndex}`);
        if (activeLine) {
          activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentLineIndex, isEditMode, lyricsLines.length]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  return (
    <div className="lyrics-container">
      
      <div className="lyrics-header">
        <h2 className="lyrics-title">
          {isCaptioning ? t('lyrics.syncMode') : t('lyrics.viewMode')}
        </h2>
        <button 
           onClick={() => setIsCaptioning(!isCaptioning)}
           className={`lyrics-toggle-btn ${isCaptioning ? 'active' : ''} ${isCaptioning && !isEditMode && currentLineIndex >= lyricsLines.length && lyricsLines.length > 0 ? 'finish-ready' : ''}`}
        >
          {isCaptioning ? (currentLineIndex >= lyricsLines.length && lyricsLines.length > 0 ? ' ' + (t('lyrics.finish') || 'Terminer') : t('lyrics.finish')) : t('lyrics.resume')}
        </button>
      </div>
      
      {isCaptioning ? (
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
              <label className="edit-label">{t('lyrics.pasteLabel')}</label>
              <textarea
                value={lyrics}
                onChange={handleTextChange}
                placeholder={t('lyrics.placeholder')}
                className="edit-textarea"
              />
            </div>
          ) : (
            <div className="sync-mode-wrapper">
              <div 
                ref={scrollRef}
                className="sync-list-container"
              >
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
                        <span className={`line-status ${isActive ? 'active' : ''} ${capture ? 'captured' : ''}`}>
                           {capture ? ` ${capture.time}s` : (isActive ? t('lyrics.clickHere') : (isNext ? t('lyrics.nextLine') : `${t('lyrics.line')} ${index + 1}`))}
                        </span>
                      </div>
                      
                      <div className="line-content">
                        <span className={`line-text ${isActive ? 'active' : ''} ${isNext ? 'next' : ''} ${isPassed ? 'passed' : ''}`}>
                          {line}
                        </span>

                        {isActive && (
                           <button 
                             onClick={handleCapture}
                             className="sync-btn"
                           >
                             {t('lyrics.syncBtn')}
                           </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky Finish Button - always visible */}
              <div className="sticky-finish-bar">
                {currentLineIndex >= lyricsLines.length && lyricsLines.length > 0 ? (
                  <button 
                    onClick={() => setIsCaptioning(false)} 
                    className="finish-sync-btn sticky-finish-btn"
                  >
                     {t('lyrics.finish') || 'Terminer la synchronisation'}
                  </button>
                ) : (
                  <div className="sync-progress-bar">
                    <div className="sync-progress-bar-label">
                      {captures.length} / {lyricsLines.length} {t('lyrics.line') || 'lignes'} synchronisées
                    </div>
                    <div className="sync-progress-track">
                      <div 
                        className="sync-progress-fill"
                        style={{ width: lyricsLines.length > 0 ? `${(captures.length / lyricsLines.length) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results / View Mode */
        <div className="results-container">
          {captures.length > 0 ? (
            <div className="captures-list">
              {captures.map((cap, idx) => (
                <div key={idx} className="capture-item">
                  <span className="cap-time">{cap.time}s</span>
                  <span className="cap-text">{cap.text}</span>
                </div>
              ))}
            </div>
          ) : (
             <div className="no-captures">
                <p>{t('lyrics.noCaptures') || 'Aucune parole synchronisée pour le moment.'}</p>
                <button onClick={() => setIsCaptioning(true)} className="start-sync-btn">
                   {t('lyrics.resume')}
                </button>
             </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="lyrics-footer">
        <div className="progress-info">
          {t('lyrics.progress')} <b>{captures.length} / {lyricsLines.length}</b>
        </div>
        <button onClick={onResetAll} className="reset-all-btn">
           {t('lyrics.resetAll') || 'Tout réinitialiser'}
        </button>
      </div>
    </div>
  );
};

export default Lyrics;