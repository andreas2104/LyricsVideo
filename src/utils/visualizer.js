// Utilitaires pour les effets visuels audio

/**
 * Crée un canvas avec un effet de vague sonore (sound wave)
 * @param {number} width - Largeur du canvas
 * @param {number} height - Hauteur du canvas
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @returns {string} Data URL de l'image générée
 */
export const generateSoundWave = (
  width = 800,
  height = 400,
  intensity = 0.5,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fond dégradé gris
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f5f5f5');
  gradient.addColorStop(1, '#e5e5e5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Dessiner des vagues sonores
  const waveCount = 8;
  const baseAmplitude = height * 0.15;

  ctx.strokeStyle = '#a3a3a3';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;

  for (let w = 0; w < waveCount; w++) {
    const amplitude = baseAmplitude * (1 + Math.sin(w) * 0.3) * intensity;
    const frequency = 0.02 + w * 0.005;
    const phase = w * 0.5;

    ctx.beginPath();
    for (let x = 0; x < width; x += 5) {
      const y =
        height / 2 +
        Math.sin(x * frequency + phase) * amplitude +
        Math.cos(x * frequency * 2) * amplitude * 0.3;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Ajouter des points pour l'effet de particules
  ctx.fillStyle = '#737373';
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = height / 2 + (Math.random() - 0.5) * height * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
};

/**
 * Crée un effet de spectre audio (barres)
 * @param {number} width - Largeur du canvas
 * @param {number} height - Hauteur du canvas
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @returns {string} Data URL de l'image générée
 */
export const generateSpectrum = (
  width = 800,
  height = 400,
  intensity = 0.5,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Fond noir/gris foncé
  ctx.fillStyle = '#262626';
  ctx.fillRect(0, 0, width, height);

  const barCount = 30;
  const barWidth = width / (barCount * 1.5);
  const spacing = barWidth * 0.5;

  for (let i = 0; i < barCount; i++) {
    // Hauteur aléatoire mais influencée par l'intensité
    const barHeight = (Math.random() * 0.8 + 0.2) * height * intensity;
    const x = i * (barWidth + spacing) + spacing;
    const y = height - barHeight;

    // Dégradé du plus clair au plus foncé
    const gradient = ctx.createLinearGradient(0, y, 0, height);
    const grayValue = Math.floor(200 - (i / barCount) * 150);
    gradient.addColorStop(0, `rgb(${grayValue}, ${grayValue}, ${grayValue})`);
    gradient.addColorStop(1, `rgb(64, 64, 64)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Ajouter un reflet
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x + 2, y + 2, barWidth - 4, 4);
  }

  return canvas.toDataURL('image/png');
};

/**
 * Crée un effet de cercle concentrique (pulsation)
 * @param {number} width - Largeur du canvas
 * @param {number} height - Hauteur du canvas
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @returns {string} Data URL de l'image générée
 */
export const generatePulseCircle = (
  width = 800,
  height = 400,
  intensity = 0.5,
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.4;

  // Fond dégradé radial
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    maxRadius * 2,
  );
  gradient.addColorStop(0, '#404040');
  gradient.addColorStop(0.5, '#262626');
  gradient.addColorStop(1, '#171717');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Cercles concentriques
  for (let i = 0; i < 10; i++) {
    const radius = maxRadius * (i / 10) * (0.8 + intensity * 0.4);
    const alpha = 0.1 + (i / 10) * 0.2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2 + i * 0.5;
    ctx.stroke();
  }

  // Points lumineux
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const distance = maxRadius * (0.8 + Math.sin(angle * 3) * 0.2);
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;

    ctx.beginPath();
    ctx.arc(x, y, 3 + Math.sin(angle * 5) * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toDataURL('image/png');
};

/**
 * Détecte si un fichier est un audio
 * @param {string} url - URL ou nom du fichier
 * @returns {boolean} True si c'est un fichier audio
 */
export const isAudioFile = (url) => {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
  const extension = url?.split('.').pop()?.toLowerCase();
  return audioExtensions.includes(extension);
};

/**
 * Génère une image de fond aléatoire pour l'audio
 * @param {string} type - Type d'effet ('wave', 'spectrum', 'pulse')
 * @param {number} intensity - Intensité de l'effet (0-1)
 * @returns {string} Data URL de l'image générée
 */
export const generateAudioBackground = (type = 'random', intensity = 0.5) => {
  const types = ['wave', 'spectrum', 'pulse'];
  let selectedType = type;

  if (type === 'random') {
    selectedType = types[Math.floor(Math.random() * types.length)];
  }

  switch (selectedType) {
    case 'wave':
      return generateSoundWave(800, 400, intensity);
    case 'spectrum':
      return generateSpectrum(800, 400, intensity);
    case 'pulse':
      return generatePulseCircle(800, 400, intensity);
    default:
      return generateSoundWave(800, 400, intensity);
  }
};
