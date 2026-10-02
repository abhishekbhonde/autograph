import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import SignatureCard from './SignatureCard';
import { fetchSignatures } from '../services/api';

export default function HallOfFame({ onSelectSignature, showToast, refreshTrigger }) {
  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadSignatures = async (cursor = null, isInitial = false) => {
    try {
      if (isInitial) setIsLoading(true);
      else setIsLoadingMore(true);

      const res = await fetchSignatures(20, cursor);

      if (isInitial) {
        setItems(res.items || []);
      } else {
        setItems((prev) => [...prev, ...(res.items || [])]);
      }
      setNextCursor(res.nextCursor || null);
      setError(null);
    } catch (err) {
      setError(err.message || 'Could not load showcase autographs');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadSignatures(null, true);
  }, [refreshTrigger]);

  return (
    <section className="py-8 px-6 max-w-6xl mx-auto space-y-6">
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
          Showcase
        </h2>
        <p className="text-slate-400 text-sm">
          Recent autographs from the community.
        </p>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="autograph-card rounded-2xl h-[280px] p-4 animate-pulse space-y-4">
              <div className="h-36 bg-white/5 rounded-xl" />
              <div className="h-10 bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="autograph-card rounded-2xl p-8 text-center space-y-4 max-w-md mx-auto">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => loadSignatures(null, true)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="autograph-card rounded-2xl p-12 text-center space-y-2 max-w-md mx-auto">
          <h3 className="text-base font-bold text-white">No autographs yet</h3>
          <p className="text-slate-400 text-xs">
            Create your signature to be the first featured in the community showcase!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <SignatureCard
                key={item.id}
                item={item}
                onSelect={onSelectSignature}
                showToast={showToast}
              />
            ))}
          </div>

          {/* Load More Button */}
          {nextCursor && (
            <div className="text-center pt-6">
              <button
                onClick={() => loadSignatures(nextCursor, false)}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 inline-flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading autographs...</span>
                  </>
                ) : (
                  <span>Load More Autographs</span>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
