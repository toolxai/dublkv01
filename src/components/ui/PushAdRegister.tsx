'use client';

import { useEffect } from 'react';

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

  return null;
}
