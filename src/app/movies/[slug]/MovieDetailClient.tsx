'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MovieRow from '@/components/ui/MovieRow';
import PricingModal from '@/components/payment/PricingModal';
import type { TMDBCredits } from '@/lib/tmdb';

interface Server {
  url: string;
  label: string;
  enabled: boolean;
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
  bunny_video_id: string | null;
  free_servers?: Server[] | null;
  vip_servers?: Server[] | null;
  // legacy
  server1_url?: string | null;
  server2_url?: string | null;
}

interface MovieDetailClientProps {
  movie: Movie;
  relatedMovies: Movie[];
  credits: TMDBCredits;
}

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function MovieDetailClient({ movie, relatedMovies, credits }: MovieDetailClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);

  // Determine if there are free servers available (legacy or new)
  const freeServersAvailable = (
    (movie.free_servers && movie.free_servers.some(s => s.enabled)) ||
    (!movie.free_servers && (movie.server1_url || movie.server2_url))
  );

  const handleWatchFree = () => {
    // No login required for free (with ads)
    router.push(`/watch/${movie.slug}?mode=free`);
  };

  const handleWatchVip = () => {
    // Opens pricing modal; VIP requires login
    setShowPricing(true);
  };

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="page-enter">
      {/* Hero Section — compact, content pushed up */}
      <section className="relative h-[42vh] sm:h-[52vh] w-full overflow-hidden">
        {movie.backdrop_url ? (
          <Image
            src={movie.backdrop_url}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-dark-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-dark-950/10" />
      </section>

      {/* Content — overlaps hero with larger negative margin */}
      <div className="relative -mt-56 sm:-mt-64 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0 w-44 sm:w-52 mx-auto md:mx-0">
              <div className="aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl shadow-brand-500/10 border border-white/10">
                <Image
                  src={movie.poster_url || '/placeholder-poster.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 pt-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 mb-3">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span className="text-xs font-semibold text-brand-300 tracking-wide">සිංහල හඩකැවූ - SINHALA DUBBED</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {movie.rating > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/15 border border-yellow-500/20">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-semibold text-yellow-300">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                {movie.release_year && <span className="text-sm text-dark-300">{movie.release_year}</span>}
                {movie.runtime && <span className="text-sm text-dark-300">{formatRuntime(movie.runtime)}</span>}
                {movie.genres.map((genre) => (
                  <span key={genre} className="px-2.5 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-dark-300">
                    {genre}
                  </span>
                ))}
              </div>

              {movie.description && (
                <p className="text-dark-300 leading-relaxed mb-6 max-w-2xl text-sm sm:text-base">
                  {movie.description}
                </p>
              )}

              {/* Two-button action row */}
              <div className="flex flex-wrap items-center gap-4 mt-2">

                {/* ── Watch Now (With Ads) ── magenta glow pill */}
                <button
                  onClick={handleWatchFree}
                  className="relative group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-white text-base transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #e600cc, #ff00d4)',
                    boxShadow: '0 0 24px 4px rgba(230,0,204,0.55), 0 4px 20px rgba(230,0,204,0.35)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 36px 8px rgba(230,0,204,0.75), 0 4px 28px rgba(230,0,204,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 24px 4px rgba(230,0,204,0.55), 0 4px 20px rgba(230,0,204,0.35)';
                  }}
                >
                  {/* floating "With Ads" corner badge */}
                  <span
                    className="absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-semibold rounded-md tracking-wider"
                    style={{
                      background: 'rgba(10,10,18,0.90)',
                      border: '1px solid rgba(230,0,204,0.35)',
                      color: '#f472f0',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    With Ads
                  </span>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Now
                </button>

                {/* ── Watch Now (Without Ads) ── indigo/violet glow pill */}
                <button
                  onClick={handleWatchVip}
                  className="relative group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-white text-base transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
                    boxShadow: '0 0 22px 3px rgba(109,40,217,0.5), 0 4px 18px rgba(109,40,217,0.3)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 34px 7px rgba(139,92,246,0.65), 0 4px 26px rgba(139,92,246,0.45)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow =
                      '0 0 22px 3px rgba(109,40,217,0.5), 0 4px 18px rgba(109,40,217,0.3)';
                  }}
                >
                  {/* floating "Without Ads" badge */}
                  <span
                    className="absolute -top-2.5 right-3 px-2.5 py-0.5 text-[10px] font-semibold rounded-md tracking-wider"
                    style={{
                      background: 'rgba(10,10,18,0.90)',
                      border: '1px solid rgba(109,40,217,0.40)',
                      color: '#a78bfa',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    No Ads · VIP
                  </span>
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Now
                </button>

              </div>
            </div>
          </div>

          {/* Cast & Crew */}
          {(credits.cast.length > 0 || credits.crew.length > 0) && (
            <div className="mt-12 space-y-10">
              {credits.cast.length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-5 flex items-center gap-2">
                    <span className="text-brand-400">🎭</span> Cast
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                    {credits.cast.map((person) => (
                      <div key={person.id} className="text-center group cursor-default">
                        {/* Avatar — no white border; gradient ring + glow on hover */}
                        <div
                          className="relative mx-auto mb-2 max-w-[80px] transition-transform duration-300 group-hover:scale-105"
                          style={{ width: '80px', height: '80px' }}
                        >
                          {/* Gradient ring shell */}
                          <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #e600cc, #6d28d9)',
                              padding: '2px',
                              borderRadius: '9999px',
                              filter: 'blur(0px)',
                              boxShadow: '0 0 14px 3px rgba(230,0,204,0.45)',
                            }}
                          />
                          <div className="absolute inset-[2px] rounded-full overflow-hidden bg-dark-800 group-hover:shadow-[0_0_12px_2px_rgba(230,0,204,0.30)] transition-shadow duration-300">
                            {person.profile_path ? (
                              <Image
                                src={`${TMDB_IMAGE_BASE}/w185${person.profile_path}`}
                                alt={person.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-medium text-white leading-tight truncate">{person.name}</p>
                        {person.character && (
                          <p className="text-[10px] text-dark-400 leading-tight truncate mt-0.5">{person.character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {credits.crew.length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-5 flex items-center gap-2">
                    <span className="text-brand-400">🎬</span> Crew
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {credits.crew.map((person, i) => (
                      <div
                        key={`${person.id}-${i}`}
                        className="group flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:border-brand-500/30 hover:bg-white/[0.07] transition-all duration-200"
                      >
                        {/* Crew avatar — gradient ring on hover */}
                        <div
                          className="relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
                          style={{ width: '36px', height: '36px' }}
                        >
                          <div
                            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #e600cc, #6d28d9)',
                              boxShadow: '0 0 8px 2px rgba(230,0,204,0.4)',
                            }}
                          />
                          <div className="absolute inset-[2px] rounded-full overflow-hidden bg-dark-800">
                            {person.profile_path ? (
                              <Image
                                src={`${TMDB_IMAGE_BASE}/w45${person.profile_path}`}
                                alt={person.name}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-dark-700">
                                <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{person.name}</p>
                          <p className="text-xs text-brand-400">{person.job}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <div className="mt-16">
          <MovieRow title="You May Also Like" movies={relatedMovies} icon="🎬" />
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        movieId={movie.id}
        movieTitle={movie.title}
        movieSlug={movie.slug}
      />
    </div>
  );
}
