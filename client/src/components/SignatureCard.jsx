import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';

export default function SignatureCard({ item, onSelect }) {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          if (canvasRef.current) {
            canvasRef.current.replay();
          }
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const handleReplay = (e) => {
    e.stopPropagation();
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const authorName = item.authorName || item.name || 'Anonymous';
  const handle = item.authorHandle || authorName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fontObjName = item.style || 'Brittany';
  const speedLabel = item.settings?.motionSpeed || 'Balanced';
  const avatarChar = authorName.charAt(0).toUpperCase();

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect && onSelect(item)}
      className="mono-card flex flex-col justify-between h-[210px] rounded-[16px] overflow-hidden group cursor-pointer border border-[var(--line)] bg-[#111111] hover:border-white/20 transition-all duration-200"
    >
      {/* Top Area (150px tall) with signature centered in white */}
      <div className="h-[150px] w-full flex items-center justify-center relative p-3 bg-[#111111]">
        <SignatureCanvas
          ref={canvasRef}
          name={item.name}
          style={item.style}
          seed={item.seed}
          settings={{
            ...item.settings,
            ink: '#FFFFFF',
            bg: 'card',
          }}
          autoPlay={isVisible}
          height={135}
        />
      </div>

      {/* 1px Hairline Divider & Footer Row */}
      <div className="border-t border-[var(--line)] px-3.5 py-2.5 bg-[#111111] flex items-center justify-between">
        {/* Left: 28px circular avatar + username with @handle */}
        <div className="flex items-center gap-2.5 truncate pr-2">
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[var(--line)] flex items-center justify-center text-xs font-medium text-white shrink-0">
            {avatarChar}
          </div>

          <div className="truncate">
            <div className="text-xs font-ui font-medium text-white truncate">
              {authorName}
            </div>
            <div className="text-[11px] font-ui text-[var(--text-faint)] truncate">
              @{handle}
            </div>
          </div>
        </div>

        {/* Right: Font name, speed pill, circular replay button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline text-[11px] font-ui text-[var(--text-faint)] capitalize">
            {fontObjName}
          </span>

          <span className="px-2 py-0.5 rounded-full border border-[var(--line)] text-[10px] font-ui text-white capitalize">
            {speedLabel}
          </span>

          <button
            onClick={handleReplay}
            className="w-7 h-7 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--text-faint)] hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            title="Replay animation"
            aria-label="Replay signature animation"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
