'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface StreamServer {
  url?: string;
  embed_code?: string;
  input_type?: 'embed' | 'url';
  name?: string;
  label?: string;
  enabled?: boolean;
}

interface WatchClientProps {
  movie: {
    id: string;
    title: string;
    slug: string;
    // Legacy columns (still supported)
    server1_url: string | null;
    server2_url: string | null;
    // New server columns
    free_servers: StreamServer[] | null;
    vip_servers: StreamServer[] | null;
    poster_url: string | null;
    backdrop_url: string | null;
    rating: number;
    release_year: number | null;
    runtime: number | null;
    genres: string[];
  };
  isFreeMode: boolean;
}

/**
 * Extract src URL from iframe code snippet if applicable
 */
function extractSrcFromEmbed(input: string): string {
  if (!input) return '';
  const str = input.trim();
  if (str.toLowerCase().includes('<iframe')) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return str;
}

/**
 * Convert a server object or URL to an embeddable format.
 * - Raw iframe snippet → extracts src URL
 * - Google Drive share links → /preview embed
 * - Other URLs (VOE, Abyss, FileMoon, Vibuxser, Morencius, Doodstream, Internet Archive, etc.) → pass through
 */
function getEmbedUrl(server: StreamServer | null): string {
  if (!server) return '';
  const rawInput = server.embed_code || server.url || '';
  const url = extractSrcFromEmbed(rawInput);
  if (!url) return '';

  // Already a Google Drive preview URL
  if (url.includes('drive.google.com') && url.includes('/preview')) return url;
  // Google Drive share link: /file/d/FILE_ID/view
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  // Google Drive ?id= format
  const idMatch = url.match(/drive\.google\.com.*[?&]id=([^&]+)/);
  if (idMatch) return `https://drive.google.com/file/d/${idMatch[1]}/preview`;

  return url;
}

/**
 * Check if a URL is a Google Drive embed (to show the "open in new tab" blocker overlay).
 */
function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com');
}

