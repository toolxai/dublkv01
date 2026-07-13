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

  // 1. Verify Authentication
  const supabase = getSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // 2. Check profile (admin status + free trial)
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, free_trial_expires_at')
    .eq('id', user.id)
    .single();
  
  const isAdmin = profile?.is_admin === true;
  const hasFreeTrialAccess = profile?.free_trial_expires_at 
    ? new Date(profile.free_trial_expires_at) > new Date()
    : false;

  // 3. Get movie details
  try {
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('id, title, server1_url, server2_url, bunny_video_id')
      .eq('id', movieId)
      .single();

    if (movieError || !movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // 4. Check access: Admin > Free Trial > Purchase
    if (!isAdmin && !hasFreeTrialAccess) {
      const { data: fullAccess } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'full')
        .eq('status', 'verified')
        .limit(1);

      if (!fullAccess || fullAccess.length === 0) {
        const { data: singleAccess } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('movie_id', movieId)
          .eq('type', 'single')
          .eq('status', 'verified')
          .limit(1);

        if (!singleAccess || singleAccess.length === 0) {
          return NextResponse.json(
            { error: 'Access denied. Purchase required.' },
            { status: 403 }
          );
        }
      }
    }

    // 5. Return access grant — the client handles embed URL construction
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
