import React, { useRef } from 'react';
import { ArrowRight, Sparkles, Layers, Video, ShieldCheck } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

export default function HeroBanner({ onOpenStudio, onBrowseWall }) {
  const canvasRef = useRef(null);

  return (
    <section className="pt-20 pb-16 px-6 max-w-[1120px] mx-auto text-left font-ui">
      <div className="space-y-8 max-w-[720px]">
        {/* Top Product Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--line)] bg-[#111111] text-[11px] font-mono-label text-[var(--text-dim)] select-none">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>ANIMATED HANDWRITING ENGINE</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-medium text-white tracking-tight leading-[1.1]">
            It's a whole new <span className="font-script text-white text-5xl sm:text-7xl block sm:inline">signature.</span>
          </h1>

          {/* Self-Writing Script Preview Banner */}
          <div className="h-[80px] w-full flex items-center pt-2">
            <SignatureCanvas
              ref={canvasRef}
              name="scribble & co."
              style="delafield"
              seed={1}
              settings={{ ink: '#FFFFFF', bg: 'transparent', pen: 1.5 }}
              autoPlay={true}
              height={80}
            />
          </div>

          {/* Subtitle Body Copy */}
          <p className="text-base sm:text-lg text-[var(--text-dim)] font-ui max-w-[620px] leading-relaxed pt-1">
            Create your own stroke-by-stroke animated signature in seconds. Preview in real time, export crisp PNG, SVG, or 60fps WebM video, and publish to the showcase.
          </p>
        </div>

        {/* Dual Actions */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onOpenStudio}
            className="btn-primary px-6 py-3 text-sm font-medium flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-all"
          >
            <span>Create your signature</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>

          <button
            onClick={onBrowseWall}
            className="btn-secondary px-5 py-3 text-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <span>Explore showcase</span>
          </button>
        </div>

        {/* Product Feature Highlights Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-[var(--line)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono-label text-white">
              <Layers className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              <span>01 / VECTOR PATHS</span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Resolution-independent SVG vector path exports.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono-label text-white">
              <Video className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              <span>02 / 60FPS VIDEO</span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Record high frame-rate WebM animation clips.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono-label text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              <span>03 / PERMALINKS</span>
            </div>
            <p className="text-xs text-[var(--text-dim)]">
              Shareable permalinks for every signature.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
