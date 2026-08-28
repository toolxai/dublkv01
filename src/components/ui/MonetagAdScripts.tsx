'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function MonetagAdScripts() {
  const pathname = usePathname();

  // Exclude popunder and vignette ads on player pages (/watch/* and /tv-series/*)
  // so movie playback, server switching, and controls are 100% unaffected.
  const isPlayerPage = pathname?.startsWith('/watch') || pathname?.startsWith('/tv-series');

  useEffect(() => {
    if (isPlayerPage) {
      // Remove any active ad script elements from DOM when entering player pages
      const scripts = document.querySelectorAll('script[src*="al5sm.com"], script[src*="n6wxm.com"]');
      scripts.forEach((s) => s.remove());
    }
  }, [isPlayerPage]);

  if (isPlayerPage) {
    return null;
  }

  return (
    <>
      {/* Popunder Ad - Zone 11669591 */}
      <Script
        src="https://al5sm.com/tag.min.js"
        data-zone="11669591"
        strategy="afterInteractive"
      />

      {/* Vignette Banner Ad - Zone 11669586 */}
      <Script
        src="https://n6wxm.com/vignette.min.js"
        data-zone="11669586"
        strategy="afterInteractive"
      />
    </>
  );
}
