import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Link2, Download, Check, Sparkles } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';
import { downloadSVG, downloadPNG } from '../utils/exportUtils';

export default function ShareModal({ signature, onClose, showToast }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  if (!signature) return null;

  const shareUrl = `${window.location.origin}?id=${signature.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (showToast) showToast('Signature URL copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = () => {
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const handleDownloadSVG = () => {
    downloadSVG(signature.name, signature.style, signature.seed, signature.settings);
    if (showToast) showToast('Downloaded SVG! ✨');
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      downloadPNG(canvasRef.current.getCanvas(), signature.name);
      if (showToast) showToast('Downloaded PNG! 🖼️');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/15 relative space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Spotlight</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
            {signature.name}
          </h3>
          <p className="text-slate-400 text-xs font-mono">
            Style: {signature.style} • ID: #{signature.id}
          </p>
        </div>

        {/* Stage Preview */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
          <SignatureCanvas
            ref={canvasRef}
            name={signature.name}
            style={signature.style}
            seed={signature.seed}
            settings={signature.settings}
            autoPlay={true}
            height={220}
          />
        </div>

        {/* Copy Share Link Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Shareable Signature Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={handleReplay}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Replay</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadSVG}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>SVG</span>
            </button>
            <button
              onClick={handleDownloadPNG}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
