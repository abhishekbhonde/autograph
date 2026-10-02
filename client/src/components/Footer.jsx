import React from 'react';
import { Heart, Sparkles, Code2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 glass-panel py-8 px-4 sm:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Autograph — Animated Signature Studio</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>using Vite, React & Canvas Physics</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate-600">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
