import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import "./index.css";
import { generateAudioBackground, isAudioFile } from "../../utils/visualizer";

const Media = ({ onTimeUpdate, currentTime, captures = [], isCaptioning, mediaUrl, setMediaUrl, mediaType, setMediaType }) => {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef(null);
  const prevIsCaptioningRef = useRef(isCaptioning);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [nextLyricIndex, setNextLyricIndex] = useState(-1);
  const [duration, setDuration] = useState(0);
  const [audioBackground, setAudioBackground] = useState(null);
  const visualChangeInterval = useRef(null);

  // Gestion du plein écran
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Entrer en plein écran
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      // Sortir du plein écran
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Écouter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Gestion des fichiers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setMediaUrl(objectUrl);
      
      // Déterminer le type de média
      if (file.type.startsWith('audio/')) {
        setMediaType('audio');
      } else {
        setMediaType('video');
      }
    }
  };


  // Gestion de la lecture
  const togglePlay = () => {
    const mediaElement = mediaType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaElement) {
      if (mediaElement.paused) {
        mediaElement.play().catch(err => console.error(err));
        setIsPlaying(true);
      } else {
        mediaElement.pause();
        setIsPlaying(false);
      }
    }
  };

  // Saut dans le temps
  const handleSeek = (amount) => {
    const mediaElement = mediaType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaElement) {
      mediaElement.currentTime = Math.max(0, Math.min(mediaElement.duration || Infinity, mediaElement.currentTime + amount));
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Capture du temps au moment précis
  const handleTimeUpdate = (e) => {
    setIsPlaying(!e.target.paused);
    setDuration(e.target.duration || 0);
    if (onTimeUpdate) {
      onTimeUpdate(e.target.currentTime);
    }
  };

  const handleProgressBarChange = (e) => {
    const newTime = parseFloat(e.target.value);
    const mediaElement = mediaType === 'audio' ? audioRef.current : videoRef.current;
    if (mediaElement) {
      mediaElement.currentTime = newTime;
    }
  };

  // Effet visuel pour les fichiers audio
  useEffect(() => {
    if (mediaType === 'audio' && mediaUrl) {
      // Générer le premier fond
      setAudioBackground(generateAudioBackground('wave', 0.6));
      
      // Changer le fond toutes les 5 secondes
      visualChangeInterval.current = setInterval(() => {
        const types = ['wave', 'spectrum', 'pulse'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setAudioBackground(generateAudioBackground(randomType, 0.6));
      }, 5000);
      
      return () => {
        if (visualChangeInterval.current) {
          clearInterval(visualChangeInterval.current);
        }
      };
    } else {
      setAudioBackground(null);
      if (visualChangeInterval.current) {
        clearInterval(visualChangeInterval.current);
      }
    }
  }, [mediaType, mediaUrl]);

  useEffect(() => {
    if (prevIsCaptioningRef.current === true && isCaptioning === false) {
      const mediaElement = mediaType === 'audio' ? audioRef.current : videoRef.current;
      if (mediaElement) {
        mediaElement.currentTime = 0;
        mediaElement.play().catch(err => console.error(err));
        setCurrentLyricIndex(-1);
        setNextLyricIndex(-1);
      }
    }
    prevIsCaptioningRef.current = isCaptioning;
  }, [isCaptioning, mediaType]);

  // Effet pour mettre à jour les index des paroles
  useEffect(() => {
    if (captures.length > 0) {
      // Trouver l'index de la parole courante
      let currentIdx = -1;
      for (let i = 0; i < captures.length; i++) {
        if (parseFloat(captures[i].time) <= currentTime) {
          currentIdx = i;
        } else {
          break;
        }
      }
      
      // Trouver l'index de la prochaine parole
      let nextIdx = -1;
      if (currentIdx >= 0 && currentIdx + 1 < captures.length) {
        nextIdx = currentIdx + 1;
      }
      
      setCurrentLyricIndex(currentIdx);
      setNextLyricIndex(nextIdx);
    }
  }, [currentTime, captures]);

  // Calculer la progression entre deux paroles (pour l'effet de coloration progressive)
  const getProgress = () => {
    if (currentLyricIndex >= 0 && nextLyricIndex >= 0) {
      const currentTimeNum = currentTime;
      const currentCaptureTime = parseFloat(captures[currentLyricIndex].time);
      const nextCaptureTime = parseFloat(captures[nextLyricIndex].time);
      
      if (nextCaptureTime > currentCaptureTime) {
        // Progression de 0 à 1 entre les deux paroles
        return Math.min(1, Math.max(0, 
          (currentTimeNum - currentCaptureTime) / (nextCaptureTime - currentCaptureTime)
        ));
      }
    }
    return 0;
  };

  const progress = getProgress();

  // Calculer la taille de police dynamique selon la longueur du texte
  const calculateFontSize = (text) => {
    if (!text) return '2.5rem';
    const length = text.length;
    if (length <= 30) return 'clamp(1.75rem, 4vw, 2.5rem)';
    if (length <= 50) return 'clamp(1.5rem, 3.5vw, 2rem)';
    if (length <= 70) return 'clamp(1.25rem, 3vw, 1.75rem)';
    return 'clamp(1rem, 2.5vw, 1.5rem)';
  };

  const currentText = captures[currentLyricIndex]?.text || '';
  const nextText = captures[nextLyricIndex]?.text || '';

  return (
    <div 
      ref={containerRef}
      className={`media-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {/* Configuration Sources - Masquer en plein écran */}
      {!isFullscreen && (
        <div className="source-section">
          <div className="file-controls">
            <input 
              type="file" 
              accept="video/*, audio/*" 
              onChange={handleFileChange}
              className="file-input"
            />
          </div>
        </div>
      )}

      <div className="display-media">
        {mediaUrl ? (
          <div className="player-outer-container" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Bouton plein écran */}
            {mediaType === 'video' && (
              <button 
                className="fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? t('media.exitFullscreen') : t('media.fullscreen')}
              >
                {isFullscreen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            )}

            {mediaType === 'video' ? (
              <video 
                key={mediaUrl} 
                src={mediaUrl}
                ref={videoRef}
                onClick={togglePlay}
                autoPlay
                className="video-player"
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'black'
                }}
              />
            ) : (
              <div className="audio-container" onClick={togglePlay}>
                {audioBackground && (
                  <img 
                    src={audioBackground} 
                    alt="Audio visualization" 
                    className="audio-background"
                  />
                )}
                <audio 
                  key={mediaUrl} 
                  src={mediaUrl}
                  ref={audioRef}
                  autoPlay
                  className="audio-player-hidden"
                  onTimeUpdate={handleTimeUpdate}
                  style={{ display: 'none' }}
                />
              </div>
            )}
            
            {/* Custom Control Bar Overlay */}
            <div className="player-controls-overlay">
              {/* Progress Bar / Scrubber */}
              <div className="player-progress-container" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleProgressBarChange}
                  className="player-progress-bar"
                />
              </div>

              <div className="player-controls-bar">
                <button onClick={(e) => {e.stopPropagation(); handleSeek(-5);}} className="player-btn" title="-5s">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                  </svg>
                </button>
                
                <button onClick={(e) => {e.stopPropagation(); togglePlay();}} className="player-btn play-pause-btn" title={isPlaying ? "Pause" : "Play"}>
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                <button onClick={(e) => {e.stopPropagation(); handleSeek(5);}} className="player-btn" title="+5s">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                  </svg>
                </button>

                <div className="player-time-display">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
            
            {/* Overlay des Paroles en mode Karaoké */}
            {!isCaptioning && captures.length > 0 && currentLyricIndex >= 0 && (
              <div className="lyrics-overlay">
                {/* Parole courante avec coloration jaune progressive */}
                <div className="current-lyric-container">
                  <div 
                    className="current-lyric"
                    style={{ 
                      '--progress': `${progress * 100}%`,
                      fontSize: calculateFontSize(currentText)
                    }}
                  >
                    {currentText}
                  </div>
                </div>
                
                {/* Prochaine parole */}
                {nextLyricIndex >= 0 && (
                  <div 
                    className="next-lyric"
                    style={{
                      fontSize: calculateFontSize(nextText)
                    }}
                  >
                    {nextText}
                  </div>
                )}
              </div>
            )}

            {/* Message quand aucune parole n'est encore disponible */}
            {!isCaptioning && captures.length > 0 && currentLyricIndex === -1 && (
              <div className="waiting-message">
                {t('media.firstLyric')}
              </div>
            )}
          </div>
        ) : (
          <div className="media-placeholder">
            {t('media.waitingMedia')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;