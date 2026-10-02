import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/90 border-b border-white/10 px-6 py-4 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setActiveTab('showcase')}
          className="text-lg font-bold text-white tracking-tight hover:opacity-90 transition-opacity"
        >
          autograph
        </button>

        {/* Navigation Links */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('showcase')}
            className={`transition-colors ${
              activeTab === 'showcase'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Showcase
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-slate-300 border-white/20 hover:border-white hover:text-white'
            }`}
          >
            Create
          </button>
        </nav>
      </div>
    </header>
  );
}