export default function WatchClient({ movie, isFreeMode }: WatchClientProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeServerIdx, setActiveServerIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [mobilePlayerStarted, setMobilePlayerStarted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Build server list based on mode — always display generic "Server 1", "Server 2", etc.
  const availableServers: { url?: string; embed_code?: string; label: string }[] = (() => {
    const rawList = isFreeMode
      ? (movie.free_servers || []).filter((s: any) => s.enabled !== false)
      : (movie.vip_servers || []).filter((s: any) => s.enabled !== false);

    if (rawList.length > 0) {
      return rawList.map((s, idx) => ({
        ...s,
        label: `Server ${idx + 1}`,
      }));
    }

    // Fallback legacy columns
    const legacy: { url: string; label: string }[] = [];
    if (movie.server1_url) legacy.push({ url: movie.server1_url, label: 'Server 1' });
    if (movie.server2_url) legacy.push({ url: movie.server2_url, label: 'Server 2' });
    return legacy;
  })();

  // In free mode, anyone can watch. In VIP mode, user must be logged in.
  const hasAccess = isFreeMode || (!authLoading && !!user);

  // Redirect unauthenticated users in VIP mode
  useEffect(() => {
    if (isFreeMode) return;
    if (authLoading) return;
    if (!user) {
      router.replace(`/movies/${movie.slug}`);
    }
  }, [isFreeMode, user, authLoading, movie.slug, router]);

  const currentServer = availableServers[activeServerIdx];
  const embedUrl = currentServer ? getEmbedUrl(currentServer) : null;
  const showGDriveOverlay = embedUrl ? isGoogleDriveUrl(embedUrl) : false;

  const handleServerSwitch = (idx: number) => {
    if (idx === activeServerIdx) return;
    setActiveServerIdx(idx);
    setIframeLoaded(false);
    setIframeError(false);
    setMobilePlayerStarted(false);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Reset iframe state on server change
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setMobilePlayerStarted(false);
  }, [activeServerIdx]);

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // VIP mode auth loading
  if (!isFreeMode && authLoading) {
    return (
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Signing in..." />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-16">
      {/* Theater Header */}
      <div className="bg-dark-950/90 backdrop-blur-xl border-b border-white/5 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.push(`/movies/${movie.slug}`)}
              className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all flex-shrink-0"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-white truncate">{movie.title}</h1>
              <div className="flex items-center gap-2 text-xs text-dark-500">
                <span>සිංහල හඩකැවූ - SINHALA DUBBED</span>
                {movie.release_year && <span>• {movie.release_year}</span>}
                {movie.runtime && <span>• {formatRuntime(movie.runtime)}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mode badge */}
            {isFreeMode ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
                🎬 Free with Ads
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 font-medium">
                ⚡ VIP
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all shadow-md border border-white/10"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              <svg className="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
              <span className="whitespace-nowrap">{isFullscreen ? 'Exit Fullscreen' : '📺 Fullscreen'}</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Streaming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Video Player */}
        <div
          ref={playerContainerRef}
          className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 bg-black"
        >
          <div
            className="relative w-full"
            style={{
              height: 'calc(100vw * 0.5625)',
              minHeight: '220px',
              maxHeight: '70vh',
            }}
          >
            {embedUrl ? (
              <>
                {/* Loading overlay */}
                {!iframeLoaded && !iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950">
                    <LoadingSpinner size="lg" text="Loading player..." />
                  </div>
                )}

                {/* Error overlay */}
                {iframeError && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Server Unavailable</h3>
                      <p className="text-dark-400 text-sm mb-4">This server is not responding. Please try another server below.</p>
                      {availableServers.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2">
                          {availableServers.map((server, idx) => idx !== activeServerIdx && (
                            <button
                              key={idx}
                              onClick={() => handleServerSwitch(idx)}
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-500 transition-all"
                            >
                              Try {server.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile Fullscreen Interceptor (Clean overlay without big play button icon) */}
                {!mobilePlayerStarted && iframeLoaded && (
                  <div
                    className="sm:hidden absolute inset-0 z-[15] bg-transparent cursor-pointer"
                    onClick={() => {
                      setMobilePlayerStarted(true);
                      if (!document.fullscreenElement && playerContainerRef.current) {
                        playerContainerRef.current.requestFullscreen().catch(() => {});
                      }
                    }}
                  />
                )}

                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={`Watch ${movie.title}`}
                  onLoad={() => { setIframeLoaded(true); setIframeError(false); }}
                  onError={() => setIframeError(true)}
                />

                {/* Block Google Drive "open in new tab" icon — only for GDrive embeds */}
                {showGDriveOverlay && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute', top: 0, right: 0,
                      width: '52px', height: '52px',
                      zIndex: 20, pointerEvents: 'all',
                      cursor: 'default',
                      background: 'rgba(0,0,0,0.88)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="DubLK" draggable={false}
                      style={{ width: '40px', height: 'auto', opacity: 0.9, userSelect: 'none', pointerEvents: 'none' }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-900">
                <div className="text-center px-6">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Video Available</h3>
                  <p className="text-dark-400 text-sm">No servers are available for this movie yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Server Selection Bar — always visible below the player */}
        <div className="mt-4 rounded-xl bg-dark-900/60 border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
              <span className="text-sm font-medium text-white">
                {isFreeMode ? 'FREE Servers' : 'VIP Servers'}
              </span>
              <span className="text-xs text-dark-500">
                ({availableServers.length} available)
              </span>
            </div>
            {currentServer && (
              <span className="text-xs text-dark-500">
                Playing: <span className="text-white font-medium">{currentServer.label}</span>
              </span>
            )}
          </div>

          {availableServers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableServers.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => handleServerSwitch(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeServerIdx === idx
                      ? isFreeMode
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/30'
                        : 'bg-brand-600 text-white shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/30'
                      : 'bg-white/5 text-dark-400 border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {activeServerIdx === idx ? (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  )}
                  <span>{server.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-dark-500 italic">No servers available for this movie.</p>
          )}
        </div>

        {/* FREE Mode Ads Notice */}
        {isFreeMode && (
          <div className="my-4 p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-200 shadow-md shadow-amber-500/5">
            <span className="text-lg leading-none mt-0.5 flex-shrink-0">⚠️</span>
            <p className="text-xs sm:text-sm text-amber-200/95 leading-relaxed font-medium">
              අපගේ free version එක මඟින් නොමිලේ සේවාව ලබා දෙන බැවින් ads play විය හැක. කරුණාකර ඒවා skip කර නැවත මෙම පිටුවට එන්න. Ads නොමැතිව පහසුවෙන්ම බලන්න sign up වී VIP වලට Upgrade වන්න.
            </p>
          </div>
        )}

        {/* Player Info Bar */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-display font-bold text-white">{movie.title}</h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {movie.rating > 0 && <span className="text-xs text-yellow-400">⭐ {movie.rating.toFixed(1)}</span>}
              {movie.release_year && <span className="text-xs text-dark-500">{movie.release_year}</span>}
              {movie.runtime && <span className="text-xs text-dark-500">{formatRuntime(movie.runtime)}</span>}
              {movie.genres?.slice(0, 3).map((g) => (
                <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-dark-400 border border-white/5">{g}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFreeMode && (
              <button
                onClick={() => router.push(`/movies/${movie.slug}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 hover:border-brand-500/40 transition-all"
              >
                ⚡ Upgrade to VIP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
