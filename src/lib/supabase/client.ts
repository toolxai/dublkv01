'use client';

import { createBrowserClient } from '@supabase/ssr';

// Create a fresh client each call — this is intentional.
// A singleton breaks PKCE because the code verifier stored during OAuth init
// must still be in the same storage when the callback runs. Using cookies
// (not localStorage) ensures it survives cross-domain redirects on Safari/iOS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        // Must be Lax (not Strict) so cookies are sent when Google redirects back
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    }
  );
}
