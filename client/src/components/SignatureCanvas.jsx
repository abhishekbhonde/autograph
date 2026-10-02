import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { generateSignatureStrokes, drawSignatureToCanvas } from '../engine/penEngine';

const SignatureCanvas = forwardRef(function SignatureCanvas(
  {
    name = '',
    style = 'delafield',
    seed = 42,
    settings = {},
    autoPlay = true,
    height = 320,
    isLightMode = false,
    className = '',
    onProgress,
  },
  ref
) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const prefersReducedMotion = React.useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useImperativeHandle(ref, () => ({
    replay: () => startAnimation(),
    setProgressManual: (p) => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setProgress(p);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawSignatureToCanvas(ctx, signatureData, p, settings, isLightMode);
      }
    },
    getCanvas: () => canvasRef.current,
  }));

  const signatureData = React.useMemo(() => {
    return generateSignatureStrokes(name, style, seed, settings);
  }, [name, style, seed, settings]);

  const startAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (prefersReducedMotion) {
      setProgress(1.0);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawSignatureToCanvas(ctx, signatureData, 1.0, settings, isLightMode);
      }
      return;
    }

    // Motion speed options: calm (0.7x), balanced (1.0x), quick (1.4x)
    let speedMult = 1.0;
    if (settings.motionSpeed === 'calm') speedMult = 0.7;
    else if (settings.motionSpeed === 'quick') speedMult = 1.4;

    const duration = Math.max(700, 1600 / speedMult);
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const currentProgress = Math.min(1.0, elapsed / duration);

      // Easing curve (cubic out)
      const easedProgress = 1 - Math.pow(1 - currentProgress, 2.5);

      setProgress(easedProgress);
      if (onProgress) onProgress(easedProgress);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawSignatureToCanvas(ctx, signatureData, easedProgress, settings, isLightMode);
      }

      if (currentProgress < 1.0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : { width: 600 };
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
      drawSignatureToCanvas(ctx, signatureData, 1.0, settings, isLightMode);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [signatureData, autoPlay, height, isLightMode]);

  return (
    <div className={`relative w-full overflow-hidden flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full cursor-pointer touch-none"
        style={{ height: `${height}px` }}
        onClick={startAnimation}
        title="Click to replay animation"
        aria-label={`Signature for ${name || 'Sign here'}`}
      />
    </div>
  );
});

export default SignatureCanvas;
