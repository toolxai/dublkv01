'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Safety-net: if Google/email OAuth ever lands the ?code= on the homepage,
 * we exchange it client-side here (same browser storage as where it was set).
 */
export default function AuthCodeRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // DO NOT intercept if we are on the official callback route
    if (pathname === '/auth/callback') return;

    const code = searchParams.get('code');
    if (!code) return;

    // Exchange the code right here in the browser — no server round-trip needed.
    // This ensures the PKCE code_verifier (stored in browser cookies) is always
    // accessible, regardless of which browser or device the user is on.
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) {
        // Hard redirect to clear the URL and force the browser to send the new session cookies to the server
        const clean = new URL(window.location.href);
        clean.searchParams.delete('code');
        window.location.href = clean.href;
      } else {
        // If it failed (e.g., PKCE verifier missing due to opening in a different browser),
        // we can remove the code to prevent infinite loops, but leave them on the homepage.
        console.error('[AuthCodeRedirect] Error:', error.message);
        const clean = new URL(window.location.href);
        clean.searchParams.delete('code');
        clean.searchParams.set('error', encodeURIComponent(error.message));
        window.location.href = clean.href;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
