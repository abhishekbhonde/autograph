import React from 'react';
import { Plus } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 w-full h-[64px] bg-[#000000] border-b border-[var(--line)] px-6 font-ui">
      <div className="max-w-[1120px] h-full mx-auto flex items-center justify-between">
        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors duration-150 cursor-pointer ${
              activeTab === 'home'
                ? 'text-white font-medium'
                : 'text-[var(--text-faint)] hover:text-white'
            }`}
          >
            Showcase
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors duration-150 cursor-pointer ${
              activeTab === 'studio'
                ? 'text-white font-medium'
                : 'text-[var(--text-faint)] hover:text-white'
            }`}
          >
            Create
          </button>
        </nav>

        {/* Right: Primary Create Button */}
        <div>
          <button
            onClick={() => setActiveTab('studio')}
            className="btn-primary px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
            <span>Create</span>
          </button>
        </div>
      </div>
    </header>
  );
}
