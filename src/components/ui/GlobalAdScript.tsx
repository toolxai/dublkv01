'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function GlobalAdScript() {
  const pathname = usePathname();

  // Exclude pop-under ad scripts on player pages (/watch and /tv-series)
  const isPlayerPage = pathname?.startsWith('/watch') || pathname?.startsWith('/tv-series');

  useEffect(() => {
    if (isPlayerPage) {
      // Purge leftover ad scripts from DOM when entering player pages
      const scripts = document.querySelectorAll('script[src*="rufflefireballcherries"]');
      scripts.forEach((s) => s.remove());
    }
  }, [isPlayerPage]);

  if (isPlayerPage) {
    return null;
  }

  return (
    <Script
      src="https://rufflefireballcherries.com/12/1d/3c/121d3cd98d22e5032db7b17b27b8d6f6.js"
      strategy="afterInteractive"
    />
  );
}
