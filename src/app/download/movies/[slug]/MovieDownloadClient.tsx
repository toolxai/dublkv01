'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface DownloadLinkItem {
  id?: string;
  quality: string; // e.g. '720p', '1080p', '480p'
  label: string;   // e.g. '720p Download link 1', '720p Download link 2 Fast'
  url: string;     // URL
}

interface Movie {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  rating: number;
  release_year: number | null;
  runtime: number | null;
  genres: string[];
  download_links?: DownloadLinkItem[] | null;
  free_servers?: any;
}

interface MovieDownloadClientProps {
  movie: Movie;
}

export default function MovieDownloadClient({ movie }: MovieDownloadClientProps) {
  // Extract download links from movie data or use default demonstration fallback
  const topLinks: DownloadLinkItem[] = Array.isArray(movie.download_links) ? movie.download_links : [];
  const freeLinks: DownloadLinkItem[] = (movie.free_servers && Array.isArray(movie.free_servers.download_links)) ? movie.free_servers.download_links : [];
  const rawLinks: DownloadLinkItem[] = freeLinks.length > topLinks.length ? freeLinks : topLinks;

  // Fallback demo links if none configured in admin panel yet
  const displayLinks: DownloadLinkItem[] = rawLinks.length > 0 ? rawLinks : [
    { quality: '720p', label: '720p Download link 1', url: '#' },
    { quality: '720p', label: '720p Download link 2 Fast', url: '#' },
    { quality: '1080p', label: '1080 Download link 1', url: '#' },
    { quality: '1080p', label: '1080 Download link 2 Fast', url: '#' },
  ];

  // Group by quality for clean display
  const qualities = Array.from(new Set(displayLinks.map(l => (l.quality || '720p').trim())));

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white page-enter">
      {/* Hero Section */}
      <section className="relative h-[35vh] sm:h-[45vh] lg:h-[50vh] w-full overflow-hidden">
        {movie.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            className="object-cover object-top opacity-40 blur-[2px]"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-dark-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-dark-950/20" />

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <Link
            href={`/movies/${movie.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-900/80 border border-white/10 text-dark-200 hover:text-white hover:bg-dark-800 transition-all text-sm font-medium backdrop-blur-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Details</span>
          </Link>
        </div>
      </section>

      {/* Content Area */}
      <div className="relative -mt-40 sm:-mt-52 lg:-mt-60 z-10 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-dark-900/90 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl mb-8">
            <div className="w-36 sm:w-44 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/10">
              <Image
                src={movie.poster_url || '/placeholder-poster.jpg'}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
                📥 Direct Download Center
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
                {movie.title}
              </h1>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm text-dark-300">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold bg-yellow-500/10 px-2.5 py-0.5 rounded-lg border border-yellow-500/20">
                    ★ {movie.rating.toFixed(1)}
                  </span>
                )}
                {movie.release_year && <span>{movie.release_year}</span>}
                {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  {movie.genres.map((g) => (
                    <span key={g} className="px-2.5 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-dark-300">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Download Links Section */}
          <div className="bg-dark-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg">
                  ⚡
                </span>
                Select Quality & Server Link
              </h2>
              <p className="text-sm text-dark-400 mt-1">
                High-speed Sinhala Dubbed movie downloads with multiple mirror links.
              </p>
            </div>

            {qualities.map((quality) => {
              const linksInQuality = displayLinks.filter((l) => (l.quality || '720p') === quality);
              return (
                <div key={quality} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white tracking-wider uppercase">
                      {quality} HD QUALITY
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {linksInQuality.map((link, idx) => {
                      const isFast = link.label.toLowerCase().includes('fast');
                      return (
                        <a
                          key={idx}
                          href={link.url !== '#' ? link.url : undefined}
                          target={link.url !== '#' ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (link.url === '#') {
                              e.preventDefault();
                              alert(`This demo download link (${link.label}) can be configured from the Admin Panel.`);
                            }
                          }}
                          className={`relative group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                            isFast
                              ? 'bg-gradient-to-r from-emerald-950/40 via-dark-800/80 to-dark-800/80 border-emerald-500/30 hover:border-emerald-400 shadow-lg hover:shadow-emerald-500/10'
                              : 'bg-dark-800/80 border-white/10 hover:border-blue-500/40 shadow-lg hover:shadow-blue-500/10'
                          } hover:-translate-y-0.5`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isFast ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}>
                              {isFast ? '⚡' : '🚀'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors text-sm sm:text-base">
                                {link.label}
                              </h3>
                              <p className="text-xs text-dark-400">Direct High-Speed Mirror</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 text-xs font-bold text-dark-200 transition-all flex items-center gap-1.5">
                              <span>Download</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
