'use client';

import { useState } from 'react';
import HeroBanner from '@/components/ui/HeroBanner';
import GlobalSearch from '@/components/ui/GlobalSearch';

interface HomeClientProps {
  heroMovies: any[];
}

export default function HomeClient({ heroMovies }: HomeClientProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <HeroBanner movies={heroMovies} onSearchOpen={() => setSearchOpen(true)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
