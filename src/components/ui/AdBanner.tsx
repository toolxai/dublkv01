'use client';

import { useEffect, useRef } from 'react';

/**
 * AdBanner — ProfitableRateCPM Network
 *
 * Uses useEffect + direct DOM script injection so the ad loads
 * correctly on ALL browsers including mobile (iOS Safari, Android Chrome).
 * Each mounted instance generates a unique container id to support
 * multiple ad slots on the same page.
 */
export default function AdBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;

    const container = containerRef.current;
    if (!container) return;

    // Set the required id on the container div
    container.id = 'container-fcbbc70a064725d257af2184712cfb77';

    // Inject the ad invoke script
    const script = document.createElement('script');
    script.async = true;
    // data-cfasync must be set as attribute (not property) for Cloudflare bypass
    script.setAttribute('data-cfasync', 'false');
    script.src =
      'https://pl31901261.profitableratecpmnetwork.com/fcbbc70a064725d257af2184712cfb77/invoke.js';

    // Append script right after the container so the ad network can find it
    container.parentNode?.insertBefore(script, container.nextSibling);

    return () => {
      // Cleanup on unmount
      try { script.parentNode?.removeChild(script); } catch {}
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ minHeight: '90px' }}
      aria-hidden="true"
    />
  );
}
