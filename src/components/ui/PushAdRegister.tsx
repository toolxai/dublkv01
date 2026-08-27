'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function PushAdRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .catch((err) => {
          console.warn('Push SW registration info:', err);
        });
    }
  }, []);

  return (
    <Script
      src="https://5gvci.com/act/files/tag.min.js?z=11587395"
      strategy="afterInteractive"
    />
  );
}
