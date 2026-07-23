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
  const { tmdb_id, title, slug, description, poster_url, backdrop_url, genres, rating, release_year, runtime, free_servers, vip_servers, is_published } = body;

  if (!tmdb_id || !title || !slug) {
    return NextResponse.json({ error: 'tmdb_id, title, and slug are required' }, { status: 400 });
  }

  const { data: movie, error } = await supabase
    .from('movies')
    .insert([{
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
    }])
    .select()
    .single();

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
  // Update both updated_at and created_at so it instantly moves to the top of all listings
  let { data: movie, error } = await supabase
    .from('movies')
    .update({ ...updates, updated_at: now, created_at: now })
    .eq('id', id)
    .select()
    .single();

  // If updated_at column is missing in schema, update created_at only
  if (error && error.message?.includes('updated_at')) {
    const res = await supabase
      .from('movies')
      .update({ ...updates, created_at: now })
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
