'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface WatchClientProps {
  movie: {
    id: string;
    title: string;
    slug: string;
    server1_url: string | null;
    server2_url: string | null;
    bunny_video_id: string | null;
    poster_url: string | null;
    backdrop_url: string | null;
    rating: number;
    release_year: number | null;
    runtime: number | null;
    genres: string[];
  };
}

type ServerTab = 'server1' | 'server2';

/**
 * Extract a Google Drive embed URL from various share link formats.
 * Supports:
 *  - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *  - https://drive.google.com/open?id=FILE_ID
 *  - Direct FILE_ID
 */
function getGDriveEmbedUrl(url: string): string {
  if (!url) return '';

  // Already an embed URL
  if (url.includes('/preview')) return url;

  // Extract file ID from /file/d/ID/ pattern
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  // Extract from ?id=ID pattern
  const idMatch = url.match(/[?&]id=([^&]+)/);
  if (idMatch) {
    return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
  }

  // Assume it's a raw file ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) {
    return `https://drive.google.com/file/d/${url.trim()}/preview`;
  }

  // Fallback — just return as-is (could be another embeddable URL)
  return url;
}

export default function WatchClient({ movie }: WatchClientProps) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeServer, setActiveServer] = useState<ServerTab>('server1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [mobilePlayerStarted, setMobilePlayerStarted] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // FREE plan: any signed-in user can watch — no server API call needed.
  // The video URL is already in props from the server-side page.
  const hasAccess = !authLoading && !!user;

  // Redirect unauthenticated users back to movie detail
  useEffect(() => {
    if (authLoading) return; // wait for auth to resolve
    if (!user) {
      router.replace(`/movies/${movie.slug}`);
    }
  }, [user, authLoading, movie.slug, router]);

  // Determine which servers are available
  const servers: { id: ServerTab; label: string; icon: string }[] = [];
  if (movie.server1_url) {
    servers.push({ id: 'server1' as ServerTab, label: 'Server 1', icon: '🎬' });
  }
  if (movie.server2_url) {
    servers.push({ id: 'server2' as ServerTab, label: 'Server 2', icon: '🌐' });
  }
  // Fallback to Bunny.net if available
  if (movie.bunny_video_id && servers.length === 0) {
    servers.push({ id: 'server1' as ServerTab, label: 'Server 1', icon: '🎬' });
  }

  // Get embed URL for current server
  const getEmbedUrl = (): string | null => {
    if (activeServer === 'server1' && movie.server1_url) {
      return getGDriveEmbedUrl(movie.server1_url);
    }
    if (activeServer === 'server2' && movie.server2_url) {
      return getGDriveEmbedUrl(movie.server2_url);
    }
    return null;
  };

  const embedUrl = getEmbedUrl();

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Reset iframe loaded state when switching servers
  useEffect(() => {
    setIframeLoaded(false);
  }, [activeServer]);

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Auth still resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Signing in..." />
      </div>
    );
  }

  // Not logged in (will redirect via useEffect)
  if (!user) {
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

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Streaming</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {hasAccess ? (
          <>
            {/* Server Tabs */}
            {servers.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-dark-500 mr-2">Select Server:</span>
                {servers.map((server) => (
                  <button
                    key={server.id}
                    onClick={() => setActiveServer(server.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeServer === server.id
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                        : 'bg-white/5 text-dark-400 border border-white/10 hover:border-brand-500/30 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{server.icon}</span>
                    <span>{server.label}</span>
                    {activeServer === server.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-1" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Video Player */}
            <div
              ref={playerContainerRef}
              className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5 bg-black"
            >
              {/*
                Mobile-first responsive container:
                - Mobile  (<640 px): fills most of the viewport height
                - Tablet  (≥640 px): 16:9 aspect ratio with min-height
                - Desktop (≥1024px): 16:9 with comfortable min-height
                Using padding-top trick (56.25% = 16:9) on sm+ screens.
              */}
              <div
                className="relative w-full"
                style={{
                  /* Mobile: fixed height that fills the screen nicely */
                  height: 'calc(100vw * 0.5625)',       /* 16:9 */
                  minHeight: '220px',
                  maxHeight: '70vh',
                }}
              >
                {embedUrl ? (
                  <>
                    {/* Loading overlay */}
                    {!iframeLoaded && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-950">
                        <LoadingSpinner size="lg" text="Loading player..." />
                      </div>
                    )}
                    
                    {/* Mobile Fullscreen Interceptor */}
                    {!mobilePlayerStarted && iframeLoaded && (
                      <div 
                        className="sm:hidden absolute inset-0 z-[15] bg-transparent flex items-center justify-center cursor-pointer group"
                        onClick={() => {
                          setMobilePlayerStarted(true);
                          if (!document.fullscreenElement && playerContainerRef.current) {
                            playerContainerRef.current.requestFullscreen().catch(() => {});
                          }
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-brand-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-xl shadow-brand-500/30 transform transition-transform group-hover:scale-110">
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`Watch ${movie.title}`}
                      onLoad={() => setIframeLoaded(true)}
                    />
                    {/* Block the Google Drive "open in new tab" icon (top-right corner) */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '52px',
                        height: '52px',
                        zIndex: 20,
                        pointerEvents: 'all',
                        cursor: 'default',
                        background: 'rgba(0,0,0,0.88)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo.png"
                        alt="DubLK"
                        draggable={false}
                        style={{ width: '40px', height: 'auto', opacity: 0.9, userSelect: 'none', pointerEvents: 'none' }}
                      />
                    </div>
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
                      <p className="text-dark-400 text-sm">This server doesn&apos;t have a video URL yet. Try switching servers.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Player Info Bar */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">{movie.title}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {movie.rating > 0 && (
                      <span className="text-xs text-yellow-400">⭐ {movie.rating.toFixed(1)}</span>
                    )}
                    {movie.release_year && (
                      <span className="text-xs text-dark-500">{movie.release_year}</span>
                    )}
                    {movie.runtime && (
                      <span className="text-xs text-dark-500">{formatRuntime(movie.runtime)}</span>
                    )}
                    {movie.genres?.slice(0, 3).map((g) => (
                      <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-dark-400 border border-white/5">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Report / Help */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Switch to next server on error
                    if (servers.length > 1) {
                      const currentIndex = servers.findIndex(s => s.id === activeServer);
                      const nextIndex = (currentIndex + 1) % servers.length;
                      setActiveServer(servers[nextIndex].id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-dark-400 hover:text-white bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {servers.length > 1 ? 'Switch Server' : 'Refresh'}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
