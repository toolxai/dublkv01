import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import TVDownloadClient from './TVDownloadClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: { slug: string };
}

export default async function TVSeriesDownloadPage({ params }: Props) {
  const { slug } = params;
  const supabase = createAdminClient();

  const { data: series, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !series) {
    notFound();
  }

  return <TVDownloadClient series={series} />;
}
