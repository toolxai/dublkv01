'use client';

import HeroBanner from '@/components/ui/HeroBanner';

interface HomeClientProps {
  heroMovies: any[];
}

export default function HomeClient({ heroMovies }: HomeClientProps) {
  return <HeroBanner movies={heroMovies} />;
}
