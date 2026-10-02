import React, { useRef, useState } from 'react';
import { X, RotateCcw, Link2, Download, Check } from 'lucide-react';
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
    if (showToast) showToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReplay = () => {
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const handleDownloadSVG = () => {
    downloadSVG(signature.name, signature.style, signature.seed, signature.settings);
    if (showToast) showToast('Downloaded SVG', 'success');
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      downloadPNG(canvasRef.current.getCanvas(), signature.name);
      if (showToast) showToast('Downloaded PNG', 'success');
    }
  };

  const authorName = signature.authorName || signature.name || 'Anonymous';
  const authorHandle = signature.authorHandle || authorName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-ui">
      <div className="mono-card p-6 max-w-lg w-full relative space-y-6 bg-[#111111] text-left border border-[var(--line)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full border border-[var(--line)] bg-[#0A0A0A] text-[var(--text-faint)] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <h3 className="text-2xl font-medium text-white">
            {signature.name}
          </h3>
          <p className="text-[var(--text-dim)] text-xs">
            By <span className="text-white">{authorName}</span> (@{authorHandle}) • Font: {signature.style}
          </p>
        </div>

        {/* Stage Preview */}
        <div className="mono-stage p-4 flex items-center justify-center relative overflow-hidden bg-[#1A1A1A] h-[220px]">
          <SignatureCanvas
            ref={canvasRef}
            name={signature.name}
            style={signature.style}
            seed={signature.seed}
            settings={{
              ...signature.settings,
              ink: '#FFFFFF',
              bg: 'dark',
            }}
            autoPlay={true}
            height={200}
          />
        </div>

        {/* Copy Share Link Input */}
        <div className="space-y-2">
          <label className="block font-mono-label">
            PERMALINK
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full mono-input px-3.5 py-2 text-xs font-mono text-white"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                copied
                  ? 'btn-primary bg-white text-black'
                  : 'btn-secondary'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--line)]">
          <button
            onClick={handleReplay}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Replay</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadSVG}
              className="btn-secondary px-3.5 py-2 text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white inline mr-1" />
              SVG
            </button>
            <button
              onClick={handleDownloadPNG}
              className="btn-primary px-3.5 py-2 text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-black inline mr-1" />
              PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
