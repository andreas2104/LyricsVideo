import { useCallback, useRef, useState } from 'react';

export const useVideoRecorder = (videoRef, audioRef) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const mediaRecorderRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const destNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const updateTimeFrameRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const mediaElementRef = useRef(null);
  const capturesRef = useRef([]);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  const initCanvas = useCallback((width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvasRef.current = canvas;
    return canvas;
  }, []);

  const calculateFontSize = (text, width) => {
    if (!text) return 40;
    const length = text.length;
    if (length <= 30) return Math.min(60, width / 20);
    if (length <= 50) return Math.min(45, width / 25);
    return Math.min(32, width / 30);
  };

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 1. Draw Background (Video or Image/Color)
    if (video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, width, height);
    } else {
      // Dark gradient for audio or empty video
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a1b');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Subtle decoration for audio
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 50 * (i + 1), 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    const captures = capturesRef.current;
    const currentTime = currentTimeRef.current;

    // 2. Draw Lyrics Overlay
    if (captures.length > 0) {
      let currentIdx = -1;
      for (let i = 0; i < captures.length; i++) {
        if (parseFloat(captures[i].time) <= currentTime) {
          currentIdx = i;
        } else {
          break;
        }
      }

      if (currentIdx >= 0) {
        const currentText = captures[currentIdx].text;
        const nextIdx = currentIdx + 1;
        const nextText =
          nextIdx < captures.length ? captures[nextIdx].text : '';

        // Dynamic font size
        const fontSize = calculateFontSize(currentText, width);

        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        const rectHeight = fontSize * 3.5;
        ctx.fillRect(0, height - rectHeight, width, rectHeight);

        // Gradient for current lyric
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Progress Calculation for coloration
        let progress = 0;
        if (nextIdx < captures.length) {
          const t1 = parseFloat(captures[currentIdx].time);
          const t2 = parseFloat(captures[nextIdx].time);
          progress = Math.min(1, Math.max(0, (currentTime - t1) / (t2 - t1)));
        }

        // Draw Shadows
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw Next Lyric (Small/Gray)
        if (nextText) {
          ctx.font = `${fontSize * 0.6}px "Segoe UI", Roboto, sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillText(nextText, width / 2, height - rectHeight / 4);
        }

        // Draw Current Lyric (Big/Gradient)
        ctx.font = `bold ${fontSize}px "Segoe UI", Roboto, sans-serif`;

        // Text Coloration logic
        if (progress > 0) {
          const textWidth = ctx.measureText(currentText).width;
          const startX = (width - textWidth) / 2;

          const textGradient = ctx.createLinearGradient(
            startX,
            0,
            startX + textWidth,
            0,
          );
          textGradient.addColorStop(0, '#FFD700'); // Gold
          textGradient.addColorStop(progress, '#FFD700');
          textGradient.addColorStop(progress, '#FFFFFF'); // White
          textGradient.addColorStop(1, '#FFFFFF');

          ctx.fillStyle = textGradient;
        } else {
          ctx.fillStyle = '#FFFFFF';
        }

        ctx.fillText(currentText, width / 2, height - rectHeight / 1.6);

        // Reset shadows
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }, [videoRef, audioRef]);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false);
        setRecordingProgress(0);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm;codecs=vp9',
        });
        
        // Final State Cleanup
        setIsRecording(false);
        setRecordingProgress(0);
        resolve(blob);
      };

      recorder.stop();

      // Stop Visual Updates
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (updateTimeFrameRef.current) {
        cancelAnimationFrame(updateTimeFrameRef.current);
      }

      // Cleanup tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Cleanup AudioContext
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== 'closed'
      ) {
        audioContextRef.current.close().catch(console.error);
      }
    });
  }, []);

  const captureFrame = useCallback(() => {
    drawFrame();
    if (currentTimeRef.current < durationRef.current) {
      animationFrameRef.current = requestAnimationFrame(captureFrame);
    }
  }, [drawFrame]);

  const startRecording = useCallback(
    (capturesData, duration) => {
      return new Promise((resolve, reject) => {
        try {
          const video = videoRef.current;
          const mediaElement = video || audioRef.current;

          if (!mediaElement) {
            reject(new Error('No media element available'));
            return;
          }

          capturesRef.current = capturesData;
          durationRef.current = duration;
          currentTimeRef.current = 0;
          recordedChunksRef.current = [];

          const width = video ? video.videoWidth || 1280 : 1280;
          const height = video ? video.videoHeight || 720 : 720;

          initCanvas(width, height);
          mediaElementRef.current = mediaElement;

          // Prepare Stream
          const canvasStream = canvasRef.current.captureStream(30);
          const videoTrack = canvasStream.getVideoTracks()[0];

          // Prepare Audio
          const audioContext = new (
            window.AudioContext || window.webkitAudioContext
          )();
          audioContextRef.current = audioContext;

          // Note: createMediaElementSource can throw if already attached
          const source = audioContext.createMediaElementSource(mediaElement);
          const destNode = audioContext.createMediaStreamDestination();
          destNodeRef.current = destNode;

          source.connect(destNode);
          source.connect(audioContext.destination);

          const audioTrack = destNode.stream.getAudioTracks()[0];

          const combinedStream = new MediaStream([
            videoTrack,
            ...(audioTrack ? [audioTrack] : []),
          ]);

          streamRef.current = combinedStream;

          const options = { mimeType: 'video/webm;codecs=vp9' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
          }

          const mediaRecorder = new MediaRecorder(combinedStream, options);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          // Handle Automatic Completion
          const handleEnded = async () => {
            mediaElement.removeEventListener('ended', handleEnded);
            const blob = await stopRecording();
            resolve(blob);
          };
          mediaElement.addEventListener('ended', handleEnded);

          mediaRecorder.start(200);
          setIsRecording(true);

          const updateProgress = () => {
            if (mediaElementRef.current) {
              currentTimeRef.current = mediaElementRef.current.currentTime;
              setRecordingProgress(
                (currentTimeRef.current / durationRef.current) * 100,
              );
            }
            if (currentTimeRef.current < durationRef.current) {
              updateTimeFrameRef.current = requestAnimationFrame(updateProgress);
            }
          };

          updateTimeFrameRef.current = requestAnimationFrame(updateProgress);
          animationFrameRef.current = requestAnimationFrame(captureFrame);
        } catch (error) {
          reject(error);
        }
      });
    },
    [videoRef, audioRef, initCanvas, captureFrame, stopRecording],
  );

  const downloadVideo = useCallback((blob, filename = 'lyrics-video.webm') => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return {
    isRecording,
    recordingProgress,
    startRecording,
    stopRecording,
    downloadVideo,
  };
};

export default useVideoRecorder;
