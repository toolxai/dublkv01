import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'TV Series | DubLK',
  description: 'Sinhala dubbed TV series — coming soon on DubLK.',
};

export default function TVSeriesPage() {
  return (
    <main className="min-h-screen bg-dark-950 pt-20 pb-28 flex items-center justify-center">
      <div className="text-center px-6 max-w-lg mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Coming Soon
        </span>

        <h1 className="text-3xl font-bold text-white mb-3">TV Series</h1>
        <p className="text-dark-400 text-base leading-relaxed mb-8">
          We&apos;re working on bringing your favourite TV series in Sinhala dubbed. Stay tuned — it&apos;s almost ready!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
          >
            ← Go Home
          </Link>
          <Link
            href="/movies"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium hover:from-brand-500 hover:to-brand-400 shadow-lg shadow-brand-500/25 transition-all duration-200"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </main>
  );
}
