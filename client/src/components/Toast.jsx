import React from 'react';

export default function Toast({ toast }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp font-ui">
      <div className="mono-card bg-[#0A0A0A] border border-[var(--line)] rounded-[12px] px-5 py-3 flex items-center gap-3 text-white shadow-2xl">
        <span className="text-xs font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
