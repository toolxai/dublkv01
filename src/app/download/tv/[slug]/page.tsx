import { redirect } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export default async function RedirectTVDownload({ params }: Props) {
  const { slug } = params;
  redirect(`/download/tv-series/${slug}`);
}
