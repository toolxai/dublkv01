'use client';

import { createBrowserClient } from '@supabase/ssr';

// Do NOT use a singleton — a fresh client per call ensures the PKCE
// code verifier and session storage are always properly initialised.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
