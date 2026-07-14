'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';
    const errorParam = searchParams.get('error_description') || searchParams.get('error');

    if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
      // Hard redirect home after showing error briefly
      setTimeout(() => { window.location.href = '/'; }, 3000);
      return;
    }

    if (!code) {
      // No code — go home via hard redirect
      window.location.href = '/';
      return;
    }

    // Exchange the code client-side — the PKCE verifier was stored in browser
    // cookies by the same browser client, so it is always accessible here.
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        console.error('[auth/callback] exchange error:', error.message);
        setErrorMsg(error.message);
        setTimeout(() => { window.location.href = '/'; }, 3000);
      } else {
        // HARD redirect — ensures the new session cookies are picked up fresh
        // on the next page load. router.replace() is soft navigation and misses
        // the newly-set Set-Cookie headers.
        window.location.href = next;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">Sign-in failed</h2>
          <p className="text-dark-400 text-sm mb-4">{errorMsg}</p>
          <p className="text-dark-600 text-xs">Redirecting home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
