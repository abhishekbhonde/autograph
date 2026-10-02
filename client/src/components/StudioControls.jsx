import React from 'react';
import { RefreshCw, Sliders, Palette, Type, Wand2 } from 'lucide-react';

const STYLE_OPTIONS = [
  { id: 'scripts', label: 'Hershey Script', desc: 'Classic handwritten' },
  { id: 'scriptc', label: 'Complex Script', desc: 'Elegant calligraphy' },
  { id: 'timesi', label: 'Serif Italic', desc: 'Formal cursive' },
  { id: 'futural', label: 'Futura Light', desc: 'Modern minimalist' },
  { id: 'gothiceng', label: 'Gothic English', desc: 'Vintage monogram' },
];

const COLOR_SWATCHES = [
  { hex: '#8b5cf6', label: 'Violet Flame' },
  { hex: '#06b6d4', label: 'Neon Cyan' },
  { hex: '#f59e0b', label: 'Royal Gold' },
  { hex: '#10b981', label: 'Emerald Spark' },
  { hex: '#ec4899', label: 'Rose Quartz' },
  { hex: '#f8fafc', label: 'Obsidian Liquid' },
];

export default function StudioControls({
  name,
  setName,
  style,
  setStyle,
  seed,
  setSeed,
  settings,
  setSettings,
}) {
  const updateSetting = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-6">
      {/* Name Input */}
      <div>
        <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          <span className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-400" />
            Signature Name
          </span>
          <span className="text-[11px] text-slate-500 font-normal">Max 40 chars</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name..."
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-lg font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          <button
            onClick={handleRandomizeSeed}
            className="absolute right-2.5 top-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 border border-white/10 transition-all"
            title="Randomize seed variation"
          >
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Vary</span>
          </button>
        </div>
      </div>

      {/* Style Selector */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Font & Handwriting Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setStyle(item.id)}
              className={`p-2.5 rounded-xl text-left border transition-all duration-200 ${
                style === item.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold">{item.label}</div>
              <div className="text-[10px] text-slate-500">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Ink Color Selector */}
      <div>
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          <Palette className="w-4 h-4 text-purple-400" />
          Ink Palette
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch.hex}
              onClick={() => updateSetting('ink', swatch.hex)}
              className={`w-8 h-8 rounded-full transition-transform duration-200 ${
                settings.ink === swatch.hex
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              }`}
              style={{ backgroundColor: swatch.hex }}
              title={swatch.label}
            />
          ))}

          {/* Custom color picker */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 cursor-pointer">
            <input
              type="color"
              value={settings.ink || '#8b5cf6'}
              onChange={(e) => updateSetting('ink', e.target.value)}
              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none opacity-0"
              title="Custom Ink Color"
            />
            <div
              className="w-full h-full"
              style={{ backgroundColor: settings.ink || '#8b5cf6' }}
            />
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="pt-2 border-t border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Pen Dynamics
          </span>
          <button
            onClick={() =>
              setSettings({
                pen: 1.5,
                ps: 0.5,
                slant: 10,
                shake: 0.5,
                rise: 4,
                sp: 1.0,
                flo: true,
                ink: settings.ink || '#8b5cf6',
              })
            }
            className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Pen Thickness */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Stroke Thickness</span>
              <span className="font-mono text-white">{settings.pen}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={settings.pen}
              onChange={(e) => updateSetting('pen', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Slant Angle */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Slant Angle</span>
              <span className="font-mono text-white">{settings.slant}°</span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              step="1"
              value={settings.slant}
              onChange={(e) => updateSetting('slant', parseInt(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Shakiness / Noise */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Hand Shakiness</span>
              <span className="font-mono text-white">{settings.shake}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.shake}
              onChange={(e) => updateSetting('shake', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>

          {/* Animation Speed */}
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Drawing Speed</span>
              <span className="font-mono text-white">{settings.sp}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={settings.sp}
              onChange={(e) => updateSetting('sp', parseFloat(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Flourish Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-slate-300">
            Decorative Underline Swash
          </span>
          <button
            onClick={() => updateSetting('flo', !settings.flo)}
            className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
              settings.flo ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>
    </div>
  );
}
