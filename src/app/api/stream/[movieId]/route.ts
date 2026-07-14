import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const movieId = params.movieId;

  // 1. Verify Authentication — must be signed in (FREE plan requires sign-up)
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. Get movie details
  try {
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('id, title, server1_url, server2_url, bunny_video_id')
      .eq('id', movieId)
      .single();

    if (movieError || !movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // 3. Access model:
    //    FREE  — any signed-in user can watch all movies (no payment needed)
    //    VIP   — Rs.100 lifetime — grants new releases & priority requests (future gating)
    // Any authenticated request passes. No purchase check for the free tier.

    return NextResponse.json({
      access: true,
      title: movie.title,
      server1_url: movie.server1_url,
      server2_url: movie.server2_url,
      bunny_video_id: movie.bunny_video_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
