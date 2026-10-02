import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Sparkles, ChevronDown } from 'lucide-react';
import SignatureCard from './SignatureCard';
import { fetchSignatures } from '../services/api';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent' },
  { id: 'popular', label: 'Popular' },
];

const INITIAL_LIMIT = 10;

export default function HallOfFame({ onSelectSignature, onOpenCreate, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSignatures = async () => {
    try {
      setIsLoading(true);
      const res = await fetchSignatures(50, null);
      let list = res.items || [];
      if (filter === 'popular') {
        list = [...list].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      }
      setItems(list);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load signatures');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSignatures();
  }, [refreshTrigger, filter]);

  const displayedItems = React.useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const hasMore = items.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  return (
    <section className="pt-8 pb-16 px-6 max-w-[1120px] mx-auto space-y-6 font-ui">
      {/* Minimal Header Row: Title & Subtitle + Filter Tabs + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-medium text-white tracking-tight">
              Showcase
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-[var(--line)] bg-[#111111] text-[var(--text-faint)]">
              {items.length} signatures
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-dim)]">
            Handwritten community signatures.
          </p>
        </div>

        {/* Right Actions: Filter Tabs + Primary Create Button */}
        <div className="flex items-center gap-3">
          {/* Filter Chips */}
          <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-full border border-[var(--line)]">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id);
                  setVisibleCount(INITIAL_LIMIT);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-white text-black font-semibold'
                    : 'text-[var(--text-faint)] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Primary Create Button */}
          <button
            onClick={onOpenCreate}
            className="btn-primary px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-md hover:opacity-90 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 columns desktop, 2 tablet, 1 mobile, 28px gap */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="mono-card h-[340px] p-4 flex flex-col justify-between animate-shimmer space-y-4"
            >
              <div className="h-[250px] bg-[#1A1A1A] rounded-xl" />
              <div className="flex items-center gap-3 pt-3 border-t border-[var(--line)]">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A]" />
                <div className="h-4 bg-[#1A1A1A] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mono-card p-12 text-center space-y-4 max-w-md mx-auto">
          <p className="text-xs text-[var(--text-dim)]">{error}</p>
          <button
            onClick={loadSignatures}
            className="btn-secondary px-4 py-2 text-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Try Again</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        /* Empty Showcase State */
        <div className="mono-card p-16 text-center space-y-3 max-w-md mx-auto">
          <Sparkles className="w-6 h-6 text-[var(--text-faint)] mx-auto" />
          <h3 className="text-base font-medium text-white">
            Nothing here yet.
          </h3>
          <p className="text-xs text-[var(--text-dim)]">
            Be the first to create and publish a signature.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenCreate}
              className="btn-primary px-4 py-2 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>Create signature</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {displayedItems.map((item) => (
              <SignatureCard
                key={item.id}
                item={item}
                onSelect={onSelectSignature}
              />
            ))}
          </div>

          {/* Show More Pagination Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={handleShowMore}
                className="btn-secondary px-6 py-2.5 text-xs font-medium inline-flex items-center gap-2 cursor-pointer hover:bg-white/5 transition-all"
              >
                <span>Show more ({items.length - visibleCount} remaining)</span>
                <ChevronDown className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
