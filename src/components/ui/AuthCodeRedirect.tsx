'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Safety-net component: detects OAuth/email-confirmation `?code=` params
 * that land on the wrong page (e.g. homepage) and redirects them to
 * /auth/callback so the session exchange can happen properly.
 */
export default function AuthCodeRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Use window.location.replace for a HARD redirect to the API route.
      // Next.js router.replace can cause infinite client-side routing loops
      // when navigating to a backend API route that responds with a 307 redirect.
      const callbackUrl = `/auth/callback?code=${encodeURIComponent(code)}`;
      window.location.replace(callbackUrl);
    }
  }, [searchParams]);

  return null;
}
