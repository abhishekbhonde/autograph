import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { createSignature } from '../services/api';

export default function PublishModal({ name, style, seed, settings, onClose, onPublished, showToast }) {
  const [authorName, setAuthorName] = useState(name || '');
  const [handle, setHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedId, setSignedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        name: (authorName || name || 'Anonymous').trim(),
        style,
        seed: seed || Math.floor(Math.random() * 10000),
        settings: {
          ...settings,
          authorName: (authorName || name || 'Anonymous').trim(),
          authorHandle: handle.trim().replace(/^@/, '') || 'autograph',
        },
      };

      const res = await createSignature(payload);
      setSignedId(res.id);
      if (onPublished) onPublished(res.id);
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to publish to showcase', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}?id=${signedId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (showToast) showToast('Link copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-ui">
      <div className="mono-card max-w-md w-full p-6 relative space-y-6 bg-[#111111] text-left border border-[var(--line)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full border border-[var(--line)] bg-[#0A0A0A] text-[var(--text-faint)] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!signedId ? (
          /* Publishing Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-white">
                Publish to showcase
              </h3>
              <p className="text-[var(--text-dim)] text-xs">
                Share your autograph with the community.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block font-mono-label">
                  DISPLAY NAME
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your display name"
                  className="w-full mono-input px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono-label">
                  HANDLE
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@handle"
                  className="w-full mono-input px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-5 py-2 text-xs font-medium cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </form>
        ) : (
          /* Simple "Published." Confirmation */
          <div className="text-left py-4 space-y-4 animate-fadeIn">
            <div className="space-y-1">
              <h3 className="text-2xl font-medium text-white">
                Published.
              </h3>
              <p className="text-[var(--text-dim)] text-xs">
                Your autograph is live on the showcase wall.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopyLink}
                className="w-full btn-secondary py-2.5 px-4 text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4 text-white" />
                <span>{copied ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
