import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import WatchClient from './WatchClient';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  params: { slug: string };
}

async function getMovie(slug: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('movies')
    .select('id, title, slug, bunny_video_id, server1_url, server2_url, free_servers, vip_servers, poster_url, backdrop_url, rating, release_year, runtime, genres')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovie(params.slug);
  return {
    title: movie ? `Watch ${movie.title}` : 'Watch Movie',
    robots: { index: false, follow: false },
  };
}

export default async function WatchPage({ params }: Props) {
  const movie = await getMovie(params.slug);
  if (!movie) notFound();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading player..." />
      </div>
    }>
      <WatchClient movie={movie} />
    </Suspense>
  );
}
