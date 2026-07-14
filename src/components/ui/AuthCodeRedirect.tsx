'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Safety-net: if Google/email OAuth ever lands the ?code= on the homepage,
 * we exchange it client-side here (same browser storage as where it was set).
 */
export default function AuthCodeRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) return;

    // Exchange the code right here in the browser — no server round-trip needed.
    // This ensures the PKCE code_verifier (stored in browser cookies) is always
    // accessible, regardless of which browser or device the user is on.
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) {
        // Remove the ?code= from the URL cleanly without adding to history
        const clean = new URL(window.location.href);
        clean.searchParams.delete('code');
        router.replace(clean.pathname + (clean.search || ''));
      }
      // On error, leave the URL as-is — user is still on homepage
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
