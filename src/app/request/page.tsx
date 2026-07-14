'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

export default function RequestPage() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    // Simulate submission (backend endpoint to be implemented)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-dark-950 pt-20 pb-28 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-600/20 to-brand-800/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/10">
            <svg className="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Request a Title</h1>
          <p className="text-dark-400 text-sm">
            Can&apos;t find what you&apos;re looking for? Request a movie or TV series to be dubbed in Sinhala.
          </p>
        </div>

        {submitted ? (
          /* Success state */
          <div className="bg-dark-800/60 border border-green-500/20 rounded-2xl p-8 text-center shadow-xl">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Request Submitted!</h2>
            <p className="text-dark-400 text-sm mb-6">
              Thank you! We&apos;ve received your request for <span className="text-white font-medium">&ldquo;{title}&rdquo;</span>. We&apos;ll consider it for our next dubbed release.
            </p>
            <button
              onClick={() => { setSubmitted(false); setTitle(''); setNote(''); }}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all"
            >
              Submit Another
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="bg-dark-800/60 border border-white/8 rounded-2xl p-6 shadow-xl space-y-5">
            {/* Type selector */}
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wider">Type</label>
              <div className="flex gap-2">
                {(['movie', 'tv'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                      type === t
                        ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/25'
                        : 'bg-white/5 border-white/10 text-dark-400 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {t === 'movie' ? '🎬 Movie' : '📺 TV Series'}
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div>
              <label htmlFor="req-title" className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wider">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="req-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'movie' ? 'e.g. Inception' : 'e.g. Breaking Bad'}
                required
                className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all"
              />
            </div>

            {/* Note */}
            <div>
              <label htmlFor="req-note" className="block text-xs font-medium text-dark-400 mb-2 uppercase tracking-wider">
                Additional Notes <span className="text-dark-600">(optional)</span>
              </label>
              <textarea
                id="req-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Year, language, season number..."
                rows={3}
                className="w-full bg-dark-900/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-dark-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
