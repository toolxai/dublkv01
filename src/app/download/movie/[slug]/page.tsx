import { redirect } from 'next/navigation';

interface Props {
  params: { slug: string };
}

export default async function RedirectMovieDownload({ params }: Props) {
  const { slug } = params;
  redirect(`/download/movies/${slug}`);
}
