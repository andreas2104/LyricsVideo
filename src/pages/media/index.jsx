import React, { useEffect, useRef, useState } from 'react';
import './index.css';
import { useVideoRecorder } from '../../hooks/useVideoRecorder';
import { generateAudioBackground, isAudioFile } from '../../utils/visualizer';

const Media = ({
  onTimeUpdate,
  currentTime,
  captures = [],
  isCaptioning,
  mediaInfo,
  onVideoRecorded,
  onMediaLoaded,
}) => {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [nextLyricIndex, setNextLyricIndex] = useState(-1);
  const [isExporting, setIsExporting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('video');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioBackground, setAudioBackground] = useState(null);

  const visualChangeInterval = useRef(null);
  const containerRef = useRef(null);
  const urlInputRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const prevIsCaptioningRef = useRef(isCaptioning);

  const {
    isRecording,
    recordingProgress,
    startRecording,
    stopRecording,
    downloadVideo,
  } = useVideoRecorder(videoRef, audioRef);

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
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
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

      // Passer les infos du média au parent
      if (onMediaLoaded) {
        onMediaLoaded({
          url: objectUrl,
          type: file.type.startsWith('audio/') ? 'audio' : 'video',
          filename: file.name,
          file: file,
        });
      }
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    const url = urlInputRef.current.value.trim();
    if (url) {
      setMediaUrl(url);
      // Déterminer le type basé sur l'extension
      if (isAudioFile(url)) {
        setMediaType('audio');
      } else {
        setMediaType('video');
      }

      // Passer les infos du média au parent (sans fichier pour les URLs)
      if (onMediaLoaded) {
        const filename = url.split('/').pop().split('?')[0] || 'media';
        onMediaLoaded({
          url: url,
          type: isAudioFile(url) ? 'audio' : 'video',
          filename: filename,
          file: null,
        });
      }
    }
  };

  // Capture du temps au moment précis
  const handleTimeUpdate = (e) => {
    if (onTimeUpdate) {
      onTimeUpdate(e.target.currentTime);
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
      const mediaElement =
        mediaType === 'audio' ? audioRef.current : videoRef.current;
      if (mediaElement) {
        mediaElement.currentTime = 0;
        mediaElement.play().catch((err) => console.error(err));
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
        return Math.min(
          1,
          Math.max(
            0,
            (currentTimeNum - currentCaptureTime) /
              (nextCaptureTime - currentCaptureTime),
          ),
        );
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

  const handleExportVideo = async () => {
    if (!mediaUrl || captures.length === 0) return;

    const mediaElement =
      mediaType === 'video' ? videoRef.current : audioRef.current;
    if (!mediaElement) return;

    setIsExporting(true);
    setIsFinalizing(false);
    try {
      const duration = mediaElement.duration || 0;

      // Start preparation
      mediaElement.currentTime = 0;

      // We must wait for the media to be ready to play at 0
      await new Promise((r) => {
        const onSeeked = () => {
          mediaElement.removeEventListener('seeked', onSeeked);
          r();
        };
        mediaElement.addEventListener('seeked', onSeeked);
      });

      await mediaElement.play();

      // startRecording now handles the 'ended' event and resolves with the blob
      const blob = await startRecording(captures, duration);

      if (blob) {
        setIsFinalizing(true);
        const baseName = mediaInfo?.filename
          ? mediaInfo.filename.replace(/\.[^/.]+$/, '')
          : 'lyrics-video';
        const filename = `${baseName}-${Date.now()}.webm`;

        // Finalize and download
        await new Promise((r) => setTimeout(r, 1000)); // Small buffer for user to see 100%
        downloadVideo(blob, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(
        "Échec de l'exportation de la vidéo. Assurez-vous que l'onglet reste actif.",
      );
    } finally {
      setIsExporting(false);
      setIsFinalizing(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`media-container ${isFullscreen ? 'fullscreen-mode' : ''}`}
    >
      {/* Configuration Sources - Masquer en plein écran */}
      {!isFullscreen && (
        <div className="source-section">
          <input
            type="file"
            accept="video/*, audio/*"
            onChange={handleFileChange}
            className="file-input"
          />
          <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              ref={urlInputRef}
              placeholder="URL du média..."
              className="url-input"
            />
            <button type="submit" className="submit-btn">
              Play
            </button>
          </form>
        </div>
      )}

      <div className="display-media">
        {mediaUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Bouton plein écran */}
            {mediaType === 'video' && (
              <button
                type="button"
                className="fullscreen-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
              >
                {isFullscreen ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
            )}

            {/* Bouton Export Vidéo */}
            {!isCaptioning && captures.length > 0 && (
              <button
                type="button"
                className="export-btn"
                onClick={handleExportVideo}
                disabled={isExporting}
                title="Exporter la vidéo avec les paroles"
              >
                {isExporting ? (
                  <>
                    <span className="export-spinner" />
                    {isFinalizing
                      ? 'Finalisation...'
                      : `Export ${Math.round(recordingProgress)}%`}
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Exporter
                  </>
                )}
              </button>
            )}

            {mediaType === 'video' ? (
              <video
                key={mediaUrl}
                src={mediaUrl}
                ref={videoRef}
                controls
                autoPlay
                className="video-player"
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: '100%',
                  height: isFullscreen ? '100vh' : 'auto',
                  maxHeight: isFullscreen ? '100vh' : '600px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <div className="audio-container">
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
                  controls
                  autoPlay
                  className="audio-player"
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            )}

            {/* Overlay des Paroles en mode Karaoké */}
            {!isCaptioning && captures.length > 0 && currentLyricIndex >= 0 && (
              <div className="lyrics-overlay">
                {/* Parole courante avec coloration jaune progressive */}
                <div className="current-lyric-container">
                  <div
                    className="current-lyric"
                    style={{
                      '--progress': `${progress * 100}%`,
                      fontSize: calculateFontSize(currentText),
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
                      fontSize: calculateFontSize(nextText),
                    }}
                  >
                    {nextText}
                  </div>
                )}
              </div>
            )}

            {/* Message quand aucune parole n'est encore disponible */}
            {!isCaptioning &&
              captures.length > 0 &&
              currentLyricIndex === -1 && (
                <div className="waiting-message">
                  Première parole à venir...
                </div>
              )}
          </div>
        ) : (
          <div className="media-placeholder">Attente du média...</div>
        )}
      </div>
    </div>
  );
};

export default Media;
