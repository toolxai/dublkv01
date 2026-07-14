import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // Use multi-search to get both movies and TV series
    const params = new URLSearchParams({
      query,
      include_adult: 'false',
      language: 'en-US',
      page: '1',
    });

    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?${params}`,
      {
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) throw new Error(`TMDB search failed: ${res.status}`);
    const data = await res.json();

    // Filter to only movies and TV — exclude persons
    const results = (data.results || []).filter(
      (r: any) => r.media_type === 'movie' || r.media_type === 'tv'
    );

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
