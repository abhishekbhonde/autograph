export const FONT_TILES = [
  { id: 'brittany', label: 'Brittany Signature', font: '"Great Vibes", cursive' },
  { id: 'signatura', label: 'Signatura Monoline', font: '"Sacramento", cursive' },
  { id: 'delafield', label: 'Mrs Saint Delafield', font: '"Mrs Saint Delafield", cursive' },
  { id: 'allura', label: 'Allura', font: '"Allura", cursive' },
  { id: 'greatvibes', label: 'Great Vibes', font: '"Great Vibes", cursive' },
  { id: 'sacramento', label: 'Sacramento', font: '"Sacramento", cursive' },
  { id: 'parisienne', label: 'Parisienne', font: '"Parisienne", cursive' },
];

export const INK_SWATCHES = [
  { id: 'white', hex: '#FFFFFF', label: 'Pure White' },
  { id: 'lightgray', hex: '#D4D4D4', label: 'Light Gray' },
  { id: 'midgray', hex: '#888888', label: 'Mid Gray' },
];

export function generateSignatureStrokes(name, style = 'brittany', seed = 42, settings = {}) {
  const text = (name || '').trim() || 'your name';
  return {
    name: text,
    text,
    style,
    seed,
    settings,
  };
}

/**
 * Draws animated handwriting stroke onto HTML5 Canvas.
 * progress is a float between 0.0 and 1.0.
 */
export function drawSignatureToCanvas(ctx, signatureData, progress, settings = {}) {
  if (!signatureData) return;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // Pure dark background (#1A1A1A preview stage or #111111 card surface or transparent)
  const bgMode = settings.bg || 'dark';
  if (bgMode === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else if (bgMode === 'card') {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, width, height);
  }

  const nameText = (signatureData.text || signatureData.name || 'your name').trim();
  const styleId = signatureData.style || 'brittany';

  const fontObj = FONT_TILES.find((f) => f.id === styleId) || FONT_TILES[0];
  const fontFamily = fontObj.font;

  const inkColor = settings.ink || '#FFFFFF';
  const penThickness = settings.pen || 1.8;

  // Auto-calculate font size dynamically
  const charCount = Math.max(nameText.length, 5);
  const targetFontSize = Math.min((width * 0.82) / (charCount * 0.46), height * 0.48);
  const fontSize = Math.max(26, Math.min(88, targetFontSize));

  ctx.save();

  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textMetrics = ctx.measureText(nameText);
  const textWidth = Math.max(textMetrics.width, 80);

  const centerX = width / 2;
  const centerY = height / 2;

  // Progressive reveal mask along X axis in stroke order
  const padding = 60;
  const startX = centerX - textWidth / 2 - padding;
  const totalRevealWidth = textWidth + padding * 2;
  const currentClipWidth = totalRevealWidth * progress;

  ctx.beginPath();
  ctx.rect(startX, 0, currentClipWidth, height);
  ctx.clip();

  // Clean, crisp single-stroke handwriting in white/gray
  ctx.fillStyle = inkColor;
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = Math.max(1, penThickness * (fontSize / 45));

  ctx.fillText(nameText, centerX, centerY);
  ctx.strokeText(nameText, centerX, centerY);

  ctx.restore();
}
