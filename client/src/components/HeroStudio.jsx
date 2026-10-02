import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Download, ChevronDown, Check } from 'lucide-react';
import SignatureCanvas from './SignatureCanvas';
import { downloadSVG, downloadPNG } from '../utils/exportUtils';
import { createSignature } from '../services/api';

const FONT_OPTIONS = [
  { id: 'scripts', label: 'Brittany Signature' },
  { id: 'scriptc', label: 'Signatura Monoline' },
  { id: 'timesi', label: 'Amsterdam Signature' },
  { id: 'futural', label: 'Tomatoes' },
  { id: 'gothiceng', label: 'Monogram Gothic' },
];

const SPEED_OPTIONS = [
  { id: 'balanced', label: 'Balanced', value: 1.0 },
  { id: 'fast', label: 'Fast', value: 1.4 },
  { id: 'slow', label: 'Slow', value: 0.7 },
];

export default function HeroStudio({ onSignaturePublished, showToast }) {
  const canvasRef = useRef(null);
  const [name, setName] = useState('your name');
  const [useInitials, setUseInitials] = useState(false);
  const [selectedFont, setSelectedFont] = useState('scripts');
  const [selectedSpeed, setSelectedSpeed] = useState('balanced');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Compute text to draw: if useInitials is checked, extract initials
  const displayText = React.useMemo(() => {
    if (!name.trim()) return 'your name';
    if (!useInitials) return name;
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }, [name, useInitials]);

  const speedMultiplier = React.useMemo(() => {
    const found = SPEED_OPTIONS.find((s) => s.id === selectedSpeed);
    return found ? found.value : 1.0;
  }, [selectedSpeed]);

  const settings = React.useMemo(
    () => ({
      pen: 1.5,
      ps: 0.5,
      slant: 10,
      shake: 0.4,
      rise: 4,
      sp: speedMultiplier,
      flo: true,
      ink: '#ffffff',
    }),
    [speedMultiplier]
  );

  const handleReplay = () => {
    if (canvasRef.current) {
      canvasRef.current.replay();
    }
  };

  const handleDownloadSVG = () => {
    downloadSVG(displayText, selectedFont, 1234, settings);
    if (showToast) showToast('Downloaded SVG autograph! ✨');
    setShowDownloadMenu(false);
  };

  const handleDownloadPNG = () => {
    if (canvasRef.current) {
      downloadPNG(canvasRef.current.getCanvas(), displayText);
      if (showToast) showToast('Downloaded PNG autograph! 🖼️');
    }
    setShowDownloadMenu(false);
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const payload = {
        name: displayText,
        style: selectedFont,
        seed: Math.floor(Math.random() * 10000),
        settings,
      };
      const res = await createSignature(payload);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      if (showToast) showToast('Featured in Showcase! 🏆');
      if (onSignaturePublished) onSignaturePublished(res.id);
    } catch (err) {
      if (showToast) showToast(err.message || 'Error publishing autograph', 'error');
    } finally {
      setIsPublishing(false);
      setShowDownloadMenu(false);
    }
  };

  return (
    <section className="pt-10 pb-20 px-6 max-w-2xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
          Create your autograph
        </h1>
        <p className="text-slate-400 text-sm">
          Create your animated signature and download it.
        </p>
      </div>

      {/* Main Canvas Preview Box */}
      <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 h-[260px] flex items-center justify-center relative overflow-hidden">
        <SignatureCanvas
          ref={canvasRef}
          name={displayText}
          style={selectedFont}
          seed={1234}
          settings={settings}
          autoPlay={true}
          height={200}
        />
      </div>

      {/* Inputs & Controls Stack */}
      <div className="space-y-5">
        {/* Signature Text Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Signature Text</span>
            <span className="font-mono text-slate-500">
              {name.length} / 80
            </span>
          </div>
          <input
            type="text"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            placeholder="your name"
            className="w-full bg-[#111111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-white/30 transition-all font-sans"
          />
        </div>

        {/* Use Initials Checkbox */}
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="useInitials"
            checked={useInitials}
            onChange={(e) => setUseInitials(e.target.checked)}
            className="w-4 h-4 rounded bg-[#111111] border-white/20 accent-white text-black cursor-pointer"
          />
          <label
            htmlFor="useInitials"
            className="text-xs font-medium text-slate-300 cursor-pointer select-none"
          >
            Use initials
          </label>
        </div>

        {/* Dropdowns Row (FONT & SPEED) */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          {/* FONT Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Font
            </label>
            <div className="relative">
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id} className="bg-[#111111] text-white">
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* SPEED Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Speed
            </label>
            <div className="relative">
              <select
                value={selectedSpeed}
                onChange={(e) => setSelectedSpeed(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white appearance-none focus:outline-none focus:border-white/30 cursor-pointer"
              >
                {SPEED_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#111111] text-white">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between pt-4">
          {/* Replay Button */}
          <button
            onClick={handleReplay}
            className="px-4 py-2.5 rounded-xl bg-[#111111] hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>

          {/* Download Autograph Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-black" />
              <span>Download autograph</span>
              <ChevronDown className="w-3.5 h-3.5 text-black" />
            </button>

            {/* Dropdown Menu */}
            {showDownloadMenu && (
              <div className="absolute right-0 bottom-12 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-fadeIn">
                <button
                  onClick={handleDownloadSVG}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Download SVG</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Download PNG</span>
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span>Publish to Showcase</span>
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
