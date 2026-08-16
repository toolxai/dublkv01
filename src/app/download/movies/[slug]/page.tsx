import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import MovieDownloadClient from './MovieDownloadClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export default async function MovieDownloadPage({ params }: Props) {
  const { slug } = params;
  const supabase = createAdminClient();

  const { data: movie, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !movie) {
    notFound();
  }

  return <MovieDownloadClient movie={movie} />;
}
