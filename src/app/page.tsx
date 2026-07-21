import { createAdminClient } from '@/lib/supabase/admin';
import HomeClient from '@/app/HomeClient';
import MovieRow from '@/components/ui/MovieRow';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMovies() {
  const supabase = createAdminClient();
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_published', true);

  if (error) {
    console.error('Failed to fetch movies:', error);
    return [];
  }

  // Sort by latest update timestamp (falling back to creation date)
  const sorted = [...(movies || [])].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at).getTime();
    const timeB = new Date(b.updated_at || b.created_at).getTime();
    return timeB - timeA;
  });

  return sorted;
}

export default async function HomePage() {
  const movies = await getMovies();

  // Pick top-rated movies for hero (must have backdrop)
  const heroMovies = [...movies]
    .filter((m) => m.backdrop_url)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  // Recently added
  const recentMovies = movies.slice(0, 20);

  // Top rated
  const topRated = [...movies]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20);

  return (
    <div>
      {/* Hero Banner */}
      <HomeClient heroMovies={heroMovies} />

      {/* Movie Rows — only 2 sections */}
      <div className="relative mt-4 sm:-mt-6 lg:-mt-12 z-10 space-y-8 sm:space-y-10 pb-16">
        <MovieRow title="Recently Added" movies={recentMovies} icon="🆕" />
        <MovieRow title="Top Rated" movies={topRated} icon="⭐" />
      </div>
    </div>
  );
}
