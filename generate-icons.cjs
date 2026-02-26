const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#007bff';
  ctx.fillRect(0, 0, size, size);
  
  // Music note / lyrics symbol
  ctx.fillStyle = '#ffffff';
  const scale = size / 100;
  
  // Draw simple "L" for Lyrics
  ctx.font = `bold ${60 * scale}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('L', size/2, size/2);
  
  return canvas.toBuffer('image/png');
}

fs.writeFileSync('public/pwa-192x192.png', createIcon(192));
fs.writeFileSync('public/pwa-512x512.png', createIcon(512));
console.log('Icons created!');
