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
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

// Helper to check admin or editor/moderator status
async function canMaintainMovies(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return Boolean(data?.is_admin === true || data?.role === 'admin' || data?.role === 'editor' || data?.role === 'moderator');
  } catch {
    return false;
  }
}

// GET - List all movies (admin)
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !(await canMaintainMovies(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { data: movies, error } = await supabase
    .from('movies')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sorted = [...(movies || [])].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at).getTime();
    const timeB = new Date(b.updated_at || b.created_at).getTime();
    return timeB - timeA;
  });

  return NextResponse.json({ movies: sorted });
}

// POST - Add a new movie
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !(await canMaintainMovies(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { tmdb_id, title, slug, description, poster_url, backdrop_url, genres, rating, release_year, runtime, free_servers, vip_servers, download_links, is_published } = body;

  if (!tmdb_id || !title || !slug) {
    return NextResponse.json({ error: 'tmdb_id, title, and slug are required' }, { status: 400 });
  }

  const insertPayload: Record<string, any> = {
    tmdb_id,
    title,
    slug,
    description,
    poster_url,
    backdrop_url,
    genres: genres || [],
    rating: rating || 0,
    release_year,
    runtime,
    free_servers: free_servers || [],
    vip_servers: vip_servers || [],
    is_published: !!is_published
  };

  if (download_links !== undefined) {
    insertPayload.download_links = download_links;
  }

  let { data: movie, error } = await supabase
    .from('movies')
    .insert([insertPayload])
    .select()
    .single();

  // If download_links column is missing in database schema cache
  if (error && (error.message?.includes('download_links') || error.message?.includes('schema cache'))) {
    const dlLinks = insertPayload.download_links;
    delete insertPayload.download_links;
    if (dlLinks !== undefined) {
      const curFree = insertPayload.free_servers;
      if (Array.isArray(curFree)) {
        insertPayload.free_servers = {
          servers: curFree,
          download_links: dlLinks,
        };
      } else if (curFree && typeof curFree === 'object') {
        insertPayload.free_servers = {
          ...curFree,
          download_links: dlLinks,
        };
      }
    }

    const res = await supabase
      .from('movies')
      .insert([insertPayload])
      .select()
      .single();
    movie = res.data;
    error = res.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ movie });
}

// PATCH - Update a movie
export async function PATCH(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !(await canMaintainMovies(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
  }

  const now = new Date().toISOString();
  let payload: Record<string, any> = { ...updates, updated_at: now, created_at: now };

  if (updates.download_links !== undefined) {
    if (payload.free_servers && typeof payload.free_servers === 'object' && !Array.isArray(payload.free_servers)) {
      payload.free_servers = {
        ...payload.free_servers,
        download_links: updates.download_links,
      };
    }
  }

  let { data: movie, error } = await supabase
    .from('movies')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // 1. If download_links column is missing in database schema cache
  if (error && (error.message?.includes('download_links') || error.message?.includes('schema cache'))) {
    const downloadLinksToSave = payload.download_links;
    delete payload.download_links;

    if (downloadLinksToSave !== undefined) {
      const currentFree = payload.free_servers ?? updates.free_servers;
      if (Array.isArray(currentFree)) {
        payload.free_servers = {
          servers: currentFree,
          download_links: downloadLinksToSave,
        };
      } else if (currentFree && typeof currentFree === 'object') {
        payload.free_servers = {
          ...currentFree,
          download_links: downloadLinksToSave,
        };
      } else {
        payload.free_servers = {
          servers: [],
          download_links: downloadLinksToSave,
        };
      }
    }

    const res = await supabase
      .from('movies')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    movie = res.data;
    error = res.error;
  }

  // 2. If updated_at column is missing in database schema
  if (error && error.message?.includes('updated_at')) {
    delete payload.updated_at;
    const res = await supabase
      .from('movies')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    movie = res.data;
    error = res.error;
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ movie });
}

// DELETE - Delete a movie
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !(await canMaintainMovies(supabase, user.id))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Movie ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
