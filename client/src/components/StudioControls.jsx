import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { FONT_TILES } from '../engine/penEngine';

const SPEED_OPTIONS = [
  { id: 'calm', label: 'Calm' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'quick', label: 'Quick' },
];

export default function StudioControls({
  textInput,
  setTextInput,
  useInitials,
  setUseInitials,
  style,
  setStyle,
  settings,
  setSettings,
}) {
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const selectedFontObj = FONT_TILES.find((f) => f.id === style) || FONT_TILES[0];
  const selectedSpeedObj = SPEED_OPTIONS.find((s) => s.id === (settings.motionSpeed || 'balanced')) || SPEED_OPTIONS[1];

  const displayText = React.useMemo(() => {
    if (!textInput.trim()) return 'your name';
    if (!useInitials) return textInput;
    return textInput
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }, [textInput, useInitials]);

  return (
    <div className="space-y-4 text-white text-left font-ui">
      {/* 3. SIGNATURE TEXT label (left) + character counter "0 / 80" (right) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between font-mono-label text-[11px]">
          <span>SIGNATURE TEXT</span>
          <span className="tabular-nums text-[var(--text-faint)]">{textInput.length} / 80</span>
        </div>

        <textarea
          rows={2}
          value={textInput}
          maxLength={80}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="your name"
          className="w-full mono-input p-3 text-sm resize-none"
        />
      </div>

      {/* 4. Checkbox "Use initials" */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setUseInitials(!useInitials)}
          className={`w-4 h-4 rounded-[4px] border border-[var(--line)] flex items-center justify-center transition-colors cursor-pointer ${
            useInitials ? 'bg-white border-white' : 'bg-[#0A0A0A]'
          }`}
          aria-label="Toggle use initials"
        >
          {useInitials && <Check className="w-3 h-3 text-black stroke-[3]" />}
        </button>
        <span
          onClick={() => setUseInitials(!useInitials)}
          className="text-xs text-[var(--text-dim)] cursor-pointer select-none"
        >
          Use initials
        </span>
      </div>

      {/* 5. Two dropdowns side by side: FONT & SPEED */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* FONT DROPDOWN */}
        <div className="space-y-1.5 relative">
          <label className="block font-mono-label text-[11px]">FONT</label>

          <button
            type="button"
            onClick={() => {
              setFontMenuOpen(!fontMenuOpen);
              setSpeedMenuOpen(false);
            }}
            className="w-full mono-input px-3 py-2 text-xs flex items-center justify-between cursor-pointer"
          >
            <span className="truncate">{selectedFontObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
          </button>

          {fontMenuOpen && (
            <div className="absolute left-0 right-0 top-[60px] z-50 bg-[#111111] border border-[var(--line)] rounded-[12px] p-1.5 shadow-2xl space-y-1 max-h-56 overflow-y-auto">
              {FONT_TILES.map((tile) => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    setStyle(tile.id);
                    setFontMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-[8px] transition-colors flex items-center justify-between cursor-pointer ${
                    style === tile.id
                      ? 'bg-[#1A1A1A] text-white font-medium'
                      : 'hover:bg-[#1A1A1A] text-[var(--text-dim)] hover:text-white'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="text-[10px] font-mono text-[var(--text-faint)]">{tile.label}</div>
                    <div
                      className="text-base text-white truncate my-0.5"
                      style={{ fontFamily: tile.font }}
                    >
                      {displayText}
                    </div>
                  </div>
                  {style === tile.id && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SPEED DROPDOWN */}
        <div className="space-y-1.5 relative">
          <label className="block font-mono-label text-[11px]">SPEED</label>

          <button
            type="button"
            onClick={() => {
              setSpeedMenuOpen(!speedMenuOpen);
              setFontMenuOpen(false);
            }}
            className="w-full mono-input px-3 py-2 text-xs flex items-center justify-between cursor-pointer"
          >
            <span>{selectedSpeedObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
          </button>

          {speedMenuOpen && (
            <div className="absolute left-0 right-0 top-[60px] z-50 bg-[#111111] border border-[var(--line)] rounded-[12px] p-1.5 shadow-2xl space-y-1">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSettings((prev) => ({ ...prev, motionSpeed: opt.id }));
                    setSpeedMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[8px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    (settings.motionSpeed || 'balanced') === opt.id
                      ? 'bg-[#1A1A1A] text-white font-medium'
                      : 'hover:bg-[#1A1A1A] text-[var(--text-dim)] hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {(settings.motionSpeed || 'balanced') === opt.id && (
                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
