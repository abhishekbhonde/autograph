import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { generateSignatureStrokes, drawSignatureToCanvas } from '../engine/penEngine';

const SignatureCanvas = forwardRef(function SignatureCanvas(
  {
    name = '',
    style = 'scripts',
    seed = 42,
    settings = {},
    autoPlay = true,
    height = 280,
    className = '',
    onProgress,
  },
  ref
) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // Expose replay method to parent ref
  useImperativeHandle(ref, () => ({
    replay: () => startAnimation(),
    getCanvas: () => canvasRef.current,
  }));

  const signatureData = React.useMemo(() => {
    return generateSignatureStrokes(name, style, seed, settings);
  }, [name, style, seed, settings]);

  const startAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const speedFactor = settings.sp ?? 1.0;
    const duration = Math.max(800, 1800 / speedFactor);
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const currentProgress = Math.min(1.0, elapsed / duration);

      // Easing function for natural fluid handwriting speed (cubic out)
      const easedProgress = 1 - Math.pow(1 - currentProgress, 2.5);

      setProgress(easedProgress);
      if (onProgress) onProgress(easedProgress);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawSignatureToCanvas(ctx, signatureData, easedProgress, settings);
      }

      if (currentProgress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Resize canvas buffer crisp for Retina displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor((rect.width || 600) * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = '100%';
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');

    if (autoPlay) {
      startAnimation();
    } else {
      setProgress(1.0);
      drawSignatureToCanvas(ctx, signatureData, 1.0, settings);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [signatureData, autoPlay, height]);

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full cursor-pointer touch-none"
        style={{ height: `${height}px` }}
        onClick={startAnimation}
        title="Click to replay signature animation"
      />
    </div>
  );
});

export default SignatureCanvas;
