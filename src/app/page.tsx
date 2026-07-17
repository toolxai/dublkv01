import { createAdminClient } from '@/lib/supabase/admin';
import HomeClient from '@/app/HomeClient';
import MovieRow from '@/components/ui/MovieRow';

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

async function getMovies() {
  const supabase = createAdminClient();
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch movies:', error);
    return [];
  }
  return movies || [];
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
      <div className="relative -mt-20 z-10 space-y-10 pb-16">
        <MovieRow title="Recently Added" movies={recentMovies} icon="🆕" />
        <MovieRow title="Top Rated" movies={topRated} icon="⭐" />
      </div>
    </div>
  );
}
