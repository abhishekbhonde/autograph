import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Download, ChevronDown } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';
import StudioControls from './StudioControls';
import PublishModal from './PublishModal';
import { downloadSVG, downloadPNG } from '../utils/exportUtils';
import { createSignature } from '../services/api';

export default function HeroStudio({ onSignaturePublished, showToast }) {
  const canvasRef = useRef(null);
  const [textInput, setTextInput] = useState('');
  const [useInitials, setUseInitials] = useState(false);
  const [debouncedText, setDebouncedText] = useState('');
  const [style, setStyle] = useState('brittany');
  const [seed] = useState(1234);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const [settings, setSettings] = useState({
    pen: 1.8,
    motionSpeed: 'balanced',
    ink: '#FFFFFF',
    bg: 'dark',
  });

  // Debounce typing re-play by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedText(textInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [textInput]);

  const autoPublishToShowcase = async () => {
    try {
      const nameToUse = (debouncedText || 'your name').trim();
      const payload = {
        name: nameToUse,
        style,
        seed,
        settings: {
          ...settings,
          authorName: nameToUse,
          authorHandle: nameToUse.toLowerCase().replace(/[^a-z0-9]/g, '') || 'autograph',
        },
      };
      const res = await createSignature(payload);
      if (onSignaturePublished) onSignaturePublished(res.id);
    } catch (err) {
      console.error('Auto publish failed:', err);
    }
  };

  const handleReplay = () => {
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const handleDownloadSVG = () => {
    downloadSVG(debouncedText || 'your name', style, seed, settings);
    autoPublishToShowcase();
    if (showToast) showToast('Downloaded & published to Showcase', 'success');
    setShowDownloadMenu(false);
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      downloadPNG(canvasRef.current.getCanvas(), debouncedText || 'your name');
      autoPublishToShowcase();
      if (showToast) showToast('Downloaded & published to Showcase', 'success');
    }
    setShowDownloadMenu(false);
  };

  const handleDownloadWebM = () => {
    if (canvasRef.current && canvasRef.current.getCanvas()) {
      const canvas = canvasRef.current.getCanvas();
      if (typeof MediaRecorder !== 'undefined') {
        const stream = canvas.captureStream(60);
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(debouncedText || 'signature').toLowerCase().replace(/\s+/g, '_')}.webm`;
          a.click();
          autoPublishToShowcase();
          if (showToast) showToast('Downloaded & published to Showcase', 'success');
        };
        recorder.start();
        if (canvasRef.current.replay) canvasRef.current.replay();
        setTimeout(() => recorder.stop(), 2000);
      } else {
        if (showToast) showToast('Video recording not supported', 'error');
      }
    }
    setShowDownloadMenu(false);
  };

  return (
    <section className="pt-12 pb-24 px-6 max-w-[760px] mx-auto text-left font-ui">
      <div className="space-y-8">
        {/* 1. Title "Create your autograph" + dim subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight">
            Create your autograph
          </h1>
          <p className="text-base text-[var(--text-dim)]">
            Create your animated signature and download it.
          </p>
        </div>

        {/* 2. PREVIEW STAGE: wide panel (#1A1A1A, 22px radius, ~16:7 ratio) */}
        <div className="mono-stage aspect-[16/7] w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#1A1A1A]">
          <SignatureCanvas
            ref={canvasRef}
            name={debouncedText || 'your name'}
            style={style}
            seed={seed}
            settings={settings}
            autoPlay={true}
            height={260}
          />
        </div>

        {/* 3, 4, 5. CONTROLS (TEXT, Initials checkbox, FONT & SPEED dropdowns) */}
        <StudioControls
          textInput={textInput}
          setTextInput={setTextInput}
          useInitials={useInitials}
          setUseInitials={setUseInitials}
          style={style}
          setStyle={setStyle}
          settings={settings}
          setSettings={setSettings}
        />

        {/* 6. Action Row */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)]">
          <div className="flex items-center gap-3">
            {/* Replay Secondary Button */}
            <button
              onClick={handleReplay}
              className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-white" />
              <span>Replay</span>
            </button>

            {/* Download Autograph Primary White Button with Split Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Download autograph</span>
                <ChevronDown className="w-4 h-4 text-black" />
              </button>

              {showDownloadMenu && (
                <div className="absolute left-0 bottom-12 w-48 bg-[#111111] border border-[var(--line)] rounded-[12px] p-1.5 shadow-2xl z-50 space-y-1">
                  <button
                    onClick={handleDownloadPNG}
                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1A1A1A] rounded-[8px] transition-colors"
                  >
                    PNG Image
                  </button>
                  <button
                    onClick={handleDownloadSVG}
                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1A1A1A] rounded-[8px] transition-colors"
                  >
                    SVG Vector
                  </button>
                  <button
                    onClick={handleDownloadWebM}
                    className="w-full text-left px-3 py-2 text-xs text-white hover:bg-[#1A1A1A] rounded-[8px] transition-colors"
                  >
                    WebM Video
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subtle text button "Publish to showcase" */}
          <button
            onClick={() => setShowPublishModal(true)}
            className="text-sm text-[var(--text-dim)] hover:text-white transition-colors cursor-pointer"
          >
            Publish to showcase
          </button>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          name={debouncedText || 'your name'}
          style={style}
          seed={seed}
          settings={settings}
          onClose={() => setShowPublishModal(false)}
          onPublished={(id) => {
            if (onSignaturePublished) onSignaturePublished(id);
          }}
          showToast={showToast}
        />
      )}
    </section>
  );
}
