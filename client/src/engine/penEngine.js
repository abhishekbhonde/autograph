/**
 * Generates signature data structure for text and style.
 */
export function generateSignatureStrokes(name, style = 'scripts', seed = 42, settings = {}) {
  const text = (name || 'your name').trim() || 'your name';
  const fontStyle = ['scripts', 'scriptc', 'timesi', 'futural', 'gothiceng'].includes(style) ? style : 'scripts';

  return {
    name: text,
    text,
    style: fontStyle,
    seed,
    settings,
    bounds: { width: 400, height: 160, minX: 0, minY: 0, maxX: 400, maxY: 160 },
  };
}

/**
 * Draws animated standard handwritten signature onto HTML5 Canvas.
 * progress is a float between 0.0 and 1.0.
 */
export function drawSignatureToCanvas(ctx, signatureData, progress, settings = {}) {
  if (!signatureData) return;

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);

  const nameText = (signatureData.text || signatureData.name || 'your name').trim() || 'your name';
  const style = signatureData.style || 'scripts';

  // Map font style to standard elegant handwriting font families
  let fontFamily = '"Great Vibes", "Alex Brush", cursive';
  if (style === 'scriptc') fontFamily = '"Dancing Script", "Great Vibes", cursive';
  else if (style === 'timesi') fontFamily = '"Alex Brush", "Dancing Script", cursive';
  else if (style === 'futural') fontFamily = '"Sacramento", "Great Vibes", cursive';
  else if (style === 'gothiceng') fontFamily = '"MonteCarlo", "Alex Brush", cursive';

  const inkColor = settings.ink || '#ffffff';

  // Calculate responsive font size based on text length and canvas dimensions
  const charCount = Math.max(nameText.length, 5);
  const targetFontSize = Math.min((width * 0.85) / (charCount * 0.52), height * 0.42);
  const fontSize = Math.max(24, Math.min(84, targetFontSize));

  ctx.save();
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textMetrics = ctx.measureText(nameText);
  const textWidth = Math.max(textMetrics.width, 80);

  const centerX = width / 2;
  const centerY = height / 2 - fontSize * 0.05;

  // Progressive left-to-right handwriting reveal mask
  const padding = 50;
  const startX = centerX - textWidth / 2 - padding;
  const totalRevealWidth = textWidth + padding * 2;
  const currentClipWidth = totalRevealWidth * progress;

  ctx.beginPath();
  ctx.rect(startX, 0, currentClipWidth, height);
  ctx.clip();

  // Draw smooth liquid ink signature with subtle depth glow
  ctx.shadowColor = inkColor;
  ctx.shadowBlur = 4;
  ctx.fillStyle = inkColor;
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = Math.max(1.2, fontSize * 0.022);

  ctx.fillText(nameText, centerX, centerY);
  ctx.strokeText(nameText, centerX, centerY);

  // Decorative Underline Swash
  if (settings.flo !== false && progress > 0.35) {
    const swashProgress = Math.min(1.0, (progress - 0.35) / 0.65);
    const swashY = centerY + fontSize * 0.42;
    const sX1 = centerX - textWidth * 0.48;
    const sX2 = centerX + textWidth * 0.48;
    const currentSX = sX1 + (sX2 - sX1) * swashProgress;

    ctx.beginPath();
    ctx.lineWidth = Math.max(1.5, fontSize * 0.024);
    ctx.moveTo(sX1, swashY);
    ctx.quadraticCurveTo(centerX, swashY + fontSize * 0.12, currentSX, swashY);
    ctx.stroke();
  }

  ctx.restore();

  // Glowing Pen Nib Effect at active leading edge
  if (progress > 0.02 && progress < 0.98) {
    const headX = startX + currentClipWidth;
    const headY = centerY + Math.sin(progress * Math.PI * 3) * (fontSize * 0.08);

    ctx.save();
    ctx.shadowColor = inkColor;
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX, headY, Math.max(3, fontSize * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
