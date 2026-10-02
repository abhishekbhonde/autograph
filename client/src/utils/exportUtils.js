import { generateSignatureStrokes } from '../engine/penEngine';

export function downloadSVG(name, style, seed, settings) {
  const signatureData = generateSignatureStrokes(name, style, seed, settings);
  const { strokes, bounds } = signatureData;
  const ink = settings.ink || '#8b5cf6';
  const strokeWidth = settings.pen || 1.5;

  let pathData = '';
  strokes.forEach((stroke) => {
    if (stroke.length < 2) return;
    pathData += `M ${stroke[0].x.toFixed(2)} ${stroke[0].y.toFixed(2)} `;
    for (let i = 1; i < stroke.length; i++) {
      pathData += `L ${stroke[i].x.toFixed(2)} ${stroke[i].y.toFixed(2)} `;
    }
  });

  const width = Math.ceil(bounds.width);
  const height = Math.ceil(bounds.height);
  const viewBox = `${bounds.minX.toFixed(2)} ${bounds.minY.toFixed(2)} ${width} ${height}`;

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">
  <style>
    .signature-path {
      stroke: ${ink};
      stroke-width: ${strokeWidth};
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
  </style>
  <path class="signature-path" d="${pathData.trim()}" />
</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = (name || 'signature').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.href = url;
  link.download = `${sanitizedName}_autograph.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadPNG(canvasElement, name = 'signature') {
  if (!canvasElement) return;

  const link = document.createElement('a');
  const sanitizedName = (name || 'signature').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${sanitizedName}_autograph.png`;
  link.href = canvasElement.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
