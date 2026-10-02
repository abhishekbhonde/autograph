import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div
        className={`glass-card rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-2xl border ${
          isError
            ? 'border-red-500/30 bg-red-950/60 text-red-200'
            : 'border-indigo-500/30 bg-slate-900/90 text-white'
        }`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        )}
        <span className="text-xs font-semibold">{toast.message}</span>
      </div>
    </div>
  );
}
