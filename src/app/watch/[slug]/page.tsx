import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import WatchClient from './WatchClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
  searchParams: { mode?: string };
}

async function getMovie(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Check if the current request has an authenticated user session.
 */
async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovie(params.slug);
  return {
    title: movie ? `Watch ${movie.title}` : 'Watch Movie',
    robots: { index: false, follow: false },
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const movie = await getMovie(params.slug);
  if (!movie) notFound();

  const isFreeMode = searchParams.mode === 'free';

  // SECURITY: Only pass VIP stream URLs if user is authenticated AND not in free mode.
  // This prevents VIP URLs from appearing in the page source for guests.
  let safeMovie = { ...movie };
  if (isFreeMode) {
    // Strip VIP data entirely — free users should never see VIP URLs
    safeMovie.vip_servers = null;
  } else {
    // VIP mode: verify the user is authenticated and has verified purchase or admin status
    const user = await getAuthenticatedUser();
    if (!user) {
      safeMovie.vip_servers = null;
    } else {
      const supabase = createAdminClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('type, movie_id, status')
          .eq('user_id', user.id)
          .eq('status', 'verified');

        const hasFull = purchases?.some((p: any) => p.type === 'full');
        const hasSingle = purchases?.some((p: any) => p.type === 'single' && p.movie_id === movie.id);

        if (!hasFull && !hasSingle) {
          safeMovie.vip_servers = null;
        }
      }
    }
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading player..." />
      </div>
    }>
      <WatchClient movie={safeMovie} isFreeMode={isFreeMode} />
    </Suspense>
  );
}
