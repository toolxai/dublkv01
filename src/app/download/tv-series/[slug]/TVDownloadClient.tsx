'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface DownloadLinkItem {
  id?: string;
  quality: string;
  label: string;
  url: string;
}

export interface EpisodeData {
  episode_number: number;
  title: string;
  description?: string;
  thumbnail_url?: string | null;
  download_links?: DownloadLinkItem[];
}

export interface SeasonData {
  season_number: number;
  name: string;
  episodes: EpisodeData[];
}

interface TVSeries {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  poster_url?: string | null;
  backdrop_url?: string | null;
  rating?: number;
  release_year?: number | null;
  genres?: string[];
  free_servers?: {
    is_tv?: boolean;
    seasons?: SeasonData[];
  };
}

interface TVDownloadClientProps {
  series: TVSeries;
}

export default function TVDownloadClient({ series }: TVDownloadClientProps) {
  const tvData = series.free_servers || {};
  const seasons: SeasonData[] = (tvData.seasons && tvData.seasons.length > 0) ? tvData.seasons : [
    {
      season_number: 1,
      name: 'SEASON 1',
      episodes: Array.from({ length: 10 }, (_, i) => ({
        episode_number: i + 1,
        title: `Episode ${i + 1}`,
        download_links: [
          { quality: '720p', label: '720p Download link 1', url: '#' },
          { quality: '720p', label: '720p Download link 2 Fast', url: '#' },
          { quality: '1080p', label: '1080 Download link 1', url: '#' },
          { quality: '1080p', label: '1080 Download link 2 Fast', url: '#' },
        ]
      }))
    }
  ];

  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [selectedEpisodeIdx, setSelectedEpisodeIdx] = useState(0);

  const currentSeason = seasons[selectedSeasonIdx] || seasons[0];
  const episodes = currentSeason?.episodes || [];
  const currentEpisode = episodes[selectedEpisodeIdx] || episodes[0];

  // Extract episode links or demonstration fallbacks
  const rawEpisodeLinks = currentEpisode?.download_links || [];
  const displayLinks: DownloadLinkItem[] = rawEpisodeLinks.length > 0 ? rawEpisodeLinks : [
    { quality: '720p', label: '720p Download link 1', url: '#' },
    { quality: '720p', label: '720p Download link 2 Fast', url: '#' },
    { quality: '1080p', label: '1080 Download link 1', url: '#' },
    { quality: '1080p', label: '1080 Download link 2 Fast', url: '#' },
  ];

  const qualities = Array.from(new Set(displayLinks.map(l => l.quality || '720p')));

  return (
    <div className="min-h-screen bg-dark-950 text-white page-enter">
      {/* Hero Section */}
      <section className="relative h-[35vh] sm:h-[45vh] lg:h-[50vh] w-full overflow-hidden">
        {series.backdrop_url ? (
          <Image
            src={series.backdrop_url}
            alt={series.title}
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
            href={`/tv-series/${series.slug}`}
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
                src={series.poster_url || '/placeholder-poster.jpg'}
                alt={series.title}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold tracking-wider uppercase">
                📥 TV Series Download Center
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
                {series.title}
              </h1>

              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm text-dark-300">
                {series.rating && series.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400 font-semibold bg-yellow-500/10 px-2.5 py-0.5 rounded-lg border border-yellow-500/20">
                    ★ {series.rating.toFixed(1)}
                  </span>
                )}
                {series.release_year && <span>{series.release_year}</span>}
                <span>{seasons.length} Season{seasons.length > 1 ? 's' : ''}</span>
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  {series.genres.map((g) => (
                    <span key={g} className="px-2.5 py-1 text-xs rounded-lg bg-white/5 border border-white/10 text-dark-300">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Season & Episode Selector Card */}
          <div className="bg-dark-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-8 mb-8">
            
            {/* Season Tabs */}
            <div>
              <h2 className="text-xs font-bold text-dark-400 tracking-wider uppercase mb-3">
                1. Select Season
              </h2>
              <div className="flex flex-wrap gap-2">
                {seasons.map((season, idx) => (
                  <button
                    key={season.season_number || idx}
                    onClick={() => {
                      setSelectedSeasonIdx(idx);
                      setSelectedEpisodeIdx(0);
                    }}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                      selectedSeasonIdx === idx
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400/40'
                        : 'bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {season.name || `Season ${season.season_number || idx + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode Grid */}
            <div>
              <h2 className="text-xs font-bold text-dark-400 tracking-wider uppercase mb-3">
                2. Select Episode
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2.5">
                {episodes.map((ep, idx) => (
                  <button
                    key={ep.episode_number || idx}
                    onClick={() => setSelectedEpisodeIdx(idx)}
                    className={`py-3 px-2 rounded-xl font-bold text-xs transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                      selectedEpisodeIdx === idx
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40'
                        : 'bg-white/5 border border-white/10 text-dark-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] opacity-75 uppercase">EP</span>
                    <span className="text-sm font-extrabold">{ep.episode_number || idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Download Links Section */}
          <div className="bg-dark-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-8">
            <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    ⚡
                  </span>
                  Download Links - Season {currentSeason?.season_number || selectedSeasonIdx + 1} Episode {currentEpisode?.episode_number || selectedEpisodeIdx + 1}
                </h2>
                <p className="text-sm text-dark-400 mt-1">
                  {currentEpisode?.title ? `Episode Title: ${currentEpisode.title}` : 'Direct High-Speed Download Links'}
                </p>
              </div>
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
                              alert(`This demo download link (${link.label}) for Episode ${currentEpisode?.episode_number || selectedEpisodeIdx + 1} can be configured from the Admin Panel.`);
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
                              <p className="text-xs text-dark-400">Episode Direct Mirror</p>
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
