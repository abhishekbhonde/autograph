import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

export default function SignatureCard({ item, onSelect, showToast }) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // IntersectionObserver to auto-replay when card enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (canvasRef.current) {
            canvasRef.current.replay();
          }
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleReplay = (e) => {
    e.stopPropagation();
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}?id=${item.id}`;
    navigator.clipboard.writeText(url);
    if (showToast) showToast('Copied signature link! 📋');
  };

  const formattedStyleLabel = React.useMemo(() => {
    switch (item.style) {
      case 'scripts': return 'Brittany Signature';
      case 'scriptc': return 'Signatura Monoline';
      case 'timesi': return 'Amsterdam Signature';
      case 'futural': return 'Tomatoes';
      case 'gothiceng': return 'Monogram Gothic';
      default: return item.style || 'Signature';
    }
  }, [item.style]);

  const username = item.name.toLowerCase().replace(/\s+/g, '');

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect && onSelect(item)}
      className="autograph-card rounded-2xl overflow-hidden flex flex-col justify-between h-[280px] group cursor-pointer border border-white/10 bg-[#111111]"
    >
      {/* Signature Canvas Stage */}
      <div className="flex-1 p-4 flex items-center justify-center relative overflow-hidden bg-[#111111]">
        <SignatureCanvas
          ref={canvasRef}
          name={item.name}
          style={item.style}
          seed={item.seed}
          settings={{ ...item.settings, ink: item.settings?.ink || '#ffffff' }}
          autoPlay={isVisible}
          height={180}
        />
      </div>

      {/* Card Footer Metadata Bar */}
      <div className="px-4 py-3 bg-[#161616] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        {/* User Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 text-white font-bold text-[10px]">
            {item.name.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <div className="text-white font-medium text-xs truncate leading-snug">
              {username}
            </div>
            <div className="text-[11px] text-slate-500 truncate leading-snug">
              @{username}
            </div>
          </div>
        </div>

        {/* Font Style Badge & Replay Button */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            {formattedStyleLabel}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white">
            Balanced
          </span>
          <button
            onClick={handleReplay}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Replay signature"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
