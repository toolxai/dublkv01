import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

interface StreamServer {
  url: string;
  label: string;
  enabled: boolean;
}

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

/**
 * Admin client that bypasses RLS for fetching movie data.
 */
function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const isRealServiceKey = serviceKey.startsWith('eyJ');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    isRealServiceKey ? serviceKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const movieId = params.movieId;
  const mode = request.nextUrl.searchParams.get('mode') || 'free';

  // Use admin client to fetch movie data (bypasses RLS for unpublished checks etc.)
  const adminDb = getAdminClient();
  
  try {
    const { data: movie, error: movieError } = await adminDb
      .from('movies')
      .select('id, title, server1_url, server2_url, free_servers, vip_servers, bunny_video_id')
      .eq('id', movieId)
      .eq('is_published', true)
      .single();

    if (movieError || !movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    // Build enabled free server list
    const freeServers: StreamServer[] = (movie.free_servers || []).filter((s: StreamServer) => s.enabled);
    // Legacy fallback
    if (freeServers.length === 0) {
      if (movie.server1_url) freeServers.push({ url: movie.server1_url, label: 'Server 1', enabled: true });
      if (movie.server2_url) freeServers.push({ url: movie.server2_url, label: 'Server 2', enabled: true });
    }

    if (mode === 'free') {
      // FREE mode — no authentication required
      return NextResponse.json({
        access: true,
        title: movie.title,
        mode: 'free',
        servers: freeServers,
      });
    }

    // VIP mode — requires authentication
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required for VIP streams' },
        { status: 401 }
      );
    }

    // Build enabled VIP server list
    const vipServers: StreamServer[] = (movie.vip_servers || []).filter((s: StreamServer) => s.enabled);

    return NextResponse.json({
      access: true,
      title: movie.title,
      mode: 'vip',
      servers: vipServers.length > 0 ? vipServers : freeServers, // Fallback to free if no VIP servers
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
