import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroBanner({ onCreateClick }) {
  return (
    <section className="pt-12 pb-16 px-6 max-w-6xl mx-auto">
      <div className="space-y-6 max-w-xl">
        {/* Cursive Signature Graphic */}
        <h1 className="text-6xl sm:text-7xl font-signature-logo text-white select-none leading-none">
          autograph
        </h1>

        {/* Welcome Tagline */}
        <div className="space-y-2 text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
          <p>
            Welcome! Create your own animated signature in minutes and submit it to be featured in the community showcase.
          </p>
          <p>
            Pick a style, preview it live, and download your signature as PNG or SVG.
          </p>
        </div>

        {/* Create Autograph Button */}
        <div className="pt-2">
          <button
            onClick={onCreateClick}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-slate-300 transition-colors group cursor-pointer"
          >
            <span>Create autograph</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
