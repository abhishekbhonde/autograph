import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

const HERO_SAMPLES = [
  { name: 'Sign it. Share it.', style: 'delafield' },
  { name: 'Arthur Pendelton', style: 'signatura' },
  { name: 'Genevieve Dupré', style: 'brittany' },
];

export default function HeroBanner({ onOpenStudio }) {
  const canvasRef = useRef(null);
  const [sampleIndex, setSampleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSampleIndex((prev) => (prev + 1) % HERO_SAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const currentSample = HERO_SAMPLES[sampleIndex];

  return (
    <section className="pt-8 pb-4 px-6 max-w-[1120px] mx-auto font-ui text-left">
      <div className="mono-card p-6 sm:p-8 bg-[#111111] border border-[var(--line)] rounded-[22px] flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Column: Title, Subtitle & Action */}
        <div className="space-y-4 max-w-[540px]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--line)] bg-[#1A1A1A] text-[11px] font-mono-label text-[var(--text-dim)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>ANIMATED SIGNATURE STUDIO</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-medium text-white tracking-tight">
              Sign it. Share it.
            </h1>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Type your name, watch it get handwritten stroke-by-stroke, customize font & speed, and export as PNG, SVG, or video.
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={onOpenStudio}
              className="btn-primary px-5 py-2.5 text-xs font-medium inline-flex items-center gap-2 cursor-pointer shadow-md hover:opacity-90 transition-all"
            >
              <span>Create signature</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Animated Signature Demo Stage */}
        <div className="w-full md:w-[420px] h-[150px] mono-stage bg-[#1A1A1A] rounded-[16px] border border-[var(--line)] flex items-center justify-center relative p-4 shrink-0 overflow-hidden">
          <SignatureCanvas
            ref={canvasRef}
            name={currentSample.name}
            style={currentSample.style}
            seed={1234}
            settings={{ ink: '#FFFFFF', bg: 'dark', pen: 1.8 }}
            autoPlay={true}
            height={130}
          />
          <div className="absolute bottom-2 right-3 text-[10px] font-mono-label text-[var(--text-faint)]">
            {currentSample.style}
          </div>
        </div>
      </div>
    </section>
  );
}
